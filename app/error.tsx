'use client';

import Link from 'next/link';

// Route-level error boundary: a runtime error in a page shows this instead of a
// blank screen. Nothing from the error (message, stack) is shown to visitors —
// Next only passes a digest in production, which matches the server log entry.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-16 mt-16 flex items-center">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-3 text-gray-600">
          Please try again. If the problem continues, contact us and we&apos;ll help you directly.
        </p>
        {error.digest && <p className="mt-2 text-xs text-gray-400">Reference: {error.digest}</p>}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Try again
          </button>
          <Link href="/contact" className="rounded-lg border border-blue-200 bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50">
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}
