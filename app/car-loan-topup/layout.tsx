import PageSchema from '@/components/PageSchema';
import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/car-loan-topup',
  title: "Car Loan Top-Up in Odisha – Extra Funds on Your Loan",
  description:
    "Need extra funds on your running car loan? Apply for a car loan top-up through EzyLoan’s partner lenders. Check eligibility, documents and process in Odisha.",
  keywords: ["car loan top up", "car loan top up Odisha", "top up on existing car loan", "extra loan on car", "car top up loan Bhubaneswar", "car top up loan Cuttack"],
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function CarLoanTopupLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema path="/car-loan-topup" name="Car Loan Top-Up" loan={{"name":"Car Loan Top-Up","loanType":"Auto loan top-up","category":"Car loan","description":"Get additional funds on your running car loan with a top-up. Check eligibility, typical top-up amounts and the documents you need."}} />
      {children}
      <RelatedArticles topic="car" heading="Top-up & car loan guides" />
    </>
  );
}
