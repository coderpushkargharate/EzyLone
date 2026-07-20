// Seed SEO blog posts for EzyLoan — ONE post per loan product/service the website
// actually offers (7 total): New Car Loan, Used Car Balance Transfer, Used Car
// Refinance, Car Loan Top-Up, Commercial Vehicle Loan, Personal Loan, and Loan
// Against Property. Each post links to its own product page + the EMI calculator.
//
//   node --env-file=.env.local scripts/seed-blogs.mjs
//
// Idempotent: posts are UPSERTED by slug (re-running updates them in place). The
// script also REMOVES the earlier generic (non-service) posts it once created, so
// the blog set matches exactly the services on the site. It never touches any
// other/pre-existing blogs. Content is compliance-safe (EzyLoan is a loan
// facilitator/DSA, not a lender). Images are stable Unsplash CDN URLs.

import mongoose from 'mongoose';

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL must be set. Run: node --env-file=.env.local scripts/seed-blogs.mjs');
  process.exit(1);
}

const BlogSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    content: String,
    excerpt: String,
    category: String,
    image: String,
  },
  { timestamps: true }
);
const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=70`;

// Generic (non-service) posts created by the earlier version of this script.
// These are removed so the blog set matches only the website's services.
const OBSOLETE_SLUGS = [
  'how-to-improve-cibil-score-before-loan',
  'new-car-loan-vs-used-car-loan',
  'personal-loan-eligibility-guide-india',
  'how-to-calculate-loan-emi',
  'fixed-vs-floating-interest-rate',
  'documents-required-for-loan-application',
  'tips-to-get-loan-approved-faster',
];

const CTA = `
<blockquote>EzyLoan is a loan <strong>facilitator (DSA)</strong>, not a lender. We connect you with RBI-regulated partner banks and NBFCs — the final loan approval, interest rate, and amount are decided by the lending partner as per their policy.</blockquote>
<h3>Ready to get started?</h3>
<p>Compare your options in minutes. <a href="/apply-now">Apply now</a> or estimate your monthly payment with our free <a href="/emi-calculator">EMI calculator</a>. Questions? Call us on <strong>+91 6372977626</strong> (Mon–Sat, 9 AM – 8 PM).</p>
`;

const posts = [
  {
    title: 'New Car Loan: Finance Your Dream Car with Easy EMIs',
    slug: 'new-car-loan',
    category: 'New Car Loan',
    image: img('1503376780353-7e6692767b70'),
    excerpt:
      'Buy your dream car with a new car loan — up to 100% funding, quick approval and low rates. Here is everything you need to know.',
    content: `
<p>A <strong>new car loan</strong> lets you drive home your dream car today and pay for it in comfortable monthly instalments. As a loan facilitator, EzyLoan matches you with partner banks and NBFCs so you get a deal that fits your budget.</p>
<h2>Highlights of a new car loan</h2>
<ul>
<li><strong>Up to 100% on-road funding*</strong> with select lenders.</li>
<li><strong>Quick approval*</strong> with minimal paperwork.</li>
<li><strong>Low, competitive interest rates*</strong> because new cars are lower risk.</li>
<li><strong>Flexible tenure</strong> — often up to 7 years for smaller EMIs.</li>
</ul>
<h2>Who can apply</h2>
<p>Salaried or self-employed individuals with a steady income and a healthy credit profile are typically eligible. Final eligibility is decided by the lending partner.</p>
<h2>How EzyLoan helps</h2>
<p>Instead of visiting multiple banks, you tell us what you need once and we compare options across partners — saving you time and helping you find a suitable rate.</p>
<p>Explore our <a href="/car-loan">new car loan</a> and check your EMI with the <a href="/emi-calculator">EMI calculator</a> before you apply.</p>
${CTA}
`,
  },
  {
    title: 'Used Car Loan Balance Transfer: Lower Your EMI',
    slug: 'car-loan-balance-transfer-lower-emi',
    category: 'Balance Transfer',
    image: img('1579621970563-ebec7560ff3e'),
    excerpt:
      'Paying a high rate on your used-car loan? A balance transfer moves it to a partner lender at a lower rate — reducing your EMI.',
    content: `
<p>If you took your used-car loan a while ago, you may be paying more interest than today's rates. A <strong>balance transfer</strong> moves your outstanding loan to a new partner lender at a lower rate — reducing your EMI or total interest.</p>
<h2>How it works</h2>
<ol>
<li>The new lender pays off your existing car loan.</li>
<li>Your loan continues with the new lender at a lower interest rate.</li>
<li>You enjoy a smaller EMI, a shorter tenure, or an optional top-up.</li>
</ol>
<h2>When a balance transfer makes sense</h2>
<ul>
<li>Your current rate is noticeably higher than what's available now.</li>
<li>You still have a meaningful number of EMIs left.</li>
<li>Your credit profile has improved since you first borrowed.</li>
</ul>
<h2>Keep an eye on costs</h2>
<p>Factor in processing and foreclosure charges — a transfer is worth it when your interest savings clearly beat these one-time costs.</p>
<p>Learn more about a <a href="/car-loan-balance-transfer">used car loan balance transfer</a> and compare your new EMI with the <a href="/emi-calculator">EMI calculator</a>.</p>
${CTA}
`,
  },
  {
    title: 'Used Car Refinance: Better Rates on Your Existing Car',
    slug: 'used-car-refinance',
    category: 'Refinance',
    image: img('1554224155-6726b3ff858f'),
    excerpt:
      'Refinance your used car for better rates, flexible terms and an optional top-up. See how used-car refinancing can save you money.',
    content: `
<p><strong>Used car refinancing</strong> replaces your current car loan with a new one on better terms — a lower rate, a more comfortable tenure, or extra funds through a top-up. It's a smart way to reduce your monthly outgo.</p>
<h2>Benefits of refinancing</h2>
<ul>
<li><strong>Better interest rates*</strong> than your existing loan.</li>
<li><strong>Flexible terms</strong> — adjust your tenure to suit your budget.</li>
<li><strong>Top-up available</strong> if you need additional funds.</li>
</ul>
<h2>Is refinancing right for you?</h2>
<p>Refinancing works best when market rates have dropped, your credit score has improved, or you want a lower EMI. Make sure the savings outweigh any processing or foreclosure charges.</p>
<h2>How EzyLoan helps</h2>
<p>We compare refinance offers across partner banks and NBFCs so you can pick the option that saves the most.</p>
<p>Explore <a href="/car-loan-refinance">used car refinance</a> and estimate your new EMI with the <a href="/emi-calculator">EMI calculator</a>.</p>
${CTA}
`,
  },
  {
    title: 'Car Loan Top-Up: Extra Funds on Your Existing Car Loan',
    slug: 'car-loan-top-up',
    category: 'Top-Up',
    image: img('1554224154-26032ffc0d07'),
    excerpt:
      'Need extra money without a new loan? A car loan top-up gives you additional funds on your existing loan, subject to eligibility.',
    content: `
<p>A <strong>car loan top-up</strong> lets you borrow an additional amount on top of your existing car loan — without taking a separate new loan. It's a convenient way to raise funds when you need them.</p>
<h2>Why choose a top-up</h2>
<ul>
<li><strong>Extra funds</strong> for any personal or business need.</li>
<li><strong>On your existing loan</strong> — no need to start fresh.</li>
<li><strong>Quick disbursal*</strong> for eligible borrowers.</li>
</ul>
<h2>What lenders check</h2>
<ul>
<li>Your repayment track record on the existing loan</li>
<li>Your current income and credit profile</li>
<li>The remaining value and tenure of your loan</li>
</ul>
<h2>Good to know</h2>
<p>A top-up increases your outstanding balance, so borrow what you can comfortably repay. Terms and eligibility are set by the lending partner.</p>
<p>Explore a <a href="/car-loan-topup">car loan top-up</a> and plan your revised EMI with the <a href="/emi-calculator">EMI calculator</a>.</p>
${CTA}
`,
  },
  {
    title: 'Commercial Vehicle Loan: Finance Trucks, Buses and Taxis',
    slug: 'commercial-vehicle-loan-guide',
    category: 'Commercial Vehicle',
    image: img('1601584115197-04ecc0da31d7'),
    excerpt:
      'Grow your transport business with a commercial vehicle loan — high loan amounts, flexible tenure and potential tax benefits.',
    content: `
<p>A <strong>commercial vehicle loan</strong> helps you finance trucks, buses, taxis and other business vehicles — so you can expand your fleet without locking up working capital.</p>
<h2>Key benefits</h2>
<ul>
<li><strong>High loan amounts</strong> for new or used commercial vehicles.</li>
<li><strong>Flexible tenure</strong> aligned to your earning cycle.</li>
<li><strong>Potential tax benefits</strong> on interest and depreciation (consult your CA).*</li>
</ul>
<h2>What lenders typically look at</h2>
<ul>
<li>Your business vintage and cash flow</li>
<li>Existing fleet and repayment track record</li>
<li>The vehicle's make, model and usage</li>
</ul>
<h2>Tips before you apply</h2>
<p>Keep your business documents and bank statements ready, maintain a healthy repayment history, and pick a tenure that matches your route's earnings.</p>
<p>Explore a <a href="/commercial-vehicle-loan">commercial vehicle loan</a> and plan your EMIs with the <a href="/emi-calculator">EMI calculator</a>.</p>
${CTA}
`,
  },
  {
    title: 'Personal Loan up to ₹25 Lakh: Uses, Eligibility and Benefits',
    slug: 'personal-loan',
    category: 'Personal Loan',
    image: img('1450101499163-c8848c66ca85'),
    excerpt:
      'A collateral-free personal loan up to ₹25 Lakh with minimal documentation — for a wedding, medical need, travel or any personal goal.',
    content: `
<p>A <strong>personal loan</strong> is flexible, collateral-free money you can use for almost any need — a wedding, medical emergency, home renovation, travel or a big purchase. EzyLoan helps you find a suitable offer from partner banks and NBFCs.</p>
<h2>Highlights</h2>
<ul>
<li><strong>Up to ₹25 Lakh</strong> based on your profile.</li>
<li><strong>Minimal documentation</strong> and a simple process.</li>
<li><strong>No collateral</strong> required.</li>
<li><strong>Any purpose</strong> — you decide how to use it.</li>
</ul>
<h2>Who can apply</h2>
<p>Salaried or self-employed individuals, typically aged 21–60, with a steady income and a healthy credit score. A better CIBIL score improves both approval odds and your rate.</p>
<h2>How EzyLoan helps</h2>
<p>Share your requirement once and we compare options across partners — so you get a personal loan that fits your income and repayment comfort.</p>
<p>Explore a <a href="/personal-loan">personal loan</a> and check your EMI with the <a href="/emi-calculator">EMI calculator</a> before you apply.</p>
${CTA}
`,
  },
  {
    title: 'Loan Against Property: Unlock Funds up to ₹3 Crore',
    slug: 'loan-against-property-guide',
    category: 'Loan Against Property',
    image: img('1560518883-ce09059eeffa'),
    excerpt:
      'Raise large funds at attractive rates using your home or commercial property as security — without selling it. Up to ₹3 Crore.',
    content: `
<p>A <strong>Loan Against Property (LAP)</strong> lets you borrow against a residential or commercial property you own — without selling it. Because it's secured, it usually offers lower rates and a longer tenure than an unsecured loan.</p>
<h2>Why choose LAP</h2>
<ul>
<li><strong>Large amounts:</strong> up to ₹3 Crore, based on your property's value.</li>
<li><strong>Lower EMIs:</strong> a long tenure spreads repayment comfortably.</li>
<li><strong>Any purpose:</strong> business expansion, education, medical, or consolidation.</li>
</ul>
<h2>What lenders assess</h2>
<ul>
<li>Market value and clear title of the property</li>
<li>Your income and repayment capacity</li>
<li>Your credit history</li>
</ul>
<h2>Things to keep in mind</h2>
<p>Your property is pledged as security, so borrow responsibly and keep EMIs on time. Compare offers to get the best rate.</p>
<p>Learn more about a <a href="/property-loan">Loan Against Property</a> and estimate your EMI with the <a href="/emi-calculator">EMI calculator</a>.</p>
${CTA}
`,
  },
];

async function main() {
  await mongoose.connect(DATABASE_URL, { dbName: 'mydatabase' });
  console.log('✅ Connected to MongoDB');

  // Remove the earlier generic (non-service) posts so only service posts remain.
  const del = await Blog.deleteMany({ slug: { $in: OBSOLETE_SLUGS } });
  if (del.deletedCount) console.log(`🧹 Removed ${del.deletedCount} old generic post(s).`);

  let created = 0;
  let updated = 0;
  for (const p of posts) {
    const res = await Blog.updateOne({ slug: p.slug }, { $set: p }, { upsert: true });
    if (res.upsertedCount) {
      created++;
      console.log(`  ＋ created: ${p.slug}`);
    } else {
      updated++;
      console.log(`  ↻ updated: ${p.slug}`);
    }
  }

  const total = await Blog.countDocuments();
  console.log(`\n✅ Done. ${created} created, ${updated} updated, ${del.deletedCount} removed. Blog collection now has ${total} posts.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
