import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/personal-loan',
  title: "Personal Loan – Eligibility, Documents & Rates",
  description:
    "Personal loans for salaried and self-employed applicants through EzyLoan’s partner lenders. Check eligibility, documents, tenure and fees before applying.",
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function PersonalLoanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RelatedArticles topic="personal" heading="Personal loan guides" />
    </>
  );
}
