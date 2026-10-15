'use client';

import { AD_CONSENT_TEXT } from '@/lib/marketing/consentText';

// Optional, unticked-by-default ad-measurement consent. Never required to submit a form.
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
  return (
    <label htmlFor={id} className="flex items-start gap-2 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        name="adConsent"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 shrink-0 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <span className={`text-[11px] leading-snug ${tone === 'dark' ? 'text-blue-100' : 'text-gray-500'}`}>{AD_CONSENT_TEXT}</span>
    </label>
  );
}
