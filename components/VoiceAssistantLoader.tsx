'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// VoiceAssistant is a heavy, purely-interactive floating widget that is not
// needed for the initial paint. Loading it on browser idle (after LCP) keeps
// its JS off the critical main-thread window, cutting TBT and LCP render delay.
const VoiceAssistant = dynamic(() => import('./VoiceAssistant'), { ssr: false });

export default function VoiceAssistantLoader() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const ric = (window as any).requestIdleCallback;
    if (typeof ric === 'function') {
      const id = ric(() => setShow(true), { timeout: 3000 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const t = setTimeout(() => setShow(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return show ? <VoiceAssistant /> : null;
}
