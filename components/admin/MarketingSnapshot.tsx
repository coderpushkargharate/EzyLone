'use client';

// Marketing snapshot on the admin Overview: Search Console clicks, GA4 visitors
// by city, and conversions delivered to Meta / Google (last 30 days). Hidden for
// users without the Marketing permission. Unavailable data says why.
import { useEffect, useState } from 'react';
import { Search, MapPin, Send, ArrowRight } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

const n = (v: any) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('en-IN', { maximumFractionDigits: 1 }));
const chg = (v: number | null | undefined) =>
  v === null || v === undefined ? null : <span className={v >= 0 ? 'text-green-600' : 'text-red-600'}>{v > 0 ? '+' : ''}{v}%</span>;

function Unavailable({ reason, onSetup }: { reason: string; onSetup?: () => void }) {
  return (
    <div className="text-sm text-gray-500">
      <p>{reason}</p>
      {onSetup && <button onClick={onSetup} className="mt-2 inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline">Set up in Marketing &amp; Ads <ArrowRight size={14} /></button>}
    </div>
  );
}

export default function MarketingSnapshot({ onOpen }: { onOpen?: () => void }) {
  const [data, setData] = useState<any>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    fetch('/api/marketing/overview')
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) return setHidden(true);
        if (r.ok) setData(await r.json());
        else setHidden(true);
      })
      .catch(() => setHidden(true));
  }, []);

  if (hidden) return null;
  if (!data) return <div className="h-40 bg-white rounded-lg border border-gray-100 animate-pulse mb-6" />;

  const sc = data.search;
  const ga = data.analytics;
  const sent = (p: 'meta' | 'google') => {
    const c = data.conversions[p] || {};
    return { ok: (c.sent || 0) + (c.submitted || 0) + (c.accepted || 0), blocked: c.blocked_consent || 0, failed: (c.failed || 0) + (c.dead || 0) + (c.rejected || 0) };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-1"><Search size={18} className="text-amber-600" />Google Search</h4>
        {sc.ok ? (
          <>
            <p className="text-xs text-gray-400 mb-3">{sc.data.range.from} → {sc.data.range.to} · Search Console</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><p className="text-xs text-gray-500">Clicks</p><p className="text-2xl font-bold">{n(sc.data.totals.clicks)}</p><p className="text-[11px]">{chg(sc.data.change.clicks)}</p></div>
              <div><p className="text-xs text-gray-500">Impressions</p><p className="text-2xl font-bold">{n(sc.data.totals.impressions)}</p><p className="text-[11px]">{chg(sc.data.change.impressions)}</p></div>
              <div><p className="text-xs text-gray-500">CTR</p><p className="text-lg font-semibold">{sc.data.totals.ctr === null ? '—' : `${(sc.data.totals.ctr * 100).toFixed(1)}%`}</p></div>
              <div><p className="text-xs text-gray-500">Avg. position</p><p className="text-lg font-semibold">{n(sc.data.totals.position)}</p></div>
            </div>
            {sc.data.topQueries.length > 0 && <p className="text-xs text-gray-500 truncate">Top search: <span className="text-gray-800">{sc.data.topQueries.map((q: any) => q.key).slice(0, 3).join(' · ')}</span></p>}
          </>
        ) : <Unavailable reason={sc.reason} onSetup={onOpen} />}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-1"><MapPin size={18} className="text-blue-600" />Visitors by city</h4>
        {ga.ok ? (
          <>
            <p className="text-xs text-gray-400 mb-3">{ga.data.range.from} → {ga.data.range.to} · GA4 · {n(ga.data.totals.sessions)} sessions {chg(ga.data.change.sessions)}</p>
            {ga.data.topCities.length ? (
              <ul className="space-y-1.5">
                {ga.data.topCities.map((c: any) => (
                  <li key={`${c.city}-${c.region}`} className="flex justify-between text-sm"><span className="truncate">{c.city}{c.region ? <span className="text-gray-400">, {c.region}</span> : null}</span><span className="tabular-nums font-medium">{n(c.sessions)}</span></li>
                ))}
              </ul>
            ) : <p className="text-sm text-gray-500">No city data for this period.</p>}
            <p className="text-[11px] text-gray-400 mt-2">City is GA4&apos;s IP-based estimate. Search Console does not report cities.</p>
          </>
        ) : <Unavailable reason={ga.reason} onSetup={onOpen} />}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-1"><Send size={18} className="text-green-600" />Conversions sent</h4>
        <p className="text-xs text-gray-400 mb-3">Last 30 days · production events only</p>
        {(['meta', 'google'] as const).map((p) => {
          const s = sent(p);
          const status = data.connections[p];
          return (
            <div key={p} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-medium">{p === 'meta' ? 'Meta Conversions API' : 'Google Ads'}</p>
                <p className="text-[11px] text-gray-400">
                  {status === 'disconnected' ? 'Not connected' : p === 'meta' && !data.connections.capiConfigured ? 'Dataset / CAPI token not set' : status.replace('_', ' ')}
                  {s.blocked ? ` · ${s.blocked} held (no consent)` : ''}{s.failed ? ` · ${s.failed} failed` : ''}
                </p>
              </div>
              <p className="text-2xl font-bold tabular-nums">{s.ok}</p>
            </div>
          );
        })}
        {onOpen && <button onClick={onOpen} className="mt-3 inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline">Open Marketing &amp; Ads <ArrowRight size={14} /></button>}
      </div>
    </div>
  );
}
