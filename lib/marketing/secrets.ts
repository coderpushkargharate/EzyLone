import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Encryption-at-rest for integration credentials (OAuth access and refresh
// tokens, Page tokens, the Meta CAPI token, API keys saved in the panel).
// AES-256-GCM with a key that never goes into the database, so a copy of the
// database alone never yields a usable secret.
//
// Key source (READ-ONLY here — this module never creates a key):
//   1. MARKETING_ENCRYPTION_KEY (server env), else
//   2. the key file: MARKETING_KEY_FILE, else ~/.ezyloan/marketing.key, else the
//      legacy ./.data/marketing.key.
// A new key file is created ONLY by createKeyFile(), which lib/marketing/keyManager.ts
// calls after confirming that no encrypted data or key fingerprint already
// exists in the database — so a lost key is reported, never silently replaced.
//
// No DB / Next imports, so it is unit-tested directly.

const PREFIX = 'enc:v1:';

export class MarketingConfigError extends Error {}

/** Where a newly created key file is written. */
export function defaultKeyFilePath(): string {
  return process.env.MARKETING_KEY_FILE?.trim() || path.join(os.homedir(), '.ezyloan', 'marketing.key');
}

/** Key file locations checked, in order (first existing one wins). */
export function keyFileCandidates(): string[] {
  const configured = process.env.MARKETING_KEY_FILE?.trim();
  if (configured) return [configured];
  return [path.join(os.homedir(), '.ezyloan', 'marketing.key'), path.join(process.cwd(), '.data', 'marketing.key')];
}

let cached: { raw: string; source: 'env' | 'file'; file?: string } | null = null;

/** Forget the cached key (tests; after createKeyFile). */
export function resetKeyCache(): void {
  cached = null;
}

function readKey(): { raw: string; source: 'env' | 'file'; file?: string } | null {
  const envKey = process.env.MARKETING_ENCRYPTION_KEY?.trim();
  if (envKey) return { raw: envKey, source: 'env' };
  if (cached) return cached;
  for (const file of keyFileCandidates()) {
    try {
      const raw = fs.readFileSync(file, 'utf8').trim();
      if (raw) {
        cached = { raw, source: 'file', file };
        return cached;
      }
    } catch {
      /* not there */
    }
  }
  return null;
}

function parseKey(raw: string): Buffer {
  const key = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, 'hex') : Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new MarketingConfigError('The encryption key must be 32 bytes (64 hex chars or base64).');
  return key;
}

/** Where the key comes from, without creating anything. */
export function encryptionKeySource(): 'env' | 'file' | null {
  return readKey()?.source || null;
}

export function encryptionKeyFile(): string | undefined {
  return readKey()?.file;
}

/**
 * Non-secret identifier of the current key: HMAC-SHA256(key, label), first 16 hex.
 * Stored in the DB so a different key is detected; it cannot be used to recover the key.
 */
export function keyFingerprint(): string | null {
  const k = readKey();
  if (!k) return null;
  return crypto.createHmac('sha256', parseKey(k.raw)).update('ezyloan-marketing-key-check-v1').digest('hex').slice(0, 16);
}

/**
 * Create a new key file (0600 in a 0700 directory). Never overwrites: fails if the
 * file exists. Callers must check for existing encrypted data first (keyManager).
 */
export function createKeyFile(): string {
  const file = defaultKeyFilePath();
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  fs.writeFileSync(file, crypto.randomBytes(32).toString('base64'), { mode: 0o600, flag: 'wx' });
  try {
    fs.chmodSync(file, 0o600);
  } catch {
    /* non-POSIX filesystem */
  }
  resetKeyCache();
  return file;
}

function loadKey(): Buffer {
  const k = readKey();
  if (!k) {
    throw new MarketingConfigError(
      'No encryption key on the server. Set MARKETING_ENCRYPTION_KEY or restore the key file (see Marketing & Ads → Settings).'
    );
  }
  return parseKey(k.raw);
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
