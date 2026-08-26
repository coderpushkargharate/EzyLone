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

// Per-product detailed FAQs. These complement the auto-generated product overview
// with the DISTINCTIVE facts users actually ask about (max amount, funding %, tax
// benefit, EMI reduction, top-up sizing…). Kept product-distinctive on purpose so
// a question about one product can never be answered with another product's facts.
// Seeded into the knowledge base (idempotently) so the self-trained brain answers
// them precisely. Every answer stays compliance-safe: indicative only, final terms
// decided by the lending partner, no document collection in chat.
export interface ProductFaq {
  product: string;   // which product this answer is about (also its category)
  question: string;  // canonical question
  variants: string[];
  keywords: string[];
  answer: string;
}

export const PRODUCT_FAQS: ProductFaq[] = [
  {
    product: 'Car Loan Top-Up',
    question: 'How much top-up can I get on my existing car loan?',
    variants: ['top up amount', 'how much top up', 'extra loan on my car', 'additional funds on car loan', 'top up limit'],
    keywords: ['top up amount', 'topup', 'additional', 'extra funds', 'existing car loan'],
    answer:
      'A *Car Loan Top-Up* gives you additional funds over and above your existing car loan — no new car needed. The amount depends on your car’s valuation, your repayment track record and the lender’s policy. ' +
      `Rates start from ${COMPANY.ratesFrom} (set by the lending partner). I can note your requirement so our specialist can share an indicative figure — shall I?`,
  },
  {
    product: 'Used Car Balance Transfer',
    question: 'Will a balance transfer lower my car loan EMI?',
    variants: ['reduce my emi', 'lower interest by transferring', 'shift loan to reduce emi', 'balance transfer benefit', 'transfer car loan lower rate'],
    keywords: ['balance transfer', 'lower emi', 'reduce emi', 'shift loan', 'lower rate'],
    answer:
      'A *Used Car Balance Transfer* moves your existing used-car loan to a partner lender offering a lower interest rate — which can reduce your EMI or shorten your tenure. ' +
      `Actual savings depend on your current rate, outstanding amount and the lender’s offer. Rates start from ${COMPANY.ratesFrom}. Want our specialist to review your current loan and estimate the savings?`,
  },
  {
    product: 'Used Car Refinance',
    question: 'Can I refinance my used car and also get extra funds?',
    variants: ['refinance with top up', 'refinance used car', 'refinance better rate', 'refinance extra money', 'purani car refinance'],
    keywords: ['refinance', 'refinancing', 'better rate', 'flexible terms', 'top up'],
    answer:
      'Yes — *Used Car Refinance* lets you refinance your existing used car for better rates and flexible terms, with an *optional top-up amount* on top if you need extra funds. ' +
      `Eligibility and the top-up size depend on the car’s valuation and lender policy. Rates start from ${COMPANY.ratesFrom}. Shall I note your details for a preliminary review?`,
  },
  {
    product: 'New Car Loan',
    question: 'Can I get 100% funding for a new car?',
    variants: ['full funding new car', 'on road price funding', 'how much funding new car', 'finance brand new car', 'new car loan amount'],
    keywords: ['new car', '100 funding', 'full funding', 'on road price', 'brand new'],
    answer:
      'Our *New Car Loan* offers up to *100% funding** of the car with competitive rates and flexible repayment. The exact funding percentage and rate are decided by the lending partner based on the car, your profile and eligibility. ' +
      `Rates start from ${COMPANY.ratesFrom}. Would you like a quick EMI estimate or a callback from our specialist?`,
  },
  {
    product: 'Commercial Vehicle Loan',
    question: 'What can I finance with a Commercial Vehicle Loan (and are there tax benefits)?',
    variants: ['truck loan', 'bus loan', 'taxi finance', 'commercial vehicle tax benefit', 'transport vehicle loan'],
    keywords: ['commercial', 'truck', 'bus', 'taxi', 'transport', 'tax benefit'],
    answer:
      'A *Commercial Vehicle Loan* finances trucks, buses, taxis and other transport vehicles — new or used — with high loan amounts and flexible tenure. Interest paid on a commercial vehicle loan may offer *tax benefits** (please confirm with your tax advisor). ' +
      `Rates start from ${COMPANY.ratesFrom}, decided by the lending partner. Shall I take a few details for a preliminary assessment?`,
  },
  {
    product: 'Personal Loan',
    question: 'What is the maximum Personal Loan amount and what can I use it for?',
    variants: ['max personal loan', 'personal loan limit', 'how much personal loan', 'personal loan for wedding', 'personal loan for medical', 'urgent cash loan'],
    keywords: ['personal loan', 'maximum', 'limit', 'cash', 'wedding', 'medical', '25 lakh'],
    answer:
      'Our *Personal Loan* goes up to *₹25 Lakh* with minimal documentation and can be used for any personal need — wedding, medical, travel, education expenses and more. ' +
      `The sanctioned amount depends on your income, credit profile and the lender’s policy. Rates start from ${COMPANY.ratesFrom}. Want me to note your requirement for our specialist?`,
  },
  {
    product: 'Loan Against Property',
    question: 'How much loan can I get against my property?',
    variants: ['max loan against property', 'lap amount', 'mortgage my property', 'property loan limit', 'business loan against property'],
    keywords: ['loan against property', 'lap', 'mortgage', 'property', '3 crore', 'business loan'],
    answer:
      'A *Loan Against Property* unlocks funds against your residential or commercial property up to *₹3 Crore*, with low EMIs and a long repayment tenure — useful for business or large personal needs. ' +
      `The final amount depends on the property valuation, your profile and lender policy. Rates start from ${COMPANY.ratesFrom}. Shall I arrange a callback from our specialist?`,
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
