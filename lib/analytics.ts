/**
 * GA4 event helper (browser only). See docs/GA4_MEASUREMENT_PLAN.md for the
 * event names, triggers and parameters.
 *
 * Rules enforced here:
 *  - No PII: parameter keys that look like contact/identity fields are dropped,
 *    and values that look like an email address or phone number are dropped.
 *  - Safe no-op when gtag isn't loaded or GA4 isn't configured.
 *  - `once` keys de-duplicate an event within the tab (e.g. form_start).
 */

const BLOCKED_KEYS = /name|email|phone|mobile|address|pan|aadha?ar|dob|birth|income|cibil|salary|account/i;
const EMAILISH = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONEISH = /(?:\+?\d[\s-]?){8,}/;
const fired = new Set<string>();

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export function sanitizeParams(params: AnalyticsParams = {}): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || BLOCKED_KEYS.test(k)) continue;
    if (typeof v === 'string') {
      if (EMAILISH.test(v) || PHONEISH.test(v)) continue;
      out[k] = v.slice(0, 100);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function trackEvent(name: string, params?: AnalyticsParams, opts: { once?: string } = {}): void {
  if (typeof window === 'undefined') return;
  if (opts.once) {
    if (fired.has(opts.once)) return;
    fired.add(opts.once);
  }
  const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  if (!gtag) return;
  gtag('event', name, sanitizeParams(params));
}
