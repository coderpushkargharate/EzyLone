'use client';

// Google Search Console + GA4 report views for the Marketing tab. All figures
// come from the official APIs via /api/marketing/search and /api/marketing/analytics;
// errors (not connected, missing permission, no property chosen) are shown as-is.

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Download, Search, LineChart, Info, ExternalLink } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

const btn = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
const btnGhost = `${btn} border border-gray-200 text-gray-700 hover:bg-gray-50`;
const btnPrimary = `${btn} bg-blue-600 text-white hover:bg-blue-700`;
const input = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const n = (v: any) => (v === null || v === undefined || Number.isNaN(v) ? '—' : Number(v).toLocaleString('en-IN', { maximumFractionDigits: 1 }));
const pct = (v: any) => (v === null || v === undefined ? '—' : `${(Number(v) * 100).toFixed(1)}%`);
const delta = (v: number | null, invert = false) =>
  v === null || v === undefined ? <span className="text-gray-400">no comparison</span> : (
    <span className={(invert ? v < 0 : v > 0) ? 'text-green-600' : v === 0 ? 'text-gray-500' : 'text-red-600'}>{v > 0 ? '+' : ''}{v}{invert ? '' : '%'} vs previous</span>
  );

async function api(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || `Request failed (${res.status})`);
  return body;
}

function Box({ title, children, right }: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3"><h2 className="text-sm font-semibold text-gray-900">{title}</h2>{right}</div>
      {children}
    </section>
  );
}

function Kpi({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-[11px] mt-1">{sub}</p>}
    </div>
  );
}

function Rows({ rows, cols, empty = 'No data.' }: { rows: any[]; cols: [string, string, ((v: any) => React.ReactNode)?][]; empty?: string }) {
  if (!rows?.length) return <p className="text-sm text-gray-400 text-center py-6">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[440px]">
        <thead><tr className="border-b border-gray-100">{cols.map(([k, l], i) => <th key={k} className={`py-2 px-1 text-xs font-semibold text-gray-500 ${i ? 'text-right' : 'text-left'}`}>{l}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-b border-gray-50 last:border-0">
              {cols.map(([k, , f], i) => <td key={k} className={`py-1.5 px-1 ${i ? 'text-right tabular-nums' : 'text-left text-gray-800 max-w-[320px] truncate'}`} title={i ? undefined : String(r[k] ?? '')}>{f ? f(r[k]) : i ? n(r[k]) : r[k]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Minimal dependency-free trend bars. */
function Trend({ rows, valueKey, label }: { rows: any[]; valueKey: string; label: (r: any) => string }) {
  if (!rows?.length) return <p className="text-sm text-gray-400 text-center py-6">No data.</p>;
  const max = Math.max(1, ...rows.map((r) => Number(r[valueKey]) || 0));
  return (
    <div className="flex items-end gap-[2px] h-32" role="img" aria-label={`Daily ${valueKey}`}>
      {rows.map((r, i) => (
        <div key={i} className="flex-1 bg-blue-500/80 hover:bg-blue-600 rounded-t" style={{ height: `${Math.max(2, ((Number(r[valueKey]) || 0) / max) * 100)}%` }} title={`${label(r)}: ${n(r[valueKey])}`} />
      ))}
    </div>
  );
}

function useRange() {
  const [range, setRange] = useState({ from: ymd(new Date(Date.now() - 31 * 86_400_000)), to: ymd(new Date(Date.now() - 3 * 86_400_000)) });
  return { range, setRange };
}

function PropertyPicker({ kind, isAdmin, current, options, onDone }: { kind: 'sc' | 'ga4'; isAdmin: boolean; current?: string; options: any[]; onDone: () => void }) {
  const [list, setList] = useState<any[]>(options || []);
  const [val, setVal] = useState(current || '');
  const [err, setErr] = useState<string | null>(null);
  const url = kind === 'sc' ? '/api/marketing/search' : '/api/marketing/analytics';
  if (!isAdmin) return <p className="text-xs text-gray-500">{current ? `Property: ${current}` : 'An admin needs to choose a property.'}</p>;
  return (
    <div className="flex flex-wrap items-end gap-2">
      <button className={btnGhost} onClick={async () => { setErr(null); try { const r = await api(url, { method: 'POST', body: JSON.stringify({ action: kind === 'sc' ? 'sites' : 'properties' }) }); setList(kind === 'sc' ? r.sites : r.properties); } catch (e) { setErr((e as Error).message); } }}>
        Load {kind === 'sc' ? 'Search Console properties' : 'GA4 properties'}
      </button>
      {list.length > 0 && (
        <>
          <select aria-label="Property" className={`${input} max-w-xs`} value={val} onChange={(e) => setVal(e.target.value)}>
            <option value="">— choose —</option>
            {list.map((o) => kind === 'sc' ? <option key={o.siteUrl} value={o.siteUrl}>{o.siteUrl} ({o.permissionLevel})</option> : <option key={o.id} value={o.id}>{o.name} — {o.account} ({o.id})</option>)}
          </select>
          <button className={btnPrimary} disabled={!val} onClick={async () => { try { await api(url, { method: 'POST', body: JSON.stringify(kind === 'sc' ? { action: 'select', siteUrl: val } : { action: 'select', propertyId: val }) }); onDone(); } catch (e) { setErr((e as Error).message); } }}>Use</button>
        </>
      )}
      {err && <p className="w-full text-xs text-red-700">{err}</p>}
    </div>
  );
}

export function SearchConsoleView({ status, isAdmin, reload }: { status: any; isAdmin: boolean; reload: () => void }) {
  const { range, setRange } = useRange();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inspectUrl, setInspectUrl] = useState('');
  const [inspect, setInspect] = useState<any>(null);
  const [sitemaps, setSitemaps] = useState<any[] | null>(null);
  const site = status.google?.google?.searchConsoleSite;

  const load = useCallback(async (fresh = false) => {
    if (!site) return;
    setLoading(true);
    setError(null);
    try { setData(await api(`/api/marketing/search?from=${range.from}&to=${range.to}${fresh ? '&fresh=1' : ''}`)); } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }, [range, site]);
  useEffect(() => { load(); }, [load]);

  if (status.google?.status === 'disconnected') return <p className="text-sm text-gray-500 bg-white rounded-2xl border border-gray-200 p-6">Connect Google on the Integrations tab (Search Console access is requested in the same sign-in).</p>;

  return (
    <div className="space-y-5">
      <Box title="Google Search Console" right={site && <span className="text-[11px] text-gray-400">{site}</span>}>
        <PropertyPicker kind="sc" isAdmin={isAdmin} current={site} options={status.google?.google?.sites || []} onDone={reload} />
        {site && (
          <div className="flex flex-wrap items-end gap-2 mt-3">
            <label className="text-xs text-gray-500">From<input type="date" className={input} value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
            <label className="text-xs text-gray-500">To<input type="date" className={input} value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></label>
            <button className={btnGhost} disabled={loading} onClick={() => load(true)}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh from Google</button>
            {isAdmin && data && <a className={btnGhost} href={`/api/marketing/search?from=${range.from}&to=${range.to}&format=csv&table=queries`}><Download size={14} />Queries CSV</a>}
            {isAdmin && data && <a className={btnGhost} href={`/api/marketing/search?from=${range.from}&to=${range.to}&format=csv&table=pages`}><Download size={14} />Pages CSV</a>}
            {data && <span className="text-[11px] text-gray-400 ml-auto">{data.fromCache ? 'Cached' : 'Fetched'} {new Date(data.fetchedAt).toLocaleString('en-IN')}</span>}
          </div>
        )}
      </Box>

      {error && <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="Clicks" value={n(data.totals.clicks)} sub={delta(data.change.clicks)} />
            <Kpi label="Impressions" value={n(data.totals.impressions)} sub={delta(data.change.impressions)} />
            <Kpi label="Average CTR" value={pct(data.totals.ctr)} sub={delta(data.change.ctr)} />
            <Kpi label="Average position" value={n(data.totals.position)} sub={data.change.position === null ? <span className="text-gray-400">no comparison</span> : <span className={data.change.position < 0 ? 'text-green-600' : data.change.position > 0 ? 'text-red-600' : 'text-gray-500'}>{data.change.position > 0 ? '+' : ''}{data.change.position} vs previous (lower is better)</span>} />
          </div>
          <p className="text-[11px] text-gray-400">Compared with {data.previous.from} → {data.previous.to}.</p>
          <Box title="Clicks per day"><Trend rows={data.trend} valueKey="clicks" label={(r) => r.key} /></Box>
          <div className="grid lg:grid-cols-2 gap-5">
            <Box title="Top queries"><Rows rows={data.queries} cols={[['key', 'Query'], ['clicks', 'Clicks'], ['impressions', 'Impr.'], ['ctr', 'CTR', pct], ['position', 'Pos.']]} /></Box>
            <Box title="Top landing pages"><Rows rows={data.pages.map((p: any) => ({ ...p, key: p.key.replace(/^https?:\/\/[^/]+/, '') || '/' }))} cols={[['key', 'Page'], ['clicks', 'Clicks'], ['impressions', 'Impr.'], ['ctr', 'CTR', pct], ['position', 'Pos.']]} /></Box>
            <Box title="Countries"><Rows rows={data.countries.map((c: any) => ({ ...c, key: c.key.toUpperCase() }))} cols={[['key', 'Country (ISO-3)'], ['clicks', 'Clicks'], ['impressions', 'Impr.'], ['ctr', 'CTR', pct]]} /></Box>
            <Box title="Devices & search appearance">
              <Rows rows={data.devices} cols={[['key', 'Device'], ['clicks', 'Clicks'], ['impressions', 'Impr.'], ['ctr', 'CTR', pct]]} />
              <div className="mt-3"><Rows rows={data.searchAppearance} cols={[['key', 'Appearance'], ['clicks', 'Clicks'], ['impressions', 'Impr.']]} empty="No search-appearance data for this range." /></div>
            </Box>
          </div>
          <ul className="space-y-1">{data.notes.map((t: string) => <li key={t} className="flex gap-1.5 text-[11px] text-gray-500"><Info size={12} className="mt-0.5 shrink-0" />{t}</li>)}</ul>
        </>
      )}

      {site && isAdmin && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Box title="URL inspection (index status)">
            <div className="flex gap-2">
              <input className={input} value={inspectUrl} onChange={(e) => setInspectUrl(e.target.value)} placeholder="https://www.ezyloan.co.in/blog/your-post" />
              <button className={btnPrimary} onClick={async () => { setInspect(null); try { setInspect((await api('/api/marketing/search', { method: 'POST', body: JSON.stringify({ action: 'inspect', url: inspectUrl }) })).result); } catch (e) { setInspect({ error: (e as Error).message }); } }}><Search size={14} />Inspect</button>
            </div>
            {inspect && (inspect.error ? <p className="text-xs text-red-700 mt-2">{inspect.error}</p> : (
              <dl className="grid grid-cols-2 gap-y-1 text-xs mt-3">
                <dt className="text-gray-500">Verdict</dt><dd className="font-medium">{inspect.verdict || '—'}</dd>
                <dt className="text-gray-500">Coverage</dt><dd>{inspect.coverageState || '—'}</dd>
                <dt className="text-gray-500">Last crawl</dt><dd>{inspect.lastCrawlTime ? new Date(inspect.lastCrawlTime).toLocaleString('en-IN') : '—'}</dd>
                <dt className="text-gray-500">Robots.txt</dt><dd>{inspect.robotsTxtState || '—'}</dd>
                <dt className="text-gray-500">Indexing allowed</dt><dd>{inspect.indexingState || '—'}</dd>
                <dt className="text-gray-500">Google canonical</dt><dd className="break-all">{inspect.googleCanonical || '—'}</dd>
                <dt className="text-gray-500">Your canonical</dt><dd className="break-all">{inspect.userCanonical || '—'}</dd>
                {inspect.inspectionResultLink && <dd className="col-span-2"><a className="text-blue-600 underline inline-flex items-center gap-1" href={inspect.inspectionResultLink} target="_blank" rel="noopener noreferrer">Open in Search Console <ExternalLink size={11} /></a></dd>}
                <dd className="col-span-2 text-[11px] text-gray-400">{inspect.note}</dd>
              </dl>
            ))}
          </Box>
          <Box title="Sitemaps" right={<button className={btnGhost} onClick={async () => { try { setSitemaps((await api('/api/marketing/search', { method: 'POST', body: JSON.stringify({ action: 'sitemaps' }) })).sitemaps); } catch (e) { alert((e as Error).message); } }}>Load status</button>}>
            {sitemaps && <Rows rows={sitemaps.map((s) => ({ ...s, submitted: s.lastSubmitted ? new Date(s.lastSubmitted).toLocaleDateString('en-IN') : '—', downloaded: s.lastDownloaded ? new Date(s.lastDownloaded).toLocaleDateString('en-IN') : '—', urls: (s.contents || []).reduce((a: number, c: any) => a + Number(c.submitted || 0), 0) }))} cols={[['path', 'Sitemap'], ['submitted', 'Submitted', (v) => v], ['downloaded', 'Last read', (v) => v], ['urls', 'URLs'], ['errors', 'Errors'], ['warnings', 'Warnings']]} empty="No sitemaps submitted for this property." />}
            <button className={`${btnGhost} mt-3`} onClick={async () => { const url = `${(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '')}/sitemap.xml`; if (!confirm(`Submit ${url}?`)) return; try { const r = await api('/api/marketing/search', { method: 'POST', body: JSON.stringify({ action: 'submit_sitemap', url }) }); alert(r.message); } catch (e) { alert((e as Error).message); } }}>Submit /sitemap.xml</button>
            <p className="text-[11px] text-gray-400 mt-2">Submitting tells Google where the sitemap is; Google decides when to crawl and whether to index.</p>
          </Box>
        </div>
      )}
    </div>
  );
}

export function AnalyticsView({ status, isAdmin, reload }: { status: any; isAdmin: boolean; reload: () => void }) {
  const [range, setRange] = useState({ from: ymd(new Date(Date.now() - 28 * 86_400_000)), to: ymd(new Date(Date.now() - 86_400_000)) });
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pid = status.google?.google?.ga4PropertyId;

  const load = useCallback(async (fresh = false) => {
    if (!pid) return;
    setLoading(true);
    setError(null);
    try { setData(await api(`/api/marketing/analytics?from=${range.from}&to=${range.to}${fresh ? '&fresh=1' : ''}`)); } catch (e) { setError((e as Error).message); } finally { setLoading(false); }
  }, [range, pid]);
  useEffect(() => { load(); }, [load]);

  if (status.google?.status === 'disconnected') return <p className="text-sm text-gray-500 bg-white rounded-2xl border border-gray-200 p-6">Connect Google on the Integrations tab (Analytics read access is requested in the same sign-in).</p>;
  const t = data?.totals || {};

  return (
    <div className="space-y-5">
      <Box title="Google Analytics 4" right={pid && <span className="text-[11px] text-gray-400">Property {pid}</span>}>
        <PropertyPicker kind="ga4" isAdmin={isAdmin} current={pid} options={status.google?.google?.ga4Properties || []} onDone={reload} />
        {pid && (
          <div className="flex flex-wrap items-end gap-2 mt-3">
            <label className="text-xs text-gray-500">From<input type="date" className={input} value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
            <label className="text-xs text-gray-500">To<input type="date" className={input} value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} /></label>
            <button className={btnGhost} disabled={loading} onClick={() => load(true)}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh from Google</button>
            {data && <span className="text-[11px] text-gray-400 ml-auto">{data.fromCache ? 'Cached' : 'Fetched'} {new Date(data.fetchedAt).toLocaleString('en-IN')}</span>}
          </div>
        )}
      </Box>
      {error && <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Kpi label="Sessions" value={n(t.sessions)} sub={delta(data.change.sessions)} />
            <Kpi label="Users" value={n(t.totalUsers)} sub={delta(data.change.totalUsers)} />
            <Kpi label="New users" value={n(t.newUsers)} sub={delta(data.change.newUsers)} />
            <Kpi label="Engagement rate" value={pct(t.engagementRate)} />
            <Kpi label="Key events" value={n(t.keyEvents)} sub={delta(data.change.keyEvents)} />
          </div>
          <Box title="Sessions per day"><Trend rows={data.trend} valueKey="sessions" label={(r) => r.date} /></Box>
          <div className="grid lg:grid-cols-2 gap-5">
            <Box title="Channels (GA4 default channel group)"><Rows rows={data.channels} cols={[['sessionDefaultChannelGroup', 'Channel'], ['sessions', 'Sessions'], ['totalUsers', 'Users'], ['keyEvents', 'Key events']]} /></Box>
            <Box title="Website funnel events"><Rows rows={data.funnelEvents} cols={[['eventName', 'Event'], ['eventCount', 'Count'], ['totalUsers', 'Users']]} /><p className="text-[11px] text-gray-400 mt-2">Events defined in docs/GA4_MEASUREMENT_PLAN.md. Zero can mean the event isn&apos;t firing yet or GA4 isn&apos;t configured on the site.</p></Box>
            <Box title="Top landing pages"><Rows rows={data.landingPages} cols={[['landingPage', 'Landing page'], ['sessions', 'Sessions'], ['engagementRate', 'Engaged', pct], ['keyEvents', 'Key events']]} /></Box>
            <Box title="Devices"><Rows rows={data.devices} cols={[['deviceCategory', 'Device'], ['sessions', 'Sessions'], ['totalUsers', 'Users']]} /></Box>
          </div>
          <ul className="space-y-1">{data.notes.map((x: string) => <li key={x} className="flex gap-1.5 text-[11px] text-gray-500"><LineChart size={12} className="mt-0.5 shrink-0" />{x}</li>)}</ul>
        </>
      )}
    </div>
  );
}
