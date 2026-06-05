import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers at EzyLoan – Join Our Team in Odisha',
  description:
    'Explore career opportunities at EzyLoan (Dibyansh Associates). Join a growing loan facilitation team in Odisha and help customers access the right finance.',
  alternates: { canonical: '/careers' },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
