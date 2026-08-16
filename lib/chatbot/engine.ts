// Ezy AI — rule/intent engine.
//
// This is the "trained" brain that works with ZERO external API: it understands
// what the visitor wants (products, EMI, eligibility, apply, callback, human
// help), runs multi-turn flows, and captures leads — all while obeying the TRD
// guardrails (never approve/reject a loan, never ask for KYC documents).
//
// When an LLM key is configured, /api/chat uses the LLM instead and this engine
// stays as the reliable fallback. Both share lib/chatbot/knowledge.ts.

import {
  COMPANY,
  PRODUCTS,
  FAQS,
  UNAVAILABLE_KEYWORDS,
  ELIGIBILITY_RULES,
  COMPLIANCE_NOTICE,
  KYC_TERMS,
  Product,
} from './knowledge';

export interface ChatState {
  flow?: 'emi' | 'eligibility' | 'lead' | 'callback' | null;
  step?: number;
  data?: Record<string, any>;
  // The quick-reply options we offered last turn, in display order. Lets the user
  // pick by number ("1", "2"…) instead of retyping the full option/product name.
  menu?: string[];
}

export interface LeadData {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  loanType?: string;
  income?: string;
  employment?: string;
  amount?: string;
  message: string;
  source: string;
}

export interface EngineResult {
  reply: string;
  quickReplies?: string[];
  state: ChatState;
  lead?: LeadData;
  handoff?: boolean;
  // True only for the final "I want to get this right for you…" catch-all — i.e.
  // the engine did NOT recognise a specific intent. /api/chat uses this to decide
  // when to let the self-trained knowledge base or the LLM backup take over.
  fallback?: boolean;
}

const norm = (s: string) => (s || '').toLowerCase().trim();
const has = (text: string, words: string[]) => words.some((w) => text.includes(w));

// Whole-word match — avoids false hits like "Delhi".includes("hi") or
// "this".includes("hi"). Use for short/risky tokens (hi, ok, bye, menu, agent…).
const hasWord = (text: string, words: string[]) =>
  words.some((w) => new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i').test(text));

// Pull the first sensible number out of a message ("5 lakh", "₹5,00,000", "12.5%").
function parseAmount(text: string): number | null {
  const t = norm(text).replace(/,/g, '');
  const lakh = t.match(/([\d.]+)\s*(lakh|lac|lakhs|l\b)/);
  if (lakh) return Math.round(parseFloat(lakh[1]) * 100000);
  const crore = t.match(/([\d.]+)\s*(crore|cr\b)/);
  if (crore) return Math.round(parseFloat(crore[1]) * 10000000);
  const m = t.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

function findProduct(text: string): Product | undefined {
  return PRODUCTS.find((p) => has(text, p.keywords) || text.includes(norm(p.name)));
}

const DEFAULT_QUICK = ['Loan products', 'EMI calculator', 'Check eligibility', 'Talk to a human'];

function withNotice(reply: string): string {
  return `${reply}\n\n_${COMPLIANCE_NOTICE}_`;
}

// Single source for the "here's everything we offer" reply — lists ALL products
// with a summary AND exposes every product name as a tappable quick reply, so no
// service is ever hidden behind a scroll or a "which one?" guess.
function productListResult(): EngineResult {
  return {
    reply:
      `Here’s everything we offer at ${COMPANY.name}:\n\n` +
      PRODUCTS.map((p) => `• *${p.name}* — ${p.summary}`).join('\n') +
      `\n\nTap a loan to know more, or ask me to check eligibility.`,
    quickReplies: [...PRODUCTS.map((p) => p.name), 'Check eligibility'],
    state: {},
  };
}

// EMI = P·r·(1+r)^n / ((1+r)^n − 1)
function calcEmi(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100;
  const emi = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = emi * months;
  return {
    emi: Math.round(emi),
    totalPayment: Math.round(total),
    totalInterest: Math.round(total - principal),
  };
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

// ────────────────────────────────────────────────────────────────────────────
// Main entry
// ────────────────────────────────────────────────────────────────────────────

// If the user replies with just a number (e.g. "1", "2.", "#3") and we offered a
// numbered menu last turn, expand it to that option's text so they can pick a
// product/choice without typing the full name. Only bare numbers are treated this
// way — real numeric answers inside a flow (EMI amount, income, phone) are safe
// because those steps never carry a `menu` (they offer no quick replies).
function resolveMenuPick(rawMessage: string, prevState: ChatState): string {
  const menu = prevState.menu;
  if (!menu || !menu.length) return rawMessage;
  const m = norm(rawMessage).match(/^#?\s*(\d{1,2})[.):]?$/);
  if (!m) return rawMessage;
  const idx = parseInt(m[1], 10) - 1;
  return idx >= 0 && idx < menu.length ? menu[idx] : rawMessage;
}

export function runEngine(rawMessage: string, prevState: ChatState = {}): EngineResult {
  const result = runEngineCore(resolveMenuPick(rawMessage, prevState), prevState);
  // Remember exactly what we're offering this turn so a bare-number reply next
  // turn maps to it — and clear it when we offer nothing, so a stray digit in a
  // numeric flow step is never mistaken for a menu pick.
  result.state = {
    ...result.state,
    menu: result.quickReplies && result.quickReplies.length ? result.quickReplies : undefined,
  };
  return result;
}

function runEngineCore(rawMessage: string, prevState: ChatState = {}): EngineResult {
  const text = norm(rawMessage);
  const state: ChatState = { ...prevState, data: { ...(prevState.data || {}) } };

  // Global escape hatches — work even mid-flow. Use whole-word matching so a
  // city/name like "Delhi" or "Roman" can never trip these mid-flow.
  if (hasWord(text, ['human', 'agent', 'executive', 'representative', 'person', 'someone']) || has(text, ['talk to', 'baat kar'])) {
    return handoff();
  }
  if (hasWord(text, ['reset', 'restart', 'cancel', 'menu']) || has(text, ['start over'])) {
    return { reply: 'No problem — starting fresh. How can I help you?', quickReplies: DEFAULT_QUICK, state: {} };
  }

  // Continue an active flow first.
  if (prevState.flow === 'emi') return emiFlow(rawMessage, state);
  if (prevState.flow === 'eligibility') return eligibilityFlow(rawMessage, state);
  if (prevState.flow === 'lead') return leadFlow(rawMessage, state);
  if (prevState.flow === 'callback') return callbackFlow(rawMessage, state);

  // ── Fresh intents ──────────────────────────────────────────────────────────

  // Greeting / opener
  if (!text || hasWord(text, ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'hii', 'hiya', 'start'])) {
    return {
      reply: `Hi! 👋 I’m *Ezy AI*, your assistant at ${COMPANY.name}. I can explain our loan options, calculate an EMI, do a quick eligibility check, or connect you with our team. What would you like to do?`,
      quickReplies: DEFAULT_QUICK,
      state: {},
    };
  }

  // Guardrail: never ask for / accept KYC documents
  if (has(text, KYC_TERMS)) {
    return {
      reply:
        'For your safety, I never collect documents like Aadhaar, PAN, or bank statements here. ' +
        'Once you’re ready, our Executive will securely guide you through the paperwork. ' +
        'For now, I can share loan details, calculate an EMI, or note your interest — what would you like?',
      quickReplies: DEFAULT_QUICK,
      state: {},
    };
  }

  // Unavailable products
  if (has(text, UNAVAILABLE_KEYWORDS)) {
    return {
      reply:
        `That product isn’t part of our current offerings. We specialise in car loans (new, used, balance transfer, refinance, top-up), commercial vehicle loans, personal loans, and loan against property. ` +
        `Would you like details on any of these, or should I connect you with our team?`,
      quickReplies: ['Loan products', 'Talk to a human'],
      state: {},
    };
  }

  // EMI calculator
  if (has(text, ['emi', 'calculate', 'installment', 'instalment', 'monthly payment', 'kitni emi'])) {
    return startEmi(state);
  }

  // Eligibility
  if (has(text, ['eligib', 'qualify', 'am i eligible', 'can i get', 'yogya', 'patra'])) {
    return startEligibility(state);
  }

  // Apply / lead / interested / callback
  if (has(text, ['call back', 'callback', 'call me', 'phone me'])) {
    return startCallback(state);
  }
  if (has(text, ['apply', 'interested', 'want a loan', 'want loan', 'proceed', 'get loan', 'lena hai', 'chahiye'])) {
    return startLead(state, findProduct(text)?.name);
  }

  // Specific product
  const product = findProduct(text);
  if (product) {
    return {
      reply: withNotice(
        `*${product.name}*\n${product.summary}\n\n• ${product.highlights.join('\n• ')}\n\nRates start from ${COMPANY.ratesFrom}. Want me to check your eligibility, calculate an EMI, or note your interest so our team can call you?`,
      ),
      quickReplies: ['Check eligibility', 'EMI calculator', 'I’m interested', 'Loan products'],
      state: { data: { loanType: product.name } },
    };
  }

  // Product list
  if (has(text, ['product', 'products', 'loan', 'loans', 'options', 'offer', 'services', 'service', 'kya milta', 'sab', 'all'])) {
    return productListResult();
  }

  // FAQ match
  const faq = FAQS.find((f) => has(text, f.keywords));
  if (faq) {
    return { reply: withNotice(faq.answer), quickReplies: DEFAULT_QUICK, state: {} };
  }

  // Thanks / bye
  if (hasWord(text, ['thanks', 'dhanyavad', 'shukriya', 'bye', 'ok', 'okay']) || has(text, ['thank you'])) {
    return {
      reply: `You’re welcome! 🙏 If you need anything else — EMI, eligibility, or a callback — I’m right here. You can also reach us on ${COMPANY.phone}.`,
      quickReplies: DEFAULT_QUICK,
      state: {},
    };
  }

  // Fallback — stay helpful, offer handoff (TRD: when AI is unsure → human).
  return {
    reply:
      `I want to get this right for you. I can help with our loan products, an EMI calculation, a quick eligibility check, or a callback from our team. ` +
      `If you’d prefer, I can connect you with a human Executive.`,
    quickReplies: DEFAULT_QUICK,
    state: {},
    fallback: true,
  };
}

// ── Handoff ───────────────────────────────────────────────────────────────────
function handoff(): EngineResult {
  return {
    reply:
      `Sure — I’ll connect you with our team. You can call us now on ${COMPANY.phone} (${COMPANY.hours}), ` +
      `WhatsApp us, or leave your details and we’ll call you back. What works best?`,
    quickReplies: ['Request a callback', 'WhatsApp us', 'Loan products'],
    state: {},
    handoff: true,
  };
}

// ── EMI flow ────────────────────────────────────────────────────────────────
function startEmi(state: ChatState): EngineResult {
  return {
    reply: 'Let’s calculate your EMI. 💰 First, how much loan amount are you considering? (e.g. 5 lakh)',
    state: { flow: 'emi', step: 1, data: state.data },
  };
}
function emiFlow(raw: string, state: ChatState): EngineResult {
  const d = state.data!;
  const step = state.step || 1;
  const val = parseAmount(raw);

  if (step === 1) {
    if (!val || val < 1000) return { reply: 'Please share a loan amount, for example “5 lakh” or 500000.', state };
    d.amount = val;
    return { reply: `Got it — ${inr(val)}. What annual interest rate (%) should I use? (e.g. 10.5). Our rates start from ${COMPANY.ratesFrom}.`, state: { flow: 'emi', step: 2, data: d } };
  }
  if (step === 2) {
    if (val == null || val <= 0 || val > 40) return { reply: 'Please share an interest rate as a number, e.g. 10.5', state };
    d.rate = val;
    return { reply: 'And the tenure in months? (e.g. 60 for 5 years)', state: { flow: 'emi', step: 3, data: d } };
  }
  // step 3 → result
  if (val == null || val < 1 || val > 360) return { reply: 'Please share the tenure in months, e.g. 60.', state };
  d.months = Math.round(val);
  const { emi, totalInterest, totalPayment } = calcEmi(d.amount, d.rate, d.months);
  return {
    reply: withNotice(
      `Here’s your estimate:\n\n• *Monthly EMI:* ${inr(emi)}\n• *Total interest:* ${inr(totalInterest)}\n• *Total payment:* ${inr(totalPayment)}\n\n(Loan ${inr(d.amount)} · ${d.rate}% p.a. · ${d.months} months)\n\nWant to check eligibility or have our team call you with exact offers?`,
    ),
    quickReplies: ['Check eligibility', 'I’m interested', 'Recalculate EMI'],
    state: { data: { loanType: d.loanType } },
  };
}

// ── Eligibility flow ──────────────────────────────────────────────────────────
function startEligibility(state: ChatState): EngineResult {
  return {
    reply:
      'Happy to do a quick *preliminary* check — no documents needed. 😊\nFirst, what’s your approximate *monthly income* (in ₹)?',
    state: { flow: 'eligibility', step: 1, data: state.data },
  };
}
function eligibilityFlow(raw: string, state: ChatState): EngineResult {
  const d = state.data!;
  const step = state.step || 1;
  const text = norm(raw);

  if (step === 1) {
    const inc = parseAmount(raw);
    if (!inc || inc < 1000) return { reply: 'Please share your approximate monthly income in ₹, e.g. 30000.', state };
    d.income = inc;
    return { reply: 'Are you *salaried* or *self-employed / business*?', quickReplies: ['Salaried', 'Self-employed'], state: { flow: 'eligibility', step: 2, data: d } };
  }
  if (step === 2) {
    d.employment = has(text, ['self', 'business', 'own']) ? 'Self-employed' : 'Salaried';
    return { reply: 'Which *city* are you in?', state: { flow: 'eligibility', step: 3, data: d } };
  }
  if (step === 3) {
    d.city = raw.trim();
    return {
      reply: 'And roughly what *loan amount* are you looking for? (e.g. 5 lakh)',
      state: { flow: 'eligibility', step: 4, data: d },
    };
  }
  // step 4 → indicative result
  d.amount = parseAmount(raw) || d.amount;
  const eligible = d.income >= ELIGIBILITY_RULES.minMonthlyIncome;
  const msg = eligible
    ? `Good news — based on what you shared, you appear to meet our *preliminary* criteria. ✅ The final decision, rate, and amount are set by the lending partner.`
    : `Based on the income shared, approval may be tighter, but options can still exist — our team can guide you on the best fit. `;
  return {
    reply: withNotice(
      `${msg}\n\nWould you like our team to call you with tailored options? I’ll just need a few basic details (no documents).`,
    ),
    quickReplies: ['Yes, call me', 'Loan products'],
    state: { flow: 'lead', step: 0, data: { ...d, loanType: d.loanType || 'General enquiry' } },
  };
}

// ── Lead capture flow ─────────────────────────────────────────────────────────
function startLead(state: ChatState, loanType?: string): EngineResult {
  return {
    reply:
      'Great! I’ll note your interest so our team can help — *no documents needed*. 📝\nWhat’s your *name*?',
    state: { flow: 'lead', step: 1, data: { ...(state.data || {}), loanType: loanType || state.data?.loanType } },
  };
}
function leadFlow(raw: string, state: ChatState): EngineResult {
  const d = state.data!;
  // Use ?? not ||: step 0 (the eligibility confirm gate) is valid and must NOT
  // fall back to 1, or the "Yes, call me" tap gets captured as the name.
  let step = state.step ?? 1;
  const text = norm(raw);

  // step 0 is a "confirm" gate coming out of eligibility. The visitor taps a
  // quick reply here ("Yes, call me" / "Loan products") — we must NOT consume
  // that tap as the name, so each branch returns and waits for the next reply.
  if (step === 0) {
    if (has(text, ['product', 'products'])) {
      return productListResult();
    }
    if (has(text, ['no', 'not now', 'later', 'nahi'])) {
      return { reply: 'No problem! I’m here whenever you need. Anything else I can help with?', quickReplies: DEFAULT_QUICK, state: {} };
    }
    // Confirmed (e.g. "Yes, call me") → ask for the name and wait for the reply.
    return startLead({ data: d }, d.loanType);
  }

  if (step === 1) {
    if (!d.name) {
      const name = raw.trim();
      if (name.length < 2) return { reply: 'Please share your name so our team can address you correctly.', state };
      d.name = name;
      return { reply: `Thanks, ${name.split(' ')[0]}! What’s the best *mobile number* to reach you?`, state: { flow: 'lead', step: 2, data: d } };
    }
    step = 2;
  }

  if (step === 2) {
    const digits = (raw.match(/\d/g) || []).join('');
    if (digits.length < 10) return { reply: 'Please share a valid 10-digit mobile number.', state };
    d.phone = digits.slice(-10);
    return {
      reply: 'And your *email address*? We’ll send you a confirmation there. (or type “skip”)',
      state: { flow: 'lead', step: 5, data: d },
    };
  }

  // step 5 → email (asked right after the mobile number)
  if (step === 5) {
    if (!hasWord(text, ['skip', 'no', 'nahi', 'later'])) {
      const email = raw.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { reply: 'Please share a valid email like name@example.com, or type “skip”.', state };
      }
      d.email = email;
    }
    if (d.city) { // came from eligibility, city already known → skip
      return askLoanTypeOrFinish(d);
    }
    return { reply: 'Which *city* are you in?', state: { flow: 'lead', step: 3, data: d } };
  }

  if (step === 3) {
    d.city = raw.trim();
    return askLoanTypeOrFinish(d);
  }

  // step 4 → loan type, then finish
  if (!d.loanType || d.loanType === 'General enquiry') {
    const p = findProduct(text);
    d.loanType = p ? p.name : raw.trim();
  }
  return finishLead(d);
}

function askLoanTypeOrFinish(d: Record<string, any>): EngineResult {
  if (d.loanType && d.loanType !== 'General enquiry') return finishLead(d);
  return {
    reply: 'Which loan are you interested in?',
    quickReplies: PRODUCTS.map((p) => p.name),
    state: { flow: 'lead', step: 4, data: d },
  };
}

function finishLead(d: Record<string, any>): EngineResult {
  const lead: LeadData = {
    name: d.name,
    email: d.email,
    phone: d.phone,
    city: d.city,
    loanType: d.loanType,
    income: d.income ? String(d.income) : undefined,
    employment: d.employment || undefined,
    amount: d.amount ? String(d.amount) : undefined,
    source: 'Ezy AI Chatbot',
    message:
      `Loan: ${d.loanType || 'Not specified'}` +
      (d.city ? ` | City: ${d.city}` : '') +
      (d.income ? ` | Monthly income: ₹${d.income}` : '') +
      (d.employment ? ` | ${d.employment}` : '') +
      (d.amount ? ` | Amount sought: ₹${d.amount}` : '') +
      (d.callbackTime ? ` | Preferred callback: ${d.callbackTime}` : ''),
  };
  return {
    reply: withNotice(
      `All set, ${String(d.name).split(' ')[0]}! ✅ Our team will reach out on ${d.phone} shortly (within ${COMPANY.hours}). ` +
        `Thanks for choosing ${COMPANY.name}. Is there anything else I can help you with?`,
    ),
    quickReplies: ['Loan products', 'EMI calculator'],
    state: {},
    lead,
  };
}

// ── Callback flow ─────────────────────────────────────────────────────────────
function startCallback(state: ChatState): EngineResult {
  return {
    reply: 'Sure! When’s a good *time* for our team to call you? (e.g. today 5 PM)',
    state: { flow: 'callback', step: 1, data: state.data },
  };
}
function callbackFlow(raw: string, state: ChatState): EngineResult {
  const d = state.data!;
  d.callbackTime = raw.trim();
  // Reuse the lead flow to collect name + number.
  return startLead({ data: d }, d.loanType);
}
