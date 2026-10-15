import { connectDB } from '@/lib/db';
import { AppCredential } from '@/lib/models/AppCredential';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import { KeyCheck } from '@/lib/models/MarketingSupport';
import { MarketingConfigError, createKeyFile, decryptSecret, defaultKeyFilePath, encryptionKeyFile, encryptionKeySource, keyFingerprint } from './secrets';

// Safe lifecycle for the encryption key that protects saved API keys and tokens.
//
//  - A key is created only when the database holds NO encrypted record and NO
//    stored key fingerprint, i.e. on a genuinely fresh install.
//  - If encrypted data exists but the key is missing, nothing is generated:
//    writes are refused with instructions to restore the original key.
//  - The key's fingerprint (an HMAC, not the key) is stored in key_checks, so a
//    different key (wrong env value, another server's file) is detected instead
//    of silently producing undecryptable data.

export interface KeyStatus {
  present: boolean;
  source: 'env' | 'file' | null;
  file?: string;
  defaultFile: string;
  fingerprint: string | null;
  storedFingerprint: string | null;
  encryptedRecords: number;
  matches: boolean | null; // null = nothing stored yet to compare with
  problem?: string;
}

/** Count records holding ciphertext produced by the key. */
export async function countEncryptedRecords(): Promise<number> {
  await connectDB();
  const [creds, conns] = await Promise.all([
    AppCredential.countDocuments({ enc: { $exists: true, $ne: null } }),
    MarketingConnection.countDocuments({
      $or: [
        { tokenEnc: { $exists: true, $ne: null } },
        { refreshTokenEnc: { $exists: true, $ne: null } },
        { 'meta.capiTokenEnc': { $exists: true, $ne: null } },
        { 'meta.pages.tokenEnc': { $exists: true } },
      ],
    }),
  ]);
  return creds + conns;
}

/** With no fingerprint stored yet, prove the current key can read an existing record. */
async function currentKeyReadsExistingData(): Promise<boolean | null> {
  const has = { $exists: true, $ne: null };
  const cred = await AppCredential.findOne({ enc: has }).select('enc').lean();
  const conn = cred
    ? null
    : await MarketingConnection.findOne({ $or: [{ tokenEnc: has }, { refreshTokenEnc: has }, { 'meta.capiTokenEnc': has }] })
        .select('tokenEnc refreshTokenEnc meta.capiTokenEnc')
        .lean();
  const sample = cred?.enc || conn?.tokenEnc || conn?.refreshTokenEnc || conn?.meta?.capiTokenEnc;
  if (!sample) return null;
  try {
    decryptSecret(sample);
    return true;
  } catch {
    return false;
  }
}

export async function keyStatus(): Promise<KeyStatus> {
  await connectDB();
  const [stored, encryptedRecords] = await Promise.all([KeyCheck.findById('encryption').lean(), countEncryptedRecords()]);
  let fingerprint: string | null = null;
  let problem: string | undefined;
  try {
    fingerprint = keyFingerprint();
  } catch (e) {
    problem = e instanceof Error ? e.message : String(e);
  }
  const source = encryptionKeySource();
  const storedFingerprint = stored?.fingerprint || null;
  const matches = fingerprint && storedFingerprint
    ? fingerprint === storedFingerprint
    : fingerprint && encryptedRecords > 0
      ? await currentKeyReadsExistingData()
      : null;
  if (!problem) {
    if (!source && (encryptedRecords > 0 || storedFingerprint)) {
      problem = `The encryption key is missing, but ${encryptedRecords} encrypted record(s) depend on it. Restore the original key (MARKETING_ENCRYPTION_KEY or the key file). A new key will NOT be generated automatically.`;
    } else if (matches === false) {
      problem = 'The encryption key on this server is not the key that encrypted the saved credentials. Restore the original key; saved keys and tokens cannot be read until then.';
    }
  }
  return {
    present: !!source,
    source,
    file: encryptionKeyFile(),
    defaultFile: defaultKeyFilePath(),
    fingerprint,
    storedFingerprint,
    encryptedRecords,
    matches,
    problem,
  };
}

/**
 * Call before writing any encrypted value. Ensures a usable key that matches
 * the stored fingerprint, creating a key file only on a fresh install.
 */
export async function ensureEncryptionKey(): Promise<KeyStatus> {
  let st = await keyStatus();
  if (st.problem) throw new MarketingConfigError(st.problem);
  if (!st.present) {
    // Fresh install: no key, no ciphertext, no fingerprint.
    try {
      createKeyFile();
    } catch (e) {
      throw new MarketingConfigError(
        `Could not create the encryption key file at ${defaultKeyFilePath()} (${(e as Error).message}). Set MARKETING_ENCRYPTION_KEY or MARKETING_KEY_FILE.`
      );
    }
    st = await keyStatus();
  }
  if (!st.storedFingerprint && st.fingerprint) {
    // First use of this key: remember its fingerprint. Upsert-without-overwrite so
    // two processes cannot store different fingerprints.
    try {
      await KeyCheck.updateOne({ _id: 'encryption' }, { $setOnInsert: { fingerprint: st.fingerprint, createdAt: new Date() } }, { upsert: true });
    } catch (e) {
      if ((e as { code?: number }).code !== 11000) throw e;
    }
    st = await keyStatus();
    if (st.problem) throw new MarketingConfigError(st.problem);
  }
  return st;
}
