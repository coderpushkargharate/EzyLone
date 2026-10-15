import { GOOGLE_ADS_API_VERSION, googleAppConfig } from '../config';
import { fetchWithTimeout } from '../retry';
import { PlatformError } from '../types';
import { classifyGoogleError, cleanCustomerId } from './payload';
import { getGoogleAccessToken } from './oauth';

// Thin REST clients for the Google Ads API (account discovery, conversion
// actions, reporting, retractions — needs the developer token) and the Data
// Manager API (conversion ingestion — OAuth only).

const ADS_BASE = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;
const DM_BASE = 'https://datamanager.googleapis.com/v1';

/** Authorized request to any Google API with the connected account (refreshes once on 401). */
export async function googleFetch(url: string, init: RequestInit = { method: 'GET' }, extraHeaders: Record<string, string> = {}) {
  return send(url, init, extraHeaders);
}

async function send(url: string, init: RequestInit, extraHeaders: Record<string, string>, retried = false): Promise<Record<string, unknown>> {
  const token = await getGoogleAccessToken(retried);
  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extraHeaders },
    }, 20_000);
  } catch (e) {
    throw new PlatformError({ kind: 'transient', retryable: true, message: `Google API unreachable: ${(e as Error).name}` });
  }
  const body = await res.json().catch(() => ({}));
  if (res.status === 401 && !retried) return send(url, init, extraHeaders, true); // refresh once
  if (!res.ok) throw new PlatformError(classifyGoogleError(res.status, body));
  return body as Record<string, unknown>;
}

async function adsHeaders(loginCustomerId?: string | null): Promise<Record<string, string>> {
  const dev = (await googleAppConfig()).developerToken;
  if (!dev) throw new PlatformError({ kind: 'config', retryable: false, message: 'GOOGLE_ADS_DEVELOPER_TOKEN is not configured.' });
  const h: Record<string, string> = { 'developer-token': dev };
  const login = loginCustomerId ? cleanCustomerId(loginCustomerId) : null;
  if (login) h['login-customer-id'] = login;
  return h;
}

export async function listAccessibleCustomers(): Promise<string[]> {
  const body = await send(`${ADS_BASE}/customers:listAccessibleCustomers`, { method: 'GET' }, await adsHeaders());
  return ((body.resourceNames as string[]) || []).map((r) => r.replace('customers/', ''));
}

export async function gaqlSearch(customerId: string, query: string, loginCustomerId?: string | null): Promise<Record<string, unknown>[]> {
  const cid = cleanCustomerId(customerId);
  if (!cid) throw new PlatformError({ kind: 'invalid', retryable: false, message: 'Invalid customer ID.' });
  const rows: Record<string, unknown>[] = [];
  let pageToken: string | undefined;
  for (let i = 0; i < 20; i++) {
    const body = await send(`${ADS_BASE}/customers/${cid}/googleAds:search`, {
      method: 'POST',
      body: JSON.stringify({ query, ...(pageToken ? { pageToken } : {}) }),
    }, await adsHeaders(loginCustomerId));
    rows.push(...((body.results as Record<string, unknown>[]) || []));
    pageToken = body.nextPageToken as string | undefined;
    if (!pageToken) break;
  }
  return rows;
}

export async function describeCustomer(customerId: string, loginCustomerId?: string | null) {
  const rows = await gaqlSearch(customerId, 'SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.manager FROM customer LIMIT 1', loginCustomerId);
  const c = (rows[0]?.customer || {}) as Record<string, unknown>;
  return { id: String(c.id || customerId), name: c.descriptiveName as string | undefined, currency: c.currencyCode as string | undefined, manager: c.manager === true };
}

export async function listConversionActions(customerId: string, loginCustomerId?: string | null) {
  const rows = await gaqlSearch(
    customerId,
    "SELECT conversion_action.id, conversion_action.name, conversion_action.type, conversion_action.status, conversion_action.category FROM conversion_action WHERE conversion_action.status = 'ENABLED'",
    loginCustomerId
  );
  return rows.map((r) => {
    const a = (r.conversionAction || {}) as Record<string, unknown>;
    return { id: String(a.id), name: String(a.name), type: a.type as string, status: a.status as string, category: a.category as string };
  });
}

export async function campaignDailyMetrics(customerId: string, from: string, to: string, loginCustomerId?: string | null) {
  // Dates are interpolated into GAQL — accept only strict YYYY-MM-DD.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    throw new PlatformError({ kind: 'invalid', retryable: false, message: 'Dates must be YYYY-MM-DD.' });
  }
  const rows = await gaqlSearch(
    customerId,
    `SELECT campaign.id, campaign.name, segments.date, metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions FROM campaign WHERE segments.date BETWEEN '${from}' AND '${to}'`,
    loginCustomerId
  );
  return rows.map((r) => {
    const c = (r.campaign || {}) as Record<string, unknown>;
    const m = (r.metrics || {}) as Record<string, unknown>;
    const s = (r.segments || {}) as Record<string, unknown>;
    return {
      campaignId: String(c.id),
      campaignName: c.name as string,
      date: String(s.date),
      spend: Number(m.costMicros || 0) / 1_000_000,
      impressions: Number(m.impressions || 0),
      clicks: Number(m.clicks || 0),
      conversions: Number(m.conversions || 0),
    };
  });
}

export async function ingestEvents(body: Record<string, unknown>): Promise<{ requestId?: string; fieldWarnings?: unknown[] }> {
  const res = await send(`${DM_BASE}/events:ingest`, { method: 'POST', body: JSON.stringify(body) }, {});
  return { requestId: res.requestId as string | undefined, fieldWarnings: res.fieldWarnings as unknown[] | undefined };
}

export async function retrieveRequestStatus(requestId: string): Promise<Record<string, unknown>> {
  return send(`${DM_BASE}/requestStatus:retrieve?${new URLSearchParams({ requestId })}`, { method: 'GET' }, {});
}

export async function uploadConversionAdjustments(customerId: string, body: Record<string, unknown>, loginCustomerId?: string | null) {
  const cid = cleanCustomerId(customerId);
  if (!cid) throw new PlatformError({ kind: 'invalid', retryable: false, message: 'Invalid customer ID.' });
  return send(`${ADS_BASE}/customers/${cid}:uploadConversionAdjustments`, { method: 'POST', body: JSON.stringify(body) }, await adsHeaders(loginCustomerId));
}
