import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact EzyLoan – Get Loan Assistance in Odisha',
  description:
    'Contact EzyLoan for help with personal, car, property and business loans. Call, email or visit our Cuttack office – our team responds within working hours.',
  alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
