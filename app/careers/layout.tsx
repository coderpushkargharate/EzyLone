import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/careers',
  title: "Careers at EzyLoan – Jobs in Cuttack, Odisha",
  description:
    "Explore career opportunities at EzyLoan (Dibyansh Associates). Join our loan facilitation team in Cuttack and help customers access the right finance.",
});

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
