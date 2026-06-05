import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal Loan – Instant Approval, Low Interest',
  description:
    'Apply for a personal loan with EzyLoan – minimal documentation, low interest rates* and quick disbursal for salaried and self-employed customers. *Subject to lender approval.',
  alternates: { canonical: '/personal-loan' },
};

export default function PersonalLoanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
