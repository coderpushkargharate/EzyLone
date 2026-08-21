// Shared "Ezy AI" brain pipeline for inbound WhatsApp messages, used by BOTH the
// Twilio path (returns TwiML) and the Meta Cloud API path (sends via Graph API)
// in app/api/whatsapp/webhook/route.ts.
//
// It runs the SAME brain as the website chat widget: the deterministic rule
// engine drives products/EMI/eligibility/lead-capture flows; a self-trained
// knowledge base answers free-form questions; an optional LLM backup phrases
// richer answers (off unless CHATBOT_LLM_ENABLED=true). Per-phone conversation
// state + recent history are persisted (WhatsApp is stateless per message) so
// multi-turn flows work exactly like on the website. Every non-flow turn is
// logged (channel 'whatsapp') so admins can train answers for what it missed.
//
// Contract: never throws. On any DB/AI hiccup it degrades to the rule engine's
// deterministic reply so the user always gets an answer.

import { runEngine, ChatState } from './engine';
import { buildSystemPrompt, llmReply } from './llm';
import { captureLead } from './leadCapture';
import { createLeadFromWebhook } from '@/lib/ingest';
import { matchKnowledge, logChat, bumpHits, HIGH_CONFIDENCE } from './knowledgeBase';
import { connectDB } from '@/lib/db';
import { WhatsAppSession } from '@/lib/models/WhatsAppSession';
import { WhatsAppMessage } from '@/lib/models/WhatsAppMessage';

// Last 10 digits of a WhatsApp sender id ("whatsapp:+919518745854" → "9518745854")
// so a direct-contact lead dedupes against a form/chat lead for the same person.
function normalizePhone(raw: string): string {
  return (raw.match(/\d/g) || []).join('').slice(-10);
}

type Turn = { role: 'user' | 'assistant'; content: string };

/**
 * Produce the auto-reply text for one inbound WhatsApp message from `phone`.
 * Loads/saves that sender's conversation memory and fires lead capture when the
 * engine completes a lead. Returns the reply string to deliver.
 */
export async function generateWhatsAppReply(phone: string, bodyText: string): Promise<string> {
  const userText = (bodyText || '').trim() || '[non-text message]';

  // 1) Load this sender's conversation memory (flow state + recent history). If
  // the DB is unreachable we degrade gracefully to a stateless single-turn reply.
  let state: ChatState = {};
  let history: Turn[] = [];
  let dbReady = false;
  let isNewSender = false;
  try {
    await connectDB();
    const doc = await WhatsAppSession.findOne({ phone }).lean();
    if (doc) {
      state = (doc.state || {}) as ChatState;
      history = (doc.history || []) as Turn[];
    } else {
      isNewSender = true; // first time we've heard from this number
    }
    dbReady = true;
  } catch (e) {
    console.error('WhatsApp session load failed (replying statelessly):', e);
  }

  // A first-time WhatsApp contact is a lead in itself — even if they never fill a
  // form or complete a flow, their number + first message must land in the CRM.
  // Deduped by phone, so if they later complete a flow captureLead updates the
  // same card. Fire-and-forget; never blocks the reply.
  if (isNewSender) {
    const digits = normalizePhone(phone);
    if (digits.length >= 10) {
      try {
        await createLeadFromWebhook({
          name: `WhatsApp ${digits}`,
          phone: digits,
          source: 'EzySaathi AI WhatsApp',
          message: `Started a WhatsApp conversation: ${userText}`,
          priority: 'WARM',
          leadStage: 'New Lead',
        });
      } catch (e) {
        console.error('WhatsApp direct-contact CRM lead failed:', e);
      }
    }
  }

  // 2) Run the rule engine (source of truth for flows + lead capture).
  const result = runEngine(bodyText, state);
  let reply = result.reply;

  // 3) Free-form answering (only OUTSIDE a structured flow and when NOT finalising
  // a lead, so flow/lead replies stay deterministic and we never run extra I/O on
  // a lead turn → keeps us under the webhook timeout). Same priority as the
  // website chat: (a) self-trained knowledge base, (b) engine intent, (c) optional
  // LLM backup (off unless CHATBOT_LLM_ENABLED=true). Every turn is logged.
  const inFlow = !!result.state.flow;
  let usedLlm = false;
  // Per-turn metadata for the durable transcript (see step 4b). Defaults describe
  // a structured-flow / lead turn; the free-form branch below overrides them.
  let turnSource = inFlow || result.lead ? 'flow' : 'engine';
  let turnMatched = !inFlow && !result.lead ? true : false;
  let turnScore = 0;
  if (!inFlow && !result.lead) {
    try {
      const kb = await matchKnowledge(bodyText, 'whatsapp');
      turnScore = kb?.score || 0;
      if (kb && kb.score >= HIGH_CONFIDENCE) {
        reply = kb.answer;
        bumpHits(kb.entryId);
        turnSource = 'knowledge'; turnMatched = true;
        await logChat({ question: userText, answer: kb.answer, source: 'knowledge', matched: true, score: kb.score, matchedEntry: kb.entryId, channel: 'whatsapp' });
      } else if (!result.fallback) {
        turnSource = 'engine'; turnMatched = true;
        await logChat({ question: userText, answer: reply, source: 'engine', matched: true, score: kb?.score || 0, channel: 'whatsapp' });
      } else if (process.env.CHATBOT_LLM_ENABLED === 'true') {
        const llm = await llmReply(buildSystemPrompt(), history, userText);
        if (llm) {
          reply = llm;
          usedLlm = true;
          turnSource = 'llm'; turnMatched = false;
          await logChat({ question: userText, answer: llm, source: 'llm', matched: false, score: kb?.score || 0, channel: 'whatsapp' });
        } else {
          turnSource = 'fallback'; turnMatched = false;
          await logChat({ question: userText, answer: reply, source: 'fallback', matched: false, score: kb?.score || 0, channel: 'whatsapp' });
        }
      } else {
        turnSource = 'fallback'; turnMatched = false;
        await logChat({ question: userText, answer: reply, source: 'fallback', matched: false, score: kb?.score || 0, channel: 'whatsapp' });
      }
    } catch (e) {
      console.error('WhatsApp free-form answering failed (using rule-engine reply):', e);
    }
  }

  // 4) Surface the engine's quick-reply suggestions as a NUMBERED menu (WhatsApp
  // free text has no buttons here). The user can reply with just the number
  // (e.g. "1") or type the option name — runEngine's resolveMenuPick maps the
  // number back to the option next turn. Skip when the LLM answered.
  if (!usedLlm && result.quickReplies && result.quickReplies.length) {
    const keycap = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    reply += `\n\n${result.quickReplies.map((q, i) => `${keycap[i] || `${i + 1}.`} ${q}`).join('\n')}`;
    reply += `\n\n_Reply with the number (e.g. 1) or the name._`;
  }

  // 4b) Durably record this turn (user message + final reply) keyed by phone, so
  // admins can read each user's full WhatsApp conversation history in the panel
  // and see the questions people ask. Fire-and-forget; a failure never blocks the
  // reply. Unlike ChatLog this captures EVERY turn (flows + free-form) and never
  // expires, giving a complete transcript per user.
  try {
    if (dbReady) {
      await WhatsAppMessage.create({
        phone,
        userMessage: userText,
        botReply: reply,
        source: turnSource,
        matched: turnMatched,
        score: turnScore,
        inFlow,
      });
    }
  } catch (e) {
    console.error('WhatsApp transcript log failed:', e);
  }

  // 5) Persist updated state + trimmed history for the next inbound message.
  if (dbReady) {
    const newHistory = [...history, { role: 'user', content: userText }, { role: 'assistant', content: reply }].slice(-10);
    try {
      await WhatsAppSession.findOneAndUpdate(
        { phone },
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
      result.lead.source = 'EzySaathi AI WhatsApp';
      await captureLead(result.lead);
    } catch (e) {
      console.error('WhatsApp lead capture failed:', e);
    }
  }

  return reply;
}
