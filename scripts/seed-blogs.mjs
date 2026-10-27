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
