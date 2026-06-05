import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Loan Top-Up – Extra Funds on Your Car Loan',
  description:
    'Need extra funds? Get a car loan top-up with EzyLoan on your existing car loan at attractive interest rates* with minimal documentation. *Subject to lender approval.',
  alternates: { canonical: '/car-loan-topup' },
};

export default function CarLoanTopupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
