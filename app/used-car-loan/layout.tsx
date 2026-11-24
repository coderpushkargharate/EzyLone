import PageSchema from '@/components/PageSchema';
import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/used-car-loan',
  title: 'Used Car Loan in Odisha – Pre-Owned Car Finance',
  description:
    'Apply for a used car loan in Odisha through EzyLoan’s partner banks and NBFCs. Check eligibility, documents and the process for pre-owned car finance.',
  keywords: ['used car loan', 'used car loan Odisha', 'second hand car loan', 'pre-owned car loan', 'used car loan Bhubaneswar', 'used car loan Cuttack', 'used car loan documents', 'used car loan eligibility'],
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function UsedCarLoanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema
        path="/used-car-loan"
        name="Used Car Loan"
        loan={{
          name: 'Used Car Loan',
          loanType: 'Auto loan',
          category: 'Used car loan',
          description:
            'Finance for a pre-owned car, arranged through EzyLoan’s partner banks and NBFCs. The lender decides approval, loan amount, rate and tenure.',
        }}
      />
      {children}
      <RelatedArticles topic="car" heading="Used car & car loan guides" />
    </>
  );
}
