import crypto from 'crypto';

// Pure helpers for authenticating inbound webhooks. No DB/Next imports so they
// can be unit-tested (scripts/test-webhook-auth.mjs).

/** Constant-time string comparison (hashes first, so lengths never leak). */
export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || !b) return false;
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export type SignatureCheck = 'valid' | 'invalid' | 'unconfigured';

/**
 * Verify Meta's `X-Hub-Signature-256: sha256=<hex HMAC of the raw body>`.
 * 'unconfigured' means no App Secret is available, so authenticity can't be
 * proven — callers must treat that as a rejection unless explicitly opted out.
 */
export function verifyMetaSignature(
  rawBody: string,
  header: string | null | undefined,
  appSecret: string | null | undefined
): SignatureCheck {
  if (!appSecret) return 'unconfigured';
  if (!header || !header.startsWith('sha256=')) return 'invalid';
  const expected = 'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex');
  return safeEqual(expected, header) ? 'valid' : 'invalid';
}

/** Explicit, documented opt-out flags. Only the exact string "true" enables them. */
export function envFlag(name: string): boolean {
  return process.env[name] === 'true';
}

/**
 * True when the request was addressed to this machine (local dev / test runs).
 * Meta, Zapier etc. can never call localhost, so a rejected webhook there is a
 * test — log it, but don't email a production alert. Spoofing the Host header
 * on the real site only suppresses an e-mail; the request is still rejected.
 */
export function isLocalRequest(host: string | null | undefined): boolean {
  return /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test((host || '').trim());
}
