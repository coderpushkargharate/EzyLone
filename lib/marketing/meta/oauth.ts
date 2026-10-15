import { connectDB } from '@/lib/db';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import type { IMarketingConnection, IMetaPageAsset } from '@/lib/models/MarketingConnection';
import { META_GRAPH_VERSION, META_REQUIRED_SCOPES, metaAppConfig } from '../config';
import { encryptSecret, decryptSecret } from '../secrets';
import { graph, graphAll, debugToken } from './graph';
import { fetchWithTimeout } from '../retry';
import { PlatformError } from '../types';
import { classifyMetaError } from './payload';
import { syncLog } from '../log';

// Meta (Facebook Login) OAuth for the Marketing Integrations panel.
// Flow: authorize dialog → code → short-lived user token → long-lived user token
// (fb_exchange_token) → Page tokens via /me/accounts (Page tokens obtained from
// a long-lived user token do not expire, but are invalidated if the user's
// access is revoked — the health check catches that).

export function metaAuthorizeUrl(state: string): string {
  const cfg = metaAppConfig();
  if (!cfg.appId) throw new PlatformError({ kind: 'config', retryable: false, message: 'META_APP_ID is not configured.' });
  const p = new URLSearchParams({
    client_id: cfg.appId,
    redirect_uri: cfg.redirectUri,
    state,
    response_type: 'code',
  });
  if (cfg.configId) p.set('config_id', cfg.configId); // Facebook Login for Business
  else p.set('scope', cfg.scopes.join(','));
  return `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?${p}`;
}

async function tokenRequest(params: Record<string, string>): Promise<{ access_token: string; expires_in?: number }> {
  const res = await fetchWithTimeout(`${graph.base}/oauth/access_token?${new URLSearchParams(params)}`, {}, 15_000);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) throw new PlatformError(classifyMetaError(res.status, body));
  return body;
}

export async function exchangeMetaCode(code: string): Promise<string> {
  const cfg = metaAppConfig();
  if (!cfg.appId || !cfg.appSecret) throw new PlatformError({ kind: 'config', retryable: false, message: 'META_APP_ID / META_APP_SECRET not configured.' });
  const short = await tokenRequest({ client_id: cfg.appId, client_secret: cfg.appSecret, redirect_uri: cfg.redirectUri, code });
  const long = await tokenRequest({
    grant_type: 'fb_exchange_token',
    client_id: cfg.appId,
    client_secret: cfg.appSecret,
    fb_exchange_token: short.access_token,
  });
  return long.access_token;
}

/** Read pages (with Page tokens) and ad accounts the user granted, and persist the connection. */
export async function saveMetaConnection(userToken: string, connectedBy: string): Promise<void> {
  await connectDB();
  const info = await debugToken(userToken);
  if (!info.isValid) throw new PlatformError({ kind: 'auth', retryable: false, message: 'Meta returned an invalid token.' });
  const me = await graph.get('/me', userToken, { fields: 'id,name' });
  const existing = await MarketingConnection.findOne({ provider: 'meta' }).lean<IMarketingConnection>();
  const prevPages = new Map((existing?.meta?.pages || []).map((p) => [p.id, p]));

  const pagesRaw = await graphAll<{ id: string; name: string; access_token?: string; tasks?: string[] }>(
    '/me/accounts', userToken, { fields: 'id,name,access_token,tasks', limit: 100 }
  );
  const pages: IMetaPageAsset[] = pagesRaw.map((p) => ({
    id: p.id,
    name: p.name,
    tasks: p.tasks,
    tokenEnc: p.access_token ? encryptSecret(p.access_token) : undefined,
    subscribed: prevPages.get(p.id)?.subscribed || false,
    subscribedAt: prevPages.get(p.id)?.subscribedAt,
    forms: prevPages.get(p.id)?.forms || [],
  }));

  let adAccounts: { id: string; name: string; currency?: string; status?: number }[] = [];
  if (info.scopes.includes('ads_read') || info.scopes.includes('ads_management')) {
    const raw = await graphAll<{ id: string; name: string; currency?: string; account_status?: number }>(
      '/me/adaccounts', userToken, { fields: 'id,name,currency,account_status', limit: 100 }
    ).catch(() => []);
    adAccounts = raw.map((a) => ({ id: a.id, name: a.name, currency: a.currency, status: a.account_status }));
  }

  const missing = META_REQUIRED_SCOPES.filter((s) => !info.scopes.includes(s));
  await MarketingConnection.updateOne(
    { provider: 'meta' },
    {
      $set: {
        provider: 'meta',
        status: missing.length ? 'needs_attention' : 'connected',
        accountId: String(me.id || info.userId || ''),
        accountName: String(me.name || ''),
        scopes: info.scopes,
        missingScopes: missing,
        tokenEnc: encryptSecret(userToken),
        tokenExpiresAt: info.expiresAt,
        dataAccessExpiresAt: info.dataAccessExpiresAt,
        connectedAt: new Date(),
        connectedBy,
        lastCheckedAt: new Date(),
        lastSuccessAt: new Date(),
        lastError: null,
        'meta.pages': pages,
        'meta.adAccounts': adAccounts,
      },
    },
    { upsert: true }
  );
  await syncLog('meta', 'oauth', missing.length ? 'partial' : 'ok',
    `Connected as ${String(me.name || 'Meta user')} — ${pages.length} page(s), ${adAccounts.length} ad account(s)` +
      (missing.length ? `. Missing permissions: ${missing.join(', ')}` : ''));
}

/** Subscribe / unsubscribe a Page to this app's `leadgen` webhook, and load its lead forms. */
export async function setPageSubscription(pageId: string, subscribe: boolean): Promise<void> {
  await connectDB();
  const conn = await MarketingConnection.findOne({ provider: 'meta' }).lean<IMarketingConnection>();
  const page = conn?.meta?.pages?.find((p) => p.id === pageId);
  if (!page?.tokenEnc) throw new PlatformError({ kind: 'config', retryable: false, message: 'Page not found in the Meta connection — reconnect Meta.' });
  const token = decryptSecret(page.tokenEnc)!;
  if (subscribe) {
    const r = await graph.post(`/${pageId}/subscribed_apps`, token, { subscribed_fields: 'leadgen' });
    if (r.success !== true) throw new PlatformError({ kind: 'invalid', retryable: false, message: 'Meta did not confirm the page subscription.' });
    const forms = await graphAll<{ id: string; name: string; status?: string }>(
      `/${pageId}/leadgen_forms`, token, { fields: 'id,name,status', limit: 100 }
    ).catch(() => []);
    await MarketingConnection.updateOne(
      { provider: 'meta', 'meta.pages.id': pageId },
      { $set: { 'meta.pages.$.subscribed': true, 'meta.pages.$.subscribedAt': new Date(), 'meta.pages.$.forms': forms.map((f) => ({ id: f.id, name: f.name, status: f.status })) } }
    );
    await syncLog('meta', 'oauth', 'ok', `Subscribed page "${page.name}" to leadgen webhooks (${forms.length} form(s))`);
  } else {
    await graph.del(`/${pageId}/subscribed_apps`, token).catch(() => undefined);
    await MarketingConnection.updateOne(
      { provider: 'meta', 'meta.pages.id': pageId },
      { $set: { 'meta.pages.$.subscribed': false } }
    );
    await syncLog('meta', 'oauth', 'info', `Unsubscribed page "${page.name}" from leadgen webhooks`);
  }
}

/** Ad pixels / datasets available on the selected ad accounts (for the CAPI dataset picker). */
export async function listPixels(adAccountIds: string[]): Promise<{ id: string; name: string; adAccountId: string }[]> {
  await connectDB();
  const conn = await MarketingConnection.findOne({ provider: 'meta' }).lean<IMarketingConnection>();
  if (!conn?.tokenEnc) return [];
  const token = decryptSecret(conn.tokenEnc)!;
  const out: { id: string; name: string; adAccountId: string }[] = [];
  for (const act of adAccountIds.slice(0, 10)) {
    const rows = await graphAll<{ id: string; name: string }>(`/${act}/adspixels`, token, { fields: 'id,name' }).catch(() => []);
    out.push(...rows.map((r) => ({ id: r.id, name: r.name, adAccountId: act })));
  }
  return out;
}

/** Disconnect: unsubscribe pages, revoke the app's permissions, wipe stored tokens. */
export async function disconnectMeta(): Promise<void> {
  await connectDB();
  const conn = await MarketingConnection.findOne({ provider: 'meta' }).lean<IMarketingConnection>();
  if (conn) {
    for (const p of conn.meta?.pages || []) {
      if (p.subscribed && p.tokenEnc) {
        try {
          await graph.del(`/${p.id}/subscribed_apps`, decryptSecret(p.tokenEnc)!);
        } catch {
          /* best effort */
        }
      }
    }
    if (conn.tokenEnc) {
      try {
        await graph.del('/me/permissions', decryptSecret(conn.tokenEnc)!);
      } catch {
        /* token may already be invalid */
      }
    }
  }
  await MarketingConnection.updateOne(
    { provider: 'meta' },
    {
      $set: { status: 'disconnected', scopes: [], missingScopes: [], 'meta.pages': [], 'meta.adAccounts': [] },
      $unset: { tokenEnc: '', tokenExpiresAt: '', dataAccessExpiresAt: '', 'meta.capiTokenEnc': '' },
    }
  );
  await syncLog('meta', 'oauth', 'info', 'Meta disconnected — tokens deleted and permissions revoked');
}
