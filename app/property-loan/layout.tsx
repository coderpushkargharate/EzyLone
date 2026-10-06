import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/property-loan',
  title: "Loan Against Property – Eligibility & Rates",
  description:
    "Loan against residential or commercial property through partner banks and NBFCs. Check eligibility, documents, tenure and indicative rates.",
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function PropertyLoanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RelatedArticles topic="property" heading="Loan against property guides" />
    </>
  );
}
