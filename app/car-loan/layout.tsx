import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/car-loan',
  title: "New Car Loan – Interest Rates & Eligibility",
  description:
    "Finance a new car through EzyLoan’s partner banks and NBFCs. Check eligibility, documents, tenure and indicative rates, then apply online.",
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function CarLoanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RelatedArticles topic="car" heading="Car loan guides" />
    </>
  );
}
