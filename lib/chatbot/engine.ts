// EzySaathi AI — rule/intent engine (the deterministic brain).
//
// EzySaathi AI is EzyLoan's digital loan assistant. It behaves like a
// professional digital relationship manager — Understand → Qualify → Guide →
// Connect → Convert — NOT a sales bot and not a static form. It:
//   • greets with a 7-option welcome menu (Car Loan Top-Up is the hero product),
//   • detects product intent from natural language (no button required),
//   • runs progressive, per-product data-collection flows (Top-Up, Balance
//     Transfer + Top-Up, Used / New / Commercial vehicle), each ending in a
//     PRELIMINARY assessment (never an approval) + a clear next step,
//   • does a smart eligibility check that routes to the right product,
//   • calculates EMI, hands off to a human specialist at every stage,
//   • creates a structured CRM lead with a HOT / WARM / COLD priority.
//
// It obeys the TRD/blueprint guardrails: never guarantee approval, never ask for
// OTP/PIN/passwords or KYC documents in chat. When an LLM key is configured,
// /api/chat uses the LLM for free-form answers and this engine stays as the
// reliable, compliance-safe flow driver. Both share lib/chatbot/knowledge.ts.

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

export const BOT_NAME = 'EzySaathi AI';

export interface ChatState {
  flow?: 'emi' | 'eligibility' | 'lead' | 'callback' | 'topupgate' | 'collect' | null;
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
  // AI qualification metadata (blueprint §14/§15) — surfaced in the CRM lead.
  priority?: 'HOT' | 'WARM' | 'COLD';
  intent?: string;
  message: string;
  source: string;
}

export interface EngineResult {
  reply: string;
  quickReplies?: string[];
  state: ChatState;
  lead?: LeadData;
  handoff?: boolean;
  // True only for the final catch-all — i.e. the engine did NOT recognise a
  // specific intent. /api/chat uses this to decide when to let the self-trained
  // knowledge base or the LLM backup take over.
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

// ── Welcome menu (blueprint §1) — Car Loan Top-Up is the hero product. ─────────
const MENU_TOPUP = 'Additional funds against my car';
const MENU_USED = 'Used Car Loan';
const MENU_NEW = 'New Car Loan';
const MENU_COMMERCIAL = 'Commercial Vehicle Loan';
const MENU_ELIGIBILITY = 'Check My Eligibility';
const MENU_EMI = 'Calculate EMI';
const MENU_SPECIALIST = 'Talk to a Loan Specialist';

const WELCOME_MENU = [
  MENU_TOPUP,
  MENU_USED,
  MENU_NEW,
  MENU_COMMERCIAL,
  MENU_ELIGIBILITY,
  MENU_EMI,
  MENU_SPECIALIST,
];

const DEFAULT_QUICK = [MENU_TOPUP, MENU_ELIGIBILITY, MENU_EMI, MENU_SPECIALIST];

function withNotice(reply: string): string {
  return `${reply}\n\n_${COMPLIANCE_NOTICE}_`;
}

function welcomeResult(greeting?: string): EngineResult {
  return {
    reply:
      (greeting ||
        `Hello 👋 Welcome to *${COMPANY.name}*. I’m *${BOT_NAME}*, your digital loan assistant.`) +
      `\n\nI can help you explore loan options, check preliminary eligibility, calculate your EMI, or connect you with an ${COMPANY.name} specialist.\n\n*How may I help you today?*`,
    quickReplies: WELCOME_MENU,
    state: {},
  };
}

// Single source for the "here's everything we offer" reply.
function productListResult(): EngineResult {
  return {
    reply:
      `Here’s everything we offer at ${COMPANY.name}:\n\n` +
      PRODUCTS.map((p) => `• *${p.name}* — ${p.summary}`).join('\n') +
      `\n\nTap a loan to know more, or ask me to check your eligibility.`,
    quickReplies: [...PRODUCTS.map((p) => p.name), MENU_ELIGIBILITY],
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
// Progressive per-product data-collection flows (blueprint §4–§9)
// ────────────────────────────────────────────────────────────────────────────
// Each product asks only its relevant questions, one at a time, remembering
// earlier answers, then produces a PRELIMINARY assessment and a CRM lead with an
// AI priority. Driven by config so all five flows share one sequential engine.

type FieldType = 'text' | 'amount' | 'number' | 'choice' | 'phone';

interface Field {
  key: string;
  label: string; // human label for the CRM lead summary
  prompt: string; // question shown to the customer
  type: FieldType;
  options?: string[]; // for choice fields (also shown as quick replies)
}

interface CollectFlow {
  id: string;
  productName: string; // becomes the CRM loanType
  intent: string; // CRM "Customer Intent"
  priority: 'HOT' | 'WARM';
  fields: Field[];
  assessment: string; // preliminary-assessment reply (no approval language)
  nextReplies: string[]; // next-step buttons after the assessment
}

const EMPLOYMENT_OPTS = ['Salaried', 'Self-Employed', 'Business Owner', 'Other'];
const EMIS_PAID_OPTS = ['Less than 6', '6–11', '12–23', '24 or more', 'Not sure'];
const POST_ASSESSMENT = ['Check My Options', MENU_SPECIALIST, 'Continue with Documents'];

const F = {
  name: { key: 'name', label: 'Name', prompt: 'To begin, may I have your *name*?', type: 'text' } as Field,
  city: { key: 'city', label: 'City', prompt: 'Which *city* are you in?', type: 'text' } as Field,
  carModel: { key: 'carModel', label: 'Car Model', prompt: 'What is your *car model*? (e.g. Hyundai Creta)', type: 'text' } as Field,
  regYear: { key: 'regYear', label: 'Registration Year', prompt: 'What is the *registration year* of the car? (e.g. 2020)', type: 'number' } as Field,
  vehicleYear: { key: 'regYear', label: 'Vehicle Year', prompt: 'What is the *vehicle year*? (e.g. 2019)', type: 'number' } as Field,
  currentLender: { key: 'currentLender', label: 'Current Lender', prompt: 'Who is your *current lender*? (e.g. HDFC, SBI)', type: 'text' } as Field,
  outstanding: { key: 'outstanding', label: 'Outstanding Loan', prompt: 'Approximately what is your *current outstanding loan*? (e.g. 4 lakh)', type: 'amount' } as Field,
  currentEmi: { key: 'currentEmi', label: 'Current EMI', prompt: 'What is your *current EMI*? (e.g. 12000)', type: 'amount' } as Field,
  remainingTenure: { key: 'remainingTenure', label: 'Remaining Tenure', prompt: 'Roughly how many months of *tenure remain*? (e.g. 24)', type: 'number' } as Field,
  topUpAmount: { key: 'topUpAmount', label: 'Top-Up Amount Required', prompt: 'Approximately how much *top-up amount* do you require? (e.g. 3 lakh)', type: 'amount' } as Field,
  purchasePrice: { key: 'purchasePrice', label: 'Approx. Purchase Price', prompt: 'What is the approximate *purchase price* of the car? (e.g. 6 lakh)', type: 'amount' } as Field,
  onRoadPrice: { key: 'onRoadPrice', label: 'Approx. On-Road Price', prompt: 'What is the approximate *on-road price* of the car? (e.g. 10 lakh)', type: 'amount' } as Field,
  amount: { key: 'amount', label: 'Loan Amount Required', prompt: 'How much *loan amount* do you require? (e.g. 5 lakh)', type: 'amount' } as Field,
  employment: { key: 'employment', label: 'Employment Type', prompt: 'What is your *employment type*?', type: 'choice', options: EMPLOYMENT_OPTS } as Field,
  income: { key: 'income', label: 'Approx. Monthly Income', prompt: 'What is your *approximate monthly income*? (e.g. 40000)', type: 'amount' } as Field,
  existingEmi: { key: 'existingEmi', label: 'Existing Monthly EMI', prompt: 'Do you have any *existing monthly EMI*? If yes, how much? (or type “none”)', type: 'amount' } as Field,
  emisPaid: { key: 'emisPaid', label: 'EMIs Paid', prompt: 'Approximately how many *EMIs have you paid* so far?', type: 'choice', options: EMIS_PAID_OPTS } as Field,
  vehicleType: { key: 'vehicleType', label: 'Vehicle Type', prompt: 'What *type of commercial vehicle* is it? (e.g. truck, bus, taxi)', type: 'text' } as Field,
  vehicleModel: { key: 'vehicleModel', label: 'Vehicle Model', prompt: 'What is the *vehicle model*?', type: 'text' } as Field,
  newOrUsed: { key: 'newOrUsed', label: 'New / Used', prompt: 'Is it a *new* or *used* vehicle?', type: 'choice', options: ['New', 'Used'] } as Field,
  vehiclePrice: { key: 'vehiclePrice', label: 'Approx. Vehicle Price', prompt: 'What is the approximate *vehicle price / valuation*? (e.g. 15 lakh)', type: 'amount' } as Field,
  businessType: { key: 'employment', label: 'Business / Employment Type', prompt: 'What is your *business / employment type*?', type: 'choice', options: EMPLOYMENT_OPTS } as Field,
  phone: { key: 'phone', label: 'Mobile', prompt: 'Lastly, what is the best *mobile number* for our specialist to reach you?', type: 'phone' } as Field,
};

const COLLECT_FLOWS: Record<string, CollectFlow> = {
  topup: {
    id: 'topup',
    productName: 'Car Loan Top-Up',
    intent: 'Car Loan Top-Up',
    priority: 'HOT',
    fields: [F.name, F.city, F.carModel, F.regYear, F.currentLender, F.outstanding, F.currentEmi, F.topUpAmount, F.employment, F.income, F.emisPaid, F.phone],
    assessment:
      'Thank you. I have the basic information required.\n\nYour requirement can now be taken up for a *preliminary assessment*. Our team will evaluate it based on applicable lender policies, vehicle valuation, your repayment profile and documentation.',
    nextReplies: POST_ASSESSMENT,
  },
  bt: {
    id: 'bt',
    productName: 'Balance Transfer + Top-Up',
    intent: 'Balance Transfer + Top-Up',
    priority: 'HOT',
    fields: [F.name, F.city, F.carModel, F.regYear, F.currentLender, F.outstanding, F.currentEmi, F.remainingTenure, F.topUpAmount, F.employment, F.income, F.emisPaid, F.phone],
    assessment:
      'Thank you. We now have the basic information required to review your *Balance Transfer + Top-Up* requirement.\n\n_Final eligibility, loan amount, pricing and terms are subject to lender policy, verification, vehicle valuation and documentation._',
    nextReplies: ['Check My Options', 'Upload Loan Statement', MENU_SPECIALIST],
  },
  used: {
    id: 'used',
    productName: 'Used Car Loan',
    intent: 'Used Car Loan',
    priority: 'HOT',
    fields: [F.name, F.city, F.carModel, F.vehicleYear, F.purchasePrice, F.amount, F.employment, F.income, F.existingEmi, F.phone],
    assessment:
      'Thank you. We have the basic information required for a *preliminary assessment* of your Used Car Loan requirement.\n\n_Final approval is subject to lender policy, verification and documentation._',
    nextReplies: ['Continue', MENU_SPECIALIST],
  },
  new: {
    id: 'new',
    productName: 'New Car Loan',
    intent: 'New Car Loan',
    priority: 'HOT',
    fields: [F.name, F.city, F.carModel, F.onRoadPrice, F.amount, F.employment, F.income, F.existingEmi, F.phone],
    assessment:
      'Thank you. We have the basic information required for a *preliminary assessment* of your New Car Loan requirement.\n\n_Final approval is subject to lender policy, verification and documentation._',
    nextReplies: ['Continue', MENU_SPECIALIST],
  },
  commercial: {
    id: 'commercial',
    productName: 'Commercial Vehicle Loan',
    intent: 'Commercial Vehicle Loan',
    priority: 'HOT',
    fields: [F.name, F.city, F.vehicleType, F.vehicleModel, F.newOrUsed, F.vehicleYear, F.vehiclePrice, F.amount, F.businessType, F.income, F.existingEmi, F.phone],
    assessment:
      'Thank you. We have the basic information required for a *preliminary assessment* of your Commercial Vehicle Loan requirement.\n\n_Final approval is subject to lender policy, verification and documentation._',
    nextReplies: ['Continue', MENU_SPECIALIST],
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Main entry
// ────────────────────────────────────────────────────────────────────────────

// If the user replies with just a number (e.g. "1", "2.", "#3") and we offered a
// numbered menu last turn, expand it to that option's text.
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
  // turn maps to it — and clear it when we offer nothing.
  result.state = {
    ...result.state,
    menu: result.quickReplies && result.quickReplies.length ? result.quickReplies : undefined,
  };
  return result;
}

function runEngineCore(rawMessage: string, prevState: ChatState = {}): EngineResult {
  const text = norm(rawMessage);
  const state: ChatState = { ...prevState, data: { ...(prevState.data || {}) } };

  // Global escape hatches — work even mid-flow. Whole-word matching so a city or
  // name can never trip these. Human handover is available at every stage (§12).
  if (
    hasWord(text, ['human', 'agent', 'executive', 'representative', 'specialist', 'person', 'someone']) ||
    has(text, ['talk to', 'call me', 'baat kar', 'i need help'])
  ) {
    return startSpecialist(state);
  }
  if (hasWord(text, ['reset', 'restart', 'cancel', 'menu']) || has(text, ['start over', 'main menu'])) {
    return welcomeResult('No problem — let’s start fresh.');
  }

  // Continue an active flow first.
  if (prevState.flow === 'topupgate') return topupGateFlow(rawMessage, state);
  if (prevState.flow === 'collect') return collectFlow(rawMessage, state);
  if (prevState.flow === 'emi') return emiFlow(rawMessage, state);
  if (prevState.flow === 'eligibility') return eligibilityFlow(rawMessage, state);
  if (prevState.flow === 'lead') return leadFlow(rawMessage, state);
  if (prevState.flow === 'callback') return callbackFlow(rawMessage, state);

  // ── Fresh intents ──────────────────────────────────────────────────────────

  // Greeting / opener → the EzySaathi welcome menu.
  if (!text || hasWord(text, ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'hii', 'hiya', 'start'])) {
    return welcomeResult();
  }

  // Guardrail: never ask for / accept OTP, PINs, passwords or KYC documents.
  if (has(text, KYC_TERMS)) {
    return {
      reply:
        'For your safety, I never collect documents or credentials like Aadhaar, PAN, OTP, UPI/ATM PIN, or bank passwords here. ' +
        'Once you’re ready, our specialist will securely guide you through the paperwork. ' +
        'For now, I can explore your options, calculate an EMI, or note your requirement — what would you like?',
      quickReplies: DEFAULT_QUICK,
      state: {},
    };
  }

  // Unavailable products
  if (has(text, UNAVAILABLE_KEYWORDS)) {
    return {
      reply:
        `That product isn’t part of our current offerings. We specialise in car loans (top-up, balance transfer, new, used), commercial vehicle loans, personal loans, and loan against property. ` +
        `Would you like to explore any of these, or shall I connect you with our specialist?`,
      quickReplies: [MENU_TOPUP, MENU_SPECIALIST],
      state: {},
    };
  }

  // ── Intent-aware product routing (blueprint §2 & §20) ────────────────────────
  // Order matters: the most specific intents (Balance Transfer, Top-Up) come
  // before the generic "car loan" match so the hero product is caught first.

  // Balance Transfer + Top-Up: transfer an existing loan AND take extra funds.
  if (
    (has(text, ['balance transfer', 'transfer my loan', 'transfer loan', 'shift my loan', 'shift loan']) ||
      (has(text, ['transfer']) && has(text, ['another', 'other company', 'other bank', 'hdfc', 'sbi', 'icici', 'axis', 'kotak']))) &&
    has(text, ['top', 'extra', 'additional', 'more'])
  ) {
    return startCollect('bt', state);
  }
  if (has(text, ['balance transfer']) || (has(text, ['transfer']) && has(text, ['loan', 'emi', 'car']))) {
    return startCollect('bt', state);
  }

  // Car Loan Top-Up (HERO): additional/extra funds against an existing car.
  if (
    has(text, ['top up', 'topup', 'top-up']) ||
    (has(text, ['additional', 'extra', 'more', 'against', 'on my car', 'existing loan', 'existing car loan']) &&
      has(text, ['car', 'vehicle', 'gaadi', 'loan', 'fund', 'money', 'amount', 'cash', 'lakh', 'lac']))
  ) {
    return startTopupGate(state);
  }

  // Used / second-hand car loan
  if (has(text, ['used car', 'second hand', 'secondhand', 'pre owned', 'pre-owned', 'purani car', 'old car'])) {
    return startCollect('used', state);
  }
  // New car loan
  if (has(text, ['new car', 'buy a car', 'buy car', 'brand new', 'nayi car', 'naye car'])) {
    return startCollect('new', state);
  }
  // Commercial vehicle loan
  if (has(text, ['commercial', 'cv loan', 'truck', 'bus', 'taxi', 'transport vehicle', 'commercial vehicle'])) {
    return startCollect('commercial', state);
  }

  // Welcome-menu taps (exact labels) — routed explicitly so a tap is unambiguous.
  if (text === norm(MENU_TOPUP) || has(text, ['additional funds against'])) return startTopupGate(state);
  if (text === norm(MENU_USED)) return startCollect('used', state);
  if (text === norm(MENU_NEW)) return startCollect('new', state);
  if (text === norm(MENU_COMMERCIAL)) return startCollect('commercial', state);

  // EMI calculator
  if (has(text, ['emi', 'calculate', 'installment', 'instalment', 'monthly payment', 'kitni emi'])) {
    return startEmi(state);
  }

  // Eligibility (smart routing)
  if (has(text, ['eligib', 'qualify', 'am i eligible', 'can i get', 'how much loan', 'how much can i', 'yogya', 'patra'])) {
    return startEligibility(state);
  }

  // Post-assessment next-step buttons.
  if (has(text, ['check my options', 'my options', 'check options'])) {
    return {
      reply: withNotice(
        'Certainly. Your requirement will now be reviewed by our specialist against applicable lender policies, vehicle valuation, repayment profile and documentation. They’ll get back to you with suitable options.',
      ),
      quickReplies: [MENU_SPECIALIST, MENU_EMI],
      state: {},
    };
  }
  if (has(text, ['continue with documents', 'upload loan statement', 'upload', 'documents', 'document'])) {
    return {
      reply:
        'When you proceed, our specialist will request only the documents the lender needs — such as ID/address proof, RC, insurance, existing loan statement, income proof and bank statements — and collect them securely.\n\n' +
        'I will *never* ask for your OTP, UPI/ATM PIN, card PIN or banking passwords. Shall I connect you with a specialist to continue?',
      quickReplies: [MENU_SPECIALIST, 'Check My Options'],
      state: {},
    };
  }

  // Apply / interested / callback
  if (has(text, ['call back', 'callback', 'phone me'])) {
    return startCallback(state);
  }
  if (has(text, ['apply', 'interested', 'want a loan', 'want loan', 'proceed', 'get loan', 'continue', 'lena hai', 'chahiye'])) {
    const p = findProduct(text);
    if (p) {
      const flowId = productFlowId(p);
      if (flowId) return startCollect(flowId, state);
    }
    return startLead(state, p?.name);
  }

  // Specific product → its dedicated flow when we have one, else a summary.
  const product = findProduct(text);
  if (product) {
    const flowId = productFlowId(product);
    if (flowId) return startCollect(flowId, state);
    return {
      reply: withNotice(
        `*${product.name}*\n${product.summary}\n\n• ${product.highlights.join('\n• ')}\n\nRates start from ${COMPANY.ratesFrom}. Would you like to check your eligibility, calculate an EMI, or note your requirement so our specialist can call you?`,
      ),
      quickReplies: [MENU_ELIGIBILITY, MENU_EMI, 'I’m interested', MENU_SPECIALIST],
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
      reply: `You’re welcome! 🙏 If you need anything else — top-up, EMI, eligibility, or a callback — I’m right here. You can also reach us on ${COMPANY.phone}.`,
      quickReplies: DEFAULT_QUICK,
      state: {},
    };
  }

  // Fallback (§18) — stay helpful, show the menu, offer a specialist.
  return {
    reply:
      'I’m sorry, I may not have understood your requirement correctly. Please choose an option below, or select *Talk to a Loan Specialist* for assistance.',
    quickReplies: WELCOME_MENU,
    state: {},
    fallback: true,
  };
}

// Map a knowledge-base Product to one of our collection flows (if any).
function productFlowId(p: Product): string | null {
  if (p.id === 'used-car-topup') return 'topup';
  if (p.id === 'used-car-bt') return 'bt';
  if (p.id === 'new-car-loan') return 'new';
  if (p.id === 'commercial-vehicle-loan') return 'commercial';
  if (p.id === 'used-car-refinance') return 'used';
  return null;
}

// ── Human specialist handover (blueprint §12) ─────────────────────────────────
function startSpecialist(state: ChatState): EngineResult {
  // If we already collected a name/phone in an earlier flow, capture a callback
  // straight away; otherwise ask for a preferred time and collect details.
  return {
    reply:
      `Of course. I’ll help you connect with an ${COMPANY.name} specialist. ` +
      `You can call us now on ${COMPANY.phone} (${COMPANY.hours}), or share your preferred callback time and I’ll arrange it.`,
    quickReplies: ['Request a callback', 'WhatsApp us', MENU_TOPUP],
    state: { data: state.data },
    handoff: true,
  };
}

// ── Car Loan Top-Up entry gate (blueprint §3) ─────────────────────────────────
function startTopupGate(state: ChatState): EngineResult {
  return {
    reply:
      `Certainly. I can help you explore a *Car Loan Top-Up* against your existing car, subject to eligibility and lender terms.\n\nFirst, do you currently have a car loan?`,
    quickReplies: ['Yes', 'No', 'Not sure'],
    state: { flow: 'topupgate', step: 1, data: state.data },
  };
}
function topupGateFlow(raw: string, state: ChatState): EngineResult {
  const text = norm(raw);
  const step = state.step || 1;

  if (step === 1) {
    if (hasWord(text, ['yes', 'yeah', 'yep', 'haan', 'ha']) || has(text, ['i do', 'i have'])) {
      return startCollect('topup', state);
    }
    if (hasWord(text, ['no', 'nope', 'nahi', 'na'])) {
      return {
        reply:
          'No problem. Let me guide you to the appropriate option. Are you looking to buy a new car, a used car, or finance a commercial vehicle? I can also connect you with a specialist.',
        quickReplies: [MENU_NEW, MENU_USED, MENU_COMMERCIAL, MENU_SPECIALIST],
        state: { data: state.data },
      };
    }
    // Not sure → ask if they pay a car-loan EMI.
    return {
      reply: 'No problem. Do you currently pay an *EMI* for a car loan?',
      quickReplies: ['Yes', 'No', 'Not sure'],
      state: { flow: 'topupgate', step: 2, data: state.data },
    };
  }

  // step 2 — the "not sure" follow-up.
  if (hasWord(text, ['yes', 'yeah', 'yep', 'haan', 'ha']) || has(text, ['i do', 'i pay'])) {
    return startCollect('topup', state);
  }
  return {
    reply:
      'Thanks for confirming. Since there may not be an existing car loan to top up, let me guide you to the right option instead.',
    quickReplies: [MENU_NEW, MENU_USED, MENU_ELIGIBILITY, MENU_SPECIALIST],
    state: { data: state.data },
  };
}

// ── Generic progressive collection flow ───────────────────────────────────────

// A field counts as already answered if we captured it in an earlier flow (e.g.
// the eligibility check gathers income/employment before routing here). Name and
// phone are always asked fresh so the lead is addressed and reachable.
function isFilled(d: Record<string, any>, field: Field): boolean {
  if (field.key === 'name' || field.key === 'phone') return false;
  const v = d[field.key];
  return v != null && v !== '';
}
function firstUnfilled(cfg: CollectFlow, d: Record<string, any>, from: number): number {
  let i = from;
  while (i < cfg.fields.length && isFilled(d, cfg.fields[i])) i++;
  return i;
}

function startCollect(flowId: string, state: ChatState): EngineResult {
  const cfg = COLLECT_FLOWS[flowId];
  const data = { ...(state.data || {}), collect: flowId, intent: cfg.intent };
  const idx = firstUnfilled(cfg, data, 0);
  if (idx >= cfg.fields.length) return finishCollect(cfg, data);
  const first = cfg.fields[idx];
  const intro: Record<string, string> = {
    topup: `Great — let’s take up your *Car Loan Top-Up* requirement. I’ll ask only what’s relevant.`,
    bt: `Certainly. We can help you explore a *Car Loan Balance Transfer with additional Top-Up funding*, subject to eligibility and lender terms.`,
    used: `Certainly. I can help you explore financing for your *used car*.`,
    new: `Certainly. I can help you explore financing for your *new car*.`,
    commercial: `Certainly. I can help you explore financing for your *commercial vehicle*.`,
  };
  return {
    reply: `${intro[flowId] || ''}\n\n${first.prompt}`,
    quickReplies: first.options,
    state: { flow: 'collect', step: idx, data },
  };
}

function collectFlow(raw: string, state: ChatState): EngineResult {
  const d = state.data!;
  const cfg = COLLECT_FLOWS[d.collect];
  if (!cfg) return welcomeResult(); // defensive: unknown config → restart cleanly
  const idx = state.step || 0;
  const field = cfg.fields[idx];

  // Validate & store the current field's answer.
  const value = parseField(raw, field);
  if (value === null) {
    return { reply: reprompt(field), quickReplies: field.options, state };
  }
  d[field.key] = value;

  // Next unfilled field, or finish.
  const nextIdx = firstUnfilled(cfg, d, idx + 1);
  if (nextIdx < cfg.fields.length) {
    const next = cfg.fields[nextIdx];
    // Personalise the very next question right after we learn the name.
    const prefix = field.key === 'name' && typeof value === 'string' ? `Thanks, ${value.split(' ')[0]}! ` : '';
    return {
      reply: prefix + next.prompt,
      quickReplies: next.options,
      state: { flow: 'collect', step: nextIdx, data: d },
    };
  }
  return finishCollect(cfg, d);
}

// Returns the parsed value, or null when the answer is invalid (→ reprompt).
function parseField(raw: string, field: Field): string | null {
  const text = norm(raw);
  const trimmed = raw.trim();
  switch (field.type) {
    case 'phone': {
      const digits = (raw.match(/\d/g) || []).join('');
      return digits.length >= 10 ? digits.slice(-10) : null;
    }
    case 'amount': {
      // "none"/"no" is a valid answer for optional EMI-type fields.
      if (field.key === 'existingEmi' && hasWord(text, ['none', 'no', 'nil', 'zero', 'nahi'])) return 'None';
      const n = parseAmount(raw);
      return n && n > 0 ? String(n) : null;
    }
    case 'number': {
      const m = text.match(/\d+/);
      return m ? m[0] : null;
    }
    case 'choice': {
      const opt = matchOption(text, field.options || []);
      return opt || trimmed || null;
    }
    default: // text
      return trimmed.length >= 2 ? trimmed : null;
  }
}

function matchOption(text: string, options: string[]): string | null {
  const t = norm(text);
  for (let i = 0; i < options.length; i++) {
    if (t === norm(options[i]) || t.includes(norm(options[i]))) return options[i];
  }
  // Loose keyword hints for employment.
  if (has(t, ['self', 'freelanc'])) return 'Self-Employed';
  if (has(t, ['business', 'owner', 'proprietor'])) return 'Business Owner';
  if (has(t, ['salary', 'salaried', 'job', 'employee'])) return 'Salaried';
  return null;
}

function reprompt(field: Field): string {
  const hints: Record<FieldType, string> = {
    phone: 'Please share a valid 10-digit mobile number.',
    amount: 'Please share an approximate amount, for example “3 lakh” or 300000.',
    number: 'Please share a number, for example 2020.',
    choice: `Please choose one of: ${(field.options || []).join(', ')}.`,
    text: 'Please share a valid response so I can note it correctly.',
  };
  return hints[field.type];
}

function finishCollect(cfg: CollectFlow, d: Record<string, any>): EngineResult {
  const lead = buildLead(cfg, d);
  const firstName = d.name ? String(d.name).split(' ')[0] : 'there';
  return {
    reply: withNotice(`${cfg.assessment}\n\nThank you, ${firstName}. Our specialist will reach out on ${d.phone}. What would you like to do next?`),
    quickReplies: cfg.nextReplies,
    state: {},
    lead,
  };
}

// Build a structured CRM lead from a completed collection flow (blueprint §14/§15).
function buildLead(cfg: CollectFlow, d: Record<string, any>): LeadData {
  const parts: string[] = [];
  const seen: Record<string, boolean> = {};
  for (let i = 0; i < cfg.fields.length; i++) {
    const f = cfg.fields[i];
    if (seen[f.label]) continue;
    seen[f.label] = true;
    const v = d[f.key];
    if (v == null || v === '') continue;
    parts.push(`${f.label}: ${formatValue(f, v)}`);
  }
  const summary = `[${cfg.intent}] ` + parts.join(' | ');
  return {
    name: d.name,
    phone: d.phone,
    city: d.city,
    loanType: cfg.productName,
    income: d.income ? String(d.income) : undefined,
    employment: d.employment || undefined,
    amount: (d.topUpAmount || d.amount) ? String(d.topUpAmount || d.amount) : undefined,
    priority: cfg.priority,
    intent: cfg.intent,
    source: `${BOT_NAME} Chatbot`,
    message: summary + ` | Priority: ${cfg.priority}`,
  };
}

function formatValue(f: Field, v: any): string {
  if (f.type === 'amount' && v !== 'None' && /^\d+$/.test(String(v))) return inr(Number(v));
  return String(v);
}

// ── EMI flow (blueprint §11) ──────────────────────────────────────────────────
function startEmi(state: ChatState): EngineResult {
  return {
    reply: 'Let’s calculate your EMI. 🧮 First, how much *loan amount* are you considering? (e.g. 5 lakh)',
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
    return { reply: `Got it — ${inr(val)}. What annual *interest rate* (%) should I use? (e.g. 10.5). Our rates start from ${COMPANY.ratesFrom}.`, state: { flow: 'emi', step: 2, data: d } };
  }
  if (step === 2) {
    if (val == null || val <= 0 || val > 40) return { reply: 'Please share an interest rate as a number, e.g. 10.5', state };
    d.rate = val;
    return { reply: 'And the *tenure* in months? (e.g. 60 for 5 years)', state: { flow: 'emi', step: 3, data: d } };
  }
  // step 3 → result
  if (val == null || val < 1 || val > 360) return { reply: 'Please share the tenure in months, e.g. 60.', state };
  d.months = Math.round(val);
  const { emi, totalInterest, totalPayment } = calcEmi(d.amount, d.rate, d.months);
  return {
    reply: withNotice(
      `*Estimated EMI*\n\n### ${inr(emi)} / month\n\n• *Total interest:* ${inr(totalInterest)}\n• *Total payment:* ${inr(totalPayment)}\n\n(Loan ${inr(d.amount)} · ${d.rate}% p.a. · ${d.months} months)\n\nThis is an indicative calculation. Actual EMI, rate and tenure may vary based on lender policy and eligibility. Would you like to apply or talk to a specialist?`,
    ),
    quickReplies: ['Apply for Loan', MENU_SPECIALIST, 'Recalculate EMI'],
    state: { data: { loanType: d.loanType } },
  };
}

// ── Smart eligibility flow (blueprint §10) ────────────────────────────────────
function startEligibility(state: ChatState): EngineResult {
  return {
    reply:
      'Happy to run a quick *preliminary* check — no documents needed. 😊\nWhat type of loan are you looking for?',
    quickReplies: [MENU_TOPUP, MENU_USED, MENU_NEW, MENU_COMMERCIAL],
    state: { flow: 'eligibility', step: 1, data: state.data },
  };
}
function eligibilityFlow(raw: string, state: ChatState): EngineResult {
  const d = state.data!;
  const step = state.step || 1;
  const text = norm(raw);

  if (step === 1) {
    // Identify the loan type and remember it, then route the rest of the check.
    if (has(text, ['top up', 'topup', 'top-up', 'additional', 'against my car'])) d.loanType = 'Car Loan Top-Up';
    else if (has(text, ['used', 'second hand', 'secondhand'])) d.loanType = 'Used Car Loan';
    else if (has(text, ['new car', 'new'])) d.loanType = 'New Car Loan';
    else if (has(text, ['commercial', 'truck', 'bus', 'cv'])) d.loanType = 'Commercial Vehicle Loan';
    else d.loanType = raw.trim() || 'General enquiry';
    return {
      reply: `Noted — *${d.loanType}*. What is your *approximate monthly income* (in ₹)?`,
      state: { flow: 'eligibility', step: 2, data: d },
    };
  }
  if (step === 2) {
    const inc = parseAmount(raw);
    if (!inc || inc < 1000) return { reply: 'Please share your approximate monthly income in ₹, e.g. 30000.', state };
    d.income = inc;
    return { reply: 'Are you *salaried* or *self-employed / business*?', quickReplies: ['Salaried', 'Self-employed'], state: { flow: 'eligibility', step: 3, data: d } };
  }
  if (step === 3) {
    d.employment = has(text, ['self', 'business', 'own']) ? 'Self-employed' : 'Salaried';
    return { reply: 'Do you have any *existing monthly EMI*? If yes, how much? (or type “none”)', state: { flow: 'eligibility', step: 4, data: d } };
  }
  if (step === 4) {
    d.existingEmi = hasWord(text, ['none', 'no', 'nil', 'zero', 'nahi']) ? 0 : parseAmount(raw) || 0;
    return { reply: 'And roughly what *loan / top-up amount* are you looking for? (e.g. 5 lakh)', state: { flow: 'eligibility', step: 5, data: d } };
  }
  // step 5 → indicative result + route to the matching product flow.
  d.amount = parseAmount(raw) || d.amount;
  const suitable = d.income >= ELIGIBILITY_RULES.minMonthlyIncome;
  const msg = suitable
    ? `Based on what you shared, your requirement *may be suitable for further assessment*. ✅ Final eligibility, amount and rate are decided by the lending partner.`
    : `Your requirement *requires further review by our loan specialist*, who can guide you on the best-fit options.`;

  // Gate on a confirm ("Yes, continue") via the lead flow's step 0. If we can map
  // the loan type to a product flow, routeFlow enters it on confirm; otherwise we
  // fall back to simple name/phone lead capture.
  const flowId = loanTypeToFlowId(d.loanType);
  return {
    reply: withNotice(`${msg}\n\nShall I take a few more details so our specialist can prepare your options? (no documents needed)`),
    quickReplies: ['Yes, continue', MENU_SPECIALIST],
    state: flowId
      ? { flow: 'lead', step: 0, data: { ...d, routeFlow: flowId } }
      : { flow: 'lead', step: 0, data: { ...d, loanType: d.loanType || 'General enquiry' } },
  };
}

function loanTypeToFlowId(loanType?: string): string | null {
  switch (loanType) {
    case 'Car Loan Top-Up': return 'topup';
    case 'Used Car Loan': return 'used';
    case 'New Car Loan': return 'new';
    case 'Commercial Vehicle Loan': return 'commercial';
    default: return null;
  }
}

// ── Lead capture flow (blueprint §12/§14) ─────────────────────────────────────
function startLead(state: ChatState, loanType?: string): EngineResult {
  return {
    reply:
      'Great! I’ll note your requirement so our specialist can help — *no documents needed*. 📝\nWhat’s your *name*?',
    state: { flow: 'lead', step: 1, data: { ...(state.data || {}), loanType: loanType || state.data?.loanType } },
  };
}
function leadFlow(raw: string, state: ChatState): EngineResult {
  const d = state.data!;
  // Use ?? not ||: step 0 (a confirm gate) is valid and must NOT fall back to 1.
  let step = state.step ?? 1;
  const text = norm(raw);

  // step 0 — confirm gate coming out of eligibility. Don't consume the tap as a name.
  if (step === 0) {
    if (has(text, ['product', 'products'])) return productListResult();
    if (hasWord(text, ['no', 'not now', 'later', 'nahi'])) {
      return { reply: 'No problem! I’m here whenever you need. Anything else I can help with?', quickReplies: DEFAULT_QUICK, state: {} };
    }
    // Confirmed → if eligibility routed us to a product flow, enter it now.
    if (d.routeFlow) {
      const flowId = d.routeFlow;
      delete d.routeFlow;
      return startCollect(flowId, { data: d });
    }
    return startLead({ data: d }, d.loanType);
  }

  if (step === 1) {
    if (!d.name) {
      const name = raw.trim();
      if (name.length < 2) return { reply: 'Please share your name so our specialist can address you correctly.', state };
      d.name = name;
      return { reply: `Thanks, ${name.split(' ')[0]}! What’s the best *mobile number* to reach you?`, state: { flow: 'lead', step: 2, data: d } };
    }
    step = 2;
  }

  if (step === 2) {
    const digits = (raw.match(/\d/g) || []).join('');
    if (digits.length < 10) return { reply: 'Please share a valid 10-digit mobile number.', state };
    d.phone = digits.slice(-10);
    if (d.city) return askCallbackOrFinish(d);
    return { reply: 'Which *city* are you in?', state: { flow: 'lead', step: 3, data: d } };
  }

  if (step === 3) {
    d.city = raw.trim();
    return askCallbackOrFinish(d);
  }

  // step 4 → loan type, then finish
  if (!d.loanType || d.loanType === 'General enquiry') {
    const p = findProduct(text);
    d.loanType = p ? p.name : raw.trim();
  }
  return finishLead(d);
}

function askCallbackOrFinish(d: Record<string, any>): EngineResult {
  if (d.loanType && d.loanType !== 'General enquiry') return finishLead(d);
  return {
    reply: 'Which loan are you interested in?',
    quickReplies: PRODUCTS.map((p) => p.name),
    state: { flow: 'lead', step: 4, data: d },
  };
}

function leadPriority(d: Record<string, any>): 'HOT' | 'WARM' | 'COLD' {
  // HOT: existing car loan / clear funding requirement / callback requested.
  if (d.currentLender || d.topUpAmount || d.callbackTime) return 'HOT';
  if (d.amount || d.income) return 'HOT';
  if (d.loanType && d.loanType !== 'General enquiry') return 'WARM';
  return 'COLD';
}

function finishLead(d: Record<string, any>): EngineResult {
  const priority = leadPriority(d);
  const intent = d.intent || d.loanType || 'General enquiry';
  const lead: LeadData = {
    name: d.name,
    email: d.email,
    phone: d.phone,
    city: d.city,
    loanType: d.loanType,
    income: d.income ? String(d.income) : undefined,
    employment: d.employment || undefined,
    amount: d.amount ? String(d.amount) : undefined,
    priority,
    intent,
    source: `${BOT_NAME} Chatbot`,
    message:
      `[${intent}] Loan: ${d.loanType || 'Not specified'}` +
      (d.city ? ` | City: ${d.city}` : '') +
      (d.income ? ` | Monthly income: ${inr(Number(d.income))}` : '') +
      (d.employment ? ` | ${d.employment}` : '') +
      (d.existingEmi != null ? ` | Existing EMI: ${d.existingEmi ? inr(Number(d.existingEmi)) : 'None'}` : '') +
      (d.amount ? ` | Amount sought: ${inr(Number(d.amount))}` : '') +
      (d.callbackTime ? ` | Preferred callback: ${d.callbackTime}` : '') +
      ` | Priority: ${priority}`,
  };
  return {
    reply: withNotice(
      `All set, ${String(d.name).split(' ')[0]}! ✅ Our specialist will reach out on ${d.phone} shortly (within ${COMPANY.hours}). ` +
        `Thank you for choosing ${COMPANY.name}. Is there anything else I can help you with?`,
    ),
    quickReplies: [MENU_TOPUP, MENU_EMI],
    state: {},
    lead,
  };
}

// ── Callback flow (blueprint §12) ─────────────────────────────────────────────
function startCallback(state: ChatState): EngineResult {
  return {
    reply: 'Sure! When’s a good *time* for our specialist to call you? (e.g. today 5 PM)',
    state: { flow: 'callback', step: 1, data: state.data },
  };
}
function callbackFlow(raw: string, state: ChatState): EngineResult {
  const d = state.data!;
  d.callbackTime = raw.trim();
  // Reuse the lead flow to collect name + number.
  return startLead({ data: d }, d.loanType);
}
