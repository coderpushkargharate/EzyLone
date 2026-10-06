import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/privacy-policy',
  title: "Privacy Policy",
  description:
    "How EzyLoan collects, uses, shares and protects your personal information, and the choices you have, in line with the IT Act and RBI DSA guidelines.",
});

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
