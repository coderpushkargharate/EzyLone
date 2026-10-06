import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/emi-calculator',
  title: "EMI Calculator – Car, Personal & Property Loans",
  description:
    "Free EMI calculator: estimate the monthly instalment, total interest and repayment for car, personal and property loans by amount, rate and tenure.",
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function EmiCalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RelatedArticles heading="Guides to plan your EMI" />
    </>
  );
}
