import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/blogs',
  title: "Loan Guides, EMI Tips & Finance Articles",
  description:
    "Practical guides on car, personal and property loans: eligibility, documents, EMIs, interest rates and smarter borrowing for customers in Odisha and India.",
});

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
