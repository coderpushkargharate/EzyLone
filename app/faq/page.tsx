// app/faq/page.tsx
import FAQSection from '@/components/FAQSection';

export const metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Find answers to common questions about EzyLoan services, eligibility, documents, and loan process.',
  alternates: { canonical: '/faq' },
};

export default function FAQPage() {
  return (
    <>
      {/* ✅ ONLY this page should have FAQ structured data */}
      <FAQSection
        injectStructuredData={true}  // ✅ Enable schema HERE ONLY
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about EzyLoan"
      />
    </>
  );
}