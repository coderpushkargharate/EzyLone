import HeroSection from '@/components/HeroSection';
import Services from '@/components/Services';
import SEO from '@/components/SEO';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'EzyLoan - Quick & Easy Loans Online | Personal, Business, Car Loans',
  description:
    'Get loan assistance with interest rates starting from 10%* p.a. | Tenure 12-60 months | Quick approval* | Serving customers across India. *Subject to lender approval.',
  robots: 'index, follow',
  alternates: { canonical: '/' },
};

export default function Home() {
  const loanDetails = {
    interestRate: 'Starting from 10%* p.a.',
    processingFee: 'Up to 3% of loan amount*',
    tenure: '12 – 60 months',
  };
  const eligibility = {
    age: '21 – 60 years',
    income: '₹15,000+ per month*',
    employment: 'Salaried / Self-employed',
  };

  return (
    <>
      <SEO
        title="EzyLoan - Quick & Easy Loans Online*"
        description="Loan assistance with interest rates starting from 10%* p.a. Subject to lender approval and credit assessment."
        canonical="/"
        keywords={[
          'personal loan', 'business loan', 'car loan',
          'loan facilitator', 'DSA', 'NBFC partner', '10% interest rate',
        ]}
        image="/og-home.jpg"
        pageType="financialproduct"
        loanType="Loan Facilitation"
      />

      <main className="min-h-screen bg-white" role="main">
        <HeroSection page="home" title="Get Loan Assistance*" />
        <Services />

        <section
          className="py-8 bg-white"
          aria-labelledby="eligibility-heading"
          style={{ minHeight: '320px', contain: 'layout' }}
        >
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-2xl font-bold mb-2 text-center">
              <h2
                id="eligibility-heading"
                className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent"
              >
                Check Your Eligibility*
              </h2>
              <p className="text-gray-600 mt-2 text-base font-normal">
                Quick pre-check • No impact on credit score*
              </p>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mt-6"
              style={{ minHeight: '120px' }}
            >
              <div className="glass-prism bg-blue-50 rounded-2xl p-6 text-center">
                <p className="font-semibold text-gray-700">Age</p>
                <p className="text-blue-600 font-bold text-lg mt-1">{eligibility.age}</p>
              </div>
              <div className="glass-prism bg-green-50 rounded-2xl p-6 text-center">
                <p className="font-semibold text-gray-700">Income</p>
                <p className="text-green-600 font-bold text-lg mt-1">{eligibility.income}</p>
              </div>
              <div className="glass-prism bg-purple-50 rounded-2xl p-6 text-center">
                <p className="font-semibold text-gray-700">Employment</p>
                <p className="text-purple-600 font-bold text-lg mt-1">{eligibility.employment}</p>
              </div>
            </div>

            <div className="text-center mt-6">
              <Link
                href="/apply-now"
                className="glass-prism inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </Link>
              <p className="text-xs text-gray-500 mt-3">*Subject to approval • Terms apply</p>
            </div>
          </div>
        </section>

        <div className="px-4 sm:px-6 lg:px-8 mt-4">
          <div className="max-w-[85rem] mx-auto px-4 py-3 bg-amber-50 border-l-4 border-amber-500" role="note">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-amber-900 font-medium">
                <strong>⚠️ Important:</strong> EzyLoan is a loan facilitation service provider (DSA),{' '}
                <strong>not a direct lender</strong>. All loan decisions are made by partner banks/NBFCs*.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 mt-4">
          <div className="max-w-[85rem] mx-auto">
            <div className="glass-prism bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-4 sm:p-5 lg:p-6 mb-6 text-white">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs opacity-90">Interest Rate</p>
                  <p className="text-lg font-bold">{loanDetails.interestRate}</p>
                  <p className="text-xs opacity-80 mt-1">Competitive rates*</p>
                </div>
                <div>
                  <p className="text-xs opacity-90">Processing Fee</p>
                  <p className="text-lg font-bold">{loanDetails.processingFee}</p>
                  <p className="text-xs opacity-80 mt-1">Transparent pricing</p>
                </div>
                <div>
                  <p className="text-xs opacity-90">Loan Tenure</p>
                  <p className="text-lg font-bold">{loanDetails.tenure}</p>
                  <p className="text-xs opacity-80 mt-1">Flexible options</p>
                </div>
              </div>
              <p className="text-xs text-center mt-3 opacity-80">
                *Terms apply. Rates subject to credit assessment and lender approval.
              </p>
            </div>
          </div>
        </div>

        <footer className="bg-white border-t border-gray-200 py-6" role="contentinfo">
          <div className="max-w-[85rem] mx-auto px-4 text-center">
            <p className="text-xs text-gray-600">
              <strong>Disclaimer:</strong> EzyLoan is a loan facilitation service provider (DSA) and{' '}
              <strong>not a direct lender</strong>. All loan approvals, rates*, fees*, and terms* are
              determined by partner lenders.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              © {new Date().getFullYear()} EzyLoan. |{' '}
              <Link href="/terms-and-conditions" className="hover:underline">
                Terms
              </Link>{' '}
              |{' '}
              <Link href="/privacy-policy" className="hover:underline">
                Privacy
              </Link>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}