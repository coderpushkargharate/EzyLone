import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/about',
  title: "About EzyLoan – Loan DSA in Cuttack, Odisha",
  description:
    "Learn about EzyLoan (Dibyansh Associates), a loan facilitator (DSA) connecting borrowers across Odisha with RBI-regulated partner banks and NBFCs.",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
