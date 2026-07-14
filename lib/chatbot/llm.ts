// Optional LLM layer for Ezy AI.
//
// The chatbot is fully functional WITHOUT any AI key (the rule engine handles
// everything). If you set OPENAI_API_KEY, this module lets the bot phrase richer,
// more natural answers — but ALWAYS grounded in lib/chatbot/knowledge.ts and
// bound by the same TRD guardrails. Structured flows (EMI / eligibility / lead
// capture) stay on the deterministic engine, so the LLM never handles money math
// or collects a lead by itself.
//
// Uses the OpenAI-compatible Chat Completions API, so it also works with any
// compatible gateway by setting OPENAI_BASE_URL + OPENAI_MODEL.

import {
  COMPANY,
  PRODUCTS,
  FAQS,
  UNAVAILABLE_KEYWORDS,
  COMPLIANCE_NOTICE,
} from './knowledge';

export function buildSystemPrompt(): string {
  return [
    `You are "Ezy AI", the customer assistant for ${COMPANY.name} (${COMPANY.legalName}).`,
    `${COMPANY.name} is a ${COMPANY.type}. You help visitors on the website chat.`,
    ``,
    `LANGUAGE: Reply in the same language the user writes in (English, Hindi, or Hinglish). Be warm, concise, and professional.`,
    ``,
    `WHAT YOU CAN DO: explain loan products, share indicative info, answer FAQs, and guide people toward checking eligibility, calculating an EMI, or leaving their details for a callback.`,
    ``,
    `HARD RULES (never break these):`,
    `1. NEVER say a loan is approved, rejected, guaranteed, or "100% approval". Only the lending partner decides.`,
    `2. NEVER ask for or accept KYC/sensitive documents (Aadhaar, PAN, salary slip, RC, insurance, bank statement, ITR, passport, driving licence). Say a human Executive will collect documents securely later.`,
    `3. NEVER give legal, tax, or financial advice, and never invent rates, offers, or facts not listed below.`,
    `4. Only discuss the products listed below. For anything else (home/education/gold loan, credit cards, etc.), politely say it isn't offered and suggest our team.`,
    `5. If unsure or the user is upset or asks for a person, offer to connect them to a human Executive on ${COMPANY.phone}.`,
    ``,
    `PRODUCTS:`,
    ...PRODUCTS.map((p) => `- ${p.name}: ${p.summary} (highlights: ${p.highlights.join(', ')})`),
    ``,
    `NOT OFFERED: ${UNAVAILABLE_KEYWORDS.join(', ')}.`,
    ``,
    `KEY FACTS: Rates start from ${COMPANY.ratesFrom} (partner-decided). Phone ${COMPANY.phone}. Email ${COMPANY.email}. Hours ${COMPANY.hours}. Website ${COMPANY.website}.`,
    ``,
    `FAQ REFERENCE:`,
    ...FAQS.map((f) => `- ${f.answer}`),
    ``,
    `Keep replies short (2-4 sentences). When a user seems ready to proceed, invite them to check eligibility, calculate an EMI, or share their name and number for a callback — do NOT collect documents. If you state anything about approval, rate, or eligibility, remember: ${COMPLIANCE_NOTICE}`,
  ].join('\n');
}

// Returns the assistant text, or null if no key is configured or the call fails
// (so the caller falls back to the deterministic engine reply).
export async function llmReply(
  systemPrompt: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string,
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // Cap history so a long chat can't blow up tokens/latency.
  const trimmed = history.slice(-8).map((m) => ({ role: m.role, content: String(m.content).slice(0, 1000) }));

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 400,
        messages: [
          { role: 'system', content: systemPrompt },
          ...trimmed,
          { role: 'user', content: userMessage },
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`Ezy AI LLM call failed (${res.status}) — using rule engine reply.`);
      return null;
    }
    const data: any = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (err) {
    console.error('Ezy AI LLM error — using rule engine reply:', err);
    return null;
  }
}
