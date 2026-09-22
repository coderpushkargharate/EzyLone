// EzySaathi AI — centralized answer/knowledge layer (compliance-safe, pure).
//
// This is the SINGLE place where the conversational answers for every supported
// intent live, so we never scatter loan facts across dozens of if/else branches
// (blueprint §21). Every builder here is a pure function (no DB, no network) so
// the intent classifier stays fully unit-testable.
//
// Guardrails (§20): we never guarantee approval/rate/eligibility, never invent
// lender policy, and never request OTP/PIN/passwords or KYC documents in chat.
// Where a figure is genuinely configured on EzyLoan we use it; otherwise we say
// it is decided by the lending partner.

import { COMPANY, PRODUCTS } from './knowledge';

// Short, reusable compliance line for answers that touch eligibility/rate/terms.
export const LENDER_DISCLAIMER =
  'Final eligibility, rate, documents and approval are decided by the lending partner as per their policies.';

// The loan products we recognise for product-specific answers. Maps a stored
// loanType string (from the lead) to a stable key so answers never drift.
export type ProductKey =
  | 'car-topup'
  | 'balance-transfer'
  | 'new-car'
  | 'used-car'
  | 'commercial'
  | 'personal'
  | 'lap'
  | 'generic';

const PRODUCT_LABEL: Record<ProductKey, string> = {
  'car-topup': 'Car Loan Top-Up',
  'balance-transfer': 'Balance Transfer + Top-Up',
  'new-car': 'New Car Loan',
  'used-car': 'Used Car Loan',
  commercial: 'Commercial Vehicle Loan',
  personal: 'Personal Loan',
  lap: 'Loan Against Property',
  generic: 'loan',
};

// Resolve a free-form loanType string (as stored on the lead) to a ProductKey.
export function productKeyOf(loanType?: string): ProductKey {
  const t = (loanType || '').toLowerCase();
  if (!t) return 'generic';
  if (t.includes('against property') || t === 'lap' || t.includes('mortgage')) return 'lap';
  if (t.includes('balance transfer') || t.includes('bt +') || t.includes('transfer')) return 'balance-transfer';
  if (t.includes('top-up') || t.includes('top up') || t.includes('topup')) return 'car-topup';
  if (t.includes('commercial')) return 'commercial';
  if (t.includes('used')) return 'used-car';
  if (t.includes('new car')) return 'new-car';
  if (t.includes('personal')) return 'personal';
  if (t.includes('car')) return 'new-car';
  return 'generic';
}

export function productLabel(key: ProductKey): string {
  return PRODUCT_LABEL[key];
}

// ── Documents (product-specific, never mixed across products) ─────────────────
const DOC_LISTS: Record<ProductKey, string[]> = {
  'car-topup': [
    'Identity & address proof',
    'Existing car loan statement',
    'Vehicle RC & insurance copy',
    'Income proof',
    'Recent bank statements',
  ],
  'balance-transfer': [
    'Identity & address proof',
    'Existing loan statement & repayment track record',
    'Vehicle RC & insurance copy',
    'Income proof',
    'Recent bank statements',
  ],
  'new-car': [
    'Identity & address proof',
    'Income proof',
    'Recent bank statements',
    'Car quotation / proforma invoice',
  ],
  'used-car': [
    'Identity & address proof',
    'Income proof',
    'Recent bank statements',
    'Vehicle RC & valuation / insurance',
  ],
  commercial: [
    'Identity & address proof',
    'Business / employment proof',
    'Income proof',
    'Recent bank statements',
    'Vehicle documents (RC, permit, insurance where applicable)',
  ],
  personal: [
    'Identity & address proof',
    'Income proof',
    'Recent bank statements',
  ],
  lap: [
    'Identity & address proof',
    'Property ownership documents',
    'Income proof',
    'Recent bank statements',
    'Existing loan statements, if any',
  ],
  generic: [
    'Identity & address proof',
    'Income proof',
    'Recent bank statements',
  ],
};

function bullets(items: string[]): string {
  return items.map((i) => `• ${i}`).join('\n');
}

export function documentsAnswer(key: ProductKey): string {
  const label = key === 'generic' ? 'your loan' : `a ${PRODUCT_LABEL[key]}`;
  return (
    `For ${label}, lenders commonly ask for:\n\n${bullets(DOC_LISTS[key])}\n\n` +
    `The exact list depends on the lender and your profile — our specialist will confirm the final documents and collect them securely. ` +
    `I never ask for OTP, PIN or passwords here.`
  );
}

// ── Eligibility ───────────────────────────────────────────────────────────────
export function eligibilityAnswer(key: ProductKey): string {
  const common = [
    'Income & repayment capacity',
    'Age and employment / business profile',
    'Credit history (CIBIL)',
    'Existing loan obligations',
  ];
  const extras: Partial<Record<ProductKey, string>> = {
    'car-topup': 'Your car’s valuation and existing-loan repayment record',
    'balance-transfer': 'Your existing loan’s repayment track record and vehicle valuation',
    'new-car': 'The car’s on-road price and funding required',
    'used-car': 'The vehicle’s age, valuation and condition',
    commercial: 'The vehicle type, usage and business income',
    lap: 'Property ownership, valuation and marketability',
  };
  const list = [...common];
  if (extras[key]) list.push(extras[key] as string);
  const label = key === 'generic' ? 'a loan' : `a ${PRODUCT_LABEL[key]}`;
  return (
    `Eligibility for ${label} usually depends on:\n\n${bullets(list)}\n\n` +
    `${LENDER_DISCLAIMER} Shall I arrange a callback so our specialist can assess your case?`
  );
}

// ── Interest rate ─────────────────────────────────────────────────────────────
export function interestRateAnswer(): string {
  return (
    `Interest rates start from *${COMPANY.ratesFrom}* and vary by product, your profile, the loan amount and the lender.\n\n` +
    `The exact rate applicable to you is set by the lending partner. Would you like an indicative EMI, or a callback to discuss your rate?`
  );
}

// ── Processing fee ────────────────────────────────────────────────────────────
export function processingFeeAnswer(): string {
  return (
    `Processing fees vary by product and lender and are usually a small percentage of the loan amount plus applicable taxes.\n\n` +
    `The exact fee is confirmed by the lending partner before disbursal — I won’t quote a figure that isn’t applicable to your case. Our specialist can share the precise charges for your loan.`
  );
}

// ── Tenure ────────────────────────────────────────────────────────────────────
export function tenureAnswer(key: ProductKey): string {
  const notes: Partial<Record<ProductKey, string>> = {
    lap: 'Loan Against Property typically offers a longer tenure than vehicle loans.',
    personal: 'Personal loans usually have a shorter tenure than secured loans.',
  };
  const extra = notes[key] ? `\n\n${notes[key]}` : '';
  return (
    `Tenure depends on the product, loan amount and lender policy — a longer tenure lowers the EMI but increases total interest.${extra}\n\n` +
    `Tell me your loan amount and preferred EMI and I can estimate a suitable tenure, or our specialist can confirm the options.`
  );
}

// ── EMI ───────────────────────────────────────────────────────────────────────
// Pure EMI maths, mirrors the engine's calculator.
export function calcEmi(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100;
  const emi = r === 0 ? principal / months : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = emi * months;
  return { emi: Math.round(emi), totalPayment: Math.round(total), totalInterest: Math.round(total - principal) };
}
const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

// Compute an EMI answer. If amount/rate/tenure aren't all known, ask for what's
// missing instead of guessing.
export function emiAnswer(opts: { amount?: number | null; rate?: number | null; months?: number | null }): string {
  const { amount, rate, months } = opts;
  if (amount && rate && months) {
    const { emi, totalInterest, totalPayment } = calcEmi(amount, rate, months);
    return (
      `*Estimated EMI: ${inr(emi)}/month*\n\n` +
      `• Loan: ${inr(amount)}\n• Rate: ${rate}% p.a.\n• Tenure: ${months} months\n` +
      `• Total interest: ${inr(totalInterest)}\n• Total payment: ${inr(totalPayment)}\n\n` +
      `This is indicative — actual EMI depends on the final rate and tenure set by the lender.`
    );
  }
  const missing: string[] = [];
  if (!amount) missing.push('loan amount (e.g. 10 lakh)');
  if (!rate) missing.push('interest rate (e.g. 10.5%)');
  if (!months) missing.push('tenure in months (e.g. 60)');
  const known: string[] = [];
  if (amount) known.push(`amount ${inr(amount)}`);
  if (rate) known.push(`rate ${rate}%`);
  if (months) known.push(`${months} months`);
  const knownLine = known.length ? `I have ${known.join(', ')}. ` : '';
  return (
    `Happy to estimate your EMI. ${knownLine}Please share the ${missing.join(' and ')} and I’ll calculate it.\n\n` +
    `Our rates start from ${COMPANY.ratesFrom}.`
  );
}

// ── CIBIL / credit score ──────────────────────────────────────────────────────
export function cibilAnswer(): string {
  return (
    `A higher CIBIL score improves your chances and pricing, but a low score doesn’t automatically mean rejection.\n\n` +
    `Lenders also consider income, stability and existing obligations, and a secured loan (car/property) can be easier than an unsecured one. An initial check with us is a soft enquiry and doesn’t hurt your score. ${LENDER_DISCLAIMER}`
  );
}

// ── Application / approval / disbursement ─────────────────────────────────────
export function applicationProcessAnswer(): string {
  return (
    `The usual process is:\n\n` +
    `• Share your basic requirement (done ✅)\n• Our specialist reviews it and suggests suitable lenders\n` +
    `• You submit documents securely to the lender\n• Lender verifies and decides\n• On approval, the loan is disbursed\n\n` +
    `No documents or credentials are collected here — our specialist guides that securely.`
  );
}

export function approvalAnswer(): string {
  return (
    `Approval is decided by the lending partner after verifying your documents and profile — we can’t guarantee it, but our specialist helps you apply to the most suitable lender to improve your chances.\n\n` +
    `A preliminary response typically comes within 24–48 hours of submitting documents.`
  );
}

export function disbursementAnswer(): string {
  return (
    `Once the lender approves and completes verification and agreement formalities, the loan amount is disbursed as per the lender’s process — usually to your bank account or the dealer/seller for vehicle loans.\n\n` +
    `Timelines depend on the lender and documentation. ${LENDER_DISCLAIMER}`
  );
}

export function prepaymentAnswer(): string {
  return (
    `Yes — prepayment or foreclosure is allowed on most products, subject to the lender’s terms and any applicable charges.\n\n` +
    `The exact foreclosure/part-payment charges are stated in your loan agreement. Our specialist can confirm them for a specific lender.`
  );
}

// ── Product concept answers ───────────────────────────────────────────────────
export function balanceTransferAnswer(): string {
  return (
    `A *Balance Transfer* moves your existing loan to a partner lender offering a lower rate — which can reduce your EMI or tenure. You can often add a *Top-Up* for extra funds at the same time.\n\n` +
    `Actual savings depend on your current rate, outstanding amount and the new lender’s offer. Want our specialist to review your current loan?`
  );
}

export function topupAnswer(): string {
  return (
    `A *Car Loan Top-Up* gives you additional funds over your existing car loan — no new car needed.\n\n` +
    `The amount depends on your car’s valuation, repayment track record and lender policy. Rates start from ${COMPANY.ratesFrom}. Shall I note your requirement for a callback?`
  );
}

// ── Property / LAP ownership (blueprint §6) ───────────────────────────────────
// Preliminary, honest guidance — no guaranteed approval, no invented policy.
export function propertyOwnershipAnswer(): string {
  return (
    `For a Loan Against Property, the property normally has to be owned by the applicant — but if it isn’t in your name, it can often still work when the owner joins as *co-applicant* or gives consent to mortgage it.\n\n` +
    `It usually depends on:\n${bullets([
      'Whose name the property is in',
      'Whether the owner can participate (co-applicant / consent)',
      'Your income and repayment profile',
      'Lending-partner rules',
    ])}\n\nWhose name is the property currently in (e.g. father, mother, spouse)? I can then explain the usual process. ${LENDER_DISCLAIMER}`
  );
}

// ── Contact / company ─────────────────────────────────────────────────────────
export function contactAnswer(): string {
  return (
    `You can reach *${COMPANY.name}*:\n\n` +
    `• Phone: ${COMPANY.phone}\n• WhatsApp: ${COMPANY.whatsapp}\n• Email: ${COMPANY.email}\n• Hours: ${COMPANY.hours}\n• Office: ${COMPANY.address}`
  );
}

export function companyAnswer(): string {
  return (
    `*${COMPANY.name}* (${COMPANY.legalName}) is a ${COMPANY.type}. We connect you with RBI-regulated partner banks and NBFCs — we don’t sanction or disburse loans ourselves.\n\n` +
    `We help with car loans (top-up, balance transfer, new, used), commercial vehicle loans, personal loans and loan against property.`
  );
}

// ── Conversational intents ────────────────────────────────────────────────────
export function greetingAnswer(name?: string): string {
  const hi = name ? `Hello ${name}! 🙏` : 'Hello 🙏';
  return (
    `${hi} I’m *EzySaathi AI*, ${COMPANY.name}’s assistant. You can ask me about EMI, interest rate, eligibility, documents, loan amount, or request a callback from a specialist. How can I help?`
  );
}

export function thankYouAnswer(name?: string): string {
  const who = name ? ` ${name}` : '';
  return `You’re welcome${who}! 🙏 If you need anything else — EMI, interest rate, documents, eligibility or a callback — I’m right here.`;
}

export function areYouHumanAnswer(): string {
  return (
    `I’m *EzySaathi AI*, ${COMPANY.name}’s AI assistant — not a human. 🙂 I can help with loan information and basic guidance.\n\n` +
    `If you’d prefer a human specialist, just say “call me” and I’ll arrange a callback.`
  );
}

export function repeatComplaintAnswer(): string {
  return (
    `You’re right — I repeated myself instead of answering your question, and I’m sorry about that. 🙏\n\n` +
    `Tell me what you’d like to know and I’ll answer it directly — for example EMI, interest rate, eligibility, documents, or a callback from a specialist.`
  );
}

export function complaintAnswer(): string {
  return (
    `I’m sorry for the trouble. 🙏 Let me help properly — please tell me in a few words what you need (for example EMI, interest rate, eligibility, documents), or say “call me” and I’ll arrange a human specialist.`
  );
}

export function unrelatedAnswer(): string {
  return (
    `That’s a bit outside what I can help with — I’m *EzySaathi AI* and I specialise in loans. 🙂\n\n` +
    `I can help with interest rates, EMI, eligibility, documents, or our products (Car Loan Top-Up, Balance Transfer, New/Used Car, Commercial Vehicle, Personal Loan, Loan Against Property). What would you like?`
  );
}

// A specific clarification instead of the old global fallback (blueprint §13/§18).
export function clarificationAnswer(): string {
  return (
    `I want to answer the right thing. Could you tell me a little more? For example, you can ask about:\n\n` +
    `• EMI or interest rate\n• Eligibility or documents\n• Maximum loan amount\n• A callback from our specialist\n\nWhat would you like to know?`
  );
}

// Loop-breaker: a DIFFERENT clarification used when we detect we're about to
// repeat the exact same reply for a different message (blueprint §18).
export function altClarificationAnswer(): string {
  return (
    `I don’t want to repeat myself, so let me ask directly — what would you like help with? For example: EMI, interest rate, eligibility, documents, loan amount, or a callback from our specialist.`
  );
}

// "How much?" type ambiguity.
export function howMuchClarification(): string {
  return `Sure — do you mean the *maximum loan amount*, the *EMI amount*, or the *interest rate*? Let me know and I’ll answer.`;
}

// ── Appointment / callback ────────────────────────────────────────────────────
export function callbackAskTimeAnswer(name?: string): string {
  const who = name ? ` ${name}` : '';
  return `Sure${who} — what time works best for our specialist to call you? (e.g. “tomorrow 11 am” or “today evening”)`;
}

export function callbackNotedAnswer(opts: { name?: string; phone?: string; time: string }): string {
  const who = opts.name ? `, ${opts.name}` : '';
  const on = opts.phone ? ` on *${opts.phone}*` : '';
  return (
    `Done${who} — I’ve noted your preferred callback time for *${opts.time}*. Our specialist will call you${on}.\n\n` +
    `If you’d like to change the time, just tell me the new time.`
  );
}

export function callbackConfirmAnswer(opts: { name?: string; phone?: string; time?: string }): string {
  const who = opts.name ? `, ${opts.name}` : '';
  if (opts.time) {
    const on = opts.phone ? ` on ${opts.phone}` : '';
    return `All set${who} — your callback is noted for *${opts.time}* and our specialist will reach you${on}. Anything else I can help with?`;
  }
  return `Sure${who} — I’ll have our specialist call you. What time works best? (e.g. “tomorrow 11 am”)`;
}

export function handoffAnswer(opts: { name?: string; phone?: string }): string {
  const who = opts.name ? ` ${opts.name}` : '';
  return (
    `Of course${who} — I’ll connect you with an ${COMPANY.name} specialist. You can call us on ${COMPANY.phone} (${COMPANY.hours}), ` +
    `or tell me a good time and I’ll arrange a callback.`
  );
}

// Product overview (used when the user names a product in Q&A mode).
export function productOverviewAnswer(key: ProductKey): string {
  const p = PRODUCTS.find((x) => productKeyOf(x.name) === key) || PRODUCTS.find((x) => x.name === PRODUCT_LABEL[key]);
  if (!p) return clarificationAnswer();
  return (
    `*${p.name}* — ${p.summary}\n\n${bullets(p.highlights)}\n\nRates start from ${COMPANY.ratesFrom} (set by the lender). ` +
    `Would you like an EMI estimate, an eligibility check, or a callback?`
  );
}
