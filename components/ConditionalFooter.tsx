'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';
import VoiceAssistantLoader from '@/components/VoiceAssistantLoader';
import FixedFooter from '@/components/FixedFooter';

// Hide the public footer + floating widgets on the admin/login dashboard.
const HIDDEN_PREFIXES = ['/admin', '/login'];

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname?.startsWith(p))) return null;
  return (
    <>
      <Footer />
      <VoiceAssistantLoader />
      <FixedFooter />
    </>
  );
}
