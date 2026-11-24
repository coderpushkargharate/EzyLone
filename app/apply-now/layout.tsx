import PageSchema from '@/components/PageSchema';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/apply-now',
  title: "Apply Online for a Car, Personal or Property Loan",
  description:
    "Apply online for a car, personal, property or commercial vehicle loan in Odisha. Share your details once and EzyLoan matches you with suitable partner lenders.",
  keywords: ["apply loan online Odisha", "online loan application", "car loan apply online", "personal loan apply online", "loan DSA Odisha"],
});

export default function ApplyNowLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema path="/apply-now" name="Apply Now" />
      {children}
    </>
  );
}
