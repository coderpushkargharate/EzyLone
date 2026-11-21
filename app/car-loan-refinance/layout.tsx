import PageSchema from '@/components/PageSchema';
import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/car-loan-refinance',
  title: "Loan Against Car in Odisha – Used Car Refinance",
  description:
    "Raise funds against a car you already own. Used car refinance and loan against car in Odisha: eligibility, documents and process with partner banks and NBFCs in Bhubaneswar and Cuttack.",
  keywords: ["loan against car", "loan against car Odisha", "used car refinance", "car refinance Bhubaneswar", "car refinance Cuttack", "loan on car RC", "cash against car"],
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function CarLoanRefinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema path="/car-loan-refinance" name="Car Loan Refinance" loan={{"name":"Car Loan Refinance (Loan Against Car)","loanType":"Loan against car","category":"Car loan","description":"Raise funds against a car you already own. Eligibility, documents and process for car refinance and loans against used cars in Odisha."}} />
      {children}
      <RelatedArticles topic="car" heading="Car refinance & car loan guides" />
    </>
  );
}
