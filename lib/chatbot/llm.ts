// LLM layer for Ezy AI.
//
// The chatbot is fully functional WITHOUT any AI key (the rule engine handles
// everything). When a key is configured, this module lets the bot phrase richer,
// more natural, ChatGPT-style answers to free-form questions — but ALWAYS grounded
// in lib/chatbot/knowledge.ts and bound by the same TRD guardrails. Structured
// flows (EMI / eligibility / lead capture) stay on the deterministic engine, so the
// LLM never handles money math or collects a lead by itself.
//
// Provider preference:
//   1. ANTHROPIC_API_KEY  → Claude (recommended) via the official @anthropic-ai/sdk.
//   2. OPENAI_API_KEY      → OpenAI-compatible Chat Completions (legacy fallback).
//   3. neither             → returns null, caller falls back to the rule engine.

import Anthropic from '@anthropic-ai/sdk';
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
    `LANGUAGE: Reply in the same language the user writes in (English, Hindi, or Hinglish). Be warm, concise, and genuinely helpful — like a knowledgeable, friendly human advisor.`,
    ``,
    `HOW TO ANSWER: Understand what the visitor actually wants and answer it directly and naturally. You can:`,
    `- Explain our loan products and share indicative info.`,
    `- Explain general loan/finance concepts in simple terms (e.g. what a credit score is, how an EMI works, what balance transfer means, fixed vs floating rate) — this is educational, not advice.`,
    `- Answer everyday/small-talk questions politely, then steer back to how we can help.`,
    `- Guide people toward checking eligibility, calculating an EMI, or leaving their details for a callback.`,
    `If you don't know something or it's outside what ${COMPANY.name} offers, say so honestly and offer to connect them with our team — never make up facts.`,
    ``,
    `HARD RULES (never break these):`,
    `1. NEVER say a loan is approved, rejected, guaranteed, or "100% approval". Only the lending partner decides.`,
    `2. NEVER ask for or accept KYC/sensitive documents (Aadhaar, PAN, salary slip, RC, insurance, bank statement, ITR, passport, driving licence). Say a human Executive will collect documents securely later.`,
    `3. NEVER give personalised legal, tax, or investment advice, and never invent rates, offers, EMI figures, or facts not listed below. General educational explanations are fine.`,
    `4. Only offer or discuss the loan PRODUCTS listed below. If asked about a product we don't offer (home/education/gold loan, credit cards, etc.), politely say we don't offer it and suggest our team — but you may still briefly explain the general concept if asked.`,
    `5. If unsure, or the user is upset or asks for a person, offer to connect them to a human Executive on ${COMPANY.phone}.`,
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
    `STYLE: Keep replies short (2-4 sentences) unless the user clearly wants detail. When a visitor seems ready to proceed, invite them to check eligibility, calculate an EMI, or share their name and number for a callback — do NOT collect documents. If you state anything about approval, rate, or eligibility, remember: ${COMPLIANCE_NOTICE}`,
  ].join('\n');
}

// Anthropic client — created lazily so a missing key never breaks import/build.
// timeout + a single retry keep a slow/hiccuping API from blocking the chat reply.
let anthropicClient: Anthropic | null = null;
function getAnthropic(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: key, timeout: 12000, maxRetries: 1 });
  }
  return anthropicClient;
}

type Turn = { role: 'user' | 'assistant'; content: string };

// Claude (Anthropic Messages API). Returns the assistant text, or null on any
// failure so the caller can fall back to the deterministic engine reply.
async function claudeReply(
  systemPrompt: string,
  history: Turn[],
  userMessage: string,
): Promise<string | null> {
  const client = getAnthropic();
  if (!client) return null;

  const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';

  // Cap history so a long chat can't blow up tokens/latency, then append the
  // current turn. The Messages API requires the first message to be a user turn,
  // so drop any leading assistant turns (e.g. the UI's welcome message).
  const messages: Turn[] = history
    .slice(-8)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 1000) }))
    .filter((m) => m.content.trim().length > 0);
  messages.push({ role: 'user', content: userMessage });
  while (messages.length && messages[0].role === 'assistant') messages.shift();
  if (messages.length === 0) return null;

  // Opus 4.7/4.8 reject sampling params; only send temperature on models that accept it.
  const acceptsTemperature = !/claude-opus-4-(7|8)/.test(model);

  try {
    const resp = await client.messages.create({
      model,
      max_tokens: 400,
      ...(acceptsTemperature ? { temperature: 0.3 } : {}),
      // Static system prompt → mark it cacheable (kicks in once the knowledge
      // base is large enough to meet the model's minimum cacheable prefix).
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages,
    });

    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();
    return text || null;
  } catch (err) {
    console.error('Ezy AI Claude error — using rule engine reply:', err);
    return null;
  }
}

// OpenAI-compatible Chat Completions (legacy fallback). Returns text or null.
async function openaiReply(
  systemPrompt: string,
  history: Turn[],
  userMessage: string,
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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
      console.error(`Ezy AI OpenAI call failed (${res.status}) — using rule engine reply.`);
      return null;
    }
    const data: any = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (err) {
    console.error('Ezy AI OpenAI error — using rule engine reply:', err);
    return null;
  }
}

// Returns the assistant text, or null if no provider is configured or the call
// fails (so the caller falls back to the deterministic engine reply). Claude is
// preferred when ANTHROPIC_API_KEY is set; OpenAI is a legacy fallback.
export async function llmReply(
  systemPrompt: string,
  history: Turn[],
  userMessage: string,
): Promise<string | null> {
  if (process.env.ANTHROPIC_API_KEY) {
    return claudeReply(systemPrompt, history, userMessage);
  }
  if (process.env.OPENAI_API_KEY) {
    return openaiReply(systemPrompt, history, userMessage);
  }
  return null;
}
