import { Link } from "lucide-react";
import React from "react";

export const metadata = {
  title: "Loan Disclosure & Terms",
  description: "Transparent loan interest rates, charges, EMI examples, eligibility criteria and terms for full regulatory compliance.",
  robots: "index, follow",
  alternates: { canonical: "/loan-disclosure" },
};

export default function LoanDisclosurePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-blue-100">
        
        {/* Page Header */}
        <header className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-blue-700 mb-3">
            Loan Disclosure &amp; Terms
          </h1>
          <p className="text-gray-600">
            Transparent loan details, charges, and policies as required by regulatory guidelines.
          </p>
          {/* ✅ COMPLIANCE: Prominent disclosure banner */}
          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <p className="text-sm text-blue-800 font-medium">
              ⚠️ <strong>Important:</strong> Interest rates, fees, and loan terms vary by lender. 
              Approval is subject to eligibility. Final terms are decided solely by the partner bank/NBFC.
            </p>
          </div>
        </header>

        {/* ✅ REQUIRED COMPLIANCE SUMMARY - Must be visible above the fold */}
        <section className="mb-8" aria-labelledby="compliance-summary">
          <h2 id="compliance-summary" className="text-lg font-semibold text-gray-800 mb-3">
            Key Compliance Disclosures
          </h2>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 rounded-xl">
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-0.5" aria-hidden="true">✓</span>
                <span className="text-gray-700"><strong>Interest rates vary by lender:</strong> Rates range from 10% – 28% p.a. and are determined by partner banks/NBFCs based on your credit profile, income, and loan product.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-0.5" aria-hidden="true">✓</span>
                <span className="text-gray-700"><strong>Processing fees may apply:</strong> Fees up to 3% of loan amount (+ GST) may be charged by lenders. EzyLoan does not charge any upfront fees from borrowers.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-0.5" aria-hidden="true">✓</span>
                <span className="text-gray-700"><strong>Approval is subject to eligibility:</strong> Loan approval depends on age, income, credit score, employment history, documentation, and lender underwriting policy.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2 mt-0.5" aria-hidden="true">✓</span>
                <span className="text-gray-700"><strong>Final terms are decided by the lender:</strong> All loan amounts, interest rates, tenure, fees, and conditions are solely determined by the partner bank/NBFC disbursing the loan.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Key Loan Information */}
        <section className="mb-8" aria-labelledby="key-loan-info">
          <h2 id="key-loan-info" className="text-lg font-semibold text-blue-800 mb-3">
            Key Loan Information
          </h2>
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Interest Rate:</strong> 10% – 28% p.a.* (varies by lender &amp; applicant profile)</li>
              <li><strong>Loan Tenure:</strong> 12 – 60 months (subject to lender policy)</li>
              <li><strong>Processing Fee:</strong> Up to 3% of loan amount + GST* (charged by lender, not EzyLoan)</li>
              <li><strong>Prepayment Charges:</strong> As per lender policy (may apply after lock-in period)</li>
              <li><strong>Late Payment Penalty:</strong> As per lender policy (typically 2-3% per month on overdue amount)</li>
              <li><strong>Loan Type:</strong> Unsecured personal loans / Secured loans (property, vehicle)</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3 italic">
              *All rates, fees, and terms are indicative. Actual offers depend on credit assessment, income verification, and lender underwriting.
            </p>
          </div>
        </section>

        {/* Representative Example */}
        <section className="mb-8" aria-labelledby="representative-example">
          <h2 id="representative-example" className="text-lg font-semibold text-gray-800 mb-3">
            Representative EMI Example (Illustrative Only)
          </h2>
          <div className="bg-green-50 border border-green-200 p-5 rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
              <p><span className="font-medium">Loan Amount:</span> ₹1,00,000</p>
              <p><span className="font-medium">Interest Rate:</span> 14% p.a. (reducing balance)*</p>
              <p><span className="font-medium">Tenure:</span> 36 months</p>
              <p><span className="font-medium">Processing Fee:</span> ₹3,000 (3% + GST)*</p>
              <p><span className="font-medium text-green-700">Approx. Monthly EMI:</span> <b>₹3,420</b>*</p>
              <p><span className="font-medium">Total Interest Payable:</span> ₹23,120*</p>
              <p className="sm:col-span-2"><span className="font-medium">Total Repayment Amount:</span> <b>₹1,23,120</b>* (Principal + Interest)</p>
            </div>
            <p className="text-xs text-gray-500 mt-3 italic">
              * This is a representative example for illustration purposes only. Actual EMI, interest, fees, and repayment amount may vary based on credit profile, lender policy, loan product, and applicable charges. This example does not constitute an offer or guarantee of loan approval.
            </p>
          </div>
        </section>

        {/* About Us */}
        <section className="mb-8" aria-labelledby="about-us">
          <h2 id="about-us" className="text-lg font-semibold text-gray-800 mb-3">
            About EzyLoan
          </h2>
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl">
            <p className="text-gray-700 leading-relaxed">
              <strong>EzyLoan (Dibyansh Associates)</strong> is a loan facilitation service provider (Direct Selling Agent / DSA) and <strong>not a direct lender, bank, or NBFC</strong>. 
              We connect borrowers with our partner banks and NBFCs to help them find suitable loan products. 
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mt-3">
              <li>We do <strong>not provide loans directly</strong> to borrowers.</li>
              <li>We do <strong>not charge any hidden fees or upfront payments</strong> from borrowers for loan processing.</li>
              <li>We do <strong>not guarantee loan approval</strong> – all decisions are made solely by partner lenders.</li>
              <li>All loans are disbursed directly by partner banks/NBFCs into the borrower's verified bank account.</li>
            </ul>
          </div>
        </section>

        {/* Eligibility Criteria */}
        <section className="mb-8" aria-labelledby="eligibility">
          <h2 id="eligibility" className="text-lg font-semibold text-gray-800 mb-3">
            General Eligibility Criteria*
          </h2>
          <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Age:</strong> 21 – 60 years (salaried), 21 – 65 years (self-employed) at loan maturity</li>
              <li><strong>Minimum Monthly Income:</strong> ₹15,000+ (varies by lender &amp; city)</li>
              <li><strong>Credit Score:</strong> 650+ preferred (not mandatory; affects rate &amp; approval)</li>
              <li><strong>Employment:</strong> Minimum 1 year total work experience, 6 months with current employer</li>
              <li><strong>Documentation:</strong> KYC (PAN, Aadhaar), Income Proof (salary slips/ITR), Bank Statements (3-6 months), Address Proof</li>
            </ul>
            <p className="text-gray-600 text-sm mt-3 italic">
              *Final eligibility, loan amount, and terms depend on comprehensive assessment of income, credit history, repayment capacity, existing obligations, employment stability, and lender-specific underwriting policies. Criteria vary by lender and loan product.
            </p>
          </div>
        </section>

        {/* Important Disclosures */}
        <section className="mb-8" aria-labelledby="important-disclosures">
          <h2 id="important-disclosures" className="text-lg font-semibold text-gray-800 mb-3">
            Important Disclosures
          </h2>
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl">
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Loan approval is not guaranteed:</strong> All applications are subject to lender's credit assessment, documentation verification, and internal underwriting policy.</li>
              <li><strong>Variable terms:</strong> Interest rates, tenure, processing fees, prepayment charges, and other terms vary by lender, loan product, applicant profile, and market conditions.</li>
              <li><strong>No upfront fees:</strong> EzyLoan does not charge any fees from borrowers before loan disbursement. Beware of fraudsters asking for advance payments.</li>
              <li><strong>Direct disbursement:</strong> All approved loans are disbursed directly by partner banks/NBFCs into the borrower's verified bank account – never to third parties.</li>
              <li><strong>Read before signing:</strong> Borrowers are strongly advised to carefully read and understand all terms, conditions, fees, and repayment obligations before accepting any loan offer.</li>
              <li><strong>Data privacy:</strong> By submitting an application, you consent to sharing your details with partner lenders for assessment. See our <a href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</a>.</li>
            </ul>
          </div>
        </section>

        {/* Risk Disclaimer */}
        <section className="mb-8" aria-labelledby="risk-disclaimer">
          <h2 id="risk-disclaimer" className="text-lg font-semibold text-gray-800 mb-3">
            ⚠️ Risk Disclaimer: Borrow Responsibly
          </h2>
          <div className="bg-red-50 border border-red-200 p-5 rounded-xl">
            <p className="text-gray-700 leading-relaxed">
              <strong>Loans create a legal financial obligation.</strong> Before availing any loan, please ensure you have adequate and stable repayment capacity. 
              Missing EMIs may:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mt-3 ml-4">
              <li>Negatively impact your CIBIL/credit score</li>
              <li>Attract late payment penalties and increased interest</li>
              <li>Lead to recovery proceedings as per applicable laws</li>
              <li>Affect your ability to obtain credit in the future</li>
            </ul>
            <p className="text-gray-700 mt-3 font-medium">
              Please borrow only what you need and can comfortably repay. If you're facing financial difficulty, contact your lender immediately to explore restructuring options.
            </p>
          </div>
        </section>

        {/* Contact & Grievance Redressal */}
        <section className="mb-8" aria-labelledby="contact">
          <h2 id="contact" className="text-lg font-semibold text-gray-800 mb-3">
            Contact &amp; Grievance Redressal
          </h2>
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-3 text-gray-700">
            <p><span className="font-medium">Customer Support Email:</span> <a href="mailto:care@ezyloan.co.in" className="text-blue-600 hover:underline">care@ezyloan.co.in</a></p>
            <p><span className="font-medium">Phone / WhatsApp:</span> <a href="tel:+916372977626" className="text-blue-600 hover:underline">+91 6372977626</a></p>
            <p><span className="font-medium">Office Address:</span> 1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur, Cuttack, Odisha – 753011</p>
            <p><span className="font-medium">Business Hours:</span> Monday – Saturday, 10:00 AM – 7:00 PM IST</p>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Grievance Redressal:</strong> If you have a complaint, please email care@ezyloan.co.in with subject "Grievance – [Your Name/Application ID]". 
                We aim to resolve all grievances within 24-48 business hours.
              </p>
            </div>
          </div>
        </section>

        {/* Regulatory Information */}
        <section className="mb-8" aria-labelledby="regulatory">
          <h2 id="regulatory" className="text-lg font-semibold text-gray-800 mb-3">
            Regulatory Information
          </h2>
          <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl">
            <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
              <li>EzyLoan (Dibyansh Associates) operates as a Direct Selling Agent (DSA) for partner banks/NBFCs.</li>
              <li>We are not an RBI-registered NBFC. All lending activities are performed by our regulated partner institutions.</li>
              <li>Partner lenders are regulated by the Reserve Bank of India (RBI) and/or other applicable financial authorities.</li>
              <li>For complaints against partner lenders, you may contact the RBI Ombudsman: <a href="https://cms.rbi.org.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://cms.rbi.org.in</a></li>
            </ul>
          </div>
        </section>

        {/* Last Updated & Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Last Updated: {new Date().toLocaleDateString('en-IN', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })}
          </p>
          {/* <p className="text-xs text-gray-500 mt-1">
            EzyLoan (Dibyansh Associates) | CIN: [To be added] | GST: [To be added]
          </p> */}
          <p className="text-xs text-gray-400 mt-3">
          <li>• <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link></li>
            <li>• <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">Terms of Service</Link></li>
            <li>• <Link href="/loan-disclosure" className="text-blue-600 hover:underline">Loan Disclosures</Link></li>
          </p>
        </div>

      </div>
    </div>
  );
}