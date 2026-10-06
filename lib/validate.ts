// Tiny input coercion helpers for public endpoints. Anything that isn't a
// primitive string/number becomes '' — so a crafted payload like
// { "fullName": { "$gt": "" } } can never reach Mongo as an operator or crash
// a cast — and every value is length-capped.
export function str(v: unknown, max = 200): string {
  if (typeof v === 'string') return v.trim().slice(0, max);
  if (typeof v === 'number' && Number.isFinite(v)) return String(v).slice(0, max);
  return '';
}

export function isEmail(v: string): boolean {
  return v.length <= 254 && /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/.test(v);
}

/** Escape a value for interpolation into an HTML email body. */
export function escapeHtml(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Escape a user-supplied string for safe use inside a RegExp (search boxes). */
export function escapeRegex(v: string): string {
  return v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
