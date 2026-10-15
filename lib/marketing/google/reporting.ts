import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { ReportCache } from '@/lib/models/MarketingSupport';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import type { IMarketingConnection } from '@/lib/models/MarketingConnection';
import { googleFetch } from './api';
import { ga4Rows, isYmd, pctChange, previousPeriod, scTotals, urlBelongsToSite } from './reportShape';
import type { ScRow } from './reportShape';
import { GOOGLE_SCOPES } from '../config';
import { PlatformError } from '../types';
import { recordConnectionError, recordConnectionSuccess } from '../connections';
import { syncLog } from '../log';

// Google Search Console (Search Analytics, Sitemaps, URL Inspection) and GA4
// Data API reporting for the admin panel. Results are cached for a few hours
// in report_cache to stay well inside API quotas; every response carries the
// fetch time so the UI can show freshness.
//   https://developers.google.com/webmaster-tools/v1/searchanalytics/query
//   https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect
//   https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport

const SC = 'https://www.googleapis.com/webmasters/v3';
const INSPECT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';
const GA_DATA = 'https://analyticsdata.googleapis.com/v1beta';
const GA_ADMIN = 'https://analyticsadmin.googleapis.com/v1beta';

async function googleConn(): Promise<IMarketingConnection> {
  await connectDB();
  const c = await MarketingConnection.findOne({ provider: 'google' }).lean<IMarketingConnection>();
  if (!c?.refreshTokenEnc || c.status === 'disconnected') throw new PlatformError({ kind: 'config', retryable: false, message: 'Google is not connected.' });
  return c;
}

function requireScope(c: IMarketingConnection, scope: string, label: string) {
  if (!c.scopes?.includes(scope) && !(scope === GOOGLE_SCOPES.searchConsole && c.scopes?.includes(`${scope}.readonly`))) {
    throw new PlatformError({ kind: 'permission', retryable: false, message: `${label} access was not granted — reconnect Google and allow it.` });
  }
}

async function cached<T>(key: string, fresh: boolean, fn: () => Promise<T>): Promise<T & { fetchedAt: string; fromCache: boolean }> {
  const k = crypto.createHash('sha256').update(key).digest('hex');
  if (!fresh) {
    const hit = await ReportCache.findOne({ key: k }).lean();
    if (hit) return { ...(hit.data as T), fetchedAt: new Date(hit.createdAt).toISOString(), fromCache: true };
  }
  const data = await fn();
  await ReportCache.updateOne({ key: k }, { $set: { data, createdAt: new Date() } }, { upsert: true });
  return { ...data, fetchedAt: new Date().toISOString(), fromCache: false };
}

async function guarded<T>(provider: 'google', label: string, fn: () => Promise<T>): Promise<T> {
  try {
    const r = await fn();
    await recordConnectionSuccess(provider);
    return r;
  } catch (e) {
    if (e instanceof PlatformError && (e.kind === 'auth' || e.kind === 'permission')) await recordConnectionError(provider, `${label}: ${e.message}`, e.kind);
    throw e;
  }
}

// ── Search Console ───────────────────────────────────────────────────────────

export async function listSearchConsoleSites() {
  const c = await googleConn();
  requireScope(c, GOOGLE_SCOPES.searchConsole, 'Search Console');
  const body = await guarded('google', 'Search Console', () => googleFetch(`${SC}/sites`));
  const sites = ((body.siteEntry as { siteUrl: string; permissionLevel?: string }[]) || [])
    .filter((s) => s.permissionLevel !== 'siteUnverifiedUser')
    .map((s) => ({ siteUrl: s.siteUrl, permissionLevel: s.permissionLevel }));
  await MarketingConnection.updateOne({ provider: 'google' }, { $set: { 'google.sites': sites } });
  return sites;
}

async function selectedSite(): Promise<{ c: IMarketingConnection; site: string }> {
  const c = await googleConn();
  requireScope(c, GOOGLE_SCOPES.searchConsole, 'Search Console');
  const site = c.google?.searchConsoleSite;
  if (!site) throw new PlatformError({ kind: 'config', retryable: false, message: 'Choose a Search Console property first.' });
  return { c, site };
}

async function scQuery(site: string, body: Record<string, unknown>): Promise<ScRow[]> {
  const res = await googleFetch(`${SC}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { method: 'POST', body: JSON.stringify(body) });
  return (res.rows as ScRow[]) || [];
}

export async function searchPerformance(from: string, to: string, opts: { fresh?: boolean; type?: string } = {}) {
  if (!isYmd(from) || !isYmd(to) || from > to) throw new PlatformError({ kind: 'invalid', retryable: false, message: 'Invalid date range.' });
  const type = ['web', 'image', 'video', 'news', 'discover', 'googleNews'].includes(opts.type || '') ? opts.type! : 'web';
  const { site } = await selectedSite();
  return cached(`sc:${site}:${type}:${from}:${to}`, !!opts.fresh, () =>
    guarded('google', 'Search Console', async () => {
      const prev = previousPeriod(from, to);
      const base = { type, dataState: 'final' };
      // Totals use a dimensionless query (one aggregated row) so they are not
      // limited to the top-N rows the per-dimension queries return.
      const [total, prevTotal, byDate, queries, pages, countries, devices, appearance] = await Promise.all([
        scQuery(site, { ...base, startDate: from, endDate: to }),
        scQuery(site, { ...base, startDate: prev.from, endDate: prev.to }),
        scQuery(site, { ...base, startDate: from, endDate: to, dimensions: ['date'], rowLimit: 500 }),
        scQuery(site, { ...base, startDate: from, endDate: to, dimensions: ['query'], rowLimit: 100 }),
        scQuery(site, { ...base, startDate: from, endDate: to, dimensions: ['page'], rowLimit: 100 }),
        scQuery(site, { ...base, startDate: from, endDate: to, dimensions: ['country'], rowLimit: 25 }),
        scQuery(site, { ...base, startDate: from, endDate: to, dimensions: ['device'] }),
        scQuery(site, { ...base, startDate: from, endDate: to, dimensions: ['searchAppearance'] }).catch(() => [] as ScRow[]),
      ]);
      const cur = scTotals(total);
      const before = scTotals(prevTotal);
      const row = (r: ScRow) => ({ key: r.keys?.[0] || '', clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: r.ctr ?? null, position: r.position != null ? Math.round(r.position * 10) / 10 : null });
      return {
        site,
        type,
        range: { from, to },
        previous: prev,
        totals: cur,
        previousTotals: before,
        change: {
          clicks: pctChange(cur.clicks, before.clicks),
          impressions: pctChange(cur.impressions, before.impressions),
          ctr: pctChange(cur.ctr, before.ctr),
          position: cur.position !== null && before.position !== null ? Math.round((cur.position - before.position) * 10) / 10 : null,
        },
        trend: byDate.map(row),
        queries: queries.map(row),
        pages: pages.map(row),
        countries: countries.map(row),
        devices: devices.map(row),
        searchAppearance: appearance.map(row),
        notes: [
          'Search Console data is finalised with a delay of roughly 2–3 days; dates are Pacific Time.',
          'Top-query and top-page lists contain the top rows Google returns; anonymised queries are omitted, so they do not add up to the totals.',
          'Average position is an impression-weighted average across all searches — not a fixed ranking for any user or search.',
          'Country is the most specific location Search Analytics reports; city-level search data is not available from this API.',
        ],
      };
    })
  );
}

export async function listSitemaps() {
  const { site } = await selectedSite();
  const body = await guarded('google', 'Search Console', () => googleFetch(`${SC}/sites/${encodeURIComponent(site)}/sitemaps`));
  return ((body.sitemap as Record<string, unknown>[]) || []).map((s) => ({
    path: s.path,
    lastSubmitted: s.lastSubmitted,
    lastDownloaded: s.lastDownloaded,
    isPending: s.isPending,
    warnings: s.warnings,
    errors: s.errors,
    contents: s.contents,
  }));
}

export async function submitSitemap(sitemapUrl: string) {
  const { c, site } = await selectedSite();
  if (!c.scopes.includes(GOOGLE_SCOPES.searchConsole)) {
    throw new PlatformError({ kind: 'permission', retryable: false, message: 'Submitting sitemaps needs full Search Console access — reconnect Google.' });
  }
  if (!urlBelongsToSite(sitemapUrl, site)) throw new PlatformError({ kind: 'invalid', retryable: false, message: 'The sitemap must be on the selected property.' });
  await guarded('google', 'Search Console', () =>
    googleFetch(`${SC}/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(sitemapUrl)}`, { method: 'PUT' })
  );
  await syncLog('google', 'search_console', 'ok', `Sitemap submitted: ${sitemapUrl} (Google decides when to crawl it)`);
}

export async function inspectUrl(url: string) {
  const { site } = await selectedSite();
  if (!urlBelongsToSite(url, site)) throw new PlatformError({ kind: 'invalid', retryable: false, message: 'That URL is not part of the selected Search Console property.' });
  const body = await guarded('google', 'URL Inspection', () =>
    googleFetch(INSPECT, { method: 'POST', body: JSON.stringify({ inspectionUrl: url, siteUrl: site, languageCode: 'en-US' }) })
  );
  const r = (body.inspectionResult || {}) as Record<string, unknown>;
  const idx = (r.indexStatusResult || {}) as Record<string, unknown>;
  await syncLog('google', 'url_inspection', 'info', `Inspected ${url}: ${String(idx.verdict || 'unknown')} — ${String(idx.coverageState || '')}`);
  return {
    url,
    inspectionResultLink: r.inspectionResultLink,
    verdict: idx.verdict,
    coverageState: idx.coverageState,
    indexingState: idx.indexingState,
    robotsTxtState: idx.robotsTxtState,
    pageFetchState: idx.pageFetchState,
    lastCrawlTime: idx.lastCrawlTime,
    googleCanonical: idx.googleCanonical,
    userCanonical: idx.userCanonical,
    sitemaps: idx.sitemap,
    mobileUsability: (r.mobileUsabilityResult as Record<string, unknown> | undefined)?.verdict,
    richResults: (r.richResultsResult as Record<string, unknown> | undefined)?.verdict,
    note: 'This reflects the version in Google’s index, not a live test, and requesting it does not cause indexing.',
  };
}

// ── GA4 ──────────────────────────────────────────────────────────────────────

export async function listGa4Properties() {
  const c = await googleConn();
  requireScope(c, GOOGLE_SCOPES.analytics, 'Google Analytics');
  const props: { id: string; name: string; account?: string }[] = [];
  let pageToken: string | undefined;
  for (let i = 0; i < 10; i++) {
    const body = await guarded('google', 'Analytics Admin', () =>
      googleFetch(`${GA_ADMIN}/accountSummaries?${new URLSearchParams({ pageSize: '200', ...(pageToken ? { pageToken } : {}) })}`)
    );
    for (const a of (body.accountSummaries as Record<string, unknown>[]) || []) {
      for (const p of (a.propertySummaries as { property: string; displayName: string }[]) || []) {
        props.push({ id: p.property.replace('properties/', ''), name: p.displayName, account: String(a.displayName || '') });
      }
    }
    pageToken = body.nextPageToken as string | undefined;
    if (!pageToken) break;
  }
  await MarketingConnection.updateOne({ provider: 'google' }, { $set: { 'google.ga4Properties': props } });
  return props;
}

async function runReport(propertyId: string, body: Record<string, unknown>) {
  return ga4Rows(await googleFetch(`${GA_DATA}/properties/${propertyId}:runReport`, { method: 'POST', body: JSON.stringify(body) }));
}

/** Conversion-funnel events the site sends (see docs/GA4_MEASUREMENT_PLAN.md). */
export const GA4_FUNNEL_EVENTS = ['page_view', 'view_item', 'cta_click', 'form_start', 'form_error', 'generate_lead', 'calculator_complete', 'submit_application'];

export async function analyticsReport(from: string, to: string, opts: { fresh?: boolean } = {}) {
  if (!isYmd(from) || !isYmd(to) || from > to) throw new PlatformError({ kind: 'invalid', retryable: false, message: 'Invalid date range.' });
  const c = await googleConn();
  requireScope(c, GOOGLE_SCOPES.analytics, 'Google Analytics');
  const pid = c.google?.ga4PropertyId;
  if (!pid || !/^\d{3,20}$/.test(pid)) throw new PlatformError({ kind: 'config', retryable: false, message: 'Choose a GA4 property first.' });
  return cached(`ga4:${pid}:${from}:${to}`, !!opts.fresh, () =>
    guarded('google', 'Analytics Data', async () => {
      const prev = previousPeriod(from, to);
      const dateRanges = [{ startDate: from, endDate: to }];
      const totalsMetrics = ['sessions', 'totalUsers', 'newUsers', 'screenPageViews', 'engagementRate', 'keyEvents'].map((name) => ({ name }));
      const [totals, prevTotals, trend, channels, landing, devices, events, cities] = await Promise.all([
        runReport(pid, { dateRanges, metrics: totalsMetrics }),
        runReport(pid, { dateRanges: [{ startDate: prev.from, endDate: prev.to }], metrics: totalsMetrics }),
        runReport(pid, { dateRanges, dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'keyEvents' }], orderBys: [{ dimension: { dimensionName: 'date' } }], limit: '400' }),
        runReport(pid, { dateRanges, dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'keyEvents' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: '20' }),
        runReport(pid, { dateRanges, dimensions: [{ name: 'landingPage' }], metrics: [{ name: 'sessions' }, { name: 'engagementRate' }, { name: 'keyEvents' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: '50' }),
        runReport(pid, { dateRanges, dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }] }),
        runReport(pid, {
          dateRanges,
          dimensions: [{ name: 'eventName' }],
          metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
          dimensionFilter: { filter: { fieldName: 'eventName', inListFilter: { values: GA4_FUNNEL_EVENTS } } },
        }),
        // City comes from GA4's IP-based geolocation (Search Console has no city data).
        runReport(pid, { dateRanges, dimensions: [{ name: 'city' }, { name: 'region' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'keyEvents' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: '50' }),
      ]);
      const t = totals[0] || {};
      const p = prevTotals[0] || {};
      const num = (o: Record<string, string | number>, k: string) => (typeof o[k] === 'number' ? (o[k] as number) : null);
      return {
        propertyId: pid,
        range: { from, to },
        previous: prev,
        totals: t,
        previousTotals: p,
        change: Object.fromEntries(['sessions', 'totalUsers', 'newUsers', 'screenPageViews', 'keyEvents'].map((k) => [k, pctChange(num(t, k), num(p, k))])),
        trend,
        channels,
        landingPages: landing,
        devices,
        cities,
        funnelEvents: GA4_FUNNEL_EVENTS.map((e) => events.find((r) => r.eventName === e) || { eventName: e, eventCount: 0, totalUsers: 0 }),
        notes: [
          'GA4 figures are sampled/modelled by Google where applicable and use the property’s time zone; recent days can still change.',
          'GA4 counts sessions and events, not CRM leads — compare with the CRM-confirmed numbers on the Dashboard tab.',
          '“Key events” are the events marked as key events in your GA4 property settings.',
          'City is GA4’s estimate from the visitor’s IP address; “(not set)” means GA4 could not determine it.',
        ],
      };
    })
  );
}
