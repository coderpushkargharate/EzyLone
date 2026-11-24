import PageSchema from '@/components/PageSchema';
import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/property-loan',
  title: "Loan Against Property in Odisha – LAP Eligibility",
  description:
    "Raise funds against residential or commercial property in Odisha. Check loan against property (LAP) eligibility, documents and tenure with partner lenders.",
  keywords: ["loan against property Odisha", "LAP Bhubaneswar", "loan against property Cuttack", "mortgage loan Odisha", "property loan interest rate", "loan against commercial property", "loan against residential property"],
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function PropertyLoanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema path="/property-loan" name="Loan Against Property" loan={{"name":"Loan Against Property","loanType":"Loan against property","category":"Secured loan","description":"Loan against residential or commercial property through partner banks and NBFCs. Check eligibility, documents, tenure and indicative rates."}} />
      {children}
      <RelatedArticles topic="property" heading="Loan against property guides" />
    </>
  );
}
