'use client';
import React from "react";
import Link from "next/link";
import Script from 'next/script';

const PrivacyPolicyPage = () => {
  // ✅ Structured Data for PrivacyPolicy Schema - Fixed trailing spaces
  const privacyPolicySchema = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    "name": "Privacy Policy - EzyLoan",
    "description": "Privacy policy explaining how EzyLoan collects, uses, stores, and protects your personal information in compliance with Indian law and RBI guidelines.",
    "url": "https://ezyloan.co.in/privacy",
    "inLanguage": "en-IN",
    "publisher": {
      "@type": "Organization",
      "name": "EzyLoan (Dibyansh Associates)",
      "url": "https://www.ezyloan.co.in",
      "logo": "https://www.ezyloan.co.in/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-6372977626",
        "contactType": "Customer Service",
        "email": "care@ezyloan.co.in",
        "areaServed": "IN"
      }
    },
    "datePublished": "2024-01-01",
    "dateModified": "2025-12-24",
    "mainEntity": {
      "@type": "WebPage",
      "name": "Privacy Policy",
      "about": "Data collection, usage, sharing, retention, security, and user rights"
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
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-6372977626",
      "contactType": "Grievance Officer",
      "email": "care@ezyloan.co.in",
      "areaServed": "IN"
    }
  };

  return (
    <>

      {/* ✅ Structured Data for SEO - Fixed trailing spaces */}
      <Script
        id="privacy-policy-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(privacyPolicySchema)
        }}
      />
      <Script
        id="organization-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />

      <main 
        className="min-h-screen bg-gray-50"
        itemScope 
        itemType="https://schema.org/WebPage"
        role="main"
      >
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16 mt-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Privacy Policy
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                We respect your privacy and are committed to protecting your personal information in accordance with Indian law and RBI guidelines.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <article className="bg-white rounded-lg shadow-lg p-8">

              {/* Last Updated - Machine Readable */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-blue-600 font-medium">
                  <time dateTime="2025-12-24">Last Updated: 24 December 2025</time>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Version 2.1 | Effective Date: 24 December 2025
                </p>
              </div>

              {/* ✅ COMPLIANCE NOTICE - Prominent disclosure */}
              <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg" role="note" aria-label="Important privacy notice">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> EzyLoan is a loan facilitation service provider (DSA), not a direct lender. 
                  By using our services, you consent to sharing your personal data with partner banks/NBFCs for loan assessment. 
                  Each lender has its own privacy policy governing how they use your data. 
                  <Link href="/loan-disclosure" className="underline hover:text-amber-900 ml-1">View loan disclosures</Link>.
                </p>
              </div>

              {/* 1. Introduction */}
              <section className="mb-8" aria-labelledby="section-intro">
                <h2 id="section-intro" className="text-2xl font-bold text-gray-800 mb-4">
                  1. Introduction
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  This Privacy Policy explains how <strong>EzyLoan Financial Services (Dibyansh Associates)</strong> ("EzyLoan", "we", "our", or "us") 
                  collects, uses, stores, shares, and protects your personal information. We comply with applicable Indian laws including:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1">
                  <li>Information Technology Act, 2000 and Rules thereunder</li>
                  <li>Digital Personal Data Protection Act, 2023 (when applicable)</li>
                  <li>Reserve Bank of India (RBI) guidelines for DSAs and lending</li>
                  <li>Secured Lending and Recovery laws</li>
                </ul>
              </section>

              {/* 2. Definition */}
              <section className="mb-8" aria-labelledby="section-definitions">
                <h2 id="section-definitions" className="text-2xl font-bold text-gray-800 mb-4">
                  2. Definition of Personal Data
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  "Personal Data" means any information that relates to an identified or identifiable individual, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-1">
                  <li>Identity information: Name, date of birth, PAN, Aadhaar, passport, voter ID</li>
                  <li>Contact information: Address, email, mobile number</li>
                  <li>Financial information: Income, bank statements, credit score, loan history</li>
                  <li>Employment information: Employer details, salary slips, business documents</li>
                  <li>Technical information: IP address, device ID, browser type, cookies</li>
                  <li>Loan application data: Purpose, amount requested, repayment capacity</li>
                </ul>
              </section>

              {/* 3. Information We Collect */}
              <section className="mb-8" aria-labelledby="section-collection">
                <h2 id="section-collection" className="text-2xl font-bold text-gray-800 mb-4">
                  3. Information We Collect
                </h2>

                <h3 className="text-xl font-semibold text-gray-700 mb-3" id="collection-provided">
                  A. Information You Provide Voluntarily
                </h3>
                <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
                  <li>Name, residential address, email ID, mobile number</li>
                  <li>KYC documents: PAN Card, Aadhaar Card, passport, driving license</li>
                  <li>Income proof: Salary slips, ITR, Form 16, bank statements (3-6 months)</li>
                  <li>Employment/Business details: Employer name, designation, business registration</li>
                  <li>Loan requirements: Desired amount, purpose, preferred tenure</li>
                  <li>Consent declarations for credit checks and data sharing</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-700 mb-3" id="collection-automatic">
                  B. Information Collected Automatically
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Technical data: IP address, browser type, operating system, device identifiers</li>
                  <li>Usage data: Pages visited, time spent, click patterns, referral sources</li>
                  <li>Location data: Approximate location derived from IP address (for service eligibility)</li>
                  <li>Cookies and similar technologies: See our <Link href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link></li>
                </ul>
              </section>

              {/* 4. Purpose of Data Collection */}
              <section className="mb-8" aria-labelledby="section-purpose">
                <h2 id="section-purpose" className="text-2xl font-bold text-gray-800 mb-4">
                  4. Purpose of Data Collection & Processing
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  We collect and process your personal data for the following legitimate purposes:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Loan Processing:</strong> Evaluating eligibility, verifying documents, coordinating with partner lenders</li>
                  <li><strong>Communication:</strong> Sending application updates, loan offers, service notifications</li>
                  <li><strong>Regulatory Compliance:</strong> Meeting RBI, IT Act, and other legal obligations including KYC/AML</li>
                  <li><strong>Fraud Prevention:</strong> Detecting and preventing identity theft, application fraud, money laundering</li>
                  <li><strong>Service Improvement:</strong> Analyzing usage patterns to enhance user experience and product offerings</li>
                  <li><strong>Marketing (with consent):</strong> Sending relevant financial product updates; you may opt-out anytime</li>
                </ul>
              </section>

              {/* 5. Legal Basis */}
              <section className="mb-8" aria-labelledby="section-legal-basis">
                <h2 id="section-legal-basis" className="text-2xl font-bold text-gray-800 mb-4">
                  5. Legal Basis for Processing Personal Data
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We process your personal data based on one or more of the following lawful grounds:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li><strong>Consent:</strong> Your explicit consent obtained during application or account creation</li>
                  <li><strong>Contractual Necessity:</strong> Processing required to facilitate your loan application with partner lenders</li>
                  <li><strong>Legal Obligation:</strong> Compliance with RBI guidelines, IT Act, PDP Act, and other applicable laws</li>
                  <li><strong>Legitimate Interest:</strong> Fraud prevention, service improvement, and business operations (balanced against your rights)</li>
                </ul>
                <p className="text-gray-600 mt-3">
                  You may withdraw consent at any time by contacting us, though this may affect our ability to provide services.
                </p>
              </section>

              {/* 6. Data Sharing and Disclosure */}
              <section className="mb-8" aria-labelledby="section-sharing">
                <h2 id="section-sharing" className="text-2xl font-bold text-gray-800 mb-4">
                  6. Data Sharing and Disclosure
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  We may share your personal information with the following parties for legitimate business or legal purposes:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Partner Lenders:</strong> Banks and NBFCs for loan evaluation, approval, and disbursement</li>
                  <li><strong>Credit Bureaus:</strong> CIBIL, Experian, Equifax, CRIF for credit assessment and reporting</li>
                  <li><strong>Service Providers:</strong> KYC verification, document management, SMS/email services, analytics (under strict confidentiality agreements)</li>
                  <li><strong>Regulatory Authorities:</strong> RBI, Ministry of Corporate Affairs, or courts as required by law</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or asset sale (with notice and continued protection)</li>
                </ul>
                <p className="text-gray-600 mt-3 font-medium">
                  ❌ We do NOT sell, rent, or trade your personal data to third parties for marketing purposes.
                </p>
                <p className="text-gray-600 mt-2 text-sm italic">
                  *Each partner lender has its own privacy policy. We encourage you to review their policies before proceeding with any loan application.
                </p>
              </section>

              {/* 7. International Data Transfers */}
              <section className="mb-8" aria-labelledby="section-transfers">
                <h2 id="section-transfers" className="text-2xl font-bold text-gray-800 mb-4">
                  7. International Data Transfers
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Your personal data is primarily processed and stored within India. In limited cases, data may be transferred to countries outside India 
                  for cloud storage or service provider operations. Such transfers comply with applicable Indian data protection laws and include 
                  appropriate safeguards such as contractual clauses ensuring equivalent protection.
                </p>
              </section>

              {/* 8. Data Retention */}
              <section className="mb-8" aria-labelledby="section-retention">
                <h2 id="section-retention" className="text-2xl font-bold text-gray-800 mb-4">
                  8. Data Retention Period
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li><strong>Active Applications:</strong> Duration of application process + 12 months for follow-up</li>
                  <li><strong>Approved Loans:</strong> Duration of loan tenure + 7 years post-closure (as per RBI record-keeping norms)</li>
                  <li><strong>Rejected Applications:</strong> 24 months for regulatory audit and fraud prevention</li>
                  <li><strong>Marketing Consent:</strong> Until you withdraw consent or 36 months from last engagement, whichever is earlier</li>
                </ul>
                <p className="text-gray-600 mt-3">
                  After the retention period, data is securely deleted or anonymized such that it can no longer identify you.
                </p>
              </section>

              {/* 9. Data Security */}
              <section className="mb-8" aria-labelledby="section-security">
                <h2 id="section-security" className="text-2xl font-bold text-gray-800 mb-4">
                  9. Data Security Measures
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement industry-standard administrative, technical, and physical safeguards to protect your personal data:
                </p>
                <ul className="list-disc list-inside text-gray-600 mt-3 space-y-2">
                  <li><strong>Encryption:</strong> SSL/TLS for data in transit; AES-256 for sensitive data at rest</li>
                  <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication for staff</li>
                  <li><strong>Network Security:</strong> Firewalls, intrusion detection, regular vulnerability assessments</li>
                  <li><strong>Employee Training:</strong> Regular privacy and security awareness programs</li>
                  <li><strong>Vendor Management:</strong> Due diligence and contractual safeguards for third-party processors</li>
                </ul>
                <p className="text-gray-600 mt-3 text-sm">
                  While we strive to protect your data, no internet transmission is 100% secure. Please safeguard your login credentials and report suspicious activity immediately.
                </p>
              </section>

              {/* 10. Your Rights */}
              <section className="mb-8" aria-labelledby="section-rights">
                <h2 id="section-rights" className="text-2xl font-bold text-gray-800 mb-4">
                  10. Your Rights & Choices
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Subject to applicable laws, you have the following rights regarding your personal data:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>Right to Access:</strong> Request a copy of your personal data we hold</li>
                  <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete data</li>
                  <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                  <li><strong>Right to Withdraw Consent:</strong> Opt-out of marketing or withdraw consent for processing (may affect service availability)</li>
                  <li><strong>Right to Portability:</strong> Request transfer of your data to another service provider (where technically feasible)</li>
                  <li><strong>Right to Grievance Redressal:</strong> Escalate concerns to our Grievance Officer (details below)</li>
                </ul>
                <p className="text-gray-600 mt-3">
                  To exercise any right, contact us at <a href="mailto:care@ezyloan.co.in" className="text-blue-600 hover:underline">care@ezyloan.co.in</a>. 
                  We respond to valid requests within 30 days.
                </p>
              </section>

              {/* 11. Cookies & Tracking */}
              <section className="mb-8" aria-labelledby="section-cookies">
                <h2 id="section-cookies" className="text-2xl font-bold text-gray-800 mb-4">
                  11. Cookies & Tracking Technologies
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, analyze usage, and personalize content. 
                  You can manage cookie preferences through your browser settings or our <Link href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>.
                </p>
                <p className="text-gray-600 mt-3 text-sm">
                  Note: Disabling essential cookies may limit functionality of our services.
                </p>
              </section>

              {/* 12. Children's Privacy */}
              <section className="mb-8" aria-labelledby="section-children">
                <h2 id="section-children" className="text-2xl font-bold text-gray-800 mb-4">
                  12. Children's Privacy
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Our services are intended for individuals aged 18 years and above. We do not knowingly collect personal data from minors. 
                  If we become aware that we have collected data from a child under 18, we will take steps to delete it promptly. 
                  If you believe a minor has provided us with data, please contact us immediately.
                </p>
              </section>

              {/* 13. Automated Decision-Making */}
              <section className="mb-8" aria-labelledby="section-automation">
                <h2 id="section-automation" className="text-2xl font-bold text-gray-800 mb-4">
                  13. Automated Decision-Making & Profiling
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We may use automated systems to pre-screen loan applications based on criteria such as credit score, income, and employment history. 
                  These systems assist—but do not replace—human review. Final loan decisions are made by partner lenders. 
                  You may request human review of any automated decision by contacting us.
                </p>
              </section>

              {/* 14. Changes to Policy */}
              <section className="mb-8" aria-labelledby="section-changes">
                <h2 id="section-changes" className="text-2xl font-bold text-gray-800 mb-4">
                  14. Changes to This Privacy Policy
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this Privacy Policy periodically to reflect changes in law, technology, or business practices. 
                  Material changes will be notified via email or prominent notice on our website. 
                  Continued use of our services after changes constitutes acceptance of the updated policy.
                </p>
                <p className="text-gray-600 mt-3 text-sm">
                  We encourage you to review this page periodically. The "Last Updated" date at the top indicates the most recent revision.
                </p>
              </section>

              {/* 15. Contact & Grievance Redressal */}
              <section className="mb-8" aria-labelledby="section-contact">
                <h2 id="section-contact" className="text-2xl font-bold text-gray-800 mb-4">
                  15. Contact Information & Grievance Redressal
                </h2>
                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-gray-800">EzyLoan Financial Services (Dibyansh Associates)</p>
                  <p className="text-gray-600 mt-3">
                    <strong>Registered Office:</strong><br />
                    1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur,<br />
                    Cuttack – 753011, Odisha, India
                  </p>
                  <p className="text-gray-600 mt-3">
                    <strong>General Inquiries:</strong><br />
                    Phone: <a href="tel:+916372977626" className="text-blue-600 hover:underline">+91 63729 77626</a><br />
                    Email: <a href="mailto:care@ezyloan.co.in" className="text-blue-600 hover:underline">care@ezyloan.co.in</a>
                  </p>
                  <p className="text-gray-600 mt-3">
                    <strong>Grievance Officer (Data Protection):</strong><br />
                    Email: <a href="mailto:care@ezyloan.co.in" className="text-blue-600 hover:underline">care@ezyloan.co.in</a><br />
                    Response Time: Within 15 business days as per IT Rules, 2021
                  </p>
                  <p className="text-gray-600 mt-3 text-sm">
                    <strong>Regulatory Escalation:</strong> If unresolved, you may approach the RBI Ombudsman: 
                    <a href="https://cms.rbi.org.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">https://cms.rbi.org.in</a>
                  </p>
                </div>
              </section>

              {/* Related Policies */}
              <section className="mb-8 pt-6 border-t border-gray-200" aria-labelledby="section-related">
                <h2 id="section-related" className="text-2xl font-bold text-gray-800 mb-4">
                  Related Policies
                </h2>
                <ul className="list-none space-y-2">
                         <li>• <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link></li>
            <li>• <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">Terms of Service</Link></li>
            <li>• <Link href="/loan-disclosure" className="text-blue-600 hover:underline">Loan Disclosures</Link></li>
                </ul>
              </section>

            </article>

       

          </div>
        </div>

        {/* ✅ GLOBAL FOOTER DISCLAIMER */}
        <footer className="bg-gray-100 border-t border-gray-200 py-6" role="contentinfo">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} EzyLoan (Dibyansh Associates). All rights reserved. | 
              CIN: [To be added] | GST: [To be added]
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This policy complies with the Information Technology Act, 2000 and applicable RBI guidelines.
            </p>
          </div>
        </footer>

      </main>
    </>
  );
};

export default PrivacyPolicyPage;