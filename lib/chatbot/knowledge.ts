// Ezy AI — Knowledge Base
// The chatbot answers ONLY from this approved data (per the TRD). It never
// guesses from the open internet, never approves/rejects a loan, and never asks
// for KYC documents (Aadhaar, PAN, salary slip, RC, ITR, bank statement, etc.).
// Sensitive-document collection is always done later by a human Executive.
//
// Keep this file as the single source of truth. Updating a rate, a product, or
// an FAQ here instantly updates both the rule engine and (when configured) the
// LLM system prompt.

export const COMPANY = {
  name: 'EzyLoan',
  legalName: 'Dibyansh Associates',
  type: 'Loan facilitator / Direct Selling Agent (DSA) — NOT a direct lender',
  phone: '+91 6372977626',
  whatsapp: 'https://wa.me/916372977626',
  email: 'care@ezyloan.co.in',
  website: 'https://www.ezyloan.co.in',
  address:
    '1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur, Cuttack, Odisha 753011',
  hours: 'Mon–Sat, 9:00 AM – 8:00 PM',
  ratesFrom: '8.99% p.a.', // "starting from" — actual rate is set by the lender
  languages: ['English', 'Hindi', 'Odia'],
};

// The ONLY loan products Ezy AI is allowed to discuss. Anything else (e.g. home
// loan, education loan, gold loan) → "not currently available, connect you to our team".
export interface Product {
  id: string;
  name: string;
  keywords: string[];
  summary: string;
  highlights: string[];
  link: string;
  applyLink: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'used-car-bt',
    name: 'Used Car Balance Transfer',
    keywords: ['balance transfer', 'bt', 'transfer', 'used car bt', 'shift loan', 'lower emi'],
    summary:
      'Move your existing used-car loan to a partner lender for a lower interest rate and reduced EMI.',
    highlights: ['Lower EMIs', 'Better rates', 'Quick processing'],
    link: '/car-loan-balance-transfer',
    applyLink: '/apply-now?loan=used-car-bt',
  },
  {
    id: 'used-car-refinance',
    name: 'Used Car Refinance',
    keywords: ['refinance', 'used car refinance', 'refinancing', 'purani car loan'],
    summary:
      'Refinance your used car for better rates, flexible terms, and an optional top-up amount.',
    highlights: ['Better rates', 'Flexible terms', 'Top-up available'],
    link: '/car-loan-refinance',
    applyLink: '/apply-now?loan=used-car-refinance',
  },
  {
    id: 'used-car-topup',
    name: 'Car Loan Top-Up',
    keywords: ['top up', 'topup', 'top-up', 'additional loan', 'extra loan on car'],
    summary:
      'Get an additional loan amount on top of your existing car loan, subject to lender eligibility.',
    highlights: ['Extra funds', 'On existing loan', 'Quick disbursal*'],
    link: '/car-loan-topup',
    applyLink: '/apply-now?loan=used-car-topup',
  },
  {
    id: 'new-car-loan',
    name: 'New Car Loan',
    keywords: ['new car', 'car loan', 'buy car', 'dream car', 'nayi car', 'gaadi loan'],
    summary:
      'Finance a brand-new car with competitive rates and flexible repayment options, up to 100% funding*.',
    highlights: ['Up to 100% funding*', 'Quick approval*', 'Low rates*'],
    link: '/car-loan',
    applyLink: '/apply-now?loan=new-car-loan',
  },
  {
    id: 'commercial-vehicle-loan',
    name: 'Commercial Vehicle Loan',
    keywords: ['commercial', 'cv loan', 'truck', 'bus', 'taxi', 'commercial vehicle', 'transport'],
    summary:
      'Finance trucks, buses, and other commercial vehicles with high loan amounts and flexible tenure.',
    highlights: ['High loan amount', 'Flexible tenure', 'Tax benefits*'],
    link: '/commercial-vehicle-loan',
    applyLink: '/apply-now?loan=commercial-vehicle-loan',
  },
  {
    id: 'personal-loan',
    name: 'Personal Loan',
    keywords: ['personal', 'personal loan', 'cash loan', 'urgent money', 'wedding', 'medical'],
    summary:
      'A hassle-free personal loan up to ₹25 Lakh with minimal documentation for any personal need.',
    highlights: ['Up to ₹25 Lakh', 'Low interest rates*', 'Minimal docs'],
    link: '/personal-loan',
    applyLink: '/apply-now?loan=personal-loan',
  },
  {
    id: 'property-loan',
    name: 'Loan Against Property',
    keywords: ['property', 'lap', 'property loan', 'mortgage', 'business loan', 'loan against property'],
    summary:
      'Unlock funds against your property up to ₹3 Crore with low EMIs and a long repayment tenure.',
    highlights: ['Up to ₹3 Crore', 'Lowest EMIs', 'Long tenure'],
    link: '/property-loan',
    applyLink: '/apply-now?loan=property-loan',
  },
];

// Products EzyLoan does NOT offer — used to politely decline instead of guessing.
export const UNAVAILABLE_KEYWORDS = [
  'home loan', 'housing loan', 'education loan', 'student loan', 'gold loan',
  'credit card', 'two wheeler', 'bike loan', 'agriculture loan', 'crop loan',
];

// Approved FAQ answers. Every answer carries the "facilitator, not lender" spirit.
export interface Faq {
  keywords: string[];
  answer: string;
}

export const FAQS: Faq[] = [
  {
    keywords: ['who can apply', 'eligible', 'eligibility', 'kaun apply', 'qualify'],
    answer:
      'Any salaried or self-employed individual aged 21–60 with valid KYC can typically apply. Final eligibility depends on income verification, credit assessment, and the lender’s underwriting policy.',
  },
  {
    keywords: ['document', 'documents', 'kyc', 'papers', 'kagaz'],
    answer:
      'Lenders usually ask for identity/address proof, income proof, and recent bank statements — but I don’t collect any documents here. Our Executive will guide you on exactly what’s needed and collect them securely later.',
  },
  {
    keywords: ['how long', 'approval time', 'processing time', 'kitna time', 'kitne din'],
    answer:
      'Applications typically get a preliminary response within 24–48 hours after documents are submitted. The final timeline depends on lender verification and underwriting — there’s no guarantee of approval.',
  },
  {
    keywords: ['prepay', 'foreclose', 'early repay', 'preclose', 'foreclosure'],
    answer:
      'Yes, prepayment or foreclosure is allowed on most products, subject to lender-specific terms and applicable charges. Confirm the exact terms in your loan agreement.',
  },
  {
    keywords: ['cibil', 'credit score', 'score affect', 'credit check'],
    answer:
      'An initial eligibility check with EzyLoan is a soft inquiry and does not impact your credit score. A formal application to a lender may involve a hard inquiry. Policies vary by lender.',
  },
  {
    keywords: ['interest', 'rate', 'roi', 'byaj', 'byaaj'],
    answer:
      `Rates start from ${COMPANY.ratesFrom} and vary by product, profile, and lender. The exact rate is decided by the lending partner — I can only share indicative starting rates.`,
  },
  {
    keywords: ['ezyloan', 'about', 'who are you', 'company', 'lender', 'dsa', 'facilitator'],
    answer:
      'EzyLoan (Dibyansh Associates) is a loan facilitator / DSA — we connect you with RBI-regulated partner banks and NBFCs. We are not a direct lender, so we don’t sanction or disburse loans ourselves.',
  },
  {
    keywords: ['contact', 'phone', 'call', 'number', 'reach', 'email', 'address', 'office'],
    answer:
      `You can reach our team on ${COMPANY.phone} (${COMPANY.hours}), email ${COMPANY.email}, or visit us at ${COMPANY.address}.`,
  },
];

// Preliminary eligibility rule thresholds. NOTE (per TRD §10): these are meant to
// be admin-editable, not hardcoded business policy — they only produce an
// *indicative* preliminary result, never a final decision.
export const ELIGIBILITY_RULES = {
  minAgeYears: 21,
  maxAgeYears: 60,
  minMonthlyIncome: 15000, // ₹ — indicative floor for a preliminary "looks eligible"
  maxVehicleAgeYears: 12, // for used-car products
};

// Mandatory compliance line shown/appended per the TRD (§15).
export const COMPLIANCE_NOTICE =
  'Ezy AI provides preliminary guidance only. Final loan approval, interest rate, eligibility, documents, and disbursal are decided by the lending partner as per their policies and applicable regulations.';

// Things Ezy AI must NEVER say (guardrails, TRD §14).
export const FORBIDDEN_CLAIMS = [
  'loan approved', 'loan rejected', '100% approval', 'guaranteed rate',
  'guaranteed disbursement', 'guaranteed approval', 'approval tomorrow',
];

// KYC / sensitive documents the bot must NEVER ask for (TRD §3).
export const KYC_TERMS = [
  'aadhaar', 'aadhar', 'pan', 'salary slip', 'payslip', 'rc book', 'insurance',
  'bank statement', 'itr', 'passport', 'driving licence', 'driving license',
];
