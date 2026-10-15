import { connectDB } from '@/lib/db';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import type { IMarketingConnection } from '@/lib/models/MarketingConnection';
import { googleAppConfig } from '../config';
import { encryptSecret, decryptSecret } from '../secrets';
import { fetchWithTimeout } from '../retry';
import { PlatformError } from '../types';
import { classifyGoogleError } from './payload';
import { syncLog } from '../log';

// Google OAuth 2.0 (web server flow, offline access, PKCE).
// https://developers.google.com/identity/protocols/oauth2/web-server

const TOKEN_URL = 'https://oauth2.googleapis.com/token';

export function googleAuthorizeUrl(state: string, codeChallenge: string): string {
  const cfg = googleAppConfig();
  if (!cfg.clientId) throw new PlatformError({ kind: 'config', retryable: false, message: 'GOOGLE_OAUTH_CLIENT_ID is not configured.' });
  const p = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    response_type: 'code',
    scope: cfg.scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent', // guarantees a refresh token is issued
    include_granted_scopes: 'true',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

async function tokenCall(params: Record<string, string>) {
  const res = await fetchWithTimeout(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    // invalid_grant = refresh token revoked/expired → re-consent required.
    if (body?.error === 'invalid_grant') throw new PlatformError({ kind: 'auth', retryable: false, message: 'Google authorization was revoked or expired — reconnect Google Ads.' });
    throw new PlatformError(classifyGoogleError(res.status, { error: { message: body?.error_description || body?.error } }));
  }
  return body as { access_token: string; expires_in: number; refresh_token?: string; scope?: string };
}

export async function exchangeGoogleCode(code: string, codeVerifier: string, connectedBy: string): Promise<void> {
  const cfg = googleAppConfig();
  if (!cfg.clientId || !cfg.clientSecret) throw new PlatformError({ kind: 'config', retryable: false, message: 'Google OAuth client is not configured.' });
  const t = await tokenCall({
    code,
    code_verifier: codeVerifier,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    redirect_uri: cfg.redirectUri,
    grant_type: 'authorization_code',
  });
  if (!t.refresh_token) throw new PlatformError({ kind: 'auth', retryable: false, message: 'Google did not return a refresh token — remove the app at myaccount.google.com/permissions and reconnect.' });
  const scopes = (t.scope || '').split(' ').filter(Boolean);
  const missing = cfg.scopes.filter((s) => !scopes.includes(s));
  await connectDB();
  await MarketingConnection.updateOne(
    { provider: 'google' },
    {
      $set: {
        provider: 'google',
        status: missing.length ? 'needs_attention' : 'connected',
        scopes,
        missingScopes: missing,
        refreshTokenEnc: encryptSecret(t.refresh_token),
        tokenEnc: encryptSecret(t.access_token),
        tokenExpiresAt: new Date(Date.now() + (t.expires_in - 60) * 1000),
        connectedAt: new Date(),
        connectedBy,
        lastSuccessAt: new Date(),
        lastCheckedAt: new Date(),
        lastError: null,
      },
    },
    { upsert: true }
  );
  await syncLog('google', 'oauth', missing.length ? 'partial' : 'ok', `Google connected${missing.length ? ` — missing scopes: ${missing.join(', ')}` : ''}`);
}

/** A valid access token, refreshed when within a minute of expiry. */
export async function getGoogleAccessToken(force = false): Promise<string> {
  await connectDB();
  const conn = await MarketingConnection.findOne({ provider: 'google' }).lean<IMarketingConnection>();
  if (!conn?.refreshTokenEnc || conn.status === 'disconnected') {
    throw new PlatformError({ kind: 'config', retryable: false, message: 'Google Ads is not connected.' });
  }
  if (!force && conn.tokenEnc && conn.tokenExpiresAt && new Date(conn.tokenExpiresAt).getTime() > Date.now()) {
    return decryptSecret(conn.tokenEnc)!;
  }
  const cfg = googleAppConfig();
  if (!cfg.clientId || !cfg.clientSecret) throw new PlatformError({ kind: 'config', retryable: false, message: 'Google OAuth client is not configured.' });
  try {
    const t = await tokenCall({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      refresh_token: decryptSecret(conn.refreshTokenEnc)!,
      grant_type: 'refresh_token',
    });
    await MarketingConnection.updateOne(
      { provider: 'google' },
      { $set: { tokenEnc: encryptSecret(t.access_token), tokenExpiresAt: new Date(Date.now() + (t.expires_in - 60) * 1000) } }
    );
    return t.access_token;
  } catch (e) {
    if (e instanceof PlatformError && e.kind === 'auth') {
      await MarketingConnection.updateOne(
        { provider: 'google' },
        { $set: { status: 'expired', lastError: { at: new Date(), message: e.message, kind: 'auth' } } }
      );
    }
    throw e;
  }
}

export async function disconnectGoogle(): Promise<void> {
  await connectDB();
  const conn = await MarketingConnection.findOne({ provider: 'google' }).lean<IMarketingConnection>();
  const token = conn?.refreshTokenEnc ? decryptSecret(conn.refreshTokenEnc) : null;
  if (token) {
    await fetchWithTimeout('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token }).toString(),
    }).catch(() => undefined);
  }
  await MarketingConnection.updateOne(
    { provider: 'google' },
    { $set: { status: 'disconnected', scopes: [], missingScopes: [] }, $unset: { tokenEnc: '', refreshTokenEnc: '', tokenExpiresAt: '' } }
  );
  await syncLog('google', 'oauth', 'info', 'Google disconnected — refresh token revoked and deleted');
}
