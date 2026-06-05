import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EzyLoan Blog – Loan Tips, Guides & Financial News',
  description:
    'Read EzyLoan’s blog for loan guides, EMI tips, interest rate updates and financial advice to help you borrow smarter across Odisha and India.',
  alternates: { canonical: '/blogs' },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
