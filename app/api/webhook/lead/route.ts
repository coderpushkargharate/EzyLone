import { NextRequest, NextResponse } from 'next/server';
import { createLeadFromWebhook } from '@/lib/ingest';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { isBlocked } from '@/lib/blocklist';
import { sendSecurityAlert } from '@/lib/email';
import { envFlag, safeEqual } from '@/lib/webhookAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Direct lead webhook — point any form builder / no-code tool (Zapier, Make,
// Google Forms add-ons, a custom site form) here to create a lead instantly.
//
//   POST /api/webhook/lead
//   { "name": "John Doe", "email": "john@x.com", "phone": "+91 98765 43210",
//     "message": "I need a loan", "source": "Website Form" }
//
// Authentication (fail closed): set WEBHOOK_LEAD_SECRET in the server env and
// send it as an `x-webhook-secret` header (preferred), or `?secret=` for tools
// that can't set headers (query strings can end up in proxy logs).
// Without WEBHOOK_LEAD_SECRET the endpoint answers 503 and creates nothing.
// WEBHOOK_LEAD_ALLOW_OPEN=true is an explicit escape hatch that re-opens it as a
// public, rate-limited endpoint — anyone can then create leads.

export async function POST(req: NextRequest) {
  const secret = process.env.WEBHOOK_LEAD_SECRET;
  if (!secret && !envFlag('WEBHOOK_LEAD_ALLOW_OPEN')) {
    console.error('Rejected /api/webhook/lead — WEBHOOK_LEAD_SECRET is not set (endpoint is disabled until it is).');
    sendSecurityAlert('lead-webhook-unconfigured', 'Lead webhook is rejecting requests', {
      Reason: 'WEBHOOK_LEAD_SECRET is not set — /api/webhook/lead creates no leads until it is.',
    }).catch(() => {});
    return NextResponse.json({ error: 'Lead webhook is not configured.' }, { status: 503 });
  }
  // Open mode gets the same per-IP budget as the website forms.
  const limited = checkRateLimit(req, secret ? 'webhook-lead' : 'webhook-lead-open', {
    windowMs: secret ? 60_000 : 10 * 60_000,
    max: secret ? 60 : 8,
    message: 'Too many requests. Please slow down.',
  });
  if (limited) return limited;

  if (secret) {
    const provided = req.headers.get('x-webhook-secret') || req.nextUrl.searchParams.get('secret');
    if (!safeEqual(provided, secret)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else if (await isBlocked(getClientIp(req))) {
    return NextResponse.json({ error: 'Request blocked.' }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = String(body.name || body.full_name || body.fullName || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().slice(0, 254);
  const phone = String(body.phone || body.mobile || body.phone_number || '').trim().slice(0, 20);
  const message = String(body.message || body.notes || '').trim().slice(0, 2000);
  const source = String(body.source || 'Website Form').trim().slice(0, 60);

  if (!name && !email && !phone) {
    return NextResponse.json(
      { error: 'At least one of name, email, or phone is required' },
      { status: 400 }
    );
  }

  try {
    const result = await createLeadFromWebhook({ name, email, phone, message, source });
    return NextResponse.json({ ok: true, created: result.created, leadId: result.leadId });
  } catch (e) {
    console.error('webhook/lead failed:', e);
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }
}
