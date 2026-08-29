'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  ShieldCheck, Activity, RefreshCw, CheckCircle2, XCircle, AlertTriangle,
  Gauge, TrendingUp, Users, FileText, Search, Info,
} from 'lucide-react';

// Website Health — a single "is everything OK?" dashboard for the owner.
//   • Live security + SEO self-checks (HTTPS, headers, robots, sitemap, response time)
//   • Real lead flow from the database (today / week / month / trend / by source)
//   • On-demand Google PageSpeed (real speed + SEO scores + Core Web Vitals)
// Ranking & Search Console need a connected Google account — flagged, not faked.

interface Check { key: string; label: string; ok: boolean; detail: string; severity: string }
interface Health {
  site: string;
  checkedAt: string;
  health: { score: number; passed: number; total: number; status: string };
  checks: Check[];
  leads: {
    today: number; yesterday: number; last7: number; last30: number; total: number; avgPerDay: number;
    bySource: { source: string; count: number }[];
    byStatus: { status: string; count: number }[];
    daily: { date: string; count: number }[];
  };
  activity: { contacts: number; loanApplications: number };
}
interface PageSpeed {
  strategy: string; usingKey: boolean;
  scores: { performance: number | null; seo: number | null; accessibility: number | null; bestPractices: number | null };
  vitals: { fcp: string; lcp: string; cls: string; tbt: string; speedIndex: string };
}

const scoreColor = (v: number | null) =>
  v == null ? 'text-gray-400' : v >= 90 ? 'text-green-600' : v >= 50 ? 'text-orange-500' : 'text-red-600';
const ringColor = (v: number | null) =>
  v == null ? 'border-gray-200' : v >= 90 ? 'border-green-500' : v >= 50 ? 'border-orange-400' : 'border-red-500';

export default function SiteHealth() {
  const [data, setData] = useState<Health | null>(null);
  const [loading, setLoading] = useState(false);
  const [ps, setPs] = useState<PageSpeed | null>(null);
  const [psLoading, setPsLoading] = useState(false);
  const [psError, setPsError] = useState('');
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/site-health?_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
      setData(res.data);
    } catch {
      alert('Failed to load site health.');
    } finally {
      setLoading(false);
    }
  };

  const runPageSpeed = async (strat: 'mobile' | 'desktop') => {
    setPsLoading(true);
    setPsError('');
    setStrategy(strat);
    try {
      const res = await axios.get(`/api/admin/site-health/pagespeed?strategy=${strat}&_t=${Date.now()}`);
      setPs(res.data);
    } catch (e: any) {
      setPsError(e?.response?.data?.hint || e?.response?.data?.message || 'PageSpeed test failed. Try again.');
      setPs(null);
    } finally {
      setPsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const maxDaily = data ? Math.max(1, ...data.leads.daily.map((d) => d.count)) : 1;
  const statusBanner = (s: string) =>
    s === 'good' ? 'bg-green-50 border-green-200 text-green-800'
      : s === 'critical' ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-orange-50 border-orange-200 text-orange-800';

  const card = (icon: React.ReactNode, label: string, value: React.ReactNode, sub?: string) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <span className="text-blue-600">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-blue-600" />
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Website Health</h3>
            <p className="text-gray-600 text-sm">Security, SEO, speed and daily leads — all in one place.</p>
          </div>
        </div>
        <button onClick={fetchData} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center gap-1">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : !data ? null : (
        <div className="space-y-6">
          {/* Health banner */}
          <div className={`rounded-lg border p-4 flex items-center justify-between gap-3 flex-wrap ${statusBanner(data.health.status)}`}>
            <div className="flex items-center gap-3">
              {data.health.status === 'good' ? <CheckCircle2 className="h-6 w-6" /> : data.health.status === 'critical' ? <XCircle className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              <div>
                <p className="font-semibold">
                  {data.health.status === 'good' ? 'All good — no problems detected'
                    : data.health.status === 'critical' ? 'Action needed — a critical check failed'
                      : 'Mostly healthy — a few things to improve'}
                </p>
                <p className="text-sm opacity-80">{data.checks.filter((c) => c.ok).length} of {data.checks.length} checks passing · {data.site}</p>
              </div>
            </div>
            <div className="text-3xl font-bold">{data.health.score}%</div>
          </div>

          {/* Lead metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {card(<TrendingUp className="h-5 w-5" />, 'Leads today', data.leads.today, `yesterday: ${data.leads.yesterday}`)}
            {card(<Activity className="h-5 w-5" />, 'Last 7 days', data.leads.last7, `~${data.leads.avgPerDay}/day avg`)}
            {card(<Users className="h-5 w-5" />, 'Last 30 days', data.leads.last30, `${data.leads.total} total leads`)}
            {card(<FileText className="h-5 w-5" />, 'Loan applications', data.activity.loanApplications, `${data.activity.contacts} contact msgs`)}
          </div>

          {/* Daily leads trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h4 className="font-semibold text-gray-800 mb-4">Leads — last 14 days</h4>
            <div className="flex items-end gap-1.5 h-36">
              {data.leads.daily.length === 0 ? (
                <p className="text-sm text-gray-400">No leads in this period.</p>
              ) : data.leads.daily.map((d) => (
                <div key={d.date} className="flex flex-col items-center justify-end flex-1 group relative">
                  <span className="text-[10px] text-gray-500 mb-0.5">{d.count || ''}</span>
                  <div className="w-full rounded-t bg-blue-500" style={{ height: `${(d.count / maxDaily) * 100}%`, minHeight: d.count ? '4px' : '0' }} />
                  <span className="text-[9px] text-gray-400 mt-1 rotate-0">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security & SEO checks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-800">Security &amp; SEO checks</h4>
              </div>
              <div className="divide-y divide-gray-100">
                {data.checks.map((c) => (
                  <div key={c.key} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {c.ok
                        ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        : c.severity === 'critical'
                          ? <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                          : <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />}
                      <span className="text-sm text-gray-700 truncate">{c.label}</span>
                    </div>
                    <span className={`text-xs whitespace-nowrap ${c.ok ? 'text-gray-400' : c.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>{c.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leads by source / status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Where leads come from (30 days)</h4>
              {data.leads.bySource.length === 0 ? (
                <p className="text-sm text-gray-400 mb-4">No leads in the last 30 days.</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {data.leads.bySource.map((s) => {
                    const pct = Math.round((s.count / Math.max(1, data.leads.last30)) * 100);
                    return (
                      <div key={s.source}>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span className="truncate">{s.source}</span>
                          <span className="font-medium whitespace-nowrap">{s.count} · {pct}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
              <h4 className="font-semibold text-gray-800 mb-2 mt-4">Lead status (all time)</h4>
              <div className="flex flex-wrap gap-2">
                {data.leads.byStatus.map((s) => (
                  <span key={s.status} className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-700">{s.status}: {s.count}</span>
                ))}
              </div>
            </div>
          </div>

          {/* PageSpeed */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-800">Speed &amp; SEO score (Google PageSpeed)</h4>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-md overflow-hidden border border-gray-200">
                  {(['mobile', 'desktop'] as const).map((s) => (
                    <button key={s} onClick={() => runPageSpeed(s)} disabled={psLoading}
                      className={`px-3 py-1.5 text-xs font-medium capitalize ${strategy === s && ps ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                      {s}
                    </button>
                  ))}
                </div>
                <button onClick={() => runPageSpeed(strategy)} disabled={psLoading}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs flex items-center gap-1 disabled:opacity-60">
                  {psLoading ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Testing… (~20s)</> : <>Run test</>}
                </button>
              </div>
            </div>

            {psError && <p className="text-sm text-orange-600 bg-orange-50 rounded-md p-3">{psError}</p>}

            {!ps && !psLoading && !psError && (
              <p className="text-sm text-gray-500">Click <strong>Run test</strong> to measure your live site’s loading speed and SEO score via Google. Takes about 20 seconds.</p>
            )}

            {ps && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {([
                    ['Performance', ps.scores.performance],
                    ['SEO', ps.scores.seo],
                    ['Accessibility', ps.scores.accessibility],
                    ['Best Practices', ps.scores.bestPractices],
                  ] as const).map(([label, val]) => (
                    <div key={label} className="flex flex-col items-center">
                      <div className={`flex h-20 w-20 items-center justify-center rounded-full border-4 ${ringColor(val)}`}>
                        <span className={`text-2xl font-bold ${scoreColor(val)}`}>{val ?? '—'}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-center">
                  {([
                    ['Load (LCP)', ps.vitals.lcp], ['First paint', ps.vitals.fcp], ['Layout shift', ps.vitals.cls],
                    ['Blocking', ps.vitals.tbt], ['Speed index', ps.vitals.speedIndex],
                  ] as const).map(([label, v]) => (
                    <div key={label} className="bg-gray-50 rounded-md p-2">
                      <p className="text-sm font-semibold text-gray-800">{v}</p>
                      <p className="text-[10px] text-gray-500">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-3">
                  {ps.strategy} · {ps.usingKey ? 'via API key' : 'no API key (limited rate)'} · scores 90+ green, 50–89 orange, below 50 red.
                </p>
              </>
            )}
          </div>

          {/* Ranking / Search Console — honest note */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
            <Search className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Google ranking &amp; Search Console (pages, redirects, indexing)</p>
              <p className="text-blue-800/90 flex items-start gap-1">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                These come from your Google Search Console account and need a one-time Google connection (OAuth) to pull real keyword rankings, indexed/redirected pages and impressions. Tell me to set it up and I’ll wire it in — until then, check them live at <span className="underline">search.google.com/search-console</span>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
