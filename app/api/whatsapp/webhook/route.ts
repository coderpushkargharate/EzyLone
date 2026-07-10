import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature, buildAutoReplyMessage } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Inbound WhatsApp webhook. Twilio POSTs here (application/x-www-form-urlencoded)
// whenever a user messages our WhatsApp number, and expects a TwiML XML reply.
// Configure this URL in the Twilio Console:
//   Messaging → Try it out → WhatsApp Sandbox → "When a message comes in"
//   → https://<your-domain>/api/whatsapp/webhook  (POST)
//
// The auto-reply is free-text (allowed because the user just messaged us, which
// opens the 24-hour customer-service window).
export async function POST(req: NextRequest) {
  // Twilio sends form-encoded params, not JSON.
  const form = await req.formData();
  const params: Record<string, string> = {};
  form.forEach((value, key) => {
    params[key] = typeof value === 'string' ? value : '';
  });

  // Verify the request really came from Twilio. The signed URL must be the exact
  // public URL Twilio called — honour proxy headers so it matches behind Vercel.
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const url = `${proto}://${host}${req.nextUrl.pathname}`;
  const signature = req.headers.get('x-twilio-signature');

  if (!validateTwilioSignature(url, params, signature)) {
    console.warn('Rejected WhatsApp webhook — invalid Twilio signature');
    return new NextResponse('Forbidden', { status: 403 });
  }

  const from = params.From || 'unknown';
  const bodyText = params.Body || '';
  console.log(`📩 Inbound WhatsApp from ${from}: ${bodyText}`);

  // Respond with TwiML — Twilio delivers <Message> back to the sender.
  const reply = buildAutoReplyMessage()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${reply}</Message></Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  });
}
