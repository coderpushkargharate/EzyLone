import HeroSection from '@/components/HeroSection';
import Services from '@/components/Services';
import WhyChoose from '@/components/home/WhyChoose';
import Commitment from '@/components/home/Commitment';
import LoanDisclosure from '@/components/LoanDisclosure';
import Link from 'next/link';
import { pageMeta } from '@/lib/seo';

const BASE_URL = 'https://www.ezyloan.co.in';

// FinancialProduct structured data for the homepage. Previously this lived in a
// <SEO> component built on `next/head`, which is a Pages-Router API and renders
// nothing in the App Router — so this schema was silently missing. Emitting it
// here as a real <script> makes it actually appear in the page HTML.
const financialProductSchema = {
  '@context': 'https://schema.org',
  '@type': 'FinancialProduct',
  name: 'Loan Facilitation - EzyLoan',
  description:
    'Loan assistance with interest rates starting from 8%* p.a. Subject to lender approval and credit assessment.',
  provider: {
    '@type': 'FinancialService',
    name: 'EzyLoan (Dibyansh Associates)',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
  },
  areaServed: 'IN',
  availableLanguage: ['English', 'Hindi'],
  offers: {
    '@type': 'Offer',
    url: `${BASE_URL}/`,
    priceCurrency: 'INR',
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'INR',
      price: 0,
      description: 'Free loan facilitation service. No upfront fees.',
    },
  },
};

export const metadata = {
  ...pageMeta({
    path: '/',
    title: "EzyLoan – Car, Personal & Property Loans in Odisha",
    description:
      "Loan assistance for car, personal, property and commercial vehicle loans in Odisha. Compare offers from partner banks and NBFCs and apply online.",
  }),
  // Homepage title stands alone (no " | EzyLoan" suffix from the template).
  title: { absolute: "EzyLoan – Car, Personal & Property Loans in Odisha" },
};

export default function Home() {
  const loanDetails = {
    interestRate: 'Starting from 8%* p.a.',
    processingFee: 'Up to 2% of loan amount*',
    tenure: '12 – 84 months',
  };
  const eligibility = {
    age: '21 – 60 years',
    income: '₹15,000+ per month*',
    employment: 'Salaried / Self-employed',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(financialProductSchema) }}
      />

      <div className="min-h-screen bg-white">
        <HeroSection page="home" title="Get Loan Assistance*" />
        <Services />
        <WhyChoose />
        <Commitment />

        <LoanDisclosure loanDetails={loanDetails} eligibility={eligibility} className="mt-10 sm:mt-12" />

        <section className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 section-py" aria-labelledby="home-cta-heading">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-blue-400 px-6 py-8 sm:px-10 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-lg">
            <div className="text-center md:text-left">
              <h2 id="home-cta-heading" className="text-2xl sm:text-3xl font-bold">Check your loan eligibility in 30 seconds</h2>
              <p className="mt-2 text-sm sm:text-base text-white/90">Free pre-check · No impact on your credit score* · Offers from 15+ banks &amp; NBFCs</p>
            </div>
            <Link
              href="/apply-now"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-white px-8 py-3 font-semibold text-blue-700 shadow-md hover:bg-blue-50 transition-colors"
            >
              Apply Now
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}