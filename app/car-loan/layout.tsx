import PageSchema from '@/components/PageSchema';
import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/car-loan',
  title: "New Car Loan in Odisha – Bhubaneswar & Cuttack",
  description:
    "Apply for a new car loan in Odisha through EzyLoan’s partner banks and NBFCs. Check eligibility, documents and EMI, and apply online from anywhere in Odisha.",
  keywords: ["car loan Odisha", "new car loan Bhubaneswar", "car loan Cuttack", "car finance Odisha", "auto loan Odisha", "car loan interest rate", "car loan eligibility", "car loan documents", "car loan EMI", "on-road price car loan"],
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function CarLoanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema path="/car-loan" name="New Car Loan" />
      {children}
      <RelatedArticles topic="car" heading="Car loan guides" />
    </>
  );
}
