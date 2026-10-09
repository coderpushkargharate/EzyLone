import Link from 'next/link';
import type { Metadata } from 'next';

// Branded 404 for unknown URLs and unpublished/missing blog posts (notFound()).
// Next serves this with a real 404 status; noindex keeps it out of search.
export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

const LINKS = [
  { href: '/personal-loan', label: 'Personal Loan' },
  { href: '/car-loan', label: 'Car Loan' },
  { href: '/property-loan', label: 'Loan Against Property' },
  { href: '/emi-calculator', label: 'EMI Calculator' },
  { href: '/blogs', label: 'Blog' },
  { href: '/contact', label: 'Contact Us' },
];

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-16 mt-16 flex items-center">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-sm font-semibold text-blue-600">404</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-3 text-gray-600">
          The page you are looking for doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Go to homepage
        </Link>
        <nav aria-label="Popular pages" className="mt-10">
          <ul className="flex flex-wrap justify-center gap-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-block rounded-full border border-blue-200 bg-white px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
