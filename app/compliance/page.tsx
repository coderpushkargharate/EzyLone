// app/compliance/page.tsx
import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compliance & Disclosure',
  description: 'G2RS compliant disclosure page. EzyLoan is a loan facilitation service provider, not a direct lender. Full transparency on fees, partners, and data usage.',
  robots: 'index, follow',
  alternates: { canonical: '/compliance' },
};

export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-blue-100">
        
        {/* Header */}
        <header className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-blue-700 mb-3">
            Compliance & Disclosure
          </h1>
          <p className="text-gray-600">
            <time dateTime={new Date().toISOString().split('T')[0]}>
              Last Updated: {new Date().toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </time>
          </p>
          <p className="mt-3 text-sm text-gray-600">
            This page contains mandatory disclosures as required by G2 Risk Solutions (G2RS) and Google Ads policies for financial services advertising in India.
          </p>
        </header>

        {/* ✅ COMPLIANCE BANNER - Prominent */}
        <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg" role="note" aria-label="Important service disclosure">
          <p className="text-sm text-blue-800 font-medium">
            ⚠️ <strong>Important:</strong> EzyLoan is a loan facilitation service provider (Direct Selling Agent / DSA). 
            We are <strong>NOT a direct lender, bank, NBFC, investment advisor, or trading platform</strong>. 
            All loan decisions, interest rates, and terms are determined solely by our partner financial institutions.
          </p>
        </div>

        {/* 1. Business Information */}
        <section className="mb-8" aria-labelledby="section-business">
          <h2 id="section-business" className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            1. Business Information
          </h2>
          <div className="bg-gray-50 p-5 rounded-lg space-y-3">
            <p><span className="font-semibold text-gray-700">Business Name:</span> EzyLoan (operated by Dibyansh Associates)</p>
            <p><span className="font-semibold text-gray-700">Nature of Business:</span> Loan Facilitation Service Provider (Direct Selling Agent / DSA) for Banks & NBFCs</p>
            <p><span className="font-semibold text-gray-700">Registered Address:</span> 1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur, Cuttack, Odisha – 753011, India</p>
            <p><span className="font-semibold text-gray-700">Contact Phone:</span> <a href="tel:+916372977626" className="text-blue-600 hover:underline">+91 63729 77626</a></p>
            <p><span className="font-semibold text-gray-700">Contact Email:</span> <a href="mailto:care@ezyloan.co.in" className="text-blue-600 hover:underline">care@ezyloan.co.in</a></p>
            <p><span className="font-semibold text-gray-700">Website:</span> <a href="https://www.ezyloan.co.in" className="text-blue-600 hover:underline">www.ezyloan.co.in</a></p>
            <p><span className="font-semibold text-gray-700">GST Number:</span> <span className="font-mono bg-gray-200 px-2 py-1 rounded">21CNXPM8317C1ZV</span></p>
          </div>
        </section>

        {/* 2. Important Declaration */}
        <section className="mb-8" aria-labelledby="section-declaration">
          <h2 id="section-declaration" className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            2. Important Declaration
          </h2>
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg">
            <p className="font-semibold text-amber-800 mb-3">Please read carefully:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>EzyLoan is NOT a lender:</strong> We do not sanction, disburse, or collect loans. All loan products are provided by our partner banks and NBFCs.</li>
              <li><strong>NO Investment Advisory:</strong> We do NOT provide investment advice, portfolio management, or financial planning services.</li>
              <li><strong>NO Trading Services:</strong> We do NOT deal in stocks, mutual funds, securities, derivatives, cryptocurrency, or any trading/investment products.</li>
              <li><strong>NO Wealth Management:</strong> We are not a SEBI-registered investment advisor, PMS provider, or wealth management firm.</li>
            </ul>
            <p className="mt-4 text-sm text-amber-700 italic">
              EzyLoan solely facilitates loan applications between borrowers and RBI-regulated lending institutions.
            </p>
          </div>
        </section>

        {/* 3. Loan Disclosure */}
        <section className="mb-8" aria-labelledby="section-loan-disclosure">
          <h2 id="section-loan-disclosure" className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            3. Loan Disclosure
          </h2>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="font-medium text-blue-800 mb-2">Key Loan Terms:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                <li><strong>Loan Approval:</strong> Subject to eligibility criteria, credit assessment, documentation, and partner lender's underwriting policy. Submission does not guarantee approval.</li>
                <li><strong>Interest Rates:</strong> Vary by lender, loan product, applicant profile, and market conditions. Indicative range: 10% – 28% p.a.*</li>
                <li><strong>Processing Fees:</strong> May apply as per lender policy (typically 0% – 3% of loan amount + GST)*.</li>
                <li><strong>Final Terms:</strong> Interest rate, tenure, fees, prepayment charges, and all other terms are solely decided by the disbursing bank/NBFC.</li>
                <li><strong>No Guarantee:</strong> EzyLoan does not guarantee loan approval, specific interest rates, or disbursement timelines.</li>
              </ul>
              <p className="mt-3 text-xs text-blue-600 italic">
                *All rates and fees are indicative. Actual offers depend on comprehensive assessment by partner lenders.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Fee Disclosure */}
        <section className="mb-8" aria-labelledby="section-fees">
          <h2 id="section-fees" className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            4. Fee Disclosure
          </h2>
          <div className="bg-green-50 border border-green-200 p-5 rounded-lg">
            <p className="font-semibold text-green-800 mb-3">✅ What We Do NOT Charge:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
              <li>No upfront fees from borrowers for application processing</li>
              <li>No hidden charges or administrative fees</li>
              <li>No payment required to "guarantee" loan approval</li>
            </ul>
            <p className="font-semibold text-green-800 mb-2">ℹ️ Potential Charges by Lenders:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li>Processing fee (0% – 3% + GST) – charged by lender upon approval</li>
              <li>Prepayment/foreclosure charges – as per lender policy</li>
              <li>Late payment penalties – as per loan agreement</li>
              <li>Stamp duty, legal charges – as applicable by state/lender</li>
            </ul>
            <p className="mt-3 text-sm text-green-700 italic">
              ⚠️ Fraud Alert: If anyone asks for advance payment for "processing", "verification", or "guaranteed approval", it is a scam. Report immediately to care@ezyloan.co.in.
            </p>
          </div>
        </section>

              {/* 5. Lending Partners */}
        <section className="mb-8" aria-labelledby="section-partners">
          <h2 id="section-partners" className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            5. Lending Partners
          </h2>
          <p className="text-gray-600 mb-6">
            EzyLoan connects borrowers with RBI-regulated partner financial institutions. Our partner network includes (illustrative list):
          </p>
          
          {/* Banks Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Banks
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Bank of Baroda',
                'Bank of India',
                'IDFC FIRST Bank Limited',
                'AU Small Finance Bank Limited',
                'ESAF Small Finance Bank Limited',
                'ICICI Bank Limited',
                'Kotak Mahindra Bank Limited'
              ].map((partner, index) => (
                <div key={`bank-${index}`} className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                  <span className="text-gray-700 text-sm">{partner}</span>
                </div>
              ))}
            </div>
          </div>

          {/* NBFCs Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              NBFCs &amp; Financial Institutions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'IndoStar Capital Finance Limited',
                'Tata Capital Limited',
                'Bajaj Finance Limited',
                'Hero FinCorp Limited',
                'HDB Financial Services Limited',
                'Shriram Finance Limited',
                'Arka Fincap Limited',
                'Purple Finance Limited',
                'ICICI Home Finance Company Limited',
                'IKF Finance Limited',
                'Piramal Finance Limited',
                'Cholamandalam Investment and Finance Company Limited',
                'Aditya Birla Finance Limited'
              ].map((partner, index) => (
                <div key={`nbfc-${index}`} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                  <span className="text-gray-700 text-sm">{partner}</span>
                </div>
              ))}
            </div>
          </div>
          
          <p className="mt-6 text-xs text-gray-500 italic">
            *Partner list is indicative and subject to change. Final loan offer depends on lender availability in your location and eligibility criteria.
          </p>
        </section>

        {/* 6. Grievance Officer */}
        <section className="mb-8" aria-labelledby="section-grievance">
          <h2 id="section-grievance" className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            6. Grievance Redressal
          </h2>
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg">
            <p className="font-semibold text-gray-800 mb-3">Grievance Officer Details:</p>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-medium">Email:</span> <a href="mailto:care@ezyloan.co.in" className="text-blue-600 hover:underline">care@ezyloan.co.in</a></p>
              <p><span className="font-medium">Phone:</span> <a href="tel:+919777243300" className="text-blue-600 hover:underline">+91 97772 43300</a></p>
              <p><span className="font-medium">Response Time:</span> Within 48 business hours</p>
              <p><span className="font-medium">Escalation:</span> If unresolved, you may approach the RBI Ombudsman: <a href="https://cms.rbi.org.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://cms.rbi.org.in</a></p>
            </div>
            <p className="mt-4 text-xs text-gray-500">
              As per Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.
            </p>
          </div>
        </section>

        {/* 7. Data Privacy */}
        <section className="mb-8" aria-labelledby="section-privacy">
          <h2 id="section-privacy" className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            7. Data Privacy & Usage
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>How We Use Your Data:</strong> Personal and financial information collected via our platform is used <strong>solely for loan application facilitation</strong>, including:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Verification of identity and eligibility</li>
              <li>Sharing with partner lenders for loan assessment</li>
              <li>Communication regarding application status</li>
              <li>Compliance with RBI, IT Act, and other regulatory requirements</li>
            </ul>
            <p className="font-semibold text-gray-800 mt-3">❌ What We Do NOT Do With Your Data:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Do NOT share data for investment, trading, or wealth management purposes</li>
              <li>Do NOT sell, rent, or trade personal information to third parties</li>
              <li>Do NOT use data for unsolicited marketing without explicit consent</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              For comprehensive details, please review our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </section>

        {/* 8. Disclaimer */}
        <section className="mb-8" aria-labelledby="section-disclaimer">
          <h2 id="section-disclaimer" className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            8. General Disclaimer
          </h2>
          <div className="bg-red-50 border border-red-200 p-5 rounded-lg">
            <p className="text-gray-700 leading-relaxed">
              <strong>EzyLoan (Dibyansh Associates) is a loan facilitation service provider (DSA) and NOT a direct lender, bank, NBFC, investment advisor, or trading platform.</strong> 
              We connect borrowers with RBI-regulated partner financial institutions. All loan approvals, interest rates, fees, tenure, and terms are solely determined by partner lenders 
              based on credit assessment, income verification, documentation, and underwriting policy. 
              Submission of an application does not guarantee approval. Borrowing involves financial risk; please borrow responsibly.
            </p>
          </div>
        </section>

        {/* Related Policies */}
        <section className="mb-8 pt-6 border-t border-gray-200" aria-labelledby="section-related">
          <h2 id="section-related" className="text-xl font-bold text-gray-800 mb-4">
            Related Policies
          </h2>
          <ul className="flex flex-wrap gap-3 text-sm">
            <li>• <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link></li>
            <li>• <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">Terms of Service</Link></li>
            <li>• <Link href="/loan-disclosure" className="text-blue-600 hover:underline">Loan Disclosures</Link></li>
          </ul>
        </section>

        {/* Acceptance Notice */}
        <div className="mt-10 pt-6 border-t-2 border-blue-200 bg-blue-50 rounded-xl p-5">
          <p className="text-sm text-blue-900 font-medium">
            ✅ By using EzyLoan services, you acknowledge that you have read, understood, and agreed to this Compliance & Disclosure statement.
          </p>
        </div>

      </div>

      {/* Footer Disclaimer */}
      <div className="mt-12 py-6 bg-gray-100 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} EzyLoan (Dibyansh Associates). All rights reserved. | GST: 21CNXPM8317C1ZV
          </p>
          <p className="text-xs text-gray-500 mt-1">
            This disclosure complies with G2 Risk Solutions (G2RS), Google Ads Financial Services policies, RBI DSA guidelines, and applicable Indian law.
          </p>
        </div>
      </div>
    </div>
  );
}