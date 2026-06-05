import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Read EzyLoan’s privacy policy to understand how we collect, use and protect your personal information in compliance with the IT Act and RBI/DSA guidelines.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
