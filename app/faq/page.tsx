// app/faq/page.tsx
import Link from 'next/link';
import FAQSection from '@/components/FAQSection';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/faq',
  title: "Loan FAQs – Eligibility, Documents & EMI",
  description:
    "Answers to common questions on loan eligibility, documents, approval time, EMIs, prepayment, credit scores and how EzyLoan works with partner lenders.",
});

// Every answer here must stay consistent with /loan-disclosure and /compliance.
// The same list feeds the visible accordion AND the FAQPage JSON-LD, so the
// structured data always mirrors what visitors can read.
const FAQS = [
  {
    question: 'What does EzyLoan do? Is EzyLoan a lender?',
    answer:
      'EzyLoan (Dibyansh Associates) is a loan facilitator (DSA). We help you choose a suitable loan, collect your documents and submit your application to RBI-regulated partner banks and NBFCs. We do not lend money ourselves.',
    answerDisclaimer: 'Loan approval, amount, interest rate and terms are decided only by the lender.',
  },
  {
    question: 'Does EzyLoan charge me any fee?',
    answer:
      'EzyLoan does not charge borrowers an upfront fee for application processing. Lenders may charge a processing fee (typically up to 3% of the loan amount plus GST) and other charges such as stamp duty, as per their policy.',
    answerDisclaimer: 'Always check the sanction letter for the final list of charges before you sign.',
  },
  {
    question: 'Who can apply for a loan?',
    answer:
      'Salaried or self-employed individuals, typically aged 21–60 years, with valid KYC documents and a steady, verifiable income can apply. Business and commercial vehicle loans also look at business vintage and turnover.',
    answerDisclaimer: 'Eligibility is subject to income verification, credit assessment and lender underwriting policy.',
  },
  {
    question: 'What documents are required?',
    answer:
      'Usually Aadhaar and PAN, address proof, income proof (salary slips or ITR), and the last 3–6 months of bank statements. Vehicle loans need the vehicle quotation or RC; property loans need property papers.',
    answerDisclaimer: 'Exact documentation varies by lender, loan type and applicant profile.',
  },
  {
    question: 'How long does approval take?',
    answer:
      'Many applications receive a preliminary response within 24–48 hours after all documents are submitted. Secured loans such as loans against property take longer because of valuation and legal checks.',
    answerDisclaimer: 'Final approval timelines depend on lender verification. Approval is never guaranteed.',
  },
  {
    question: 'What interest rate will I get?',
    answer:
      'Rates depend on the loan type, your credit score, income, existing obligations and the lender. Secured loans (car, property) usually carry lower rates than unsecured personal loans. Indicative ranges are listed on our loan disclosure page.',
    answerDisclaimer: 'Rates shown anywhere on this site are indicative, not an offer.',
  },
  {
    question: 'How is my EMI calculated?',
    answer:
      'EMI depends on the loan amount, the interest rate and the tenure. A longer tenure lowers the EMI but increases the total interest you pay. You can try different combinations with our free EMI calculator before applying.',
  },
  {
    question: 'Does checking eligibility affect my CIBIL score?',
    answer:
      'An initial eligibility discussion with EzyLoan does not affect your credit score. When an application is formally submitted to a lender, the lender may run a hard enquiry, which is recorded in your credit report.',
    answerDisclaimer: 'Credit enquiry practices vary by lender.',
  },
  {
    question: 'Can I get a loan with a low credit score?',
    answer:
      'It is harder but sometimes possible, for example with a secured loan, a co-applicant, a lower loan amount or a lender with a different risk policy. Paying existing EMIs and credit card dues on time is the best way to improve your score.',
    answerDisclaimer: 'No lender approves every application; a low score may lead to rejection or a higher rate.',
  },
  {
    question: 'What is a car loan balance transfer?',
    answer:
      'A balance transfer moves your running car loan to another lender, usually to get a lower interest rate or a better tenure. It makes sense when the savings are larger than the new lender’s processing fee and your current lender’s foreclosure charges.',
  },
  {
    question: 'What is the difference between a car loan top-up and a car refinance?',
    answer:
      'A top-up gives you extra funds on top of a car loan you are still repaying. A refinance (loan against car) lets you raise money against a car you already own, whether or not it has an existing loan.',
  },
  {
    question: 'Can I repay my loan early?',
    answer:
      'Yes, most loans allow part-prepayment or full foreclosure. Some lenders apply a lock-in period or prepayment charges, especially on fixed-rate and unsecured loans.',
    answerDisclaimer: 'Prepayment terms vary by lender. Confirm them in your loan agreement.',
  },
  {
    question: 'Is my personal information safe?',
    answer:
      'We use your details only to process your loan enquiry and share them only with the partner lenders you are being considered for. See our privacy policy for how data is stored, shared and deleted on request.',
  },
];

export default function FAQPage() {
  return (
    <>
      <FAQSection
        faqs={FAQS}
        injectStructuredData={true} // the only page that emits FAQPage schema
        title="Frequently Asked Questions"
        subtitle="Eligibility, documents, rates, EMIs and how EzyLoan works"
      />
      <nav aria-label="Related pages" className="max-w-3xl mx-auto px-4 pb-16 -mt-6 text-center text-sm text-gray-600">
        Explore:{' '}
        <Link href="/personal-loan" className="text-blue-700 underline">Personal Loan</Link> ·{' '}
        <Link href="/car-loan" className="text-blue-700 underline">Car Loan</Link> ·{' '}
        <Link href="/car-loan-balance-transfer" className="text-blue-700 underline">Car Loan Balance Transfer</Link> ·{' '}
        <Link href="/property-loan" className="text-blue-700 underline">Loan Against Property</Link> ·{' '}
        <Link href="/emi-calculator" className="text-blue-700 underline">EMI Calculator</Link> ·{' '}
        <Link href="/loan-disclosure" className="text-blue-700 underline">Rates &amp; Fees</Link>
      </nav>
    </>
  );
}
