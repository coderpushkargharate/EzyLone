import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/ThankYouPage',
  title: "Application Received",
  description:
    "Thank you for applying with EzyLoan. Our team will review your details and contact you with suitable loan options from our partner lenders.",
  // Post-conversion page: useful to visitors, not to searchers.
  noindex: true,
});

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return children;
}
