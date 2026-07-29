import { NextRequest, NextResponse } from 'next/server';
import { createLeadFromWebhook } from '@/lib/ingest';
import { checkRateLimit } from '@/lib/rateLimit';

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
  const limited = checkRateLimit(req, 'webhook-lead', {
    windowMs: 60_000,
    max: 60,
    message: 'Too many requests. Please slow down.',
  });
  if (limited) return limited;

  const secret = process.env.WEBHOOK_LEAD_SECRET;
  if (secret) {
    const provided = req.headers.get('x-webhook-secret') || req.nextUrl.searchParams.get('secret');
    if (provided !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = String(body.name || body.full_name || body.fullName || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || body.mobile || body.phone_number || '').trim();
  const message = String(body.message || body.notes || '').trim();
  const source = String(body.source || 'Website Form').trim();

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
