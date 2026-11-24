import PageSchema from '@/components/PageSchema';
import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/car-loan-balance-transfer',
  title: "Car Loan Balance Transfer in Odisha – Lower Your EMI",
  description:
    "Move your running car loan to a partner bank or NBFC that may offer better terms. Check car loan balance transfer eligibility, documents and process in Odisha.",
  keywords: ["car loan balance transfer", "car loan balance transfer Odisha", "reduce car loan EMI", "car loan takeover", "transfer car loan to another bank", "used car balance transfer Bhubaneswar", "car loan BT Cuttack"],
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function CarLoanBtLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema path="/car-loan-balance-transfer" name="Car Loan Balance Transfer" loan={{"name":"Car Loan Balance Transfer","loanType":"Auto loan balance transfer","category":"Car loan","description":"Move your running car loan to a partner lender offering a lower rate or better tenure. Check eligibility, documents and how much you could save."}} />
      {children}
      <RelatedArticles topic="car" heading="Balance transfer & car loan guides" />
    </>
  );
}
