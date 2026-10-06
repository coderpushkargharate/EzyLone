'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { HONEYPOT_FIELD, FORM_TOKEN_FIELD, MIN_FILL_MS } from '@/lib/formGuardFields';

// Client half of the public-form spam guard (server half: lib/formGuard.ts).
// Nothing for the visitor to solve. Drop `guardNode` inside a <form>, then on
// submit `await getGuardPayload()` and merge it into the POST body.
//
// The signed form token is fetched the first time the visitor interacts with
// the form (not on page load, so it costs nothing for visitors who never use
// the form). If someone submits within MIN_FILL_MS of that, we wait out the
// remainder instead of failing — a human never sees an error.

interface Token {
  value: string;
  receivedAt: number;
}

async function fetchToken(): Promise<Token | null> {
  try {
    const res = await fetch('/api/form-token', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.token === 'string' ? { value: data.token, receivedAt: Date.now() } : null;
  } catch {
    return null;
  }
}

export function useFormGuard() {
  // Honeypot value — stays empty for real users; a bot that fills every field trips it.
  const [honeypot, setHoneypot] = useState('');
  const tokenRef = useRef<Promise<Token | null> | null>(null);

  const ensureToken = useCallback(() => {
    if (!tokenRef.current) {
      tokenRef.current = fetchToken().then((t) => {
        if (!t) tokenRef.current = null; // allow a retry on the next attempt
        return t;
      });
    }
    return tokenRef.current;
  }, []);

  // Start the token clock on the first focus/tap anywhere in an enclosing form.
  // A callback ref so every rendered copy of the form (e.g. separate mobile and
  // desktop layouts) is wired up.
  const anchorRef = useCallback(
    (el: HTMLDivElement | null) => {
      const form = el?.closest('form');
      if (!form) return;
      const start = () => void ensureToken();
      form.addEventListener('focusin', start, { once: true });
      form.addEventListener('pointerdown', start, { once: true });
    },
    [ensureToken]
  );

  const resetGuard = useCallback(() => {
    setHoneypot('');
    tokenRef.current = null; // one token per submission
  }, []);

  /** Await before submitting; resolves with the fields the API expects. */
  const getGuardPayload = useCallback(async () => {
    const token = await ensureToken();
    if (token) {
      const wait = token.receivedAt + MIN_FILL_MS + 200 - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    }
    return { [HONEYPOT_FIELD]: honeypot, [FORM_TOKEN_FIELD]: token?.value || '' };
  }, [ensureToken, honeypot]);

  const guardNode = useMemo(
    () => (
      // Honeypot: invisible to humans and assistive tech. Not type=hidden (some
      // bots skip those) — moved off-screen instead.
      <div
        ref={anchorRef}
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}
      >
        <label htmlFor={HONEYPOT_FIELD}>Company website (leave this empty)</label>
        <input
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
    ),
    [honeypot, anchorRef]
  );

  return { guardNode, getGuardPayload, resetGuard };
}
