import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Car Loan Balance Transfer – Lower Your EMI',
  description:
    'Transfer your existing car loan to EzyLoan’s partner lenders for a lower interest rate* and reduced EMI. Save more with a quick balance transfer. *Subject to lender approval.',
  alternates: { canonical: '/car-loan-balance-transfer' },
};

export default function CarLoanBtLayout({ children }: { children: React.ReactNode }) {
  return children;
}
