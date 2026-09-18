// "EzySaathi AI" brain for inbound WhatsApp messages, used by the Twilio webhook
// (app/api/whatsapp/webhook/route.ts).
//
// WhatsApp is currently served ONLY for Odisha. The conversation is a guided,
// token-light controller (NOT the full website chat engine) with three stages,
// all persisted per-phone in WhatsAppContact (permanent) + WhatsAppSession
// (conversation memory / in-progress form):
//
//   1) STATE GATE  — every new sender is first asked which state they're in.
//        • Odisha  → proceed to the lead form.
//        • other   → a polite "we're only in Odisha" message + PERMANENT manual
//                    (bot goes silent forever; a human can take over from admin).
//   2) LEAD FORM   — collect the contact-form fields once (name, city, email,
//        phone, loan amount, loan type), thank them, and create ONE CRM lead.
//   3) Q&A MODE    — after the lead exists we never push lead creation again; we
//        just answer questions (self-trained knowledge base + rule engine for
//        product/EMI/FAQ info, EMI handed off to the online calculator link).
//        The sender may ask up to MAX_QUESTIONS_AFTER_LEAD questions; beyond that
//        they're dropped into a 2-hour manual cooldown (auto-reverts to auto),
//        after which they get a fresh batch of questions — but the lead stays one.
//
// Contract: never throws. On any DB hiccup it degrades to a safe deterministic
// reply so the user always gets an answer.

import { runEngine, LeadData } from './engine';
import { captureLead } from './leadCapture';
import { matchKnowledge, logChat, bumpHits, HIGH_CONFIDENCE } from './knowledgeBase';
import { connectDB } from '@/lib/db';
import { WhatsAppSession } from '@/lib/models/WhatsAppSession';
import { WhatsAppMessage } from '@/lib/models/WhatsAppMessage';
import { WhatsAppContact, WhatsAppMode, IWhatsAppContact } from '@/lib/models/WhatsAppContact';

// ── Tunables ──────────────────────────────────────────────────────────────────
// How many questions a lead may ask before the bot hands off to a human for a
// cooldown. "10 se 15" per the brief → 15.
const MAX_QUESTIONS_AFTER_LEAD = 15;
// Temporary manual cooldown length once that cap is hit (auto-reverts to auto).
const MANUAL_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
// Public EMI calculator — on WhatsApp we hand users this instead of a multi-step
// in-chat EMI Q&A, keeping the conversation short.
const EMI_CALCULATOR_URL = 'https://www.ezyloan.co.in/emi-calculator';

// Odisha (and its common city/district names) so a user who answers with their
// city — not the state — still passes the gate. Anything else is treated as
// outside Odisha.
const ODISHA_TOKENS = [
  'odisha', 'odissa', 'odisa', 'odhisa', 'orissa', 'ଓଡ଼ିଶା', 'ଓଡିଶା',
  'bhubaneswar', 'bhubaneshwar', 'cuttack', 'rourkela', 'berhampur', 'brahmapur',
  'sambalpur', 'puri', 'balasore', 'baleswar', 'bhadrak', 'baripada', 'jharsuguda',
  'jeypore', 'angul', 'dhenkanal', 'kendrapara', 'jagatsinghpur', 'paradip',
  'koraput', 'rayagada', 'bolangir', 'balangir', 'nabarangpur', 'nuapada',
  'kalahandi', 'kandhamal', 'phulbani', 'ganjam', 'gajapati', 'malkangiri',
  'sundargarh', 'sundergarh', 'keonjhar', 'mayurbhanj', 'nayagarh', 'khordha',
  'khurda', 'sonepur', 'subarnapur', 'deogarh', 'boudh', 'bargarh', 'talcher',
];

// Last 10 digits of a WhatsApp sender id ("whatsapp:+919518745854" → "9518745854")
// so a WhatsApp lead dedupes against a form/chat lead for the same person.
function normalizePhone(raw: string): string {
  return (raw.match(/\d/g) || []).join('').slice(-10);
}

type Turn = { role: 'user' | 'assistant'; content: string };

// Pull the first sensible number out of a message ("5 lakh", "₹5,00,000").
function parseAmount(text: string): number | null {
  const t = (text || '').toLowerCase().replace(/,/g, '');
  const lakh = t.match(/([\d.]+)\s*(lakh|lac|lakhs|l\b)/);
  if (lakh) return Math.round(parseFloat(lakh[1]) * 100000);
  const crore = t.match(/([\d.]+)\s*(crore|cr\b)/);
  if (crore) return Math.round(parseFloat(crore[1]) * 10000000);
  const m = t.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

/**
 * Whether this sender is on the auto-reply bot ('auto', default) or has been
 * taken over by a human ('manual'). A TEMPORARY manual cooldown (manualUntil in
 * the past) auto-reverts to 'auto' here. Never throws — on any DB hiccup it falls
 * back to 'auto' so the bot keeps working.
 */
export async function getContactMode(phone: string): Promise<WhatsAppMode> {
  try {
    await connectDB();
    const c = await WhatsAppContact.findOne({ phone }).lean();
    if (!c) return 'auto';
    if (c.mode === 'manual') {
      // A bot-imposed cooldown that has elapsed → flip back to auto.
      if (c.manualUntil && new Date(c.manualUntil).getTime() <= Date.now()) {
        await WhatsAppContact.updateOne({ phone }, { $set: { mode: 'auto' }, $unset: { manualUntil: '' } });
        return 'auto';
      }
      return 'manual';
    }
    return 'auto';
  } catch (e) {
    console.error('WhatsApp contact mode load failed (defaulting to auto):', e);
    return 'auto';
  }
}

// ── Persistence helpers ─────────────────────────────────────────────────────

// Load (or synthesize a default in-memory) contact record. Never throws.
async function loadContact(phone: string): Promise<Partial<IWhatsAppContact>> {
  try {
    await connectDB();
    const c = await WhatsAppContact.findOne({ phone }).lean();
    if (c) return c as any;
  } catch (e) {
    console.error('WhatsApp contact load failed (using defaults):', e);
  }
  return { phone, mode: 'auto', geoStateStatus: 'new', leadCreated: false, questionsSinceLead: 0 };
}

async function saveContact(phone: string, updates: Record<string, any>, unset?: Record<string, ''>): Promise<void> {
  try {
    await connectDB();
    const op: any = { $set: updates };
    if (unset) op.$unset = unset;
    await WhatsAppContact.findOneAndUpdate({ phone }, op, { upsert: true });
  } catch (e) {
    console.error('WhatsApp contact save failed:', e);
  }
}

// Append a turn to the durable transcript (admin panel) + rolling history.
async function record(phone: string, userText: string, reply: string, source: string, history: Turn[]): Promise<void> {
  try {
    await WhatsAppMessage.create({ phone, userMessage: userText, botReply: reply, source, matched: source !== 'fallback', score: 0, inFlow: source === 'flow' });
  } catch (e) {
    console.error('WhatsApp transcript log failed:', e);
  }
  try {
    const turns: Turn[] = [...history, { role: 'user', content: userText }];
    if (reply) turns.push({ role: 'assistant', content: reply });
    await WhatsAppSession.findOneAndUpdate({ phone }, { $set: { history: turns.slice(-10) } }, { upsert: true });
  } catch (e) {
    console.error('WhatsApp session history save failed:', e);
  }
}

// Load conversation memory (in-progress form lives in session.state.form).
async function loadSession(phone: string): Promise<{ history: Turn[]; form: Record<string, any>; formStep: number }> {
  try {
    await connectDB();
    const doc = await WhatsAppSession.findOne({ phone }).lean();
    if (doc) {
      const st = (doc.state || {}) as any;
      return { history: (doc.history || []) as Turn[], form: st.form || {}, formStep: st.formStep || 0 };
    }
  } catch (e) {
    console.error('WhatsApp session load failed:', e);
  }
  return { history: [], form: {}, formStep: 0 };
}

async function saveFormState(phone: string, form: Record<string, any>, formStep: number): Promise<void> {
  try {
    await WhatsAppSession.findOneAndUpdate({ phone }, { $set: { state: { form, formStep } } }, { upsert: true });
  } catch (e) {
    console.error('WhatsApp form state save failed:', e);
  }
}

// ── MANUAL mode side-effects (bot silent, human replies) ─────────────────────
/**
 * MANUAL mode path: the bot stays silent, but we still record the inbound message
 * into the durable transcript + rolling history so the admin panel shows it. No
 * lead is created here anymore — a lead is only created once the user completes
 * the Odisha lead form (see the auto path). Fire-and-forget; never throws.
 */
export async function recordInboundMessage(phone: string, bodyText: string): Promise<void> {
  const userText = (bodyText || '').trim() || '[non-text message]';
  const { history } = await loadSession(phone);
  await record(phone, userText, '', 'inbound', history);
}

// ── State-gate helpers ───────────────────────────────────────────────────────
function isOdisha(text: string): boolean {
  const t = (text || '').toLowerCase();
  return ODISHA_TOKENS.some((tok) => t.includes(tok));
}

const ASK_STATE_MSG =
  `Namaste 🙏 *EzyLoan* me aapka swagat hai. Main *EzySaathi AI* hoon.\n\n` +
  `Filhal hum apni services *Odisha* me de rahe hain. Aage badhne se pehle bataiye — ` +
  `aap *kis state* se hain?`;

const OUT_OF_STATE_MSG =
  `Dhanyavaad aapke sampark ke liye 🙏\n\n` +
  `Filhal hum apni loan services *sirf Odisha* me de rahe hain, isliye hum abhi aapki ` +
  `request aage nahi le paa rahe. Jaise hi hum aapke area me shuru karenge, aapko ` +
  `zaroor sampark karenge. Dhanyavaad!`;

// ── Lead form ────────────────────────────────────────────────────────────────
interface FormStep {
  key: 'name' | 'city' | 'email' | 'phone' | 'amount' | 'loanType';
  prompt: string;
}
const FORM_STEPS: FormStep[] = [
  { key: 'name', prompt: 'Bahut badhiya! 😊 Shuru karte hain — aapka *pura naam* kya hai?' },
  { key: 'city', prompt: 'Aap Odisha me *kis city / district* se hain?' },
  { key: 'email', prompt: 'Aapki *email id* bataiye. (nahi dena chahte to "skip" likh dein)' },
  { key: 'phone', prompt: 'Aapse sampark ke liye best *mobile number* (10 digit)?' },
  { key: 'amount', prompt: 'Aapko kitna *loan amount* chahiye? (e.g. 5 lakh)' },
  { key: 'loanType', prompt: 'Aakhri sawaal — *kis type ka loan* chahiye?\n(e.g. Car Loan Top-Up, New Car, Used Car, Personal Loan, Loan Against Property)' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate + normalise one answer. Returns { value } to accept, or { error } to
// reprompt with a hint.
function validateForm(step: FormStep, raw: string): { value?: string; error?: string } {
  const text = (raw || '').trim();
  switch (step.key) {
    case 'name':
      return text.length >= 2 ? { value: text } : { error: 'Kripya apna pura naam likhein.' };
    case 'city':
      return text.length >= 2 ? { value: text } : { error: 'Kripya apni city / district ka naam likhein.' };
    case 'email':
      if (/^(skip|nahi|no|na)$/i.test(text)) return { value: '' };
      return EMAIL_RE.test(text) ? { value: text } : { error: 'Kripya sahi email likhein (e.g. name@gmail.com), ya "skip" likhein.' };
    case 'phone': {
      const digits = (raw.match(/\d/g) || []).join('');
      return digits.length >= 10 ? { value: digits.slice(-10) } : { error: 'Kripya sahi 10-digit mobile number dein.' };
    }
    case 'amount': {
      const n = parseAmount(raw);
      return n && n > 0 ? { value: String(n) } : { error: 'Kripya approximate amount dein, e.g. "5 lakh" ya 500000.' };
    }
    case 'loanType':
      return text.length >= 2 ? { value: text } : { error: 'Kripya loan type likhein, e.g. Car Loan Top-Up.' };
  }
}

// Build the CRM lead from the completed form. Odisha + full details → HOT.
function buildFormLead(phone: string, form: Record<string, any>): LeadData {
  const amountNum = form.amount ? Number(form.amount) : undefined;
  const summary =
    `[WhatsApp Odisha Lead] Loan: ${form.loanType || 'Not specified'}` +
    (form.city ? ` | City: ${form.city}` : '') +
    (amountNum ? ` | Amount: ${inr(amountNum)}` : '') +
    ` | State: Odisha | Priority: HOT`;
  return {
    name: form.name,
    email: form.email || undefined,
    phone: form.phone || normalizePhone(phone),
    city: form.city,
    loanType: form.loanType,
    amount: amountNum ? String(amountNum) : undefined,
    priority: 'HOT',
    intent: form.loanType,
    source: 'EzySaathi AI WhatsApp',
    message: summary,
  };
}

function thankYouMsg(form: Record<string, any>): string {
  const first = form.name ? String(form.name).split(' ')[0] : 'ji';
  return (
    `Shukriya ${first}! ✅ Aapki details hamari team ko mil gayi hain. ` +
    `Hamara loan specialist jald hi aapse *${form.phone}* par sampark karega.\n\n` +
    `Tab tak agar aapka koi sawaal ho — EMI, interest rate, documents ya process — ` +
    `to beshak poochiye, main yahin hoon 😊`
  );
}

// ── Q&A mode (after the lead exists) ─────────────────────────────────────────
// Intents that would restart data collection. We never do that once a lead
// exists — instead we reassure the user their details are already with the team.
const ALREADY_NOTED_MSG =
  `Aapki details already hamari team ke paas hain ✅ — woh aapse jald sampark karenge. ` +
  `Tab tak main aapke kisi bhi sawaal (EMI, interest rate, documents, process) ka jawab de sakta hoon 😊`;

const COOLDOWN_MSG =
  `Aapke aur sawaalon ke liye ab hamari team aapse *personally* baat karegi — thodi hi der me ` +
  `hamara specialist aapse connect karega 🙏 Dhanyavaad!`;

// Produce an informational answer using the self-trained knowledge base first,
// then the rule engine (products / FAQ / EMI). We run the engine STATELESSLY so
// it can never get stuck in — or restart — a data-collection flow. Returns the
// reply plus a source tag for logging.
async function answerQuestion(userText: string): Promise<{ reply: string; source: string; score: number }> {
  // 1) Self-trained knowledge base (high confidence only).
  try {
    const kb = await matchKnowledge(userText, 'whatsapp');
    if (kb && kb.score >= HIGH_CONFIDENCE) {
      bumpHits(kb.entryId);
      await logChat({ question: userText, answer: kb.answer, source: 'knowledge', matched: true, score: kb.score, matchedEntry: kb.entryId, channel: 'whatsapp' });
      return { reply: kb.answer, source: 'knowledge', score: kb.score };
    }
  } catch (e) {
    console.error('WhatsApp KB match failed:', e);
  }

  // 2) Rule engine — stateless, concise. Used only for informational intents.
  const r = runEngine(userText, {}, { concise: true });

  // EMI → hand off to the online calculator (no multi-step Q&A on WhatsApp).
  if (r.state.flow === 'emi') {
    const reply =
      `🧮 Apni EMI aap turant yahaan calculate kar sakte hain:\n\n${EMI_CALCULATOR_URL}\n\n` +
      `Bas loan amount, interest rate aur tenure daaliye. Aur koi help chahiye to bataiye 😊`;
    await logChat({ question: userText, answer: reply, source: 'engine', matched: true, score: 0, channel: 'whatsapp' });
    return { reply, source: 'engine', score: 0 };
  }

  // Any data-collection / lead / eligibility / callback intent → don't restart it.
  const collectFlows = ['collect', 'lead', 'callback', 'topupgate', 'eligibility'];
  if (r.lead || (r.state.flow && collectFlows.includes(r.state.flow))) {
    return { reply: ALREADY_NOTED_MSG, source: 'flow', score: 0 };
  }

  // Otherwise use the engine's informational reply (products, FAQ, greeting…).
  const source = r.fallback ? 'fallback' : 'engine';
  await logChat({ question: userText, answer: r.reply, source, matched: !r.fallback, score: 0, channel: 'whatsapp' });
  return { reply: r.reply, source, score: 0 };
}

/**
 * Produce the auto-reply for one inbound WhatsApp message. Only ever called in
 * 'auto' mode (the webhook short-circuits 'manual'). Drives the three-stage
 * controller above. Returns the reply string to deliver.
 */
export async function generateWhatsAppReply(phone: string, bodyText: string): Promise<string> {
  const userText = (bodyText || '').trim() || '[non-text message]';
  const contact = await loadContact(phone);
  const { history, form, formStep } = await loadSession(phone);

  // ── STAGE 1: STATE GATE ─────────────────────────────────────────────────────
  const status = contact.geoStateStatus || 'new';

  if (status === 'new') {
    await saveContact(phone, { geoStateStatus: 'asked' });
    await record(phone, userText, ASK_STATE_MSG, 'flow', history);
    return ASK_STATE_MSG;
  }

  if (status === 'asked') {
    // Ignore empty / non-text answers — ask once more.
    if (userText === '[non-text message]') {
      await record(phone, userText, ASK_STATE_MSG, 'flow', history);
      return ASK_STATE_MSG;
    }
    if (isOdisha(userText)) {
      await saveContact(phone, { geoStateStatus: 'verified', geoState: 'Odisha' });
      const first = FORM_STEPS[0].prompt;
      await saveFormState(phone, {}, 0);
      await record(phone, userText, first, 'flow', history);
      return first;
    }
    // Outside Odisha → polite decline + PERMANENT manual (bot silent hereafter).
    await saveContact(phone, { geoStateStatus: 'rejected', geoState: userText, mode: 'manual' }, { manualUntil: '' });
    await record(phone, userText, OUT_OF_STATE_MSG, 'flow', history);
    return OUT_OF_STATE_MSG;
  }

  // status 'rejected' but reached here means an admin re-enabled auto — fall
  // through and treat them like a verified user.

  // ── STAGE 3: Q&A MODE (lead already created) ────────────────────────────────
  if (contact.leadCreated) {
    const asked = (contact.questionsSinceLead || 0) + 1;
    if (asked > MAX_QUESTIONS_AFTER_LEAD) {
      // Too many questions → 2-hour manual cooldown (auto-reverts), fresh batch after.
      await saveContact(phone, { mode: 'manual', manualUntil: new Date(Date.now() + MANUAL_COOLDOWN_MS), questionsSinceLead: 0 });
      await record(phone, userText, COOLDOWN_MSG, 'flow', history);
      return COOLDOWN_MSG;
    }
    await saveContact(phone, { questionsSinceLead: asked });
    const { reply, source } = await answerQuestion(userText);
    await record(phone, userText, reply, source, history);
    return reply;
  }

  // ── STAGE 2: LEAD FORM (Odisha, no lead yet) ────────────────────────────────
  const step = FORM_STEPS[formStep];
  const { value, error } = validateForm(step, bodyText);
  if (error) {
    await record(phone, userText, error, 'flow', history);
    return error;
  }
  form[step.key] = value;

  const nextStep = formStep + 1;
  if (nextStep < FORM_STEPS.length) {
    let prompt = FORM_STEPS[nextStep].prompt;
    if (step.key === 'name' && value) prompt = `Thanks, ${value.split(' ')[0]}! ` + prompt;
    await saveFormState(phone, form, nextStep);
    await record(phone, userText, prompt, 'flow', history);
    return prompt;
  }

  // Form complete → create ONE lead, thank the user, enter Q&A mode.
  const reply = thankYouMsg(form);
  await saveContact(phone, { leadCreated: true, leadCreatedAt: new Date(), questionsSinceLead: 0 });
  await saveFormState(phone, {}, 0); // clear in-progress form
  await record(phone, userText, reply, 'flow', history);
  try {
    await captureLead(buildFormLead(phone, form), { skipWhatsAppConfirmation: true });
  } catch (e) {
    console.error('WhatsApp lead capture failed:', e);
  }
  return reply;
}
