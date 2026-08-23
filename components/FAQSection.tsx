"use client";

import { useState } from "react";
import Link from "next/link";
import Script from 'next/script';

interface FAQItem {
  question: string;
  answer: string;
  answerDisclaimer?: string;
}

interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  faqs?: FAQItem[];
  className?: string;
  showComplianceBanner?: boolean;
  injectStructuredData?: boolean; // Set to FALSE if parent page already injects FAQ schema
}

const defaultFAQs: FAQItem[] = [
  {
    question: "Who can apply for a loan?",
    answer: "Any salaried or self-employed individual aged 21–60 years with valid KYC documents can apply.",
    answerDisclaimer: "Eligibility subject to income verification, credit assessment, and lender underwriting policy."
  },
  {
    question: "What documents are required?",
    answer: "Aadhaar Card, PAN Card, income proof (salary slips/ITR), and last 3–6 months bank statements are typically required.",
    answerDisclaimer: "Exact documentation varies by lender, loan type, and applicant profile."
  },
  {
    question: "How long does approval take?",
    answer: "Loan applications typically receive a preliminary response within 24–48 hours after successful document submission.",
    answerDisclaimer: "Final approval timeline depends on lender verification, credit assessment, and underwriting policy. No guarantee of approval."
  },
  {
    question: "Can I repay early?",
    answer: "Yes, prepayment or foreclosure is allowed on most loan products, subject to lender-specific terms and applicable charges.",
    answerDisclaimer: "Prepayment policies, lock-in periods, and charges vary by lender. Confirm terms in your loan agreement."
  },
  {
    question: "Does checking eligibility affect my CIBIL?",
    answer: "Initial eligibility checks via EzyLoan are soft inquiries and do not impact your credit score. However, formal loan applications submitted to lenders may involve hard inquiries.",
    answerDisclaimer: "Credit impact policies vary by lender. Always confirm with your loan agreement."
  },
];

export default function FAQSection({
  title = "Frequently Asked Questions",
  subtitle = "Get answers to common questions about EzyLoan services.",
  faqs = defaultFAQs,
  className = "",
  showComplianceBanner = true,
  injectStructuredData = true, // IMPORTANT: Set to false if parent page already injects FAQ schema
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // ✅ FAQ Schema - CORRECT STRUCTURE with "text" field
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `${faq.answer}${faq.answerDisclaimer ? ` ${faq.answerDisclaimer}` : ''}`
      }
    }))
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "EzyLoan (Dibyansh Associates)",
    "url": "https://ezyloan.co.in",
    "description": "EzyLoan is a loan facilitation service provider (DSA) connecting borrowers with partner banks and NBFCs across India. We are not a direct lender.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-6372977626",
      "contactType": "Customer Service",
      "email": "care@ezyloan.co.in",
      "areaServed": "IN"
    }
  };

  return (
    <>

      {/* ✅ CONDITIONAL Structured Data - Only inject when explicitly enabled AND not duplicated */}
      {injectStructuredData && (
        <>
          <Script id="faq-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
          <Script id="organization-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        </>
      )}

      {/* ✅ Section - NO microdata attributes (JSON-LD only) */}
      <section className={`relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 min-h-screen mt-10 ${className}`} role="region" aria-labelledby="faq-section-title">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-4 -left-4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -right-4 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-cyan-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 bg-white/70 backdrop-blur-sm border-b border-blue-100">
          <div className="max-w-4xl mx-auto px-4 py-14 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              <h1 id="faq-section-title" className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{title}</h1>
              <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          </div>
        </div>

        {/* Compliance Banner */}
        {showComplianceBanner && (
          <div className="relative z-10 max-w-4xl mx-auto px-4 py-4">
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg" role="note">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Answers provided are for general guidance only. Loan eligibility, approval timelines, interest rates, fees, and terms vary by lender and applicant profile. Final decisions are made solely by partner banks/NBFCs. <Link href="/loan-disclosure" className="underline hover:text-amber-900">View full disclosures</Link>.
              </p>
            </div>
          </div>
        )}

        {/* FAQ List - NO microdata attributes */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <article key={index} className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-5 text-left hover:bg-blue-50/50 transition-colors duration-200 group"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  <span className="font-medium text-gray-800 pr-4 group-hover:text-blue-700 transition-colors">{faq.question}</span>
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 text-2xl font-light flex-shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180 scale-110" : "group-hover:scale-105"}`}>
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? "pb-5 max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="text-gray-600 leading-relaxed border-t border-blue-100 pt-4">
                    <p>{faq.answer}</p>
                    {faq.answerDisclaimer && <p className="text-xs text-gray-500 mt-2 italic">{faq.answerDisclaimer}</p>}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <Link href="/contact" className="glass-prism glass-prism-btn inline-flex px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all">
              Contact Support
            </Link>
            <p className="text-xs text-gray-500 mt-3">Response time: 24-48 business hours | <Link href="/loan-disclosure" className="underline">Full terms</Link></p>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 mt-16 pt-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm" role="contentinfo">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-3">
            <p className="text-xs text-gray-600">
              <strong>Disclaimer:</strong> EzyLoan (Dibyansh Associates) is a loan facilitation service provider (DSA) and <strong>not a direct lender</strong>. All loan approvals, interest rates, fees, tenure, and terms are solely determined by partner lenders.
            </p>
            <p className="text-xs text-gray-500 pt-2">
              © {new Date().getFullYear()} EzyLoan. All rights reserved. | <Link href="/terms-and-conditions" className="hover:underline">Terms</Link> | <Link href="/privacy-policy" className="hover:underline">Privacy</Link>
            </p>
          </div>
        </footer>
      </section>
    </>
  );
}