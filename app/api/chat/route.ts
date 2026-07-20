import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { runEngine, ChatState } from '@/lib/chatbot/engine';
import { buildSystemPrompt, llmReply } from '@/lib/chatbot/llm';
import { captureLead } from '@/lib/chatbot/leadCapture';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatBody {
  message?: string;
  state?: ChatState;
  history?: { role: 'user' | 'assistant'; content: string }[];
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

  // The rule engine is the source of truth for flows (EMI/eligibility/lead) and
  // for lead capture — it's deterministic and compliance-safe. We ALWAYS run it.
  const result = runEngine(message, state);

  // Fire lead capture (CRM + WhatsApp) when the engine produced one.
  if (result.lead) {
    // Don't block the reply on network I/O — but do await so serverless doesn't
    // freeze the function before the fetch resolves.
    await captureLead(result.lead);
  }

  // Optional LLM upgrade: if a key is configured AND we're not inside a
  // structured flow (EMI/eligibility/lead), let the LLM phrase a richer answer
  // grounded in the same knowledge base. Flows stay on the deterministic engine
  // so guardrails and lead capture are never bypassed.
  const inFlow = !!result.state.flow;
  if (!inFlow && process.env.CHATBOT_LLM_ENABLED !== 'false') {
    const llm = await llmReply(buildSystemPrompt(), body.history || [], message);
    if (llm) {
      return NextResponse.json({
        reply: llm,
        quickReplies: result.quickReplies,
        state: result.state,
        handoff: result.handoff || false,
      });
    }
  }

  return NextResponse.json({
    reply: result.reply,
    quickReplies: result.quickReplies || [],
    state: result.state,
    handoff: result.handoff || false,
  });
}
