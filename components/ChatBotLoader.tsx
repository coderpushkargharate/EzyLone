'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Like VoiceAssistantLoader: the chat widget is purely interactive and not
// needed for first paint, so we defer its JS to browser idle (after LCP) to keep
// it off the critical main-thread window.
const ChatBot = dynamic(() => import('./ChatBot'), { ssr: false });

export default function ChatBotLoader() {
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

  return show ? <ChatBot /> : null;
}
