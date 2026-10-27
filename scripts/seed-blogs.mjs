// Seed / refresh EzyLoan's SEO blog articles (same approach as the Mappingg blog seed).
//
//   node --env-file=.env.local scripts/seed-blogs.mjs --dry-run      # check only, writes nothing
//   node --env-file=.env.local scripts/seed-blogs.mjs                # write
//   node --env-file=.env.local scripts/seed-blogs.mjs --only=new-car-loan,personal-loan
//   node --env-file=.env.local scripts/seed-blogs.mjs --new-as=pending   # new posts wait for approval
//
// - Article bodies live in scripts/blog-content/<slug>.html (plain, sanitizer-safe HTML:
//   no inline styles, no H1 — the page renders the title as the only H1).
// - Upserts by slug, so re-running refreshes content instead of duplicating. Existing
//   URLs are kept (old thin posts are rewritten in place, keeping their links).
// - Existing posts keep their featured image, creation date and first publish date.
// - Before writing, every post that will change is backed up to
//   scripts/blog-backups/blogs-<time>.json (gitignored) so a write can be undone.
// - Never deletes anything.
// - Validates each article first: word count, SEO title/description length, no H1,
//   no inline styles, internal links point at real pages or seeded posts.
//
// Content rules: EzyLoan is a loan facilitator (DSA), not a lender. No promised
// approval, no fixed rates — every rate/EMI is labelled as an illustration.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(DIR, 'blog-content');
const BACKUP_DIR = path.join(DIR, 'blog-backups');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const NEW_AS = (args.find((a) => a.startsWith('--new-as=')) || '--new-as=published').slice(9);
if (!['published', 'pending', 'draft'].includes(NEW_AS)) {
  console.error('--new-as must be published, pending or draft');
  process.exit(2);
}

const AUTHOR = 'EzyLoan Editorial Team';
const AUTHOR_BIO =
  'The EzyLoan team in Cuttack, Odisha helps borrowers compare car, personal, property and commercial vehicle loans from RBI-regulated partner banks and NBFCs. EzyLoan is a loan facilitator (DSA), not a lender.';
const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;

// Public pages an article may link to (anything else must be a seeded post).
const SITE_PAGES = new Set([
  '/', '/about', '/apply-now', '/blogs', '/car-loan', '/car-loan-balance-transfer', '/car-loan-refinance',
  '/car-loan-topup', '/commercial-vehicle-loan', '/compliance', '/contact', '/emi-calculator', '/faq',
  '/lending-partners', '/loan-disclosure', '/personal-loan', '/privacy-policy', '/property-loan',
  '/terms-and-conditions',
]);

const posts = [
  {
    slug: 'trusted-loan-facilitator-india',
    title: 'What Is a Loan DSA? How EzyLoan Works and How to Spot Fake Loan Agents',
    excerpt: 'What a loan DSA does, how EzyLoan works with partner banks and NBFCs, and the red flags that tell you a "loan agent" is a fraud.',
    category: 'Loan Basics',
    tags: ['loan DSA', 'loan facilitator', 'loan fraud', 'fake loan agent', 'RBI', 'Odisha'],
    seoTitle: 'What Is a Loan DSA? Spot Fake Loan Agents',
    seoDescription: 'How a loan DSA works, what a genuine loan agent asks for, and the red flags of loan fraud: advance fees, guaranteed approval and OTP requests.',
    focusKeyword: 'loan DSA',
    secondaryKeywords: ['loan facilitator India', 'fake loan agent', 'how to avoid loan fraud', 'direct selling agent bank'],
    featuredImageAlt: 'Borrower discussing loan options with a loan facilitator',
  },
  {
    slug: 'new-car-loan',
    title: 'New Car Loan Guide: Down Payment, Tenure, Documents and EMI Planning',
    excerpt: 'How a new car loan works in India: how much you can borrow, ex-showroom vs on-road price, choosing the tenure, documents and the costs beyond the interest rate.',
    category: 'Car Loan',
    tags: ['new car loan', 'car loan documents', 'car loan tenure', 'car loan EMI', 'Odisha'],
    seoTitle: 'New Car Loan Guide: Tenure, Documents & EMI',
    seoDescription: 'Plan your new car loan: how much you can borrow, on-road vs ex-showroom price, 5 vs 7 year tenure, documents checklist and hidden costs.',
    focusKeyword: 'new car loan',
    secondaryKeywords: ['car loan documents', 'car loan tenure', 'car loan down payment', 'car loan Odisha'],
    featuredImageAlt: 'New car ready for delivery after a car loan',
  },
  {
    slug: 'car-loan-balance-transfer-lower-emi',
    title: 'Car Loan Balance Transfer: When It Really Lowers Your EMI (With Example)',
    excerpt: 'How a car loan balance transfer works, a worked example of the savings, the foreclosure and processing fees to subtract, and when it is worth doing.',
    category: 'Car Loan',
    tags: ['car loan balance transfer', 'lower EMI', 'car loan refinance', 'foreclosure charges'],
    seoTitle: 'Car Loan Balance Transfer: Is It Worth It?',
    seoDescription: 'See when a car loan balance transfer really saves money: a worked example with EMI, interest saved, foreclosure and processing fees.',
    focusKeyword: 'car loan balance transfer',
    secondaryKeywords: ['transfer car loan to another bank', 'reduce car loan EMI', 'car loan foreclosure charges'],
    featuredImageAlt: 'Calculating savings from a car loan balance transfer',
  },
  {
    slug: 'car-loan-top-up',
    title: 'Car Loan Top-Up: How It Works, Eligibility and Top-Up vs Personal Loan',
    excerpt: 'Get extra funds on your running car loan. Eligibility, how the top-up amount is decided, costs, documents and how it compares with a personal loan.',
    category: 'Car Loan',
    tags: ['car loan top-up', 'top-up loan', 'loan on car', 'personal loan alternative'],
    seoTitle: 'Car Loan Top-Up: Eligibility & vs Personal Loan',
    seoDescription: 'How a car loan top-up works, who is eligible, how much you can get, the costs to check and when it is cheaper than a personal loan.',
    focusKeyword: 'car loan top-up',
    secondaryKeywords: ['top up on car loan', 'car top up loan eligibility', 'top up vs personal loan'],
    featuredImageAlt: 'Car owner checking a car loan top-up offer',
  },
  {
    slug: 'used-car-refinance',
    title: 'Used Car Refinance (Loan Against Car): How It Works and When It Makes Sense',
    excerpt: 'Raise money against a car you own: how lenders value your car, eligibility, documents, costs and the risks of pledging your vehicle.',
    category: 'Car Loan',
    tags: ['car refinance', 'loan against car', 'used car refinance', 'car valuation'],
    seoTitle: 'Used Car Refinance & Loan Against Car Guide',
    seoDescription: 'How a loan against your car works: car valuation, eligibility, documents, costs and risks, plus how refinance differs from a balance transfer.',
    focusKeyword: 'loan against car',
    secondaryKeywords: ['car refinance India', 'used car refinance', 'loan on old car', 'car refinance Odisha'],
    featuredImageAlt: 'Documents and calculator for a used car refinance',
  },
  {
    slug: 'used-car-loan-india-2026',
    title: 'Used Car Loan in India 2026: Car Age Rules, Documents and Safe Buying Checklist',
    excerpt: 'Financing a second-hand car: how valuation works, the car age rule, paperwork checks on the car, documents, costs and dealer vs private seller.',
    category: 'Car Loan',
    tags: ['used car loan', 'second hand car loan', 'pre-owned car finance', 'car valuation', 'RC transfer'],
    seoTitle: 'Used Car Loan 2026: Age Rules & Documents',
    seoDescription: 'Buying a second-hand car on a loan? Learn how lenders value the car, the car age rule, RC and paperwork checks, documents and costs.',
    focusKeyword: 'used car loan',
    secondaryKeywords: ['second hand car loan', 'pre owned car loan documents', 'used car loan eligibility'],
    featuredImageAlt: 'Buyer inspecting a used car before taking a loan',
  },
  {
    slug: 'commercial-vehicle-loan-guide',
    title: 'Commercial Vehicle Loan Guide for Truck, Bus and Taxi Owners',
    excerpt: 'How commercial vehicle loans work for fleet owners, small operators and first-time buyers: eligibility, documents and planning the EMI against vehicle income.',
    category: 'Commercial Vehicle',
    tags: ['commercial vehicle loan', 'truck loan', 'bus loan', 'tipper finance', 'transport business', 'Odisha'],
    seoTitle: 'Commercial Vehicle Loan Guide: Trucks & Buses',
    seoDescription: 'Commercial vehicle loans for trucks, buses, tippers and taxis: eligibility for first-time buyers, documents and planning EMIs against vehicle income.',
    focusKeyword: 'commercial vehicle loan',
    secondaryKeywords: ['truck loan', 'first time buyer commercial vehicle loan', 'bus loan', 'CV loan Odisha'],
    featuredImageAlt: 'Goods truck financed with a commercial vehicle loan',
  },
  {
    slug: 'loan-against-property-guide',
    title: 'Loan Against Property: Eligibility, LTV, Documents and Risks Explained',
    excerpt: 'How a loan against property works: loan-to-value, tenure and EMI, eligibility, the legal and technical checks, documents, costs and how to borrow safely.',
    category: 'Property Loans',
    tags: ['loan against property', 'LAP', 'mortgage loan', 'property documents', 'Odisha'],
    seoTitle: 'Loan Against Property: LTV, Documents & Risks',
    seoDescription: 'Complete loan against property guide: how LTV decides the amount, 10 vs 15 year EMI, legal and technical checks, documents, costs and risks.',
    focusKeyword: 'loan against property',
    secondaryKeywords: ['LAP eligibility', 'loan against property documents', 'mortgage loan', 'LAP Odisha'],
    featuredImageAlt: 'House used as security for a loan against property',
  },
  {
    slug: 'personal-loan',
    title: 'Personal Loan Guide: Eligibility, Documents and How to Avoid Rejection',
    excerpt: 'How personal loans work, what lenders check, a documents checklist for salaried and self-employed applicants, choosing the tenure and common rejection reasons.',
    category: 'Personal Loan',
    tags: ['personal loan', 'personal loan eligibility', 'personal loan documents', 'self-employed personal loan'],
    seoTitle: 'Personal Loan Eligibility & Documents Guide',
    seoDescription: 'Personal loan eligibility, documents for salaried and self-employed applicants, choosing the tenure, real costs and why applications get rejected.',
    focusKeyword: 'personal loan eligibility',
    secondaryKeywords: ['personal loan documents', 'personal loan for self employed', 'personal loan rejection reasons'],
    featuredImageAlt: 'Applicant filling in a personal loan application',
  },
  {
    slug: 'best-personal-loan-india-2026',
    title: 'How to Compare Personal Loan Offers in 2026: APR, Fees and Fine Print',
    excerpt: 'The lowest rate is not always the cheapest loan. Compare personal loan offers using APR, total cost and the fine print, with a worked example.',
    category: 'Personal Loan',
    tags: ['compare personal loans', 'APR', 'key fact statement', 'processing fee', 'personal loan 2026'],
    seoTitle: 'How to Compare Personal Loan Offers (APR)',
    seoDescription: 'Compare personal loans the right way: APR from the Key Fact Statement, total cost, processing fees and prepayment rules, with a worked example.',
    focusKeyword: 'compare personal loan offers',
    secondaryKeywords: ['best personal loan 2026', 'personal loan APR', 'personal loan processing fee', 'key fact statement'],
    featuredImageAlt: 'Comparing two personal loan offers side by side',
  },
  // ---- new posts (URLs reused from the earlier generic posts) ----
  {
    slug: 'how-to-improve-cibil-score-before-loan',
    title: 'How to Improve Your CIBIL Score Before Applying for a Loan',
    excerpt: 'What affects your credit score, how to get your free credit report, fix errors, and a practical 90-day plan to improve your CIBIL score before a loan.',
    category: 'Loan Basics',
    tags: ['CIBIL score', 'credit score', 'credit report', 'improve credit score', 'loan approval'],
    seoTitle: 'How to Improve Your CIBIL Score Before a Loan',
    seoDescription: 'Improve your CIBIL score before applying: what affects it, free credit reports, fixing errors, card usage and a simple 90-day plan.',
    focusKeyword: 'improve CIBIL score',
    secondaryKeywords: ['credit score for loan', 'free credit report India', 'CIBIL dispute', 'how to increase credit score'],
    featuredImageAlt: 'Checking a credit report online on a laptop and phone',
    image: img('1563986768609-322da13575f3'),
  },
  {
    slug: 'how-to-calculate-loan-emi',
    title: 'How to Calculate Loan EMI: Formula, Example and Amortisation Table',
    excerpt: 'The EMI formula explained with a worked example, how each EMI splits into interest and principal, tenure trade-offs and whether to prepay.',
    category: 'Loan Basics',
    tags: ['EMI calculation', 'EMI formula', 'amortisation schedule', 'loan prepayment', 'EMI calculator'],
    seoTitle: 'How to Calculate Loan EMI: Formula & Example',
    seoDescription: 'Learn the EMI formula with a worked ₹5 lakh example, the interest and principal split, EMI per lakh, tenure trade-offs and prepayment savings.',
    focusKeyword: 'how to calculate EMI',
    secondaryKeywords: ['EMI formula', 'loan amortisation schedule', 'EMI per lakh', 'prepayment reduce tenure or EMI'],
    featuredImageAlt: 'Calculator and loan papers for working out an EMI',
    image: img('1554224155-6726b3ff858f'),
  },
  // ---- batch 3: 18 new long-tail guides (brings the blog to 30 posts) ----
  {
    slug: 'car-loan-eligibility-by-salary',
    title: 'How Much Car Loan Can I Get on My Salary? Eligibility Explained',
    excerpt: 'How lenders work out car loan eligibility from your salary using FOIR, a worked ₹50,000 salary example, and practical ways to raise the amount you qualify for.',
    category: 'Car Loan',
    tags: ['car loan eligibility', 'FOIR', 'car loan on salary', 'car loan amount', 'Odisha'],
    seoTitle: 'Car Loan Eligibility: How Much on My Salary?',
    seoDescription: 'Find out how much car loan you can get on your salary: the FOIR rule, a worked ₹50,000 salary example and simple ways to raise your eligibility.',
    focusKeyword: 'car loan eligibility',
    secondaryKeywords: ['how much car loan can I get on my salary', 'car loan FOIR', 'car loan minimum salary'],
    featuredImageAlt: 'Car buyer working out car loan eligibility on a calculator',
    image: img('1494976388531-d1058494cdd8'),
  },
  {
    slug: 'car-loan-documents-checklist',
    title: 'Car Loan Documents Checklist for Salaried, Self-Employed and Businesses',
    excerpt: 'The complete car loan documents list: KYC, income proof for salaried and self-employed applicants, car papers for new and used cars, and mismatches that cause delays.',
    category: 'Car Loan',
    tags: ['car loan documents', 'car loan checklist', 'KYC', 'income proof', 'used car documents'],
    seoTitle: 'Car Loan Documents Checklist (2026)',
    seoDescription: 'Car loan documents checklist for salaried, self-employed and business applicants, plus new and used car papers and the mismatches that delay approval.',
    focusKeyword: 'car loan documents',
    secondaryKeywords: ['documents required for car loan', 'car loan documents self employed', 'used car loan documents'],
    featuredImageAlt: 'Loan application documents laid out on a desk',
    image: img('1586528116311-ad8dd3c8310d'),
  },
  {
    slug: 'car-loan-interest-rate-factors',
    title: 'What Decides Your Car Loan Interest Rate (and How to Get a Better One)',
    excerpt: 'Why two buyers get different car loan rates: credit score, income, down payment, car age, tenure and more, plus flat vs reducing rates and how to get a better offer.',
    category: 'Car Loan',
    tags: ['car loan interest rate', 'flat vs reducing rate', 'car loan APR', 'credit score', 'down payment'],
    seoTitle: 'What Decides Your Car Loan Interest Rate?',
    seoDescription: 'The factors that decide your car loan interest rate, what half a percent costs, flat vs reducing rates, and practical ways to get a better car loan offer.',
    focusKeyword: 'car loan interest rate',
    secondaryKeywords: ['how to get lower car loan rate', 'flat rate vs reducing rate', 'car loan rate factors'],
    featuredImageAlt: 'New car on display with a finance offer',
    image: img('1549317661-bd32c8ce0db2'),
  },
  {
    slug: 'car-loan-prepayment-foreclosure',
    title: 'Car Loan Prepayment and Foreclosure: Charges, Savings and Process',
    excerpt: 'Should you prepay or foreclose your car loan? A worked example of the interest saved, the charges to expect, RBI rules on penalties and the step-by-step closure process.',
    category: 'Car Loan',
    tags: ['car loan foreclosure', 'car loan prepayment', 'foreclosure charges', 'loan closure NOC'],
    seoTitle: 'Car Loan Foreclosure & Prepayment Guide',
    seoDescription: 'Car loan prepayment vs foreclosure: a worked example of interest saved, prepayment charges, RBI penalty rules and the step-by-step loan closure process.',
    focusKeyword: 'car loan foreclosure',
    secondaryKeywords: ['car loan prepayment charges', 'close car loan early', 'reduce EMI or tenure'],
    featuredImageAlt: 'Calculating savings from closing a car loan early',
    image: img('1554224154-26032ffc0d07'),
  },
  {
    slug: 'car-loan-for-self-employed',
    title: 'Car Loan for Self-Employed: Eligibility, ITR Rules and Documents',
    excerpt: 'How lenders assess self-employed income for a car loan, the ITR problem and how to solve it, documents, and buying the car in your name or your business name.',
    category: 'Car Loan',
    tags: ['car loan for self employed', 'car loan without salary slip', 'ITR car loan', 'business car loan'],
    seoTitle: 'Car Loan for Self-Employed: ITR & Documents',
    seoDescription: 'Car loan for self-employed professionals and business owners: how income is assessed from ITR and banking, documents needed and tips to improve approval.',
    focusKeyword: 'car loan for self employed',
    secondaryKeywords: ['car loan for business owners', 'car loan without ITR', 'self employed car loan documents'],
    featuredImageAlt: 'Business owner reviewing car loan papers at the shop',
    image: img('1556761175-5973dc0f32e7'),
  },
  {
    slug: 'remove-hypothecation-from-rc-after-car-loan',
    title: 'How to Remove Hypothecation from RC After Your Car Loan Ends',
    excerpt: 'Paid your last EMI? How to remove the lender\'s name from your RC: NOC, Form 35, the online Parivahan process, the RTO route and updating your insurance.',
    category: 'Car Loan',
    tags: ['hypothecation removal', 'Form 35', 'car loan NOC', 'RC update', 'Parivahan', 'RTO Odisha'],
    seoTitle: 'Remove Hypothecation from RC: Form 35 & NOC',
    seoDescription: 'Step-by-step guide to removing hypothecation from your RC after a car loan: NOC, Form 35, online Parivahan process, RTO visit and insurance update.',
    focusKeyword: 'remove hypothecation from RC',
    secondaryKeywords: ['hypothecation termination', 'Form 35 car loan', 'car loan NOC RTO', 'hypothecation removal online'],
    featuredImageAlt: 'Car keys and registration papers after a car loan is closed',
    image: img('1449965408869-eaa3f722e40d'),
  },
  {
    slug: 'personal-loan-with-low-cibil-score',
    title: 'Personal Loan with a Low CIBIL Score: Real Options and Red Flags',
    excerpt: 'Low credit score? Realistic ways to get a personal loan, what a low score costs you, the frauds that target rejected borrowers and a plan to rebuild your score.',
    category: 'Personal Loan',
    tags: ['personal loan low CIBIL', 'low credit score loan', 'bad credit loan', 'loan fraud', 'credit score'],
    seoTitle: 'Personal Loan with Low CIBIL Score: Options',
    seoDescription: 'Can you get a personal loan with a low CIBIL score? Realistic options, what it costs, fraud warning signs and a simple plan to rebuild your credit score.',
    focusKeyword: 'personal loan with low CIBIL score',
    secondaryKeywords: ['loan for low credit score', 'personal loan bad credit India', 'CIBIL score for personal loan'],
    featuredImageAlt: 'Person checking a low credit score on a phone',
    image: img('1563013544-824ae1b704d3'),
  },
  {
    slug: 'personal-loan-vs-credit-card',
    title: 'Personal Loan vs Credit Card: Which Is Cheaper to Borrow From?',
    excerpt: 'Revolving credit, card EMI conversion or a personal loan? A ₹2 lakh worked example, side-by-side comparison and when each option makes sense.',
    category: 'Personal Loan',
    tags: ['personal loan vs credit card', 'credit card EMI', 'credit card interest', 'credit utilisation'],
    seoTitle: 'Personal Loan vs Credit Card: Which Is Cheaper?',
    seoDescription: 'Personal loan vs credit card borrowing compared: a ₹2 lakh worked example, card EMI conversion, cash withdrawal costs and when each option makes sense.',
    focusKeyword: 'personal loan vs credit card',
    secondaryKeywords: ['credit card EMI vs personal loan', 'credit card debt to personal loan', 'cheapest way to borrow'],
    featuredImageAlt: 'Credit card and cash on a table comparing borrowing options',
    image: img('1580519542036-c47de6196ba5'),
  },
  {
    slug: 'debt-consolidation-loan',
    title: 'Debt Consolidation Loan: Combine EMIs and Pay Less Interest',
    excerpt: 'How a debt consolidation loan combines several EMIs and card bills into one, a worked example of the savings, the options available and when it backfires.',
    category: 'Personal Loan',
    tags: ['debt consolidation loan', 'combine loans', 'multiple EMIs', 'credit card debt', 'personal loan'],
    seoTitle: 'Debt Consolidation Loan: One EMI, Less Interest',
    seoDescription: 'Combine several loans and card bills into one EMI: how a debt consolidation loan works, a worked example, your options and when it is a bad idea.',
    focusKeyword: 'debt consolidation loan',
    secondaryKeywords: ['combine multiple loans into one', 'consolidate credit card debt', 'reduce multiple EMIs'],
    featuredImageAlt: 'Several bills being combined into one loan payment',
    image: img('1579621970563-ebec7560ff3e'),
  },
  {
    slug: 'loan-app-fraud-rbi-digital-lending-rules',
    title: 'Loan App Fraud: RBI Digital Lending Rules and How to Stay Safe',
    excerpt: 'How fake loan apps and advance-fee scams work, what RBI\'s digital lending rules require from genuine lenders, red flags, and exactly what to do if you are targeted.',
    category: 'Loan Basics',
    tags: ['loan app fraud', 'RBI digital lending guidelines', 'fake loan app', 'advance fee fraud', 'cybercrime 1930'],
    seoTitle: 'Loan App Fraud & RBI Digital Lending Rules',
    seoDescription: 'Spot fake loan apps and advance-fee scams. What RBI digital lending rules require, how to check a lender and what to do if you are targeted or harassed.',
    focusKeyword: 'loan app fraud',
    secondaryKeywords: ['RBI digital lending guidelines', 'fake loan app complaint', 'how to check loan app is genuine'],
    featuredImageAlt: 'Smartphone showing a loan app with a security warning',
    image: img('1611974789855-9c2a0a7236a3'),
  },
  {
    slug: 'personal-loan-for-medical-emergency',
    title: 'Personal Loan for a Medical Emergency: Fast, Safe Options Compared',
    excerpt: 'Hospital bills cannot wait. The cheapest ways to fund a medical emergency, how a personal loan compares with cards and gold loans, and how to borrow fast and safely.',
    category: 'Personal Loan',
    tags: ['medical loan', 'personal loan for medical emergency', 'hospital bills', 'health insurance', 'emergency loan'],
    seoTitle: 'Personal Loan for Medical Emergency: Options',
    seoDescription: 'Need money for hospital bills? Compare personal loans, cards, gold loans and car top-ups for a medical emergency, and learn how to borrow fast and safely.',
    focusKeyword: 'personal loan for medical emergency',
    secondaryKeywords: ['medical loan India', 'emergency loan for hospital bills', 'instant medical loan'],
    featuredImageAlt: 'Family at a hospital arranging funds for treatment',
    image: img('1584515933487-779824d29309'),
  },
  {
    slug: 'loan-against-property-vs-personal-loan',
    title: 'Loan Against Property vs Personal Loan: Which Should You Choose?',
    excerpt: 'Compare a loan against property and a personal loan on rate, amount, tenure, speed and risk, with a ₹10 lakh worked example showing why the lower rate is not always cheaper.',
    category: 'Property Loans',
    tags: ['loan against property vs personal loan', 'LAP', 'secured vs unsecured loan', 'personal loan'],
    seoTitle: 'Loan Against Property vs Personal Loan',
    seoDescription: 'Loan against property vs personal loan compared on rate, amount, tenure and risk, with a ₹10 lakh example showing why a lower rate can still cost more.',
    focusKeyword: 'loan against property vs personal loan',
    secondaryKeywords: ['LAP or personal loan', 'secured vs unsecured loan', 'loan against property interest'],
    featuredImageAlt: 'House model and calculator comparing loan options',
    image: img('1570129477492-45c003edd2be'),
  },
  {
    slug: 'loan-against-property-for-business',
    title: 'Loan Against Property for Business: Uses, LTV, Documents and Costs',
    excerpt: 'Use your home or shop to fund business growth: how a business LAP works, how much you can borrow, term loan vs overdraft, documents, costs and how to borrow safely.',
    category: 'Property Loans',
    tags: ['loan against property for business', 'business LAP', 'working capital', 'MSME loan', 'Odisha'],
    seoTitle: 'Loan Against Property for Business Guide',
    seoDescription: 'How a loan against property funds business growth: LTV and eligibility, term loan vs overdraft, documents, costs and tips to borrow against property safely.',
    focusKeyword: 'loan against property for business',
    secondaryKeywords: ['business loan against property', 'LAP for working capital', 'overdraft against property'],
    featuredImageAlt: 'Small business owner planning expansion with a property loan',
    image: img('1460925895917-afdab827c52f'),
  },
  {
    slug: 'property-documents-for-loan-odisha',
    title: 'Property Documents for a Loan in Odisha: RoR, EC, Mutation and More',
    excerpt: 'The property papers lenders check in Odisha: sale deed, Record of Rights, mutation, encumbrance certificate, land conversion and building approvals, and how to fix gaps.',
    category: 'Property Loans',
    tags: ['property documents for loan', 'Record of Rights', 'encumbrance certificate', 'mutation', 'Bhulekh', 'Odisha'],
    seoTitle: 'Property Documents for a Loan in Odisha',
    seoDescription: 'Property documents for a loan in Odisha: sale deed, RoR from Bhulekh, mutation, encumbrance certificate, land conversion, approvals and common fixes.',
    focusKeyword: 'property documents for loan',
    secondaryKeywords: ['Record of Rights Odisha', 'encumbrance certificate Odisha', 'documents for loan against property'],
    featuredImageAlt: 'Property papers and house keys for a loan application',
    image: img('1568605114967-8130f3a36994'),
  },
  {
    slug: 'used-commercial-vehicle-loan',
    title: 'Used Commercial Vehicle Loan: Trucks, Tippers and Buses Explained',
    excerpt: 'Buying a second-hand truck, tipper or bus on a loan: how lenders value it, eligibility for operators and first-time buyers, documents and checks before paying the seller.',
    category: 'Commercial Vehicle',
    tags: ['used commercial vehicle loan', 'used truck loan', 'second hand truck finance', 'tipper loan', 'Odisha'],
    seoTitle: 'Used Commercial Vehicle Loan: Truck & Bus',
    seoDescription: 'Used truck, tipper or bus loan guide: how lenders value a used commercial vehicle, eligibility, documents, costs and the checks to do before you pay.',
    focusKeyword: 'used commercial vehicle loan',
    secondaryKeywords: ['used truck loan', 'second hand commercial vehicle finance', 'old truck loan'],
    featuredImageAlt: 'Used goods truck being inspected before purchase',
    image: img('1519003722824-194d4455a60c'),
  },
  {
    slug: 'taxi-loan-commercial-car',
    title: 'Taxi Loan Guide: Commercial Car Loans for Cab Drivers and Owners',
    excerpt: 'Turn your rent into ownership: how taxi and commercial car loans work, yellow-plate rules, eligibility for drivers, documents and planning the EMI around daily earnings.',
    category: 'Commercial Vehicle',
    tags: ['taxi loan', 'commercial car loan', 'cab loan', 'yellow plate car', 'driver loan'],
    seoTitle: 'Taxi Loan: Commercial Car Loan for Drivers',
    seoDescription: 'Taxi and commercial car loans for cab drivers and owners: yellow-plate rules, eligibility, documents, costs and planning the EMI around daily earnings.',
    focusKeyword: 'taxi loan',
    secondaryKeywords: ['commercial car loan', 'cab loan for drivers', 'car loan for taxi business'],
    featuredImageAlt: 'Taxi car on a city road',
    image: img('1559526324-4b87b5e36e44'),
  },
  {
    slug: 'fixed-vs-floating-interest-rate',
    title: 'Fixed vs Floating Interest Rate: Which Is Better for Your Loan?',
    excerpt: 'Fixed vs floating interest rates explained: how each works, what a 1% rise does to your EMI, prepayment rules and how to choose for car, personal and property loans.',
    category: 'Loan Basics',
    tags: ['fixed vs floating interest rate', 'floating rate loan', 'repo rate', 'EMI change', 'prepayment'],
    seoTitle: 'Fixed vs Floating Interest Rate Explained',
    seoDescription: 'Fixed vs floating interest rate: how each works, what a 1% rate rise does to your EMI, RBI prepayment rules and how to choose the right option for you.',
    focusKeyword: 'fixed vs floating interest rate',
    secondaryKeywords: ['floating rate vs fixed rate loan', 'repo linked loan', 'which interest rate is better'],
    featuredImageAlt: 'Chart showing interest rates moving over time',
    image: img('1434626881859-194d67b2b86f'),
  },
  {
    slug: 'co-applicant-guarantor-loan-eligibility',
    title: 'Co-Applicant vs Guarantor: How They Affect Your Loan Eligibility',
    excerpt: 'The difference between a co-applicant, co-borrower and guarantor, how combined income raises eligibility, and the risks to think about before you sign for someone else.',
    category: 'Loan Basics',
    tags: ['co-applicant', 'guarantor', 'joint loan', 'loan eligibility', 'co-borrower'],
    seoTitle: 'Co-Applicant vs Guarantor for a Loan',
    seoDescription: 'Co-applicant vs guarantor explained: how combined income raises loan eligibility, who can be one, credit score effects and the risks before you sign.',
    focusKeyword: 'co-applicant vs guarantor',
    secondaryKeywords: ['co-applicant loan eligibility', 'guarantor for loan responsibilities', 'joint loan with spouse'],
    featuredImageAlt: 'Couple signing a joint loan application together',
    image: img('1551836022-d5d88e9218df'),
  },
];

// ---------------------------------------------------------------- validation

const words = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').split(/\s+/).filter(Boolean).length;

function validate(p, html, knownSlugs) {
  const problems = [];
  const w = words(html);
  if (w < 800) problems.push(`only ${w} words`);
  if (/<h1[\s>]/i.test(html)) problems.push('contains an <h1>');
  if (/\sstyle=|<style|<script|<link/i.test(html)) problems.push('contains inline style/script/link');
  // The site's title template adds " | EzyLoan" (10 chars), so keep our part to 50.
  if (p.seoTitle.length > 50) problems.push(`SEO title ${p.seoTitle.length} chars (max 50; the site adds " | EzyLoan")`);
  if (/ezyloan/i.test(p.seoTitle)) problems.push('SEO title must not include "EzyLoan" (the site adds it)');
  if (p.seoDescription.length < 110 || p.seoDescription.length > 160) problems.push(`SEO description ${p.seoDescription.length} chars (aim 110-160)`);
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (/^https?:/.test(href)) continue;
    const m = href.match(/^\/blog\/([a-z0-9-]+)$/);
    if (m ? !knownSlugs.has(m[1]) : !SITE_PAGES.has(href)) problems.push(`broken internal link ${href}`);
    if (m && m[1] === p.slug) problems.push('links to itself');
  }
  return { w, problems };
}

// ---------------------------------------------------------------------- main

const BlogSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema, 'blogs');

async function main() {
  const { DATABASE_URL } = process.env;
  if (!DATABASE_URL) {
    console.error('DATABASE_URL must be set. Run: node --env-file=.env.local scripts/seed-blogs.mjs --dry-run');
    process.exit(1);
  }
  const selected = ONLY.length ? posts.filter((p) => ONLY.includes(p.slug)) : posts;
  if (ONLY.length && selected.length !== ONLY.length) {
    console.error('Unknown slug in --only:', ONLY.filter((s) => !posts.some((p) => p.slug === s)).join(', '));
    process.exit(2);
  }

  await mongoose.connect(DATABASE_URL, { dbName: process.env.DATABASE_NAME?.trim() || 'mydatabase' });
  const existing = await Blog.find({ slug: { $in: selected.map((p) => p.slug) } }).lean();
  const bySlug = new Map(existing.map((d) => [d.slug, d]));
  const publicSlugs = (await Blog.find({ $or: [{ status: 'published' }, { status: { $exists: false } }] }, { slug: 1 }).lean()).map((d) => d.slug);
  const knownSlugs = new Set([...publicSlugs, ...posts.map((p) => p.slug)]);

  // 1. Build + validate everything before touching the database.
  const now = new Date();
  const plan = [];
  let failed = false;
  for (const p of selected) {
    const html = (await readFile(path.join(CONTENT_DIR, `${p.slug}.html`), 'utf8')).trim();
    const { w, problems } = validate(p, html, knownSlugs);
    const old = bySlug.get(p.slug);
    if (!old && !p.image) problems.push('new post needs an image');
    if (problems.length) failed = true;
    const status = old ? (old.status && old.status !== 'published' ? old.status : 'published') : NEW_AS;
    plan.push({ p, html, w, problems, old, status });
    console.log(`${problems.length ? '✗' : '✓'} ${old ? 'update' : 'create'} ${p.slug}  (${w} words, ${status})${problems.length ? '\n    - ' + problems.join('\n    - ') : ''}`);
  }
  if (failed) {
    console.error('\nFix the problems above first. Nothing was written.');
    await mongoose.disconnect();
    process.exit(1);
  }
  if (DRY) {
    console.log(`\nDry run OK: ${plan.length} posts ready. Nothing was written.`);
    await mongoose.disconnect();
    return;
  }

  // 2. Back up what is about to change.
  if (existing.length) {
    await mkdir(BACKUP_DIR, { recursive: true });
    const file = path.join(BACKUP_DIR, `blogs-${now.toISOString().replace(/[:.]/g, '-')}.json`);
    await writeFile(file, JSON.stringify(existing, null, 2));
    console.log(`\nBackup of ${existing.length} existing post(s): ${path.relative(process.cwd(), file)}`);
  }

  // 3. Write.
  for (const { p, html, old, status } of plan) {
    const { image, ...meta } = p;
    const set = {
      ...meta,
      content: html,
      author: AUTHOR,
      authorBio: AUTHOR_BIO,
      status,
      modifiedAt: now,
      image: old?.image || image,
    };
    if (status === 'published') set.publishedAt = old?.publishedAt || old?.createdAt || now;
    await Blog.updateOne({ slug: p.slug }, { $set: set, $setOnInsert: { previousSlugs: [] } }, { upsert: true });
    console.log(`  ${old ? '↻ updated' : '＋ created'}: /blog/${p.slug}`);
  }
  console.log('\nDone. Blog pages refresh within an hour (the listing within 10 minutes).');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
