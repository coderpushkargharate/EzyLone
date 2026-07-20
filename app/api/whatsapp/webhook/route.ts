import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature } from '@/lib/whatsapp';
import { runEngine, ChatState } from '@/lib/chatbot/engine';
import { buildSystemPrompt, llmReply } from '@/lib/chatbot/llm';
import { captureLead } from '@/lib/chatbot/leadCapture';
import { connectDB } from '@/lib/db';
import { WhatsAppSession } from '@/lib/models/WhatsAppSession';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Turn = { role: 'user' | 'assistant'; content: string };

// Inbound WhatsApp webhook. Twilio POSTs here (application/x-www-form-urlencoded)
// whenever a user messages our WhatsApp number, and expects a TwiML XML reply.
//
// This runs the SAME "Ezy AI" brain as the website chat widget: the deterministic
// rule engine drives products/EMI/eligibility/lead-capture flows, and (when an AI
// key is configured) Claude phrases richer free-form answers — all grounded in
// lib/chatbot/knowledge.ts and bound by the same guardrails. Conversation state +
// recent history are persisted per phone number (WhatsApp sends each message with
// no client-side state), so multi-turn flows work exactly like on the website.
//
// The reply is free text, which WhatsApp allows because the user just messaged us
// (that opens the 24-hour customer-service window).
//
// Configure this URL in the Twilio Console:
//   Messaging → Try it out → WhatsApp Sandbox → "When a message comes in"
//   (or, in production, your WhatsApp Sender's messaging webhook)
//   → https://<your-domain>/api/whatsapp/webhook   (HTTP POST)

function twimlReply(reply: string): NextResponse {
  const safe = reply.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${safe}</Message></Response>`;
  return new NextResponse(twiml, { status: 200, headers: { 'Content-Type': 'text/xml' } });
}

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
  const bodyText = (params.Body || '').toString();
  const userText = bodyText.trim() || '[non-text message]';
  console.log(`📩 Inbound WhatsApp from ${from}: ${bodyText}`);

  // 1) Load this sender's conversation memory (flow state + recent history). If
  // the DB is unreachable we degrade gracefully to a stateless single-turn reply.
  let state: ChatState = {};
  let history: Turn[] = [];
  let dbReady = false;
  try {
    await connectDB();
    const doc = await WhatsAppSession.findOne({ phone: from }).lean();
    if (doc) {
      state = (doc.state || {}) as ChatState;
      history = (doc.history || []) as Turn[];
    }
    dbReady = true;
  } catch (e) {
    console.error('WhatsApp session load failed (replying statelessly):', e);
  }

  // 2) Run the rule engine (source of truth for flows + lead capture).
  const result = runEngine(bodyText, state);
  let reply = result.reply;

  // 3) Optional LLM upgrade — only for free-form answers OUTSIDE a structured flow
  // and when we're NOT finalising a lead (so flow/lead replies stay deterministic
  // and we never run the LLM and lead-capture on the same turn → keeps us well
  // under Twilio's webhook timeout).
  const inFlow = !!result.state.flow;
  let usedLlm = false;
  if (!inFlow && !result.lead && process.env.CHATBOT_LLM_ENABLED !== 'false') {
    try {
      const llm = await llmReply(buildSystemPrompt(), history, userText);
      if (llm) {
        reply = llm;
        usedLlm = true;
      }
    } catch (e) {
      console.error('WhatsApp LLM reply failed (using rule-engine reply):', e);
    }
  }

  // 4) Surface the engine's quick-reply suggestions as tappable-looking text
  // (WhatsApp free text has no buttons here). Skip when the LLM answered, to
  // avoid a mismatched menu under a free-form reply.
  if (!usedLlm && result.quickReplies && result.quickReplies.length) {
    reply += `\n\n${result.quickReplies.map((q) => `▪️ ${q}`).join('\n')}`;
  }

  // 5) Persist updated state + trimmed history for the next inbound message.
  if (dbReady) {
    const newHistory = [...history, { role: 'user', content: userText }, { role: 'assistant', content: reply }].slice(-10);
    try {
      await WhatsAppSession.findOneAndUpdate(
        { phone: from },
        { $set: { state: result.state, history: newHistory } },
        { upsert: true, new: false },
      );
    } catch (e) {
      console.error('WhatsApp session save failed:', e);
    }
  }

  // 6) If the engine captured a lead, run the SAME pipeline as the website chat
  // (DB + admin email + CRM + WhatsApp confirmation). Guarded; never blocks reply.
  if (result.lead) {
    try {
      // Tag the channel so the admin/CRM can tell WhatsApp leads from web-chat ones.
      result.lead.source = 'Ezy AI WhatsApp';
      await captureLead(result.lead);
    } catch (e) {
      console.error('WhatsApp lead capture failed:', e);
    }
  }

  // Respond with TwiML — Twilio delivers <Message> back to the sender.
  return twimlReply(reply);
}
