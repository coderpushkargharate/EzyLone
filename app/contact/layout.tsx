import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/contact',
  title: "Contact EzyLoan – Loan Assistance in Cuttack",
  description:
    "Talk to EzyLoan about car, personal, property or commercial vehicle loans. Call, email, WhatsApp or visit our Cuttack office during working hours.",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
