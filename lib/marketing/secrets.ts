import crypto from 'crypto';

// Encryption-at-rest for marketing integration credentials (OAuth access and
// refresh tokens, Page tokens, the Meta CAPI dataset token). AES-256-GCM with a
// key held ONLY in the server environment (MARKETING_ENCRYPTION_KEY), so a copy
// of the database alone never yields a usable token.
//
// Pure module (no DB / Next imports) so it is unit-tested directly.

const PREFIX = 'enc:v1:';

export class MarketingConfigError extends Error {}

function loadKey(raw = process.env.MARKETING_ENCRYPTION_KEY): Buffer {
  if (!raw) {
    throw new MarketingConfigError(
      'MARKETING_ENCRYPTION_KEY is not set — marketing integrations cannot store credentials.'
    );
  }
  const trimmed = raw.trim();
  const key = /^[0-9a-f]{64}$/i.test(trimmed) ? Buffer.from(trimmed, 'hex') : Buffer.from(trimmed, 'base64');
  if (key.length !== 32) {
    throw new MarketingConfigError('MARKETING_ENCRYPTION_KEY must be 32 bytes (64 hex chars or base64).');
  }
  return key;
}

export function encryptionConfigured(): boolean {
  try {
    loadKey();
    return true;
  } catch {
    return false;
  }
}

export function encryptSecret(plain: string): string {
  const key = loadKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return PREFIX + Buffer.concat([iv, tag, enc]).toString('base64url');
}

export function decryptSecret(blob: string | null | undefined): string | null {
  if (!blob) return null;
  if (!blob.startsWith(PREFIX)) throw new MarketingConfigError('Stored credential is not in the expected encrypted format.');
  const key = loadKey();
  const buf = Buffer.from(blob.slice(PREFIX.length), 'base64url');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
}

/** Strip anything that looks like a credential from a string before it is logged or stored as an error. */
export function redactSecrets(text: string): string {
  return String(text)
    .replace(/(access_token|refresh_token|client_secret|appsecret_proof|code|token)=([^&\s"']+)/gi, '$1=[redacted]')
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/g, 'Bearer [redacted]')
    .replace(/\bEAA[A-Za-z0-9]{20,}\b/g, '[redacted-meta-token]')
    .replace(/\bya29\.[A-Za-z0-9._-]+/g, '[redacted-google-token]')
    .replace(/\b1\/\/[A-Za-z0-9._-]{20,}/g, '[redacted-google-refresh]');
}
