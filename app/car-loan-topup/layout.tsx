import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/car-loan-topup',
  title: "Car Loan Top-Up – Extra Funds on Your Car Loan",
  description:
    "Get additional funds on your running car loan with a top-up. Check eligibility, typical top-up amounts and the documents you need.",
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function CarLoanTopupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RelatedArticles topic="car" heading="Top-up & car loan guides" />
    </>
  );
}
