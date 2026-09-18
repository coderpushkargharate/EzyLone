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
//        The loan-type question is a NUMBERED menu (pick a number OR type it).
//   3) Q&A MODE    — after the lead exists we never push lead creation again; we
//        just answer questions (self-trained knowledge base + rule engine for
//        product/EMI/FAQ info, EMI handed off to the online calculator link).
//        The sender may ask up to MAX_QUESTIONS_AFTER_LEAD questions; beyond that
//        they're dropped into a 2-hour manual cooldown (auto-reverts to auto),
//        after which they get a fresh batch of questions — but the lead stays one.
//
// LANGUAGE: every FIXED controller string is served in the user's language
// (English default, Hindi/Hinglish, or Odia) — see lib/chatbot/waLang.ts. Free-
// form Q&A answers come from the trained knowledge base / engine as authored.
//
// Contract: never throws. On any DB hiccup it degrades to a safe deterministic
// reply so the user always gets an answer.

import { runEngine, LeadData } from './engine';
import { captureLead } from './leadCapture';
import { matchKnowledge, logChat, bumpHits, HIGH_CONFIDENCE } from './knowledgeBase';
import { T, Lang, detectLang, loanTypePrompt, resolveLoanTypePick } from './waLang';
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
  return { phone, mode: 'auto', geoStateStatus: 'new', lang: 'en', leadCreated: false, questionsSinceLead: 0 };
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
 * lead is created here — a lead is only created once the user completes the
 * Odisha lead form (see the auto path). Fire-and-forget; never throws.
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

// ── Lead form ────────────────────────────────────────────────────────────────
type FormKey = 'name' | 'city' | 'email' | 'phone' | 'amount' | 'loanType';
const FORM_KEYS: FormKey[] = ['name', 'city', 'email', 'phone', 'amount', 'loanType'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The question text for a form step in the user's language. Loan type is a
// numbered menu; everything else is a single localized prompt.
function formPrompt(key: FormKey, lang: Lang): string {
  if (key === 'loanType') return loanTypePrompt(lang);
  return T[lang].form[key];
}

// Validate + normalise one answer. Returns { value } to accept, or { invalid:true }
// to reprompt (caller supplies the localized hint).
function validateForm(key: FormKey, raw: string): { value?: string; invalid?: boolean } {
  const text = (raw || '').trim();
  switch (key) {
    case 'name':
      return text.length >= 2 ? { value: text } : { invalid: true };
    case 'city':
      return text.length >= 2 ? { value: text } : { invalid: true };
    case 'email':
      if (/^(skip|nahi|no|na)$/i.test(text)) return { value: '' };
      return EMAIL_RE.test(text) ? { value: text } : { invalid: true };
    case 'phone': {
      const digits = (raw.match(/\d/g) || []).join('');
      return digits.length >= 10 ? { value: digits.slice(-10) } : { invalid: true };
    }
    case 'amount': {
      const n = parseAmount(raw);
      return n && n > 0 ? { value: String(n) } : { invalid: true };
    }
    case 'loanType': {
      const picked = resolveLoanTypePick(raw); // bare number → option
      if (picked) return { value: picked };
      return text.length >= 2 ? { value: text } : { invalid: true };
    }
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

// ── Q&A mode (after the lead exists) ─────────────────────────────────────────
// Produce an informational answer using the self-trained knowledge base first,
// then the rule engine (products / FAQ / EMI). We run the engine STATELESSLY so
// it can never get stuck in — or restart — a data-collection flow. Returns the
// reply plus a source tag for logging.
async function answerQuestion(userText: string, lang: Lang): Promise<{ reply: string; source: string }> {
  // 1) Self-trained knowledge base (high confidence only).
  try {
    const kb = await matchKnowledge(userText, 'whatsapp');
    if (kb && kb.score >= HIGH_CONFIDENCE) {
      bumpHits(kb.entryId);
      await logChat({ question: userText, answer: kb.answer, source: 'knowledge', matched: true, score: kb.score, matchedEntry: kb.entryId, channel: 'whatsapp' });
      return { reply: kb.answer, source: 'knowledge' };
    }
  } catch (e) {
    console.error('WhatsApp KB match failed:', e);
  }

  // 2) Rule engine — stateless, concise. Used only for informational intents.
  const r = runEngine(userText, {}, { concise: true });

  // EMI → hand off to the online calculator (localized, no multi-step Q&A here).
  if (r.state.flow === 'emi') {
    const reply = T[lang].emi(EMI_CALCULATOR_URL);
    await logChat({ question: userText, answer: reply, source: 'engine', matched: true, score: 0, channel: 'whatsapp' });
    return { reply, source: 'engine' };
  }

  // Any data-collection / lead / eligibility / callback intent → don't restart it.
  const collectFlows = ['collect', 'lead', 'callback', 'topupgate', 'eligibility'];
  if (r.lead || (r.state.flow && collectFlows.includes(r.state.flow))) {
    return { reply: T[lang].alreadyNoted, source: 'flow' };
  }

  // Otherwise use the engine's informational reply (products, FAQ, greeting…).
  const source = r.fallback ? 'fallback' : 'engine';
  await logChat({ question: userText, answer: r.reply, source, matched: !r.fallback, score: 0, channel: 'whatsapp' });
  return { reply: r.reply, source };
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

  // Pick the reply language: detect this turn, else keep the last known, else en.
  const detected = detectLang(userText);
  const lang: Lang = detected || (contact.lang as Lang) || 'en';
  if (detected && detected !== contact.lang) await saveContact(phone, { lang: detected });

  // ── STAGE 1: STATE GATE ─────────────────────────────────────────────────────
  const status = contact.geoStateStatus || 'new';

  if (status === 'new') {
    await saveContact(phone, { geoStateStatus: 'asked' });
    const msg = T[lang].askState;
    await record(phone, userText, msg, 'flow', history);
    return msg;
  }

  if (status === 'asked') {
    // Ignore empty / non-text answers — ask once more.
    if (userText === '[non-text message]') {
      const msg = T[lang].askState;
      await record(phone, userText, msg, 'flow', history);
      return msg;
    }
    if (isOdisha(userText)) {
      await saveContact(phone, { geoStateStatus: 'verified', geoState: 'Odisha' });
      await saveFormState(phone, {}, 0);
      const first = formPrompt('name', lang);
      await record(phone, userText, first, 'flow', history);
      return first;
    }
    // Outside Odisha → polite decline + PERMANENT manual (bot silent hereafter).
    await saveContact(phone, { geoStateStatus: 'rejected', geoState: userText, mode: 'manual' }, { manualUntil: '' });
    const msg = T[lang].outOfState;
    await record(phone, userText, msg, 'flow', history);
    return msg;
  }

  // status 'rejected' but reached here means an admin re-enabled auto — fall
  // through and treat them like a verified user.

  // ── STAGE 3: Q&A MODE (lead already created) ────────────────────────────────
  if (contact.leadCreated) {
    const asked = (contact.questionsSinceLead || 0) + 1;
    if (asked > MAX_QUESTIONS_AFTER_LEAD) {
      // Too many questions → 2-hour manual cooldown (auto-reverts), fresh batch after.
      await saveContact(phone, { mode: 'manual', manualUntil: new Date(Date.now() + MANUAL_COOLDOWN_MS), questionsSinceLead: 0 });
      const msg = T[lang].cooldown;
      await record(phone, userText, msg, 'flow', history);
      return msg;
    }
    await saveContact(phone, { questionsSinceLead: asked });
    const { reply, source } = await answerQuestion(userText, lang);
    await record(phone, userText, reply, source, history);
    return reply;
  }

  // ── STAGE 2: LEAD FORM (Odisha, no lead yet) ────────────────────────────────
  const key = FORM_KEYS[formStep];
  const { value, invalid } = validateForm(key, bodyText);
  if (invalid) {
    const err = T[lang].err[key];
    await record(phone, userText, err, 'flow', history);
    return err;
  }
  form[key] = value;

  const nextStep = formStep + 1;
  if (nextStep < FORM_KEYS.length) {
    let prompt = formPrompt(FORM_KEYS[nextStep], lang);
    if (key === 'name' && value) prompt = T[lang].thanksPrefix(value.split(' ')[0]) + prompt;
    await saveFormState(phone, form, nextStep);
    await record(phone, userText, prompt, 'flow', history);
    return prompt;
  }

  // Form complete → create ONE lead, thank the user, enter Q&A mode.
  const first = form.name ? String(form.name).split(' ')[0] : '';
  const reply = T[lang].thankYou(first, form.phone);
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
