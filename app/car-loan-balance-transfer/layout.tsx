import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/car-loan-balance-transfer',
  title: "Car Loan Balance Transfer – Lower Your EMI",
  description:
    "Move your running car loan to a partner lender offering a lower rate or better tenure. Check eligibility, documents and how much you could save.",
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function CarLoanBtLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RelatedArticles topic="car" heading="Balance transfer & car loan guides" />
    </>
  );
}
