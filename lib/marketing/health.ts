import { connectDB } from '@/lib/db';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import type { IMarketingConnection } from '@/lib/models/MarketingConnection';
import { sendSecurityAlert } from '@/lib/email';
import { META_REQUIRED_SCOPES } from './config';
import { decryptSecret } from './secrets';
import { debugToken } from './meta/graph';
import { getGoogleAccessToken } from './google/oauth';
import { PlatformError } from './types';
import { syncLog } from './log';

// Real connection health checks (never assumed). Run by the worker every few
// hours and on demand from the admin panel. Emails the alert inbox when a token
// is invalid or about to expire.

const WARN_BEFORE_MS = 7 * 86_400_000;

export async function checkMetaHealth(): Promise<string> {
  await connectDB();
  const conn = await MarketingConnection.findOne({ provider: 'meta' }).lean<IMarketingConnection>();
  if (!conn?.tokenEnc || conn.status === 'disconnected') return 'not connected';
  try {
    const info = await debugToken(decryptSecret(conn.tokenEnc)!);
    const missing = META_REQUIRED_SCOPES.filter((s) => !info.scopes.includes(s));
    const status = !info.isValid ? 'expired' : missing.length ? 'needs_attention' : 'connected';
    await MarketingConnection.updateOne(
      { provider: 'meta' },
      {
        $set: {
          status,
          scopes: info.scopes,
          missingScopes: missing,
          tokenExpiresAt: info.expiresAt,
          dataAccessExpiresAt: info.dataAccessExpiresAt,
          lastCheckedAt: new Date(),
          ...(info.isValid ? { lastSuccessAt: new Date() } : { lastError: { at: new Date(), message: 'Meta reports the token is no longer valid.', kind: 'auth' } }),
        },
      }
    );
    const soonest = [info.expiresAt, info.dataAccessExpiresAt].filter(Boolean).map((d) => d!.getTime()).sort()[0];
    if (!info.isValid) {
      await sendSecurityAlert('meta-token-invalid', 'Meta integration needs reconnecting', { Problem: 'The Meta access token is invalid or revoked.', Fix: 'Admin → Marketing → Integrations → Reconnect Meta' }).catch(() => {});
    } else if (soonest && soonest - Date.now() < WARN_BEFORE_MS) {
      await sendSecurityAlert('meta-token-expiring', 'Meta integration access expires soon', { Expires: new Date(soonest).toISOString(), Fix: 'Admin → Marketing → Integrations → Reconnect Meta' }).catch(() => {});
    }
    await syncLog('meta', 'token_check', status === 'connected' ? 'ok' : 'error', `Token ${info.isValid ? 'valid' : 'INVALID'}${missing.length ? `; missing: ${missing.join(', ')}` : ''}`);
    return status;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await syncLog('meta', 'token_check', 'error', `Health check failed: ${msg}`);
    return `check failed: ${msg}`;
  }
}

export async function checkGoogleHealth(): Promise<string> {
  await connectDB();
  const conn = await MarketingConnection.findOne({ provider: 'google' }).lean<IMarketingConnection>();
  if (!conn?.refreshTokenEnc || conn.status === 'disconnected') return 'not connected';
  try {
    await getGoogleAccessToken(true); // proves the refresh token still works
    const status = conn.missingScopes?.length ? 'needs_attention' : 'connected';
    await MarketingConnection.updateOne({ provider: 'google' }, { $set: { status, lastCheckedAt: new Date(), lastSuccessAt: new Date() } });
    await syncLog('google', 'token_check', 'ok', 'Refresh token valid');
    return status;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (e instanceof PlatformError && e.kind === 'auth') {
      await sendSecurityAlert('google-token-invalid', 'Google Ads integration needs reconnecting', { Problem: msg, Fix: 'Admin → Marketing → Integrations → Reconnect Google' }).catch(() => {});
    }
    await syncLog('google', 'token_check', 'error', `Health check failed: ${msg}`);
    return `check failed: ${msg}`;
  }
}
