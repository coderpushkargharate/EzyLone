import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/car-loan-refinance',
  title: "Car Loan Refinance – Loan Against Your Car",
  description:
    "Raise funds against a car you already own. Eligibility, documents and process for car refinance and loans against used cars in Odisha.",
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function CarLoanRefinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RelatedArticles topic="car" heading="Car refinance & car loan guides" />
    </>
  );
}
