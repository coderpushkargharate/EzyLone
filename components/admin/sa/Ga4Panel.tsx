'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChartCard, Donut, HBars, StatTile, WeekColumns } from './SeoCharts';

// Google Analytics 4 summary for the "SEO & Traffic" tab — users, sessions,
// where they come from, landing pages, cities, devices and the loan funnel
// events. Data: /api/admin/ga4 (the Google account connected in Marketing & Ads).

type Rec = Record<string, string | number>;
interface Ga4Data {
  status: 'ok'; days: number; propertyId: string; fetchedAt: string;
  range: { from: string; to: string };
  totals: Rec; change: Record<string, number | null>;
  trend: Rec[]; channels: Rec[]; landingPages: Rec[]; devices: Rec[]; cities: Rec[];
  funnelEvents: { eventName: string; eventCount: number; totalUsers: number }[];
}
type Resp = Ga4Data | { status: 'not_configured' | 'no_property' | 'auth_failed' | 'no_access' | 'api_error'; message?: string };

const fmt = (n: number) => Math.round(n || 0).toLocaleString('en-IN');
const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);
const when = (iso: string) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const ga4Date = (s: string) => (/^\d{8}$/.test(s) ? `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}` : s);
const DEVICE_COLORS: Record<string, string> = { mobile: '#2563eb', desktop: '#7c3aed', tablet: '#b0924f' };
const EVENT_NAMES: Record<string, string> = {
  page_view: 'Page views', view_item: 'Viewed a loan page', cta_click: 'Clicked Apply / Call', form_start: 'Started a form',
  form_error: 'Form errors', generate_lead: 'Leads sent', calculator_complete: 'Used EMI calculator', submit_application: 'Applications submitted',
};

function delta(p: number | null | undefined) {
  if (p == null) return undefined;
  return <span className={`gsc-delta ${p >= 0 ? 'up' : 'down'}`}>{p > 0 ? '▲' : p < 0 ? '▼' : ''} {Math.abs(p).toFixed(0)}% vs previous period</span>;
}

export default function Ga4Panel() {
  const [days, setDays] = useState(28);
  const [d, setD] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback((refresh = false) => {
    setLoading(true);
    fetch(`/api/admin/ga4?days=${days}${refresh ? '&refresh=1' : ''}`, { credentials: 'same-origin' })
      .then((r) => r.json()).then((b) => setD(b?.data || { status: 'api_error', message: b?.message || 'Empty response' }))
      .catch(() => setD({ status: 'api_error', message: 'Could not reach the server' }))
      .finally(() => setLoading(false));
  }, [days]);
  useEffect(() => { load(); }, [load]);

  const head = (
    <div className="gsc-bar">
      <div>
        <h2 className="gsc-title"><i className="fas fa-chart-pie" /> Google Analytics 4 <span className="gsc-live">LIVE</span></h2>
        <p className="muted">{d?.status === 'ok' ? `Property ${d.propertyId} · ${d.range.from} – ${d.range.to} · updated ${when(d.fetchedAt)}` : 'Users, sessions and the loan funnel from GA4'}</p>
      </div>
      <div className="gsc-actions">
        <div className="viz-toggle" role="tablist" aria-label="Date range">
          {[[7, '7 days'], [28, '28 days'], [90, '3 months']].map(([n, l]) => <button key={n} role="tab" aria-selected={days === n} className={days === n ? 'on' : ''} onClick={() => setDays(n as number)}>{l}</button>)}
        </div>
        <button className="adm-btn ghost sm" onClick={() => load(true)} disabled={loading}><i className={`fas fa-rotate${loading ? ' fa-spin' : ''}`} /> Refresh</button>
      </div>
    </div>
  );

  if (!d) return <div className="viz gsc">{head}<div className="adm-empty"><i className="fas fa-spinner fa-spin" /><p>Loading Google Analytics…</p></div></div>;

  if (d.status !== 'ok') {
    const title = d.status === 'not_configured' ? 'Connect Google to see Analytics data'
      : d.status === 'no_property' ? 'Pick your GA4 property to see data'
        : 'Google Analytics could not be read — no data shown';
    return (
      <div className="viz gsc">
        {head}
        <div className="adm-panel">
          <div className="adm-panel-head"><h3>{title}</h3></div>
          {d.message && <p className="adm-note gsc-err"><i className="fas fa-triangle-exclamation" /><span>{d.message}</span></p>}
          <div className="adm-health" style={{ marginTop: 12 }}>
            {[
              ['Open Marketing & Ads', <>In this admin go to <b>Growth &amp; Automation → Marketing &amp; Ads</b> (admin login needed).</>],
              ['Connect Google', 'Click “Connect Google” and allow Analytics access with the account that owns the EzyLoan GA4 property.'],
              ['Choose the GA4 property', 'Under Google Analytics, pick the EzyLoan property and save.'],
              ['Come back here', 'Press Refresh above.'],
            ].map(([t, desc], i) => (
              <div className="adm-health-row" key={i}><span className="viz-step">{i + 1}</span><div><b>{t}</b><br /><span className="muted">{desc}</span></div></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const t = d.totals;
  const trend = d.trend.map((r) => ({ week: ga4Date(String(r.date)), count: num(r.totalUsers) })).sort((a, b) => a.week.localeCompare(b.week));
  const channels = d.channels.map((r) => ({ label: String(r.sessionDefaultChannelGroup || '(other)'), value: num(r.sessions) }));
  const landing = d.landingPages.filter((r) => r.landingPage && r.landingPage !== '(not set)').slice(0, 12).map((r) => ({ label: String(r.landingPage), value: num(r.sessions) }));
  const cities = d.cities.filter((r) => r.city && r.city !== '(not set)').slice(0, 15).map((r) => ({ label: String(r.city), value: num(r.totalUsers), region: String(r.region || '') }));
  const devices = d.devices.map((r) => ({ key: String(r.deviceCategory), label: String(r.deviceCategory).replace(/^\w/, (c) => c.toUpperCase()), count: num(r.totalUsers), color: DEVICE_COLORS[String(r.deviceCategory)] || '#9b9a94' }));
  const devTotal = devices.reduce((a, x) => a + x.count, 0);
  const funnel = d.funnelEvents.filter((e) => e.eventName !== 'page_view').map((e) => ({ label: EVENT_NAMES[e.eventName] || e.eventName, value: e.eventCount, users: e.totalUsers }));
  const max = (rows: { value: number }[]) => Math.max(...rows.map((r) => r.value), 1);
  const engagement = num(t.engagementRate);

  return (
    <div className="viz gsc">
      {head}
      <div className="viz-tiles">
        <StatTile label="Users" value={fmt(num(t.totalUsers))} note={delta(d.change.totalUsers) || `${fmt(num(t.newUsers))} new`} />
        <StatTile label="Sessions" value={fmt(num(t.sessions))} note={delta(d.change.sessions) || `${(engagement * 100).toFixed(0)}% engaged`} />
        <StatTile label="Page views" value={fmt(num(t.screenPageViews))} note={delta(d.change.screenPageViews)} />
        <StatTile label="Key events" value={fmt(num(t.keyEvents))} note={delta(d.change.keyEvents) || 'Events marked as key events in GA4'} />
      </div>

      <ChartCard title="Users per day" subtitle="From Google Analytics (property time zone)"
        table={{ head: ['Day', 'Users', 'Sessions', 'Key events'], rows: [...d.trend].reverse().map((r) => [ga4Date(String(r.date)), num(r.totalUsers), num(r.sessions), num(r.keyEvents)]) }}>
        {(show, hide) => trend.length ? <WeekColumns period="day" data={trend} noun={['user', 'users']} show={show} hide={hide} /> : <div className="adm-empty"><p>No data for this period.</p></div>}
      </ChartCard>

      <div className="viz-grid2">
        <ChartCard title="Where users come from" subtitle="Sessions by channel"
          table={{ head: ['Channel', 'Sessions', 'Users', 'Key events'], rows: d.channels.map((r) => [String(r.sessionDefaultChannelGroup), num(r.sessions), num(r.totalUsers), num(r.keyEvents)]) }}>
          {(show, hide) => channels.length ? <HBars rows={channels} max={max(channels)} show={show} hide={hide} valueText={fmt} tipLines={(r) => [`${fmt(r.value)} sessions`]} /> : <div className="adm-empty"><p>No sessions yet.</p></div>}
        </ChartCard>
        <ChartCard title="Loan funnel" subtitle="Funnel events sent by the website"
          table={{ head: ['Step', 'Events', 'Users'], rows: funnel.map((f) => [f.label, f.value, f.users]) }}>
          {(show, hide) => <HBars rows={funnel} max={max(funnel)} show={show} hide={hide} valueText={fmt} tipLines={(r) => { const f = funnel.find((x) => x.label === r.label); return [`${fmt(r.value)} times`, `by ${fmt(f?.users || 0)} users`]; }} />}
        </ChartCard>
      </div>

      <div className="viz-grid2">
        <ChartCard title="Top landing pages" subtitle="Where sessions started"
          table={{ head: ['Page', 'Sessions', 'Engagement', 'Key events'], rows: d.landingPages.map((r) => [String(r.landingPage), num(r.sessions), `${(num(r.engagementRate) * 100).toFixed(0)}%`, num(r.keyEvents)]) }}>
          {(show, hide) => landing.length ? <HBars rows={landing} max={max(landing)} show={show} hide={hide} valueText={fmt} tipLines={(r) => [`${fmt(r.value)} sessions`]} /> : <div className="adm-empty"><p>No landing pages yet.</p></div>}
        </ChartCard>
        <ChartCard title="Top cities" subtitle="GA4's estimate from the visitor's IP"
          table={{ head: ['City', 'State', 'Users'], rows: cities.map((c) => [c.label, c.region, c.value]) }}>
          {(show, hide) => cities.length ? <HBars rows={cities} max={max(cities)} show={show} hide={hide} valueText={fmt} tipLines={(r) => { const c = cities.find((x) => x.label === r.label); return [`${fmt(r.value)} users`, c?.region || '']; }} /> : <div className="adm-empty"><p>No city data yet.</p></div>}
        </ChartCard>
      </div>

      <ChartCard title="Devices" subtitle="Users by device"
        table={{ head: ['Device', 'Users', 'Sessions'], rows: d.devices.map((r) => [String(r.deviceCategory), num(r.totalUsers), num(r.sessions)]) }}>
        {(show, hide) => devTotal ? <Donut slices={devices} centerValue={fmt(devTotal)} centerLabel="users" show={show} hide={hide} /> : <div className="adm-empty"><p>No data yet.</p></div>}
      </ChartCard>
    </div>
  );
}
