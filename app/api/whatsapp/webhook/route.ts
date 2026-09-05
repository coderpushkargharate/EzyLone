import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/whatsapp';
import { generateWhatsAppReply, getContactMode, recordInboundMessage } from '@/lib/chatbot/whatsappBrain';
import { sendAdminPush } from '@/lib/push';

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

// Empty TwiML — acknowledges the inbound message to Twilio WITHOUT sending any
// auto-reply. Used when an admin has put this conversation in "manual" mode and
// will reply to the user by hand from the panel.
function twimlSilent(): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;
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

  // Alert the admin app immediately (works even when it's closed). The sender's
  // name (if Twilio provides one) or number, plus a short message preview.
  const waWho = (params.ProfileName || '').trim() || from.replace('whatsapp:', '');
  void sendAdminPush({
    title: `New WhatsApp message from ${waWho}`,
    body: bodyText ? bodyText.slice(0, 140) : 'Sent a message',
    // Deep-link straight to the WhatsApp Chats tab (admin page reads ?tab=).
    url: '/admin?tab=whatsappChats',
    tag: 'wa',
    // MessageSid is identical across Twilio's webhook retries, so the SW can
    // ignore a retry and avoid double-counting the icon badge.
    dedupeId: params.MessageSid || params.SmsMessageSid || undefined,
  });

  // If an admin has taken this conversation over (manual mode), stay silent:
  // record the inbound message for the panel and let a human reply by hand.
  const mode = await getContactMode(from);
  if (mode === 'manual') {
    console.log(`   ↳ manual mode — bot silent, awaiting human reply.`);
    await recordInboundMessage(from, bodyText);
    return twimlSilent();
  }

  const reply = await generateWhatsAppReply(from, bodyText);

  // Respond with TwiML — Twilio delivers <Message> back to the sender.
  return twimlReply(reply);
}
