import Link from 'next/link';
import {
  ArrowRight, BadgeCheck, Car, CheckCircle2, ClipboardList, FileText, Gauge,
  Handshake, MapPin, Phone, Search, ShieldCheck, UserCheck,
} from 'lucide-react';
import LoanDisclosure from '@/components/LoanDisclosure';
import { CALL_DISPLAY, CALL_NUMBER } from '@/lib/contact';

// Server component: every word on this page is in the initial HTML.
// Content rules: no rate, amount, approval-time or partner claim beyond what the
// site's own loan-disclosure page already publishes. The lender decides approval
// and terms; EzyLoan only facilitates the application.

const loanDetails = {
  interestRate: '10% – 28% p.a.',
  processingFee: 'Up to 3% of loan amount',
  tenure: '12 – 60 months',
};
const emiExample = { principal: 100000, rate: 14, tenureMonths: 36, emi: 3418, totalAmount: 123048 };
const eligibility = { age: '21 – 60 years', income: '₹15,000+ per month', employment: 'Salaried / Self-employed' };

const vehicleChecks = [
  { icon: Gauge, title: 'Age of the car', text: 'Lenders usually set a maximum age for the car at the end of the loan, so an older car may get a shorter tenure.' },
  { icon: Search, title: 'Valuation', text: 'The lender values the car (often through an empanelled valuer). The loan is based on that value, not only on the asking price.' },
  { icon: FileText, title: 'Clean ownership papers', text: 'The RC, insurance and any previous loan closure (NOC / hypothecation removal) need to be in order before transfer.' },
  { icon: UserCheck, title: 'Your repayment profile', text: 'Income, existing EMIs and credit history (CIBIL) decide how much a lender is willing to offer and at what rate.' },
];

const documents = [
  { group: 'Identity & address (KYC)', items: ['Aadhaar card', 'PAN card', 'Address proof if different from Aadhaar', 'Passport-size photographs'] },
  { group: 'Income', items: ['Salaried: recent salary slips', 'Self-employed: ITR and business proof', 'Bank statements for the last 3–6 months'] },
  { group: 'The car', items: ['Copy of the RC (registration certificate)', 'Valid insurance', 'Sale agreement / seller details', 'Seller’s NOC and Form 35 if the car has a running loan'] },
];

const steps = [
  { title: 'Share your details', text: 'Fill the short Apply Now form with your contact details, city and the type of loan.' },
  { title: 'Talk to our team', text: 'An EzyLoan advisor calls you to understand the car, your income and your documents.' },
  { title: 'Application to partner lenders', text: 'We submit your application to partner banks/NBFCs that finance used cars for profiles like yours.' },
  { title: 'Lender verification & decision', text: 'The lender checks your documents, values the car and decides. If it sanctions the loan, it disburses as per its process and records hypothecation on the RC.' },
];

const faqs = [
  {
    q: 'Who decides whether my used car loan is approved?',
    a: 'The partner bank or NBFC. EzyLoan is a loan facilitator (DSA): we help you prepare and submit the application, but the lender alone decides approval, loan amount, interest rate and tenure.',
  },
  {
    q: 'How much loan can I get on a used car?',
    a: 'It depends on the lender’s valuation of the car, the car’s age and your repayment capacity. Lenders usually finance a percentage of the valued price rather than the full asking price, so plan for a down payment.',
  },
  {
    q: 'Is the interest rate different from a new car loan?',
    a: 'Often, yes. Used car loans are commonly priced higher than new car loans and may have shorter tenures, because the car is older. The exact rate is set by the lender for your profile.',
  },
  {
    q: 'Can I buy a used car that still has a loan on it?',
    a: 'Yes, but the seller’s existing loan must be closed and the hypothecation removed (bank NOC and Form 35) before or during the transfer. The lender will check this before disbursing.',
  },
  {
    q: 'Does EzyLoan charge me a fee?',
    a: 'EzyLoan does not charge any upfront fee from borrowers. Lenders may charge a processing fee (up to 3% of the loan amount + GST), which is shown in their sanction terms.',
  },
  {
    q: 'Can I apply if I am self-employed?',
    a: 'Yes. Self-employed applicants usually share ITRs and business proof instead of salary slips. Requirements vary by lender.',
  },
];

const related = [
  { href: '/car-loan', title: 'New Car Loan', text: 'Finance for a brand-new car.' },
  { href: '/car-loan-topup', title: 'Car Loan Top-Up', text: 'Extra funds on a running car loan.' },
  { href: '/car-loan-balance-transfer', title: 'Car Loan Balance Transfer', text: 'Move your car loan to another lender.' },
  { href: '/emi-calculator', title: 'EMI Calculator', text: 'Estimate your monthly repayment.' },
];

export default function UsedCarLoanPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="page-top bg-gradient-to-b from-[#eef4fc] to-white">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 section-py">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-4">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="hover:text-blue-700">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-slate-700">Used Car Loan</li>
            </ol>
          </nav>
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
              <Car className="w-4 h-4" aria-hidden="true" /> Pre-owned car finance
            </p>
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
              Used Car Loan in Odisha
            </h1>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-700">
              Buying a second-hand car? EzyLoan helps you apply for a used car loan with our partner banks and NBFCs,
              from checking your documents to submitting your application. We are a loan facilitator (DSA), not a
              lender: approval, loan amount, interest rate and tenure are decided by the lender.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link href="/apply-now" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2064c8] px-6 py-3 font-semibold text-white shadow-sm hover:bg-[#1a54a8] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                Apply for a used car loan <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a href={`tel:${CALL_NUMBER}`} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:border-blue-400 hover:text-blue-700">
                <Phone className="w-4 h-4" aria-hidden="true" /> Call {CALL_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* What lenders look at */}
        <section aria-labelledby="checks-heading" className="section-py">
          <h2 id="checks-heading" className="text-2xl sm:text-3xl font-bold text-slate-900">What lenders check for a used car loan</h2>
          <p className="mt-2 max-w-3xl text-slate-600">
            A used car loan is assessed on two things: you, and the car. Knowing what lenders look at helps you choose a
            car that is easier to finance.
          </p>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {vehicleChecks.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="w-5 h-5" aria-hidden="true" /></span>
                <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Eligibility */}
        <section aria-labelledby="eligibility-heading" className="section-mb grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
            <h2 id="eligibility-heading" className="text-2xl font-bold text-slate-900">Eligibility</h2>
            <p className="mt-2 text-sm text-slate-600">Typical criteria. Each lender applies its own policy.</p>
            <ul className="mt-4 space-y-3 text-slate-700">
              {[
                `Age: ${eligibility.age}`,
                `Income: ${eligibility.income}`,
                `Employment: ${eligibility.employment}`,
                'A repayment history and credit score acceptable to the lender',
                'A car that meets the lender’s age and valuation norms',
              ].map((t) => (
                <li key={t} className="flex gap-3"><CheckCircle2 className="mt-0.5 w-5 h-5 shrink-0 text-green-600" aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-bold text-slate-900">New or used: what changes</h2>
            <dl className="mt-4 divide-y divide-slate-100 text-sm">
              {[
                ['Loan amount', 'Based on the lender’s valuation of the car instead of the showroom price.'],
                ['Interest rate', 'Often higher than for a new car, set by the lender.'],
                ['Tenure', 'May be shorter, depending on the car’s age.'],
                ['Extra paperwork', 'RC transfer, and NOC / Form 35 if the car had a loan.'],
              ].map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-3 py-3">
                  <dt className="font-semibold text-slate-800">{k}</dt>
                  <dd className="col-span-2 text-slate-600">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm"><Link href="/car-loan" className="font-medium text-blue-700 hover:underline">Looking for a new car loan instead? →</Link></p>
          </div>
        </section>

        {/* Documents */}
        <section aria-labelledby="documents-heading" className="section-mb">
          <h2 id="documents-heading" className="text-2xl sm:text-3xl font-bold text-slate-900">Documents required</h2>
          <p className="mt-2 max-w-3xl text-slate-600">
            The usual checklist is below; your lender may ask for more. See also our{' '}
            <Link href="/blog/car-loan-documents-checklist" className="font-medium text-blue-700 hover:underline">car loan documents checklist</Link>.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.map((d) => (
              <div key={d.group} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900"><ClipboardList className="w-5 h-5 text-blue-700" aria-hidden="true" />{d.group}</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {d.items.map((i) => (<li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" aria-hidden="true" />{i}</li>))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section aria-labelledby="process-heading" className="section-mb">
          <h2 id="process-heading" className="text-2xl sm:text-3xl font-bold text-slate-900">How to apply</h2>
          <ol className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2064c8] text-sm font-bold text-white">{i + 1}</span>
                <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Why EzyLoan */}
        <section aria-labelledby="why-heading" className="section-mb rounded-2xl bg-[#0b1b3f] p-6 sm:p-8 text-white">
          <h2 id="why-heading" className="text-2xl font-bold">Why apply through EzyLoan</h2>
          <ul className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Handshake, title: 'One application', text: 'Share your details once; we route them to partner lenders that suit your profile.' },
              { icon: BadgeCheck, title: 'No upfront fee from you', text: 'EzyLoan does not charge borrowers an upfront fee. Lender fees are shown in their terms.' },
              { icon: MapPin, title: 'Office in Cuttack', text: 'Call us or visit our office at Pir Bazar, Bhanpur, Cuttack (Mon–Sat).' },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon className="w-6 h-6 text-orange-300" aria-hidden="true" />
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-blue-100">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <LoanDisclosure loanDetails={loanDetails} emiExample={emiExample} eligibility={eligibility} contained={false} className="section-mb" />

        {/* FAQs: native <details> so answers are in the HTML and work without JS */}
        <section aria-labelledby="faq-heading" className="section-mb">
          <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold text-slate-900">Used car loan FAQs</h2>
          <div className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-slate-900">
                  <h3 className="text-base">{f.q}</h3>
                  <span className="mt-0.5 text-blue-700 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-600">More questions? See the <Link href="/faq" className="font-medium text-blue-700 hover:underline">loan FAQ</Link> or read our <Link href="/blog/used-car-loan-india-2026" className="font-medium text-blue-700 hover:underline">used car loan guide</Link>.</p>
        </section>

        {/* Related services */}
        <section aria-labelledby="related-heading" className="section-mb">
          <h2 id="related-heading" className="text-2xl font-bold text-slate-900">Related car loan services</h2>
          <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((r) => (
              <li key={r.href}>
                <Link href={r.href} className="block h-full rounded-2xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm">
                  <span className="font-semibold text-slate-900">{r.title}</span>
                  <span className="mt-1 block text-sm text-slate-600">{r.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Final CTA */}
        <section className="section-mb rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sm:p-8 text-center">
          <ShieldCheck className="mx-auto w-8 h-8 text-blue-700" aria-hidden="true" />
          <h2 className="mt-3 text-2xl font-bold text-slate-900">Found the car? Start your application</h2>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">It takes a few minutes. Our team will call you to take it forward with partner lenders.</p>
          <Link href="/apply-now" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#2064c8] px-6 py-3 font-semibold text-white hover:bg-[#1a54a8]">
            Apply now <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}
