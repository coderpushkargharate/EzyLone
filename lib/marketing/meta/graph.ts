import crypto from 'crypto';
import { META_GRAPH_VERSION, metaAppConfig } from '../config';
import { classifyMetaError } from './payload';
import { fetchWithTimeout } from '../retry';
import { PlatformError } from '../types';

// Minimal Graph API client. Tokens travel in the request body / query string to
// graph.facebook.com only; URLs containing them are never logged. When the App
// Secret is configured every call carries appsecret_proof (HMAC of the token),
// so a leaked token alone cannot be used from elsewhere if "Require App Secret"
// is enabled on the Meta app.

const BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

function proof(token: string): string | undefined {
  const secret = metaAppConfig().appSecret;
  return secret ? crypto.createHmac('sha256', secret).update(token).digest('hex') : undefined;
}

type Params = Record<string, string | number | boolean | undefined>;

async function call(method: 'GET' | 'POST' | 'DELETE', path: string, token: string, params: Params = {}, opts: { timeoutMs?: number; noProof?: boolean } = {}) {
  const timeoutMs = opts.timeoutMs ?? 15_000;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined) qs.set(k, String(v));
  qs.set('access_token', token);
  const p = opts.noProof ? undefined : proof(token);
  if (p) qs.set('appsecret_proof', p);

  let res: Response;
  try {
    res =
      method === 'GET'
        ? await fetchWithTimeout(`${BASE}${path}?${qs}`, { method }, timeoutMs)
        : await fetchWithTimeout(`${BASE}${path}`, {
            method,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: qs.toString(),
          }, timeoutMs);
  } catch (e) {
    throw new PlatformError({ kind: 'transient', retryable: true, message: `Meta API unreachable: ${(e as Error).name}` });
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || (body && typeof body === 'object' && 'error' in body)) {
    throw new PlatformError(classifyMetaError(res.status, body));
  }
  return body as Record<string, unknown>;
}

export const graph = {
  get: (path: string, token: string, params?: Params) => call('GET', path, token, params),
  post: (path: string, token: string, params?: Params) => call('POST', path, token, params),
  // Conversions API tokens are generated in Events Manager and are not tied to
  // this app, so appsecret_proof must not be attached to them.
  postNoProof: (path: string, token: string, params?: Params) => call('POST', path, token, params, { noProof: true }),
  del: (path: string, token: string, params?: Params) => call('DELETE', path, token, params),
  base: BASE,
};

/** Follow cursor pagination (bounded) and return all `data` rows. */
export async function graphAll<T = Record<string, unknown>>(path: string, token: string, params: Params = {}, maxPages = 20): Promise<T[]> {
  const out: T[] = [];
  let after: string | undefined;
  for (let i = 0; i < maxPages; i++) {
    const body = await graph.get(path, token, { ...params, after });
    const data = Array.isArray(body.data) ? (body.data as T[]) : [];
    out.push(...data);
    const cursors = ((body.paging || {}) as { cursors?: { after?: string }; next?: string });
    if (!cursors.next || !cursors.cursors?.after) break;
    after = cursors.cursors.after;
  }
  return out;
}

/** Token introspection with the app access token. */
export async function debugToken(inputToken: string): Promise<{
  isValid: boolean;
  scopes: string[];
  expiresAt: Date | null;
  dataAccessExpiresAt: Date | null;
  userId?: string;
}> {
  const { appId, appSecret } = metaAppConfig();
  if (!appId || !appSecret) throw new PlatformError({ kind: 'config', retryable: false, message: 'META_APP_ID / META_APP_SECRET not configured.' });
  const body = await call('GET', '/debug_token', `${appId}|${appSecret}`, { input_token: inputToken });
  const d = (body.data || {}) as Record<string, unknown>;
  const ts = (v: unknown) => (typeof v === 'number' && v > 0 ? new Date(v * 1000) : null);
  return {
    isValid: d.is_valid === true,
    scopes: Array.isArray(d.scopes) ? (d.scopes as string[]) : [],
    expiresAt: ts(d.expires_at),
    dataAccessExpiresAt: ts(d.data_access_expires_at),
    userId: typeof d.user_id === 'string' ? d.user_id : undefined,
  };
}
