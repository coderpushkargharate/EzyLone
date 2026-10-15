import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Encryption-at-rest for integration credentials (OAuth access and refresh
// tokens, Page tokens, the Meta CAPI token, API keys saved in the panel).
// AES-256-GCM with a key that never goes into the database, so a copy of the
// database alone never yields a usable secret. Key source, in order:
//   1. MARKETING_ENCRYPTION_KEY (server env), or
//   2. a key file on the server (MARKETING_KEY_FILE, default ./.data/marketing.key),
//      created automatically with mode 0600 on first use. Back it up: if it is
//      lost, saved keys/tokens must be re-entered and platforms reconnected.
//
// Pure module (no DB / Next imports) so it is unit-tested directly.

const PREFIX = 'enc:v1:';

export class MarketingConfigError extends Error {}

function keyFilePath(): string {
  return process.env.MARKETING_KEY_FILE?.trim() || path.join(process.cwd(), '.data', 'marketing.key');
}

let fileKey: string | null = null;

/** Read the key file, creating it (0600) on first use. Returns null if the disk is not writable. */
function keyFromFile(create: boolean): string | null {
  if (fileKey) return fileKey;
  const file = keyFilePath();
  try {
    fileKey = fs.readFileSync(file, 'utf8').trim() || null;
    if (fileKey) return fileKey;
  } catch {
    /* missing */
  }
  if (!create) return null;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
    const k = crypto.randomBytes(32).toString('base64');
    fs.writeFileSync(file, k, { mode: 0o600, flag: 'wx' }); // wx: never overwrite an existing key
    fileKey = k;
    return k;
  } catch {
    try {
      fileKey = fs.readFileSync(file, 'utf8').trim() || null; // another process won the race
      return fileKey;
    } catch {
      return null;
    }
  }
}

/** Where the encryption key comes from ('env' | 'file'), or null when none is usable. */
export function encryptionKeySource(): 'env' | 'file' | null {
  if (process.env.MARKETING_ENCRYPTION_KEY?.trim()) return 'env';
  return keyFromFile(true) ? 'file' : null;
}

function loadKey(raw = process.env.MARKETING_ENCRYPTION_KEY?.trim() || keyFromFile(true) || undefined): Buffer {
  if (!raw) {
    throw new MarketingConfigError(
      'No encryption key: set MARKETING_ENCRYPTION_KEY, or make the app folder writable so .data/marketing.key can be created.'
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
