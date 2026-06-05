import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Loan Refinance – Better Rates on Your Car Loan',
  description:
    'Refinance your car loan with EzyLoan to secure a better interest rate*, flexible tenure and lower EMIs. Quick, paperless process across Odisha. *Subject to lender approval.',
  alternates: { canonical: '/car-loan-refinance' },
};

export default function CarLoanRefinanceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
