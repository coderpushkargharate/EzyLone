import crypto from 'crypto';

// Normalization + SHA-256 hashing of customer matching fields for the ad
// platforms. Each function takes the RAW value straight from the CRM and
// returns the platform-specific normalized-then-hashed value (lowercase hex),
// or null when the input is unusable. A value that is already a SHA-256 hex
// digest is passed through untouched, so nothing is ever hashed twice.
//
// Meta:   https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
// Google: https://developers.google.com/data-manager/api/devguides/concepts/formatting
//
// Pure module — unit-tested in scripts/test-marketing.mjs.

const SHA256_RE = /^[a-f0-9]{64}$/;

export function isSha256Hex(v: string): boolean {
  return SHA256_RE.test(v);
}

export function sha256Hex(v: string): string {
  return crypto.createHash('sha256').update(v, 'utf8').digest('hex');
}

function hashNormalized(raw: string | null | undefined, normalize: (s: string) => string | null): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (isSha256Hex(s.toLowerCase())) return s.toLowerCase();
  const n = normalize(s);
  return n ? sha256Hex(n) : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: string): string | null {
  const e = raw.trim().toLowerCase();
  return EMAIL_RE.test(e) ? e : null;
}

/** Google additionally drops dots in the local part of gmail.com / googlemail.com addresses. */
export function normalizeEmailGoogle(raw: string): string | null {
  const e = normalizeEmail(raw);
  if (!e) return null;
  const [local, domain] = e.split('@');
  if (domain === 'gmail.com' || domain === 'googlemail.com') return `${local.replace(/\./g, '')}@${domain}`;
  return e;
}

/**
 * Digits-only phone WITH country code and no leading zeros / "+", e.g.
 * "919876543210". A bare 10-digit Indian mobile gets the default country code.
 */
export function normalizePhoneDigits(raw: string, defaultCountryCode = '91'): string | null {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length === 10 && /^[6-9]/.test(d)) d = defaultCountryCode + d;
  d = d.replace(/^0+/, '');
  return d.length >= 8 && d.length <= 15 ? d : null;
}

/** E.164 ("+919876543210") — Google's required phone format before hashing. */
export function normalizePhoneE164(raw: string, defaultCountryCode = '91'): string | null {
  const d = normalizePhoneDigits(raw, defaultCountryCode);
  return d ? `+${d}` : null;
}

/** Lowercase, letters only (Unicode letters kept, punctuation/spaces/digits removed). */
export function normalizeNamePart(raw: string): string | null {
  const n = raw.normalize('NFC').toLowerCase().replace(/[^\p{L}]/gu, '');
  return n || null;
}

export function splitName(full: string | null | undefined): { first: string | null; last: string | null } {
  const parts = String(full || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first: null, last: null };
  return { first: parts[0], last: parts.length > 1 ? parts[parts.length - 1] : null };
}

export function normalizeCity(raw: string): string | null {
  const c = raw.normalize('NFC').toLowerCase().replace(/[^\p{L}]/gu, '');
  return c || null;
}

export function normalizeZip(raw: string): string | null {
  const z = raw.toLowerCase().replace(/\s+/g, '');
  return /^[a-z0-9-]{3,10}$/.test(z) ? z : null;
}

export const metaHash = {
  email: (v?: string | null) => hashNormalized(v, normalizeEmail),
  phone: (v?: string | null) => hashNormalized(v, (s) => normalizePhoneDigits(s)),
  firstName: (v?: string | null) => hashNormalized(v, normalizeNamePart),
  lastName: (v?: string | null) => hashNormalized(v, normalizeNamePart),
  city: (v?: string | null) => hashNormalized(v, normalizeCity),
  zip: (v?: string | null) => hashNormalized(v, normalizeZip),
  country: (v?: string | null) => hashNormalized(v, (s) => (/^[a-z]{2}$/i.test(s) ? s.toLowerCase() : null)),
  externalId: (v?: string | null) => hashNormalized(v, (s) => s.trim()),
};

export const googleHash = {
  email: (v?: string | null) => hashNormalized(v, normalizeEmailGoogle),
  phone: (v?: string | null) => hashNormalized(v, (s) => normalizePhoneE164(s)),
};
