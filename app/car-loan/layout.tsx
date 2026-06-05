import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Car Loan – Low Interest Rates, 24-Hour Approval',
  description:
    'Get a new car loan with EzyLoan – competitive interest rates*, up to 100% on-road funding* and approval in 24 hours* across Odisha. *Subject to lender approval.',
  alternates: { canonical: '/car-loan' },
};

export default function CarLoanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
