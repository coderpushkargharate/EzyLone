import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createLeadFromWebhook } from '@/lib/ingest';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { isBlocked } from '@/lib/blocklist';

function secretMatches(provided: string | null, secret: string): boolean {
  if (!provided) return false;
  const a = crypto.createHash('sha256').update(provided).digest();
  const b = crypto.createHash('sha256').update(secret).digest();
  return crypto.timingSafeEqual(a, b);
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Direct lead webhook — point any form builder / no-code tool (Zapier, Make,
// Google Forms add-ons, a custom site form) here to create a lead instantly.
//
//   POST /api/webhook/lead
//   { "name": "John Doe", "email": "john@x.com", "phone": "+91 98765 43210",
//     "message": "I need a loan", "source": "Website Form" }
//
// Optional security: set WEBHOOK_LEAD_SECRET in .env.local and pass it as an
// `x-webhook-secret` header (or `?secret=` query) so only your forms can post.

export async function POST(req: NextRequest) {
  const secret = process.env.WEBHOOK_LEAD_SECRET;
  // Without a configured secret this endpoint is effectively public, so it gets
  // the same per-IP budget as the website forms. SET WEBHOOK_LEAD_SECRET in
  // production so only your own integrations can create leads.
  const limited = checkRateLimit(req, secret ? 'webhook-lead' : 'webhook-lead-open', {
    windowMs: secret ? 60_000 : 10 * 60_000,
    max: secret ? 60 : 8,
    message: 'Too many requests. Please slow down.',
  });
  if (limited) return limited;

  if (secret) {
    const provided = req.headers.get('x-webhook-secret') || req.nextUrl.searchParams.get('secret');
    if (!secretMatches(provided, secret)) {
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
