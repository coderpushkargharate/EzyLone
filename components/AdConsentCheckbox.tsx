'use client';

import { useState } from 'react';
import { AD_CONSENT_SHORT, AD_CONSENT_TEXT } from '@/lib/marketing/consentText';

// Optional, unticked-by-default ad-measurement consent. Never required to submit a form.
// Shows a one-line summary; "Read more" expands the full wording.
export default function AdConsentCheckbox({
  checked,
  onChange,
  tone = 'light',
  id = 'adConsent',
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  tone?: 'light' | 'dark';
  id?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const dark = tone === 'dark';

  return (
    <div className="flex items-start gap-2 text-left">
      <input
        id={id}
        type="checkbox"
        name="adConsent"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <div className={`min-w-0 text-xs leading-relaxed break-words whitespace-normal ${dark ? 'text-white/90' : 'text-gray-600'}`}>
        <label htmlFor={id} className="cursor-pointer">
          {expanded ? AD_CONSENT_TEXT : AD_CONSENT_SHORT}
        </label>{' '}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={`font-semibold underline underline-offset-2 ${dark ? 'text-white' : 'text-blue-600'}`}
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      </div>
    </div>
  );
}
