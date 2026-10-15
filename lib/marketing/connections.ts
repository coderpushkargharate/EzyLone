import { connectDB } from '@/lib/db';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import type { IMarketingConnection, ConnectionStatus } from '@/lib/models/MarketingConnection';
import { Integration } from '@/lib/models/Integration';
import { decryptSecret, redactSecrets } from './secrets';
import type { ErrorKind } from './types';

// Server-side access to platform connections and their decrypted tokens.
// Decrypted tokens exist only in memory inside these helpers' callers.

export async function getConnection(provider: 'meta' | 'google'): Promise<IMarketingConnection | null> {
  await connectDB();
  return MarketingConnection.findOne({ provider }).lean<IMarketingConnection>();
}

/** Page access token for a Lead Ads page: OAuth-connected page first, then the legacy manual config. */
export async function getPageToken(pageId?: string | null): Promise<{ token: string | null; via: 'oauth' | 'manual' | null }> {
  const conn = await getConnection('meta');
  if (conn?.status !== 'disconnected' && conn?.meta?.pages?.length) {
    const page = pageId ? conn.meta.pages.find((p) => p.id === String(pageId)) : conn.meta.pages.find((p) => p.subscribed);
    if (page?.tokenEnc) {
      try {
        return { token: decryptSecret(page.tokenEnc), via: 'oauth' };
      } catch {
        /* fall through to manual */
      }
    }
  }
  // Legacy: Page token typed into Automations → Facebook Lead Ads (shared `integrations` row).
  const integ = await Integration.findOne({ provider: 'facebook' }).lean();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const manual = (integ as any)?.config?.pageAccessToken as string | undefined;
  return manual ? { token: manual, via: 'manual' } : { token: null, via: null };
}

export async function getMetaUserToken(): Promise<string | null> {
  const conn = await getConnection('meta');
  if (!conn?.tokenEnc || conn.status === 'disconnected') return null;
  return decryptSecret(conn.tokenEnc);
}

/** Conversions API credentials: the dataset id and its Events Manager access token. */
export async function getCapiCredentials(): Promise<{ datasetId: string; token: string } | null> {
  const conn = await getConnection('meta');
  const datasetId = conn?.meta?.datasetId;
  if (!datasetId || !conn?.meta?.capiTokenEnc) return null;
  const token = decryptSecret(conn.meta.capiTokenEnc);
  return token ? { datasetId, token } : null;
}

const KIND_TO_STATUS: Partial<Record<ErrorKind, ConnectionStatus>> = {
  auth: 'expired',
  permission: 'needs_attention',
};

/** Record a platform failure against the connection so the health card is truthful. */
export async function recordConnectionError(provider: 'meta' | 'google', message: string, kind?: ErrorKind): Promise<void> {
  await connectDB();
  const set: Record<string, unknown> = {
    lastError: { at: new Date(), message: redactSecrets(message).slice(0, 500), kind },
    lastCheckedAt: new Date(),
  };
  const status = kind ? KIND_TO_STATUS[kind] : undefined;
  if (status) set.status = status;
  await MarketingConnection.updateOne({ provider, status: { $ne: 'disconnected' } }, { $set: set });
}

export async function recordConnectionSuccess(provider: 'meta' | 'google'): Promise<void> {
  await connectDB();
  await MarketingConnection.updateOne(
    { provider, status: { $ne: 'disconnected' } },
    { $set: { lastSuccessAt: new Date(), lastCheckedAt: new Date() } }
  );
}

/** Browser-safe view of a connection: no token fields, ever. */
export function publicConnectionView(c: IMarketingConnection | null) {
  if (!c) return { status: 'disconnected' as ConnectionStatus };
  return {
    status: c.status,
    accountId: c.accountId,
    accountName: c.accountName,
    scopes: c.scopes,
    missingScopes: c.missingScopes,
    tokenExpiresAt: c.tokenExpiresAt,
    dataAccessExpiresAt: c.dataAccessExpiresAt,
    connectedAt: c.connectedAt,
    connectedBy: c.connectedBy,
    lastCheckedAt: c.lastCheckedAt,
    lastSuccessAt: c.lastSuccessAt,
    lastError: c.lastError,
    meta: c.meta
      ? {
          pages: (c.meta.pages || []).map((p) => ({
            id: p.id,
            name: p.name,
            subscribed: !!p.subscribed,
            subscribedAt: p.subscribedAt,
            hasToken: !!p.tokenEnc,
            tasks: p.tasks,
            forms: p.forms || [],
          })),
          adAccounts: c.meta.adAccounts || [],
          selectedAdAccountIds: c.meta.selectedAdAccountIds || [],
          datasetId: c.meta.datasetId,
          capiTokenSet: !!c.meta.capiTokenEnc,
        }
      : undefined,
    google: c.google
      ? {
          customerId: c.google.customerId,
          loginCustomerId: c.google.loginCustomerId,
          accessibleCustomers: c.google.accessibleCustomers || [],
          conversionActions: c.google.conversionActions || [],
          currency: c.google.currency,
          refreshTokenSet: !!c.refreshTokenEnc,
          searchConsoleSite: c.google.searchConsoleSite,
          sites: c.google.sites || [],
          ga4PropertyId: c.google.ga4PropertyId,
          ga4Properties: c.google.ga4Properties || [],
        }
      : undefined,
  };
}
