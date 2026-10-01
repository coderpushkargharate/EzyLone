'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  HONEYPOT_FIELD,
  CAPTCHA_A,
  CAPTCHA_B,
  CAPTCHA_ANS,
} from '@/lib/formGuard';

// Client half of the public-form spam guard (server half: lib/formGuard.ts).
// Drop `guardNode` inside a <form>, merge `getGuardPayload()` into the POST body,
// and gate submit on `validateGuard()`. See HeroSection / apply-now / contact.

function randInt() {
  return Math.floor(Math.random() * 9) + 1; // 1..9, single digit, friendly
}

export function useFormGuard() {
  // Honeypot value — stays empty for real users; a bot that fills every field trips it.
  const [honeypot, setHoneypot] = useState('');
  // Math challenge operands + the user's typed answer.
  const [nums, setNums] = useState(() => ({ a: randInt(), b: randInt() }));
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const resetGuard = useCallback(() => {
    setNums({ a: randInt(), b: randInt() });
    setAnswer('');
    setError('');
    setHoneypot('');
  }, []);

  const validateGuard = useCallback((): boolean => {
    if (Number(answer) !== nums.a + nums.b) {
      setError('Please answer the verification question correctly.');
      return false;
    }
    setError('');
    return true;
  }, [answer, nums]);

  const getGuardPayload = useCallback(
    () => ({
      [HONEYPOT_FIELD]: honeypot,
      [CAPTCHA_A]: nums.a,
      [CAPTCHA_B]: nums.b,
      [CAPTCHA_ANS]: answer,
    }),
    [honeypot, nums, answer]
  );

  const guardNode = useMemo(
    () => (
      <div>
        {/* Honeypot: invisible to humans, irresistible to dumb bots. Not type=hidden
            (some bots skip those) — moved off-screen instead. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
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

        {/* Simple human check */}
        <div className="flex items-center gap-2">
          <label htmlFor="vq_ans" className="text-sm font-medium whitespace-nowrap">
            {nums.a} + {nums.b} = ?
          </label>
          <input
            id="vq_ans"
            name="vq_ans"
            type="number"
            inputMode="numeric"
            required
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (error) setError('');
            }}
            placeholder="Answer *"
            aria-label={`What is ${nums.a} plus ${nums.b}?`}
            className="w-24 px-3 py-2 rounded-lg border border-gray-300 text-gray-900 outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    ),
    [honeypot, nums, answer, error]
  );

  return { guardNode, getGuardPayload, validateGuard, resetGuard };
}
