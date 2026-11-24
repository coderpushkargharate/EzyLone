import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Integration } from '@/lib/models/Integration';
import { sendSecurityAlert } from '@/lib/email';
import { envFlag, isLocalRequest, safeEqual, verifyMetaSignature } from '@/lib/webhookAuth';
import { recordLeadgen, processReceiptNow } from '@/lib/marketing/meta/leads';
import type { LeadgenChange } from '@/lib/marketing/meta/leads';
import { metaAppConfig } from '@/lib/marketing/config';
import { getCredential } from '@/lib/credentials';
import { mlog, syncLog } from '@/lib/marketing/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Facebook & Instagram Lead Ads webhook.
//
// Callback URL: https://<domain>/api/webhook/facebook. The Verify Token is the
// one saved in Automations → Facebook Lead Ads (or FACEBOOK_VERIFY_TOKEN).
// Pages are subscribed to the `leadgen` field from Admin → Marketing →
// Integrations (OAuth), or manually in the Meta app dashboard.
//
// Processing: each `leadgen` change is written to meta_lead_receipts (UNIQUE
// leadgen_id), so a redelivered or replayed notification is acknowledged but
// never processed twice. The lead's field data is then fetched with the Page
// token — inline for low latency, and by the background worker with backoff
// if Meta's API is unavailable — so a temporary outage no longer produces an
// empty lead.

const MAX_BODY_BYTES = 1_000_000;
// Missing/wrong App Secret is a configuration problem: alert every 6 h, not every 10 min.
const CONFIG_ALERT_WINDOW_MS = 6 * 60 * 60 * 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getFacebookConfig(): Promise<Record<string, any> | null> {
  await connectDB();
  const integ = await Integration.findOne({ provider: 'facebook' }).lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (integ as any)?.config || null;
}

// ── GET: verification handshake ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');

  const cfg = await getFacebookConfig();
  const expected = cfg?.verifyToken || (await getCredential('FACEBOOK_VERIFY_TOKEN'));

  if (mode === 'subscribe' && expected && safeEqual(token, expected)) {
    return new NextResponse(challenge || '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// Signature policy (fail closed):
//  - App Secret saved (Automations → Facebook → App Secret) or META_APP_SECRET /
//    FACEBOOK_APP_SECRET set → every POST must carry a valid X-Hub-Signature-256, else 403.
//  - No App Secret → 403, because anyone could otherwise forge lead events.
//    FACEBOOK_ALLOW_UNSIGNED=true is an explicit, temporary escape hatch: requests
//    are accepted but logged, and a lead is only saved when its leadgen_id really
//    resolves through the Graph API with your Page token (forged ids don't).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function appSecretFrom(cfg: Record<string, any> | null): Promise<string | undefined> {
  return cfg?.appSecret || (await metaAppConfig()).appSecret || undefined;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return new NextResponse('Payload too large', { status: 413 });
  const cfg = await getFacebookConfig();

  const sigHeader = req.headers.get('x-hub-signature-256');
  const sig = verifyMetaSignature(raw, sigHeader, await appSecretFrom(cfg));
  if (sig === 'invalid') {
    console.warn('Rejected Facebook webhook — invalid signature');
    // A signed request that fails verification is usually the App Secret of a
    // *different* Meta app than the one whose webhook is calling us — every
    // lead is then rejected. Say so (unsigned probes are ignored, not alerted).
    if (sigHeader?.startsWith('sha256=') && /"leadgen"/.test(raw) && !isLocalRequest(req.headers.get('host'))) {
      sendSecurityAlert('fb-webhook-bad-signature', 'Facebook Lead Ads webhook: App Secret does not match', {
        Reason: 'A signed lead event arrived but its signature does not match the saved App Secret, so the lead was rejected.',
        'Likely cause': 'The App Secret saved in the admin belongs to a different Meta app than the one that has the webhook subscription.',
        Fix: 'Meta for Developers → the app whose Webhooks → Page → leadgen points to /api/webhook/facebook → App settings → Basic → App secret. Paste it in Admin → Automations → Facebook Lead Ads → Manage → App Secret.',
      }, CONFIG_ALERT_WINDOW_MS).catch(() => {});
    }
    return new NextResponse('Forbidden', { status: 403 });
  }
  const verified = sig === 'valid';
  if (!verified) {
    if (!envFlag('FACEBOOK_ALLOW_UNSIGNED')) {
      console.error(
        'Rejected Facebook webhook — no App Secret configured, so the request cannot be verified. ' +
          'Save the App Secret in Automations → Facebook Lead Ads (or set META_APP_SECRET / FACEBOOK_APP_SECRET).'
      );
      if (!isLocalRequest(req.headers.get('host'))) sendSecurityAlert('fb-webhook-unconfigured', 'Facebook Lead Ads webhook is rejecting events', {
        Reason: 'No App Secret configured — leads are NOT being received until it is saved.',
        Fix: 'Meta for Developers → your app (the one with the Page leadgen webhook) → App settings → Basic → App secret → copy it into Admin → Automations → Facebook Lead Ads → Manage → App Secret → Save.',
      }, CONFIG_ALERT_WINDOW_MS).catch(() => {});
      return new NextResponse('Forbidden', { status: 403 });
    }
    console.warn('Accepting UNSIGNED Facebook webhook (FACEBOOK_ALLOW_UNSIGNED=true) — set an App Secret.');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any = {};
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: true }); // ack & ignore malformed
  }
  if (payload?.object && payload.object !== 'page') return NextResponse.json({ ok: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changes: any[] = (Array.isArray(payload.entry) ? payload.entry : []).flatMap((e: any) => (Array.isArray(e?.changes) ? e.changes : []));
  const fresh: string[] = [];
  let duplicates = 0;
  for (const ch of changes.slice(0, 100)) {
    if (ch?.field !== 'leadgen' || !ch.value) continue;
    try {
      const { isNew, receiptId } = await recordLeadgen(ch.value as LeadgenChange, 'webhook', verified);
      if (isNew && receiptId) fresh.push(receiptId);
      else duplicates++;
    } catch (e) {
      // Could not even record the receipt (DB down): let Meta retry the delivery.
      mlog('error', 'leadgen_receipt_failed', { error: e instanceof Error ? e.message : String(e) });
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }

  // Fetch + create inline (bounded); anything slow or failing is left to the worker.
  const inline = Promise.allSettled(fresh.map((id) => processReceiptNow(id)));
  await Promise.race([inline, new Promise((r) => setTimeout(r, 8_000))]);

  if (fresh.length || duplicates) {
    void syncLog('meta', 'webhook', 'ok', `Leadgen webhook: ${fresh.length} new, ${duplicates} duplicate/redelivered${verified ? '' : ' (UNSIGNED)'}`, {
      counts: { new: fresh.length, duplicate: duplicates },
    });
  }
  return NextResponse.json({ ok: true });
}
