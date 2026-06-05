import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Property Loan & Loan Against Property (LAP)',
  description:
    'Unlock the value of your property with EzyLoan’s loan against property (LAP) and home loans. High funding, long tenure and attractive rates*. *Subject to lender approval.',
  alternates: { canonical: '/property-loan' },
};

export default function PropertyLoanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
