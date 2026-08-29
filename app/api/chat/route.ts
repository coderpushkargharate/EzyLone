import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { runEngine, ChatState } from '@/lib/chatbot/engine';
import { buildSystemPrompt, llmReply } from '@/lib/chatbot/llm';
import { captureLead } from '@/lib/chatbot/leadCapture';
import { matchKnowledge, logChat, bumpHits, HIGH_CONFIDENCE } from '@/lib/chatbot/knowledgeBase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatBody {
  message?: string;
  state?: ChatState;
  history?: { role: 'user' | 'assistant'; content: string }[];
  via?: 'text' | 'voice'; // how the visitor entered the message (typed vs mic)
}

// POST /api/chat — public (rate-limited). Returns { reply, quickReplies, state }.
export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, 'chat', {
    windowMs: 60 * 1000,
    max: 30,
    message: 'You’re sending messages a bit fast. Please wait a moment and try again.',
  });
  if (limited) return limited;

  let body: ChatBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  const message = (body.message || '').toString().slice(0, 1000);
  const state = body.state || {};
  const via = body.via === 'voice' ? 'voice' : 'text';

  // The rule engine is the source of truth for flows (EMI/eligibility/lead) and
  // for lead capture — it's deterministic and compliance-safe. We ALWAYS run it.
  const result = runEngine(message, state);

  // Fire lead capture (CRM + WhatsApp) when the engine produced one.
  if (result.lead) {
    // Don't block the reply on network I/O — but do await so serverless doesn't
    // freeze the function before the fetch resolves.
    await captureLead(result.lead);
  }

  // Inside a structured flow (EMI/eligibility/lead/callback) the deterministic
  // engine is the sole authority — never let the brain or LLM hijack a flow.
  const inFlow = !!result.state.flow;
  if (inFlow) {
    return NextResponse.json({
      reply: result.reply,
      quickReplies: result.quickReplies || [],
      state: result.state,
      handoff: result.handoff || false,
    });
  }

  // ── Free-form answering ────────────────────────────────────────────────────
  // Priority: (1) our SELF-TRAINED knowledge base, (2) the engine's recognised
  // intents (greeting / product / FAQ / handoff), (3) an OPTIONAL LLM backup
  // (off unless CHATBOT_LLM_ENABLED=true), (4) the engine's generic fallback.
  // Every turn is logged so admins can teach the bot answers for what it missed.

  // 1. Self-trained knowledge base. Guarded: a DB hiccup must never break chat —
  // we simply fall through to the engine's own answer.
  let kb: Awaited<ReturnType<typeof matchKnowledge>> = null;
  try {
    kb = await matchKnowledge(message);
  } catch (err) {
    console.error('Ezy AI knowledge match failed (using rule engine):', err);
  }
  if (kb && kb.score >= HIGH_CONFIDENCE) {
    bumpHits(kb.entryId); // fire-and-forget
    await logChat({
      question: message, answer: kb.answer, source: 'knowledge',
      matched: true, score: kb.score, matchedEntry: kb.entryId, channel: 'web', via,
    });
    return NextResponse.json({
      reply: kb.answer,
      quickReplies: result.quickReplies || [],
      state: result.state,
      handoff: false,
    });
  }

  // 2. Engine recognised a specific intent (not its generic catch-all).
  if (!result.fallback) {
    await logChat({
      question: message, answer: result.reply, source: 'engine',
      matched: true, score: kb?.score || 0, channel: 'web', via,
    });
    return NextResponse.json({
      reply: result.reply,
      quickReplies: result.quickReplies || [],
      state: result.state,
      handoff: result.handoff || false,
    });
  }

  // 3. Optional LLM backup — only when explicitly enabled by the owner.
  if (process.env.CHATBOT_LLM_ENABLED === 'true') {
    const llm = await llmReply(buildSystemPrompt(), body.history || [], message);
    if (llm) {
      await logChat({
        question: message, answer: llm, source: 'llm',
        matched: false, score: kb?.score || 0, channel: 'web', via,
      });
      return NextResponse.json({
        reply: llm,
        quickReplies: result.quickReplies,
        state: result.state,
        handoff: result.handoff || false,
      });
    }
  }

  // 4. Nothing confident — the engine's helpful catch-all. Log as UNANSWERED so
  // it shows up in the admin "Needs training" list.
  await logChat({
    question: message, answer: result.reply, source: 'fallback',
    matched: false, score: kb?.score || 0, channel: 'web', via,
  });
  return NextResponse.json({
    reply: result.reply,
    quickReplies: result.quickReplies || [],
    state: result.state,
    handoff: result.handoff || false,
  });
}
