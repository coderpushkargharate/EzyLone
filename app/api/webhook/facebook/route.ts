import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Integration } from '@/lib/models/Integration';
import { createLeadFromWebhook } from '@/lib/ingest';
import { sendSecurityAlert } from '@/lib/email';
import { envFlag, safeEqual, verifyMetaSignature } from '@/lib/webhookAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Facebook & Instagram Lead Ads webhook.
//
// Configure in the admin panel (Automations → Facebook Lead Ads → Configure):
// the Callback URL is https://<domain>/api/webhook/facebook and the Verify Token
// you enter there is stored in the DB and checked here. When someone submits a
// Lead Ad, Meta POSTs a `leadgen` change containing a `leadgen_id`; we then call
// the Graph API with the saved Page Access Token to read the actual field data
// (name/email/phone) and create a lead.
//
// Meta setup: your App → Webhooks → Page subscription → subscribe to `leadgen`,
// and make sure the Page is subscribed to your app.

const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v21.0';

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
  const expected = cfg?.verifyToken || process.env.FACEBOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && expected && safeEqual(token, expected)) {
    return new NextResponse(challenge || '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// Signature policy (fail closed):
//  - App Secret saved (Automations → Facebook → App Secret) or FACEBOOK_APP_SECRET
//    set → every POST must carry a valid X-Hub-Signature-256, else 403.
//  - No App Secret → 403, because anyone could otherwise forge lead events.
//    FACEBOOK_ALLOW_UNSIGNED=true is an explicit, temporary escape hatch: requests
//    are accepted but logged, and a lead is only saved when its leadgen_id really
//    resolves through the Graph API with your Page token (forged ids don't).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function appSecretFrom(cfg: Record<string, any> | null): string | undefined {
  return cfg?.appSecret || process.env.FACEBOOK_APP_SECRET || undefined;
}

// Pull the full lead field data from the Graph API for one leadgen_id.
async function fetchLeadFields(leadgenId: string, pageAccessToken: string): Promise<Record<string, string>> {
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${leadgenId}?access_token=${encodeURIComponent(pageAccessToken)}`;
  const res = await fetch(url);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`Facebook leadgen fetch failed (HTTP ${res.status}):`, data?.error?.message || '');
    return {};
  }
  const fields: Record<string, string> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (data.field_data || []).forEach((f: any) => {
    fields[f.name] = (f.values || [])[0] || '';
  });
  return fields;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const cfg = await getFacebookConfig();

  const sig = verifyMetaSignature(raw, req.headers.get('x-hub-signature-256'), appSecretFrom(cfg));
  if (sig === 'invalid') {
    console.warn('Rejected Facebook webhook — invalid signature');
    return new NextResponse('Forbidden', { status: 403 });
  }
  const verified = sig === 'valid';
  if (!verified) {
    if (!envFlag('FACEBOOK_ALLOW_UNSIGNED')) {
      console.error(
        'Rejected Facebook webhook — no App Secret configured, so the request cannot be verified. ' +
          'Save the App Secret in Automations → Facebook Lead Ads (or set FACEBOOK_APP_SECRET).'
      );
      sendSecurityAlert('fb-webhook-unconfigured', 'Facebook Lead Ads webhook is rejecting events', {
        Reason: 'No App Secret configured — leads are NOT being received until it is saved.',
        Fix: 'Admin → Automations → Facebook Lead Ads → Configure → App Secret',
      }).catch(() => {});
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

  const pageAccessToken = cfg?.pageAccessToken as string | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const changes: any[] = (payload.entry || []).flatMap((e: any) => e.changes || []);
  for (const ch of changes) {
    if (ch.field !== 'leadgen') continue;
    const leadgenId = ch.value?.leadgen_id;
    if (!leadgenId) continue;

    let fields: Record<string, string> = {};
    if (pageAccessToken) {
      try {
        fields = await fetchLeadFields(String(leadgenId), pageAccessToken);
      } catch (e) {
        console.error('Facebook leadgen fetch error:', e);
      }
    } else {
      console.warn('Facebook lead received but no Page Access Token saved — cannot fetch details.');
    }

    const name =
      fields.full_name ||
      fields.name ||
      [fields.first_name, fields.last_name].filter(Boolean).join(' ').trim();
    const email = fields.email || '';
    const phone = fields.phone_number || fields.phone || '';

    // Unverified request: only trust lead ids Meta actually resolved for us.
    if (!verified && !name && !email && !phone) {
      console.warn('Ignored unsigned Facebook leadgen event whose id did not resolve via the Graph API.');
      continue;
    }

    try {
      await createLeadFromWebhook({
        name,
        email,
        phone,
        message: 'Submitted via Facebook / Instagram Lead Ad',
        source: 'Facebook Lead Ads',
        sourceMessageId: `fb_${leadgenId}`,
      });
    } catch (e) {
      console.error('Failed to save Facebook lead:', e);
    }
  }

  // Always 200 quickly so Meta doesn't retry / disable the webhook.
  return NextResponse.json({ ok: true });
}
