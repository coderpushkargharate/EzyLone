import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/whatsapp';
import { sendMetaText, verifyMetaChallenge, validateMetaSignature, parseMetaInbound } from '@/lib/whatsappMeta';
import { generateWhatsAppReply } from '@/lib/chatbot/whatsappBrain';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Inbound WhatsApp webhook — supports BOTH providers:
//
//  • Meta WhatsApp Cloud API (the direct, cheaper path): Meta first calls this
//    URL with a GET verification challenge, then POSTs JSON for every inbound
//    message. We reply by POSTing back to the Graph API (sendMetaText) and just
//    200-ack the webhook.
//  • Twilio: POSTs application/x-www-form-urlencoded and expects a TwiML XML
//    reply inline.
//
// Both run the SAME "Ezy AI" brain via generateWhatsAppReply() — the deterministic
// rule engine + self-trained knowledge base + optional Claude backup, all grounded
// in lib/chatbot/knowledge.ts, with per-phone conversation memory.
//
// Configure this URL:
//   Meta:   developers.facebook.com → your App → WhatsApp → Configuration →
//           Callback URL = https://<domain>/api/whatsapp/webhook, Verify token =
//           META_WHATSAPP_VERIFY_TOKEN, then Subscribe to the "messages" field.
//   Twilio: Console → Messaging → Senders → WhatsApp → "When a message comes in".

function twimlReply(reply: string): NextResponse {
  const safe = reply.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`;
  return new NextResponse(twiml, { status: 200, headers: { 'Content-Type': 'text/xml' } });
}

// ── GET: Meta webhook verification handshake ────────────────────────────────
export async function GET(req: NextRequest) {
  const challenge = verifyMetaChallenge(req.nextUrl.searchParams);
  if (challenge !== null) {
    return new NextResponse(challenge, { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || '';

  // ── Meta Cloud API (JSON) ─────────────────────────────────────────────────
  if (contentType.includes('application/json')) {
    // Read the RAW body so we can verify Meta's signature over the exact bytes.
    const raw = await req.text();
    if (!validateMetaSignature(raw, req.headers.get('x-hub-signature-256'))) {
      console.warn('Rejected WhatsApp webhook — invalid Meta signature');
      return new NextResponse('Forbidden', { status: 403 });
    }

    let payload: any = {};
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: true }); // malformed → ack & ignore
    }

    const inbound = parseMetaInbound(payload);
    // No message (delivery/read status event, etc.) → just acknowledge.
    if (!inbound) return NextResponse.json({ ok: true });

    console.log(`📩 Inbound WhatsApp (Meta) from ${inbound.from}: ${inbound.text}`);
    try {
      const reply = await generateWhatsAppReply(inbound.from, inbound.text);
      await sendMetaText(inbound.from, reply);
    } catch (e) {
      console.error('Meta WhatsApp handling failed:', e);
    }
    // Always 200 quickly so Meta doesn't retry/disable the webhook.
    return NextResponse.json({ ok: true });
  }

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
