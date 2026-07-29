import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { Integration } from '@/lib/models/Integration';
import { createLeadFromWebhook } from '@/lib/ingest';

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

  if (mode === 'subscribe' && expected && token === expected) {
    return new NextResponse(challenge || '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// Optional signature check — only enforced when an App Secret is saved.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function signatureOk(raw: string, header: string | null, cfg: Record<string, any> | null): boolean {
  const appSecret = cfg?.appSecret || process.env.FACEBOOK_APP_SECRET;
  if (!appSecret) return true; // not configured → can't verify, allow
  if (!header) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(raw, 'utf-8').digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header));
  } catch {
    return false;
  }
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

  if (!signatureOk(raw, req.headers.get('x-hub-signature-256'), cfg)) {
    console.warn('Rejected Facebook webhook — invalid signature');
    return new NextResponse('Forbidden', { status: 403 });
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
