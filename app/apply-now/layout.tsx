import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/apply-now',
  title: "Apply for a Loan Online",
  description:
    "Apply online for a car, personal, property or commercial vehicle loan. Share your details once and we match you with suitable partner lenders.",
});

export default function ApplyNowLayout({ children }: { children: React.ReactNode }) {
  return children;
}
