'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';

// Admin/login screens are a standalone dashboard — no public site header there.
const HIDDEN_PREFIXES = ['/ezyadmin', '/ezylogin'];

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;
  return (
    <>
      <Header />
      {/* The header is position:fixed, so reserve its exact height here once.
          Pages must NOT add their own top offset for the header. */}
      <div aria-hidden="true" className="shrink-0" style={{ height: 'var(--header-offset)' }} />
    </>
  );
}
