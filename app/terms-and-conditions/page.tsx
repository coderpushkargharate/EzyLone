import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Terms & Conditions",
  description: "Read the terms and conditions for using EzyLoan services. EzyLoan is a loan facilitation platform, not a direct lender.",
  robots: "index, follow",
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsPage() {
  // ✅ Structured Data for TermsOfService Schema - Fixed trailing spaces
  const termsSchema = {
    "@context": "https://schema.org",
    "@type": "TermsOfService",
    "name": "Terms & Conditions - EzyLoan",
    "description": "Terms of service for EzyLoan, a loan facilitation platform connecting borrowers with partner banks and NBFCs in India.",
    "url": "https://ezyloan.co.in/terms",
    "inLanguage": "en-IN",
    "provider": {
      "@type": "Organization",
      "name": "EzyLoan (Dibyansh Associates)",
      "url": "https://ezyloan.co.in",
      "logo": "https://ezyloan.co.in/logo.webp",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-6372977626",
        "contactType": "Customer Service",
        "email": "care@ezyloan.co.in",
        "areaServed": "IN"
      }
    },
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "mainEntity": {
      "@type": "WebPage",
      "name": "Terms & Conditions",
      "about": "User obligations, service limitations, liability disclaimers, and dispute resolution"
    }
  };

  // ✅ Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "EzyLoan (Dibyansh Associates)",
    "url": "https://ezyloan.co.in",
    "description": "EzyLoan is a loan facilitation service provider (DSA) connecting borrowers with partner banks and NBFCs across India. We are not a direct lender.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur",
      "addressLocality": "Cuttack",
      "postalCode": "753011",
      "addressRegion": "Odisha",
      "addressCountry": "IN"
    }
  };

  return (
    <main 
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16"
      itemScope 
      itemType="https://schema.org/WebPage"
      role="main"
    >
      {/* ✅ Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-blue-100">
        
        {/* Header with Machine-Readable Date */}
        <header className="mb-8 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-blue-700 mb-3">
            Terms & Conditions
          </h1>
          <p className="text-gray-600">
            <time dateTime={new Date().toISOString().split('T')[0]}>
              Last Updated: {new Date().toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </time>
            {/* <span className="ml-2 text-gray-400">| Version 2.1</span> */}
          </p>
          <p className="mt-3 text-gray-600">
            By using EzyLoan services, you agree to comply with and be bound by the following terms and conditions. 
            Please read them carefully before using our platform.
          </p>
        </header>

        {/* ✅ COMPLIANCE BANNER - Prominent DSA/Lender Disclosure */}
        <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg" role="note" aria-label="Important service disclosure">
          <p className="text-sm text-amber-800">
            <strong>⚠️ Important Disclosure:</strong> EzyLoan (operated by Dibyansh Associates) is a <strong>loan facilitation service provider (Direct Selling Agent / DSA)</strong> and <strong>NOT a direct lender, bank, or NBFC</strong>. 
            We connect borrowers with partner financial institutions. All loan approvals, interest rates*, fees*, tenure, and terms* are solely determined by partner lenders. 
            <Link href="/loan-disclosure" className="underline hover:text-amber-900 ml-1">View full loan disclosures</Link>.
          </p>
        </div>

        {/* 1. Introduction */}
        <Section title="1. Introduction" id="section-intro">
          <p>
            By accessing or using EzyLoan (operated by Dibyansh Associates), you agree to be bound by these Terms & Conditions. 
            If you disagree with any part of these terms, please do not use our services.
          </p>
          <p className="mt-2">
            EzyLoan is a digital loan facilitation platform that connects borrowers with partner banks and Non-Banking Financial Companies (NBFCs). 
            We are <strong>not a lender, NBFC, or financial institution</strong> and do not sanction, disburse, or collect loans.
          </p>
          <p className="mt-2 text-sm text-gray-500 italic">
            *All rates, fees, and terms are subject to lender policy, credit assessment, and regulatory approval.
          </p>
        </Section>

        {/* 2. Services Provided */}
        <Section title="2. Services Provided" id="section-services">
          <p>
            EzyLoan provides the following facilitation services:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
            <li>Loan application facilitation and documentation support</li>
            <li>Connecting users with RBI-regulated partner banks/NBFCs</li>
            <li>EMI calculator and loan comparison tools (illustrative estimates only*)</li>
            <li>Financial education and guidance resources</li>
            <li>Application status tracking and customer support</li>
          </ul>
          <p className="mt-3 text-gray-600 font-medium">
            ❌ We do NOT: sanction loans, disburse funds, collect EMIs, set interest rates, or guarantee approval.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            *Calculator results are estimates. Actual terms determined by lender.
          </p>
        </Section>

        {/* 3. User Responsibilities */}
        <Section title="3. User Responsibilities" id="section-responsibilities">
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Provide accurate, complete, and up-to-date information during application</li>
            <li>Maintain confidentiality of your account credentials and OTPs</li>
            <li>Use the platform only for lawful purposes and legitimate loan applications</li>
            <li>Review all loan offers, terms, and disclosures before acceptance</li>
            <li>Repay loans as per agreed schedules with lending partners</li>
            <li>Notify us immediately of any unauthorized account activity</li>
          </ul>
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ <strong>Fraud Warning:</strong> Providing false information, forged documents, or misrepresenting facts may result in: 
              (a) immediate application rejection, (b) legal action under Indian Penal Code, (c) blacklisting with partner institutions, 
              and (d) reporting to credit bureaus. EzyLoan does not charge any upfront fees—beware of fraudsters asking for advance payments.
            </p>
          </div>
        </Section>

        {/* 4. Loan Approval & Disbursement */}
        <Section title="4. Loan Approval, Terms & Disbursement" id="section-approval">
          <p>
            Loan approval is <strong>not guaranteed</strong> and depends on multiple factors including:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
            <li>Credit score (CIBIL/Experian/Equifax) and credit history</li>
            <li>Income verification, repayment capacity, and employment stability</li>
            <li>Documentation completeness and authenticity</li>
            <li>Lender's internal risk policies, portfolio guidelines, and regulatory limits</li>
            <li>Property/vehicle valuation (for secured loans)</li>
          </ul>
          <p className="mt-3 text-gray-600">
            All loans are disbursed <strong>directly by partner banks/NBFCs</strong> into the borrower's verified bank account. 
            EzyLoan has no control over approval decisions, interest rates*, processing fees*, tenure, or disbursement timelines.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            *Final rates and fees disclosed by lender before loan acceptance. Subject to change.
          </p>
        </Section>

        {/* 5. Fees, Charges & Payments */}
        <Section title="5. Fees, Charges & Payment Obligations" id="section-fees">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="font-medium text-blue-800 mb-2">Potential Charges (as per lender policy)*:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
              <li><strong>Processing Fee:</strong> 0% – 3% of loan amount + GST (charged by lender at disbursal)</li>
              <li><strong>Prepayment/Foreclosure Charges:</strong> 0% – 4% as per lender policy (may apply after lock-in)</li>
              <li><strong>Late Payment Penalty:</strong> 2% – 3% per month on overdue amount + GST</li>
              <li><strong>Stamp Duty & Legal Charges:</strong> As applicable by state law and lender</li>
              <li><strong>Insurance:</strong> Optional credit life/asset insurance as offered by lender</li>
            </ul>
          </div>
          <p className="mt-3 text-gray-600 font-medium">
            ✅ <strong>EzyLoan does not charge any upfront fees from borrowers.</strong> 
            All fees are disclosed in writing by the lender before loan acceptance. 
            If anyone asks for advance payment for "processing", "verification", or "guaranteed approval", it is a scam—report immediately to care@ezyloan.co.in.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            *Charges vary by lender, loan product, and applicant profile. Confirm in your loan agreement.
          </p>
        </Section>

        {/* 6. Limitation of Liability */}
        <Section title="6. Limitation of Liability" id="section-liability">
          <p>
            To the maximum extent permitted by Indian law, EzyLoan and its affiliates shall not be liable for:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
            <li>Loan approval/rejection decisions made by partner lenders</li>
            <li>Changes in interest rates*, fees*, terms, or policies by lending partners</li>
            <li>Delays in documentation, verification, credit assessment, or disbursement</li>
            <li>Any financial loss, credit score impact, or legal consequences arising from loan availing or repayment</li>
            <li>Technical errors, platform downtime, data transmission issues, or third-party service failures</li>
            <li>Actions or omissions of partner lenders, credit bureaus, or regulatory authorities</li>
          </ul>
          <p className="mt-3 text-gray-600">
            Users agree to hold EzyLoan harmless from any claims, damages, or losses arising out of their use of the platform 
            or transactions with lending partners, except in cases of gross negligence or willful misconduct by EzyLoan.
          </p>
        </Section>

        {/* 7. Privacy & Data Usage */}
        <Section title="7. Privacy, Consent & Data Usage" id="section-privacy">
          <p>
            By using EzyLoan, you expressly consent to:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
            <li>Collection, verification, and processing of personal, financial, KYC, and device information</li>
            <li>Sharing of your data with partner banks/NBFCs, credit bureaus, and service providers for loan processing</li>
            <li>Use of your information for service improvement, communication, fraud prevention, and regulatory compliance</li>
            <li>Automated decision-making and profiling for pre-screening applications (subject to human review upon request)</li>
          </ul>
          <p className="mt-2">
            For comprehensive details on data handling, your rights, and grievance redressal, please review our 
            <Link href="/privacy" className="text-blue-600 hover:underline font-medium ml-1">Privacy Policy</Link>.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            You may withdraw consent for marketing communications anytime via email or account settings. 
            Withdrawal of core processing consent may affect service availability.
          </p>
        </Section>

        {/* 8. Changes to Terms */}
        <Section title="8. Modifications to These Terms" id="section-changes">
          <p>
            EzyLoan reserves the right to modify these Terms & Conditions at any time without prior notice. 
            Material changes will be notified via email or prominent notice on our website at least 7 days in advance.
          </p>
          <p className="mt-2 text-gray-600">
            Changes become effective on the "Last Updated" date shown at the top of this page. 
            Your continued use of the platform after changes constitutes acceptance of the updated terms. 
            We encourage you to review this page periodically.
          </p>
        </Section>

        {/* 9. Governing Law & Dispute Resolution */}
        <Section title="9. Governing Law, Jurisdiction & Dispute Resolution" id="section-disputes">
          <p>
            These terms shall be governed by and construed in accordance with the laws of the Republic of India. 
            Any disputes shall be subject to the exclusive jurisdiction of courts in Cuttack, Odisha, India.
          </p>
          <p className="mt-3">
            <strong>Grievance Redressal:</strong> For complaints regarding our services, contact our Grievance Officer:
          </p>
          <ul className="list-none space-y-1 mt-2 text-gray-700">
            <li>📧 Email: <a href="mailto:care@ezyloan.co.in" className="text-blue-600 hover:underline">care@ezyloan.co.in</a></li>
            <li>📞 Phone: <a href="tel:+916372977626" className="text-blue-600 hover:underline">+91 63729 77626</a></li>
            <li>⏱ Response Time: Within 15 business days as per IT Rules, 2021</li>
          </ul>
          <p className="mt-3 text-sm text-gray-600">
            <strong>Regulatory Escalation:</strong> If unresolved, you may approach the RBI Ombudsman: 
            <a href="https://cms.rbi.org.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">https://cms.rbi.org.in</a>
          </p>
        </Section>

        {/* 10. Regulatory Compliance */}
        <Section title="10. Regulatory Compliance & RBI Guidelines" id="section-regulatory">
          <p>
            EzyLoan operates in compliance with applicable Indian regulations including:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
            <li>Reserve Bank of India (RBI) guidelines for Direct Selling Agents (DSAs)</li>
            <li>Information Technology Act, 2000 and Rules thereunder</li>
            <li>Digital Personal Data Protection Act, 2023 (when applicable)</li>
            <li>Prevention of Money Laundering Act (PMLA) and KYC/AML norms</li>
            <li>Consumer Protection Act, 2019</li>
          </ul>
          <p className="mt-3 text-gray-600">
            Partner lenders are regulated by RBI and/or other financial authorities. 
            EzyLoan does not represent or warrant the regulatory status of partner institutions.
          </p>
        </Section>

        {/* 11. No Financial Advice */}
        <Section title="11. No Financial, Legal or Tax Advice" id="section-advice">
          <p>
            Content provided on EzyLoan is for informational and educational purposes only* and does not constitute:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
            <li>Financial advice, investment recommendation, or credit counseling</li>
            <li>Legal advice regarding loan agreements, rights, or obligations</li>
            <li>Tax advice regarding loan proceeds, interest deductions, or implications</li>
          </ul>
          <p className="mt-3 text-gray-600">
            You should consult qualified professionals (CA, lawyer, financial advisor) for personalized advice. 
            Loan decisions should be based on your individual financial situation and goals.
          </p>
          <p className="mt-2 text-xs text-gray-500 italic">
            *Calculator tools provide illustrative estimates only. Not a substitute for professional advice.
          </p>
        </Section>

        {/* 12. Contact Information */}
        <Section title="12. Contact Information" id="section-contact">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-2 text-gray-700">
            <p><span className="font-medium">Legal Entity:</span> Dibyansh Associates (d/b/a EzyLoan)</p>
            {/* <p><span className="font-medium">CIN:</span> [To be added]</p> */}
            <p><span className="font-medium">GST:</span> [21CNXPM8317C1ZV
]</p>
            <p><span className="font-medium">Email:</span> <a href="mailto:care@ezyloan.co.in" className="text-blue-600 hover:underline">care@ezyloan.co.in</a></p>
            <p><span className="font-medium">Phone:</span> <a href="tel:+916372977626" className="text-blue-600 hover:underline">+91 63729 77626</a></p>
            <p><span className="font-medium">Address:</span> 1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur, Cuttack, Odisha – 753011, India</p>
            <p><span className="font-medium">Business Hours:</span> Monday – Saturday, 10:00 AM – 7:00 PM IST</p>
          </div>
        </Section>

        {/* Related Policies Navigation */}
        <nav className="mt-10 pt-6 border-t border-gray-200" aria-label="Related policies">
          <p className="text-sm font-medium text-gray-700 mb-3">Related Policies:</p>
          <ul className="flex flex-wrap gap-3 text-sm">
       <li>• <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link></li>
            <li>• <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">Terms of Service</Link></li>
            <li>• <Link href="/loan-disclosure" className="text-blue-600 hover:underline">Loan Disclosures</Link></li>
          </ul>
        </nav>

        {/* Acceptance Notice */}
        <div className="mt-10 pt-6 border-t-2 border-blue-200 bg-blue-50 rounded-xl p-5">
          <p className="text-sm text-blue-900 font-medium">
            ✅ <strong>Acknowledgement:</strong> By proceeding with any loan application on EzyLoan, 
            you acknowledge that you have read, understood, and agreed to these Terms & Conditions, 
            our <Link href="/privacy" className="underline">Privacy Policy</Link>, and the loan disclosures 
            provided by partner lenders.
          </p>
        </div>

      </div>

      {/* ✅ GLOBAL FOOTER DISCLAIMER */}
      <footer className="mt-12 py-6 bg-gray-100 border-t border-gray-200" role="contentinfo">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} EzyLoan (Dibyansh Associates). All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            These terms comply with the Information Technology Act, 2000, RBI DSA guidelines, and applicable Indian law.
          </p>
        
        </div>
      </footer>

    </main>
  );
}

// Reusable Section Component with proper TypeScript typing and accessibility
interface SectionProps {
  title: string;
  children: React.ReactNode;
  id?: string;
}

function Section({ title, children, id }: SectionProps) {
  return (
    <section className="mb-8 last:mb-0" aria-labelledby={id}>
      <h2 
        id={id}
        className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100"
      >
        {title}
      </h2>
      <div className="text-gray-700 leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}