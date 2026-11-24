import PageSchema from '@/components/PageSchema';
import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/personal-loan',
  title: "Personal Loan in Odisha – Bhubaneswar, Cuttack & More",
  description:
    "Apply for a personal loan in Odisha through EzyLoan’s partner banks and NBFCs. Salaried and self-employed applicants can check eligibility, documents and EMI.",
  keywords: ["personal loan Odisha", "personal loan Bhubaneswar", "personal loan Cuttack", "personal loan for salaried", "personal loan for self employed", "personal loan interest rate", "personal loan eligibility", "personal loan documents"],
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function PersonalLoanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema path="/personal-loan" name="Personal Loan" />
      {children}
      <RelatedArticles topic="personal" heading="Personal loan guides" />
    </>
  );
}
