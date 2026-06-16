/**
 * Google Ads conversion tracking — single source of truth.
 *
 * Configure these in `.env.local` (and your host's env vars):
 *   NEXT_PUBLIC_GOOGLE_ADS_ID         e.g. AW-18024243962
 *   NEXT_PUBLIC_GADS_CONVERSION_LABEL the label from Google Ads → Conversions →
 *                                     your action → "Tag setup" (the part after
 *                                     the slash, e.g. AbC-D_efGhIjKlMnOp)
 *
 * Until the label is set, `trackGoogleAdsConversion` is a safe no-op — no
 * malformed conversion is ever sent to Google (avoids polluting your data).
 */
export const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-18024243962';

const CONVERSION_LABEL = process.env.NEXT_PUBLIC_GADS_CONVERSION_LABEL || '';

interface ConversionOpts {
  value?: number;
  currency?: string;
  transactionId?: string;
}

/** Fire a Google Ads conversion. No-op if gtag isn't loaded or the label isn't set. */
export function trackGoogleAdsConversion(opts: ConversionOpts = {}): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag || !CONVERSION_LABEL) return;

  gtag('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${CONVERSION_LABEL}`,
    value: opts.value ?? 1.0,
    currency: opts.currency ?? 'INR',
    ...(opts.transactionId ? { transaction_id: opts.transactionId } : {}),
  });
}
