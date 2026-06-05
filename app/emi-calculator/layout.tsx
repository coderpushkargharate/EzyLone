import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EMI Calculator – Calculate Your Loan EMI Online',
  description:
    'Use EzyLoan’s free EMI calculator to estimate monthly payments for car, personal, property and business loans. Adjust amount, rate and tenure instantly.',
  alternates: { canonical: '/emi-calculator' },
};

export default function EmiCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
