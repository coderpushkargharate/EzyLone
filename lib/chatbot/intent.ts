// EzySaathi AI — context-aware intent classifier for POST-LEAD Q&A mode.
//
// This is the piece that fixes the "same generic fallback repeated" problem
// (blueprint §3/§4/§13/§14). Every incoming message in Q&A mode is classified
// using the CURRENT message *plus* the previous assistant message, the selected
// loan product, and the appointment/callback state — not the message alone. It
// then returns a ready, compliance-safe answer from lib/chatbot/answers.ts.
//
// It is a PURE function (no DB, no network) so it is fully unit-testable and can
// never throw a data-layer error into a chat reply. The WhatsApp brain
// (lib/chatbot/whatsappBrain.ts) supplies the context from persisted state and
// applies the returned actions (store callback time, hand off, etc.).

import * as A from './answers';
import { productKeyOf, ProductKey } from './answers';

export type Intent =
  | 'GREETING'
  | 'THANK_YOU'
  | 'ARE_YOU_HUMAN'
  | 'REPEAT_MESSAGE_COMPLAINT'
  | 'COMPLAINT'
  | 'HUMAN_HANDOFF'
  | 'CALLBACK_REQUEST'
  | 'APPOINTMENT_REQUEST'
  | 'CALLBACK_TIME'
  | 'CONFIRM_APPOINTMENT'
  | 'CHANGE_APPOINTMENT'
  | 'CONTACT_INFORMATION'
  | 'DOCUMENTS'
  | 'ELIGIBILITY'
  | 'EMI_CALCULATION'
  | 'INTEREST_RATE'
  | 'PROCESSING_FEE'
  | 'TENURE'
  | 'CIBIL'
  | 'INCOME_REQUIREMENT'
  | 'LOAN_AMOUNT'
  | 'APPLICATION_PROCESS'
  | 'APPROVAL_PROCESS'
  | 'DISBURSEMENT'
  | 'FORECLOSURE'
  | 'BALANCE_TRANSFER'
  | 'TOP_UP'
  | 'LOAN_PRODUCT_INFO'
  | 'PROPERTY_OWNERSHIP'
  | 'COMPANY_INFO'
  | 'CLARIFICATION'
  | 'UNRELATED_QUESTION'
  | 'UNKNOWN';

// Follow-up actions the brain must perform after we answer.
export type IntentAction =
  | 'NONE'
  | 'ASK_CALLBACK_TIME' // set awaitingCallbackTime = true
  | 'SET_CALLBACK_TIME' // store preferredCallbackTime (+ callbackRequested)
  | 'REQUEST_CALLBACK' // callbackRequested = true (time still unknown)
  | 'CONFIRM_CALLBACK' // confirmation of an already-noted callback
  | 'HANDOFF'; // hand to human / mark specialist requested

export interface ConvContext {
  loanType?: string; // product selected during the lead flow
  productKey?: ProductKey; // resolved product (optional; derived from loanType if absent)
  leadName?: string; // first name for personalisation
  leadPhone?: string; // 10-digit number for callback confirmations
  previousAssistant?: string; // the assistant's last message (context for short replies)
  callbackRequested?: boolean; // a callback was already requested earlier
  awaitingCallbackTime?: boolean; // we just asked for a preferred time
  preferredCallbackTime?: string; // a callback time already on file
  // EMI carry-over (if we ever collect it across turns). Optional.
  emiAmount?: number | null;
  emiRate?: number | null;
  emiMonths?: number | null;
}

export interface IntentResult {
  intent: Intent;
  confidence: number; // 0..1 (heuristic, for logging/telemetry)
  reply: string;
  source: string; // for ChatLog: 'intent', 'appointment', 'clarification', 'unrelated'…
  action: IntentAction;
  callbackTime?: string; // parsed, when action === 'SET_CALLBACK_TIME'
  requiresHuman?: boolean;
}

// ── Small, local text helpers (kept independent of the engine) ────────────────
const norm = (s: string | undefined) => (s || '').toLowerCase().trim();
const has = (t: string, words: string[]) => words.some((w) => t.includes(w));
const hasWord = (t: string, words: string[]) =>
  words.some((w) => new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i').test(t));

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Parse a natural-language callback time into a tidy label, or null if the text
// carries no time signal. Handles "tomorrow 11am", "monday 3 pm", "today evening",
// "at 5", "next week", clock times with/without am-pm.
export function parseCallbackTime(text: string): string | null {
  const t = norm(text);
  if (!t) return null;

  // Day / relative-day portion.
  let day = '';
  if (/\btomorrow\b/.test(t)) day = 'Tomorrow';
  else if (/\btonight\b/.test(t)) day = 'Tonight';
  else if (/\btoday\b/.test(t)) day = 'Today';
  else if (/\bnext week\b/.test(t)) day = 'Next week';
  else {
    for (const d of DAYS) {
      if (new RegExp(`\\b${d}\\b`).test(t)) {
        day = cap(d);
        break;
      }
    }
  }

  // Clock time: "11am", "11 am", "3:30 pm", "11:00".
  let clock = '';
  const ampm = t.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)/);
  if (ampm) {
    const h = parseInt(ampm[1], 10);
    const min = ampm[2] ? ampm[2] : '00';
    const mer = ampm[3].replace(/\./g, '').toUpperCase();
    if (h >= 1 && h <= 12) clock = `${h}:${min} ${mer}`;
  } else {
    const hhmm = t.match(/\b(\d{1,2}):(\d{2})\b/);
    if (hhmm) {
      const h = parseInt(hhmm[1], 10);
      if (h >= 0 && h <= 23) clock = `${hhmm[1]}:${hhmm[2]}`;
    }
  }

  // Part-of-day words.
  let part = '';
  if (!clock) {
    if (/\bmorning\b/.test(t)) part = 'morning';
    else if (/\bafternoon\b/.test(t)) part = 'afternoon';
    else if (/\bevening\b/.test(t)) part = 'evening';
    else if (/\bnight\b/.test(t) && day !== 'Tonight') part = 'night';
  }

  if (!day && !clock && !part) return null;

  if (day && clock) return `${day} at ${clock}`;
  if (day && part) return `${day} ${part}`;
  if (day) return day;
  if (clock) return clock;
  return part; // e.g. "evening"
}

export function looksLikeTime(text: string): boolean {
  return parseCallbackTime(text) !== null;
}

// Extract amount / rate / tenure for an EMI question in one message.
function parseEmiParts(text: string): { amount?: number | null; rate?: number | null; months?: number | null } {
  const t = norm(text).replace(/,/g, '');
  let rate: number | null = null;
  const pct = t.match(/([\d.]+)\s*%/);
  if (pct) rate = parseFloat(pct[1]);
  let months: number | null = null;
  const mo = t.match(/([\d.]+)\s*(month|months|mahine|mahina)/);
  if (mo) months = Math.round(parseFloat(mo[1]));
  const yr = t.match(/([\d.]+)\s*(year|years|saal|yr)/);
  if (!months && yr) months = Math.round(parseFloat(yr[1]) * 12);
  let amount: number | null = null;
  const lakh = t.match(/([\d.]+)\s*(lakh|lac|lakhs)/);
  const crore = t.match(/([\d.]+)\s*(crore|cr)/);
  if (lakh) amount = Math.round(parseFloat(lakh[1]) * 100000);
  else if (crore) amount = Math.round(parseFloat(crore[1]) * 10000000);
  return { amount, rate, months };
}

// Does the previous assistant message look like it asked for a callback time or
// offered a human/specialist connection?
function prevAskedTime(ctx: ConvContext): boolean {
  if (ctx.awaitingCallbackTime) return true;
  const p = norm(ctx.previousAssistant);
  if (!p) return false;
  return (
    /what time|preferred (callback )?time|time.*(call|callback)|when.*(call|reach)|good time/.test(p) ||
    (has(p, ['callback', 'call you']) && has(p, ['time', 'when']))
  );
}
function prevOfferedHuman(ctx: ConvContext): boolean {
  const p = norm(ctx.previousAssistant);
  if (!p) return false;
  return has(p, ['specialist', 'connect you', 'call you', 'callback', 'human', 'reach you']);
}

// ── The classifier ────────────────────────────────────────────────────────────
export function classifyIntent(rawMessage: string, ctx: ConvContext = {}): IntentResult {
  const text = norm(rawMessage);
  const key: ProductKey = ctx.productKey || productKeyOf(ctx.loanType);
  const name = ctx.leadName;

  const make = (
    intent: Intent,
    reply: string,
    opts: Partial<Omit<IntentResult, 'intent' | 'reply'>> = {},
  ): IntentResult => ({
    intent,
    confidence: opts.confidence ?? 0.8,
    reply,
    source: opts.source ?? 'intent',
    action: opts.action ?? 'NONE',
    callbackTime: opts.callbackTime,
    requiresHuman: opts.requiresHuman,
  });

  // Empty / non-text.
  if (!text || text === '[non-text message]') {
    return make('CLARIFICATION', A.clarificationAnswer(), { confidence: 0.3, source: 'clarification' });
  }

  // 1) Complaint about repetition — MUST beat everything so we break the loop.
  if (
    has(text, ['same message', 'same answer', 'same reply', 'same thing', 'repeat', 'repeating', 'repeatedly']) ||
    has(text, ['keep sending', 'again and again', 'same response']) ||
    (has(text, ['not understand', "don't understand", 'dont understand', 'not understanding']) && has(text, ['you', 'u']))
  ) {
    return make('REPEAT_MESSAGE_COMPLAINT', A.repeatComplaintAnswer(), { confidence: 0.95, source: 'complaint' });
  }

  // 2) "Are you human / bot / real?"
  if (
    has(text, ['are you human', 'are you real', 'is this a bot', 'are you a bot', 'are you robot', 'real person', 'human or bot']) ||
    has(text, ['who am i talking', 'who am i speaking', 'am i talking to a']) ||
    (hasWord(text, ['bot', 'robot', 'human', 'ai']) && has(text, ['are you', 'you a', 'you an', 'this a']))
  ) {
    return make('ARE_YOU_HUMAN', A.areYouHumanAnswer(), { confidence: 0.9 });
  }

  // 3) Appointment confirmation ("fix appointment", "confirm", "book it").
  const confirmish = has(text, ['fix appointment', 'confirm appointment', 'book appointment', 'schedule appointment', 'confirm callback', 'confirm', 'book it', 'go ahead', 'yes please']);
  const changeish = has(text, ['change appointment', 'reschedule', 'change the time', 'different time', 'another time']);
  if (changeish) {
    return make('CHANGE_APPOINTMENT', A.callbackAskTimeAnswer(name), { confidence: 0.85, action: 'ASK_CALLBACK_TIME', source: 'appointment', requiresHuman: true });
  }
  if (confirmish) {
    if (ctx.preferredCallbackTime || ctx.callbackRequested || ctx.awaitingCallbackTime) {
      return make('CONFIRM_APPOINTMENT', A.callbackConfirmAnswer({ name, phone: ctx.leadPhone, time: ctx.preferredCallbackTime }), {
        confidence: 0.9,
        action: ctx.preferredCallbackTime ? 'CONFIRM_CALLBACK' : 'ASK_CALLBACK_TIME',
        source: 'appointment',
        requiresHuman: true,
      });
    }
    // Fresh "fix appointment" with no context → treat as a new callback request.
    return make('APPOINTMENT_REQUEST', A.callbackAskTimeAnswer(name), { confidence: 0.85, action: 'ASK_CALLBACK_TIME', source: 'appointment', requiresHuman: true });
  }

  // 4) Explicit human / callback request.
  const wantsHuman = hasWord(text, ['human', 'agent', 'executive', 'representative', 'specialist', 'someone']) || has(text, ['talk to a person', 'talk to human', 'real person', 'i want executive', 'i need executive', 'connect me']);
  const wantsCallback = has(text, ['call me', 'callback', 'call back', 'phone me', 'ring me', 'need a call', 'want a call', 'contact me', 'appointment', 'schedule call', 'schedule a call', 'book a call']);
  if (wantsHuman || wantsCallback) {
    // If they included a time in the same breath, capture it now.
    const t = parseCallbackTime(text);
    if (t) {
      return make('CALLBACK_TIME', A.callbackNotedAnswer({ name, phone: ctx.leadPhone, time: t }), {
        confidence: 0.92,
        action: 'SET_CALLBACK_TIME',
        callbackTime: t,
        source: 'appointment',
        requiresHuman: true,
      });
    }
    const intent: Intent = wantsHuman ? 'HUMAN_HANDOFF' : 'CALLBACK_REQUEST';
    return make(intent, A.callbackAskTimeAnswer(name), { confidence: 0.9, action: 'ASK_CALLBACK_TIME', source: 'appointment', requiresHuman: true });
  }

  // 5) A bare time / day answer — in Q&A mode this is almost always a callback
  // time (especially right after we offered a specialist). Handle BEFORE topic
  // matching so "Tomorrow 11am" is never a generic fallback.
  const timeLabel = parseCallbackTime(text);
  if (timeLabel && (prevAskedTime(ctx) || prevOfferedHuman(ctx) || ctx.callbackRequested || isMostlyTime(text))) {
    return make('CALLBACK_TIME', A.callbackNotedAnswer({ name, phone: ctx.leadPhone, time: timeLabel }), {
      confidence: 0.9,
      action: 'SET_CALLBACK_TIME',
      callbackTime: timeLabel,
      source: 'appointment',
      requiresHuman: true,
    });
  }

  // 6) Greeting.
  if (hasWord(text, ['hi', 'hello', 'hey', 'namaste', 'namaskar', 'hii', 'hiya', 'hlo']) && text.length <= 20) {
    return make('GREETING', A.greetingAnswer(name), { confidence: 0.85, source: 'greeting' });
  }

  // 7) Thanks.
  if (hasWord(text, ['thanks', 'thank', 'dhanyavad', 'dhanyabad', 'shukriya', 'thx', 'tq']) || has(text, ['thank you', 'thankyou'])) {
    return make('THANK_YOU', A.thankYouAnswer(name), { confidence: 0.85, source: 'thanks' });
  }

  // 8) Contact / company.
  if (has(text, ['your number', 'phone number', 'contact number', 'your phone', 'your contact', 'how to reach', 'your email', 'your address', 'office address', 'where are you located', 'your office'])) {
    return make('CONTACT_INFORMATION', A.contactAnswer(), { confidence: 0.85 });
  }
  if (has(text, ['who are you', 'about you', 'about ezyloan', 'about the company', 'are you a lender', 'are you rbi', 'what is ezyloan'])) {
    return make('COMPANY_INFO', A.companyAnswer(), { confidence: 0.8 });
  }

  // 9) Property ownership / LAP eligibility (context-aware).
  if (
    has(text, ['not in my name', 'not my name', 'not on my name', "father's property", 'fathers property', 'father property', "mother's property", 'mother property', "wife's property", 'wife property', "husband's property", "spouse's property", 'in my father', 'in my mother', 'in my wife', 'in my husband', 'someone else name', 'someone elses name', 'property ownership', 'ownership mandatory', 'own the property', 'i own', 'property is in'])
  ) {
    return make('PROPERTY_OWNERSHIP', A.propertyOwnershipAnswer(), { confidence: 0.85 });
  }

  // Knowledge intents — ordered MOST-SPECIFIC first so a broad phrase like
  // "can I get" (eligibility) never shadows "can I get a used car loan" (product)
  // or "how much can I get" (amount).

  // 10) Documents.
  if (has(text, ['document', 'documents', 'papers', 'kagaz', 'kagzat', 'what do i need', 'what is required', 'requirement list', 'docs needed', 'documents needed', 'documents required', 'documents list', 'list of documents'])) {
    return make('DOCUMENTS', A.documentsAnswer(key), { confidence: 0.85 });
  }

  // 11) EMI (calculate if we have the numbers, else ask).
  if (has(text, ['emi', 'installment', 'instalment', 'monthly payment', 'kitni emi', 'monthly emi'])) {
    const parts = parseEmiParts(text);
    return make('EMI_CALCULATION', A.emiAnswer({ amount: parts.amount ?? ctx.emiAmount, rate: parts.rate ?? ctx.emiRate, months: parts.months ?? ctx.emiMonths }), { confidence: 0.85, source: 'emi' });
  }

  // 12) Interest rate.
  if (has(text, ['interest rate', 'rate of interest', 'roi', 'byaj', 'byaaj', 'what rate', 'rate kya']) || (hasWord(text, ['interest']) && !has(text, ['no interest']))) {
    return make('INTEREST_RATE', A.interestRateAnswer(), { confidence: 0.85 });
  }

  // 13) Foreclosure / prepayment (before the generic "charges" fee match).
  if (has(text, ['prepay', 'pre pay', 'foreclose', 'foreclosure', 'preclose', 'early repay', 'part payment', 'part-payment', 'close early'])) {
    return make('FORECLOSURE', A.prepaymentAnswer(), { confidence: 0.8 });
  }

  // 14) Processing fee.
  if (has(text, ['processing fee', 'processing charge', 'file charge', 'file charges', 'hidden charge', 'charges', 'processing'])) {
    return make('PROCESSING_FEE', A.processingFeeAnswer(), { confidence: 0.8 });
  }

  // 15) Tenure.
  if (has(text, ['tenure', 'how many years', 'how many months', 'repayment period', 'loan period', 'duration', 'how long can i repay', 'kitne saal', 'kitne months'])) {
    return make('TENURE', A.tenureAnswer(key), { confidence: 0.8 });
  }

  // 16) CIBIL / credit.
  if (has(text, ['cibil', 'credit score', 'credit history', 'low score', 'bad credit', 'poor credit', 'score kam'])) {
    return make('CIBIL', A.cibilAnswer(), { confidence: 0.85 });
  }

  // 17) Income requirement / no salary / income proof.
  if (has(text, ['minimum income', 'income required', 'required income', 'salary required', 'without salary', 'no salary', 'no income proof', "don't have income proof", 'without income proof', 'income proof', 'salary slip', 'without salary slip'])) {
    return make('INCOME_REQUIREMENT', A.eligibilityAnswer(key), { confidence: 0.8, source: 'eligibility' });
  }

  // 18) Balance transfer / top-up concepts.
  if (has(text, ['balance transfer', 'transfer my loan', 'transfer loan', 'shift my loan', 'shift loan', 'transfer existing', 'transfer my existing'])) {
    return make('BALANCE_TRANSFER', A.balanceTransferAnswer(), { confidence: 0.8, source: 'product' });
  }
  if (has(text, ['top up', 'topup', 'top-up', 'additional fund', 'extra fund', 'extra loan on'])) {
    return make('TOP_UP', A.topupAnswer(), { confidence: 0.8, source: 'product' });
  }

  // 19) Named products → overview (BEFORE eligibility, so "can I get a used car
  // loan" is product info, not a generic eligibility answer).
  const namedKey = detectProduct(text);
  if (namedKey) {
    return make('LOAN_PRODUCT_INFO', A.productOverviewAnswer(namedKey), { confidence: 0.75, source: 'product' });
  }

  // 20) Max / how-much loan amount (BEFORE eligibility for the same reason).
  if (has(text, ['maximum loan', 'max loan', 'how much loan', 'how much can i get', 'how much i can get', 'loan amount', 'maximum amount', 'kitna loan', 'max amount'])) {
    if (key !== 'generic') return make('LOAN_AMOUNT', A.productOverviewAnswer(key), { confidence: 0.75, source: 'product' });
    return make('CLARIFICATION', A.howMuchClarification(), { confidence: 0.5, source: 'clarification' });
  }

  // 21) Application / approval / disbursement.
  if (has(text, ['how to apply', 'application process', 'how do i apply', 'loan process', 'process of loan', 'how does it work', 'how it works', 'steps to apply', 'apply online', 'can i apply'])) {
    return make('APPLICATION_PROCESS', A.applicationProcessAnswer(), { confidence: 0.8 });
  }
  if (has(text, ['approval', 'approve', 'how long approval', 'approval time', 'will i get approved', 'get approved', 'sanction'])) {
    return make('APPROVAL_PROCESS', A.approvalAnswer(), { confidence: 0.8 });
  }
  if (has(text, ['disburse', 'disbursement', 'when will i get money', 'get the money', 'amount credited'])) {
    return make('DISBURSEMENT', A.disbursementAnswer(), { confidence: 0.8 });
  }

  // 22) Eligibility (generic) — last of the loan intents so specific ones win.
  if (has(text, ['eligib', 'qualify', 'am i eligible', 'can i get', 'do i qualify', 'yogya', 'patra'])) {
    return make('ELIGIBILITY', A.eligibilityAnswer(key), { confidence: 0.8, source: 'eligibility' });
  }

  // 23) Clearly unrelated small talk / off-topic.
  if (
    has(text, ['cricket', 'football', 'movie', 'weather', 'joke', 'song', 'politics', 'game', 'ipl', 'match', 'recipe', 'love you']) &&
    !has(text, ['loan', 'emi', 'car', 'property'])
  ) {
    return make('UNRELATED_QUESTION', A.unrelatedAnswer(), { confidence: 0.6, source: 'unrelated' });
  }

  // 24) "How much" with no product context → clarify.
  if (has(text, ['how much', 'kitna', 'kitni'])) {
    return make('CLARIFICATION', A.howMuchClarification(), { confidence: 0.5, source: 'clarification' });
  }

  // 25) Nothing matched → a SPECIFIC clarification, never the old generic loop.
  return make('UNKNOWN', A.clarificationAnswer(), { confidence: 0.3, source: 'clarification' });
}

// A message that is "mostly" a time expression (few non-time words) — used to
// treat a lone "Tomorrow 11am" as a callback time even without prior context.
function isMostlyTime(text: string): boolean {
  const t = norm(text);
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length > 4) return false;
  // reject if it contains obvious topic words.
  if (has(t, ['loan', 'emi', 'rate', 'document', 'eligib', 'property', 'car', 'interest'])) return false;
  return parseCallbackTime(t) !== null;
}

// Map product keywords in a message to a ProductKey (for overview answers).
function detectProduct(text: string): ProductKey | null {
  if (has(text, ['loan against property', 'against property', 'lap', 'mortgage'])) return 'lap';
  if (has(text, ['personal loan', 'personal'])) return 'personal';
  if (has(text, ['commercial', 'truck', 'bus', 'taxi', 'transport vehicle'])) return 'commercial';
  if (has(text, ['used car', 'second hand', 'pre owned', 'pre-owned', 'old car'])) return 'used-car';
  if (has(text, ['new car', 'buy a car', 'brand new'])) return 'new-car';
  if (has(text, ['balance transfer'])) return 'balance-transfer';
  if (has(text, ['top up', 'topup', 'top-up'])) return 'car-topup';
  return null;
}
