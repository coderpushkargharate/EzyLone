import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Apply for a Loan Online – Quick Approval',
  description:
    'Apply online for personal, car, property or business loans with EzyLoan. Minimal documentation, low interest rates* and approval in 24 hours*. *Subject to lender approval.',
  alternates: { canonical: '/apply-now' },
};

export default function ApplyNowLayout({ children }: { children: React.ReactNode }) {
  return children;
}
