import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About EzyLoan – Trusted Loan DSA in Odisha',
  description:
    'Learn about EzyLoan (Dibyansh Associates), an RBI-compliant loan facilitator (DSA) connecting borrowers across Odisha with partner banks and NBFCs.',
  alternates: { canonical: '/about' },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
