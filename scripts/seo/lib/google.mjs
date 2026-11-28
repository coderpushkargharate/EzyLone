// Google API access for the read-only SEO scripts (Search Console, GA4, PageSpeed).
//
// Auth: a Google Cloud *service account* with read-only scopes. The key is read from
//   GOOGLE_SA_KEY_FILE  — path to the JSON key (local use; keep it OUTSIDE the repo), or
//   GOOGLE_SA_KEY_JSON  — the JSON itself (GitHub Actions secret).
// Nothing here writes to Google, the website or the database.
// See docs/GSC-INTEGRATION-GUIDE.md for how to create the account.

import { readFileSync } from 'node:fs';
import jwt from 'jsonwebtoken';

export const SCOPES = {
  searchConsole: 'https://www.googleapis.com/auth/webmasters.readonly',
  analytics: 'https://www.googleapis.com/auth/analytics.readonly',
};

export class SetupError extends Error {}

export function loadServiceAccount(env = process.env) {
  let raw = env.GOOGLE_SA_KEY_JSON;
  if (!raw && env.GOOGLE_SA_KEY_FILE) {
    try { raw = readFileSync(env.GOOGLE_SA_KEY_FILE, 'utf8'); }
    catch (e) { throw new SetupError(`Cannot read GOOGLE_SA_KEY_FILE (${e.code || e.message})`); }
  }
  if (!raw) throw new SetupError('No service account: set GOOGLE_SA_KEY_FILE or GOOGLE_SA_KEY_JSON (docs/GSC-INTEGRATION-GUIDE.md)');
  let key;
  try { key = JSON.parse(raw); } catch { throw new SetupError('Service account key is not valid JSON'); }
  if (key.type !== 'service_account' || !key.client_email || !key.private_key) {
    throw new SetupError('Key JSON is not a service account key (needs type=service_account, client_email, private_key)');
  }
  return key;
}

const tokenCache = new Map();

/** OAuth access token for the service account (JWT bearer grant). Cached until 60 s before expiry. */
export async function accessToken(scopes, key = loadServiceAccount()) {
  const scope = [].concat(scopes).join(' ');
  const hit = tokenCache.get(scope);
  if (hit && hit.exp > Date.now() + 60_000) return hit.token;
  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    { iss: key.client_email, scope, aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 },
    key.private_key,
    { algorithm: 'RS256' },
  );
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
    signal: AbortSignal.timeout(30_000),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new SetupError(`Token request failed (${r.status}): ${j.error_description || j.error || 'unknown'}`);
  tokenCache.set(scope, { token: j.access_token, exp: Date.now() + j.expires_in * 1000 });
  return j.access_token;
}

/** Remove secrets from a message: explicit values plus any `key=` query value found in `url`. */
export function redactSecrets(msg, url = '', extra = []) {
  const urlKey = (() => { try { return new URL(url).searchParams.get('key'); } catch { return null; } })();
  let out = String(msg);
  for (const s of [urlKey, ...extra].filter((x) => x && x.length >= 6)) out = out.split(s).join('[redacted]');
  return out.replace(/([?&]key=)[^&\s"']+/g, '$1[redacted]');
}

/**
 * JSON call to a Google API with retry on 429/5xx. Errors never include the OAuth token
 * (it is only in a header) or an API key (redacted from Google's message, from network
 * errors, and from any `key=` in the URL). Pass `redact` for any other secret.
 */
export async function googleJson(url, { scopes, body, method = body ? 'POST' : 'GET', redact = [] } = {}) {
  try {
    return await googleJsonRaw(url, { scopes, body, method });
  } catch (e) {
    const err = new Error(redactSecrets(e.message, url, redact));
    err.status = e.status;
    if (e instanceof SetupError) throw Object.assign(new SetupError(err.message), { status: e.status });
    throw err;
  }
}

async function googleJsonRaw(url, { scopes, body, method }) {
  for (let attempt = 0; ; attempt++) {
    const headers = { 'Content-Type': 'application/json' };
    if (scopes) headers.Authorization = `Bearer ${await accessToken(scopes)}`;
    const r = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(90_000) });
    if ((r.status === 429 || r.status >= 500) && attempt < 3) {
      await new Promise((res) => setTimeout(res, 2000 * 2 ** attempt));
      continue;
    }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = j.error?.message || r.statusText;
      const err = new Error(`${r.status} ${msg}`);
      err.status = r.status;
      throw err;
    }
    return j;
  }
}
