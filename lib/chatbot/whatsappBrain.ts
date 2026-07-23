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
import { matchKnowledge, logChat, bumpHits, HIGH_CONFIDENCE } from './knowledgeBase';
import { connectDB } from '@/lib/db';
import { WhatsAppSession } from '@/lib/models/WhatsAppSession';

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
  try {
    await connectDB();
    const doc = await WhatsAppSession.findOne({ phone }).lean();
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

  // 3) Free-form answering (only OUTSIDE a structured flow and when NOT finalising
  // a lead, so flow/lead replies stay deterministic and we never run extra I/O on
  // a lead turn → keeps us under the webhook timeout). Same priority as the
  // website chat: (a) self-trained knowledge base, (b) engine intent, (c) optional
  // LLM backup (off unless CHATBOT_LLM_ENABLED=true). Every turn is logged.
  const inFlow = !!result.state.flow;
  let usedLlm = false;
  if (!inFlow && !result.lead) {
    try {
      const kb = await matchKnowledge(bodyText, 'whatsapp');
      if (kb && kb.score >= HIGH_CONFIDENCE) {
        reply = kb.answer;
        bumpHits(kb.entryId);
        await logChat({ question: userText, answer: kb.answer, source: 'knowledge', matched: true, score: kb.score, matchedEntry: kb.entryId, channel: 'whatsapp' });
      } else if (!result.fallback) {
        await logChat({ question: userText, answer: reply, source: 'engine', matched: true, score: kb?.score || 0, channel: 'whatsapp' });
      } else if (process.env.CHATBOT_LLM_ENABLED === 'true') {
        const llm = await llmReply(buildSystemPrompt(), history, userText);
        if (llm) {
          reply = llm;
          usedLlm = true;
          await logChat({ question: userText, answer: llm, source: 'llm', matched: false, score: kb?.score || 0, channel: 'whatsapp' });
        } else {
          await logChat({ question: userText, answer: reply, source: 'fallback', matched: false, score: kb?.score || 0, channel: 'whatsapp' });
        }
      } else {
        await logChat({ question: userText, answer: reply, source: 'fallback', matched: false, score: kb?.score || 0, channel: 'whatsapp' });
      }
    } catch (e) {
      console.error('WhatsApp free-form answering failed (using rule-engine reply):', e);
    }
  }

  // 4) Surface the engine's quick-reply suggestions as tappable-looking text
  // (WhatsApp free text has no buttons here). Skip when the LLM answered.
  if (!usedLlm && result.quickReplies && result.quickReplies.length) {
    reply += `\n\n${result.quickReplies.map((q) => `▪️ ${q}`).join('\n')}`;
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
      result.lead.source = 'Ezy AI WhatsApp';
      await captureLead(result.lead);
    } catch (e) {
      console.error('WhatsApp lead capture failed:', e);
    }
  }

  return reply;
}
