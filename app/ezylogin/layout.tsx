import type { Metadata } from 'next';

// Private page: middleware also sends X-Robots-Tag noindex. This adds the same
// directive in the HTML and gives the tab a real title instead of the homepage's.
export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
