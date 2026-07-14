import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { runEngine, ChatState, LeadData } from '@/lib/chatbot/engine';
import { buildSystemPrompt, llmReply } from '@/lib/chatbot/llm';
import { connectDB } from '@/lib/db';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { syncLeadToCrm } from '@/lib/crm';
import { sendLoanAdminNotification } from '@/lib/email';
import { sendLeadConfirmationWhatsApp } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatBody {
  message?: string;
  state?: ChatState;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

// A chat-captured lead goes through the SAME pipeline as an "Apply Now" (calling
// team) lead: it is saved to the LoanApplication collection (so it appears in the
// admin dashboard alongside every other lead), then an admin email, CRM sync, and
// a WhatsApp confirmation are sent. Fields the chat doesn't collect (email,
// pincode, CIBIL) get tidy "via chat" placeholders. Every step is guarded so a
// DB/mail/CRM/Twilio hiccup never breaks the chat reply — the lead is saved first.
async function captureLead(lead: LeadData) {
  const fullName = lead.name || 'Ezy AI Lead';
  const phoneNumber = lead.phone || '';
  const loanType = lead.loanType || 'General enquiry';
  const employmentType = lead.employment || 'Not specified';
  const city = lead.city || 'Not provided';
  const pincode = 'Not provided (via chat)';
  const cibilScore = 'Not shared (via chat)';

  // 1) Persist to the admin's lead list (same collection as Apply Now).
  try {
    await connectDB();
    await LoanApplication.create({
      fullName, email: undefined, phoneNumber, loanType, employmentType, city, pincode, cibilScore,
    });
  } catch (e) {
    console.error('Chat lead DB save failed:', e);
  }

  // 2) Notify the admin/lead inbox by email (same template as Apply Now).
  try {
    await sendLoanAdminNotification({
      fullName, email: '', phoneNumber, loanType, employmentType, city, pincode, cibilScore,
    });
  } catch (e) {
    console.error('Chat lead admin email failed (lead still saved):', e);
  }

  // 3) Mirror into the CRM (Privyr etc.) — carries the richer chat context.
  try {
    await syncLeadToCrm({
      name: fullName,
      phone: phoneNumber,
      message: lead.message,
      source: lead.source,
    });
  } catch (e) {
    console.error('Chat lead CRM sync failed (lead still saved):', e);
  }

  // 4) WhatsApp confirmation to the lead (template/free-text auto-picked by env).
  if (phoneNumber) {
    try {
      await sendLeadConfirmationWhatsApp(phoneNumber, fullName);
    } catch (e) {
      console.error('Chat lead WhatsApp failed (lead still saved):', e);
    }
  }
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
