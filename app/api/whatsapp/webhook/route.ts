import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/whatsapp';
import { generateWhatsAppReply } from '@/lib/chatbot/whatsappBrain';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Inbound WhatsApp webhook — Twilio only.
//
// Twilio POSTs application/x-www-form-urlencoded for every inbound message and
// expects a TwiML XML reply inline. The reply is produced by the SAME "Ezy AI"
// brain via generateWhatsAppReply() — the deterministic rule engine + self-trained
// knowledge base + optional Claude backup, grounded in lib/chatbot/knowledge.ts,
// with per-phone conversation memory.
//
// Configure this URL:
//   Twilio: Console → Messaging → Senders → WhatsApp → "When a message comes in".

function twimlReply(reply: string): NextResponse {
  const safe = reply.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`;
  return new NextResponse(twiml, { status: 200, headers: { 'Content-Type': 'text/xml' } });
}

export async function POST(req: NextRequest) {
  // ── Twilio (form-encoded) ─────────────────────────────────────────────────
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
  const bodyText = (params.Body || '').toString();
  console.log(`📩 Inbound WhatsApp (Twilio) from ${from}: ${bodyText}`);

  const reply = await generateWhatsAppReply(from, bodyText);

  // Respond with TwiML — Twilio delivers <Message> back to the sender.
  return twimlReply(reply);
}
