'use client';

// Marketing & Ads — Meta / Google connections, CRM-confirmed funnel vs
// platform-reported metrics, conversion delivery log, sync history and
// conversion settings. Every number shown here comes from an API response;
// nothing is estimated in the browser. Admin-only actions are also enforced
// server-side (the buttons are hidden for others only as a convenience).

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchConsoleView, AnalyticsView } from './SearchAnalyticsViews';
import CredentialsPanel from './CredentialsPanel';
import {
  Megaphone, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Link2, Unlink, Download, Play,
  Facebook, Search, Settings2, ListChecks, History, BarChart3, Copy, Check, Info,
} from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

type View = 'dashboard' | 'search' | 'analytics' | 'integrations' | 'events' | 'history' | 'settings';
const CRM_EVENTS = ['Lead', 'QualifiedLead', 'SubmitApplication', 'ApprovedApplication', 'LoanDisbursed'] as const;
const EVENT_LABEL: Record<string, string> = {
  Lead: 'New lead',
  QualifiedLead: 'Qualified lead',
  SubmitApplication: 'Application submitted',
  ApprovedApplication: 'Approved / sanctioned',
  LoanDisbursed: 'Loan disbursed',
};
const LEAD_STATUSES = ['New', 'No Response', 'Cold', 'Warm', '1. Interested', '0. Not Interested', 'Lost', 'Converted', 'Out Of Odisha'];
const CHANNELS = ['google_ads', 'meta_lead_ads', 'meta_ads', 'meta_click', 'organic_search', 'social', 'referral', 'direct', 'campaign', 'email', 'whatsapp', 'manual', 'other', 'unattributed'];
const STATUS_STYLE: Record<string, string> = {
  sent: 'bg-green-50 text-green-700', accepted: 'bg-green-50 text-green-700', submitted: 'bg-blue-50 text-blue-700',
  pending: 'bg-gray-100 text-gray-700', processing: 'bg-gray-100 text-gray-700', retry: 'bg-amber-50 text-amber-700',
  unverified: 'bg-amber-50 text-amber-700', skipped: 'bg-gray-100 text-gray-500', blocked_consent: 'bg-purple-50 text-purple-700',
  rejected: 'bg-red-50 text-red-700', failed: 'bg-red-50 text-red-700', dead: 'bg-red-100 text-red-800', retracted: 'bg-gray-200 text-gray-600',
};
const STATUS_HELP: Record<string, string> = {
  sent: 'Meta confirmed receipt. Receipt is not proof that Meta attributed it to an ad.',
  submitted: 'Google accepted the upload; processing result is checked about 15 minutes later.',
  accepted: 'Google processed the upload. It still may not be attributed to an ad click.',
  unverified: 'Google’s processing status could not be confirmed.',
  blocked_consent: 'Not sent: no recorded ad-measurement consent for this person.',
  skipped: 'Not sent — see the reason (e.g. no usable identifier, test mode, mapping off).',
  dead: 'Retries exhausted. Fix the cause, then retry.',
  failed: 'Configuration or credential problem. Fix it, then retry.',
  rejected: 'The platform refused this event — see the error.',
};

const fmtNum = (v: number | null | undefined) => (v === null || v === undefined ? '—' : v.toLocaleString('en-IN'));
const fmtMoney = (v: number | null | undefined, cur?: string | null) =>
  v === null || v === undefined ? 'Unavailable' : `${cur === 'INR' || !cur ? '₹' : `${cur} `}${v.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const fmtPct = (v: number | null | undefined) => (v === null || v === undefined ? '—' : `${v}%`);
const fmtDate = (v?: string | Date | null) => (v ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const ymd = (d: Date) => new Date(d.getTime() + 330 * 60_000).toISOString().slice(0, 10);

async function api(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || `Request failed (${res.status})`);
  return body;
}

function Card({ title, icon, children, right }: { title: string; icon?: React.ReactNode; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">{icon}{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Badge({ status }: { status: string }) {
  return (
    <span title={STATUS_HELP[status] || ''} className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLE[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function HealthPill({ status }: { status?: string }) {
  const map: Record<string, [string, React.ReactNode, string]> = {
    connected: ['bg-green-50 text-green-700', <CheckCircle2 key="i" size={14} />, 'Connected'],
    needs_attention: ['bg-amber-50 text-amber-700', <AlertTriangle key="i" size={14} />, 'Needs attention'],
    expired: ['bg-red-50 text-red-700', <XCircle key="i" size={14} />, 'Expired — reconnect'],
    error: ['bg-red-50 text-red-700', <XCircle key="i" size={14} />, 'Error'],
    disconnected: ['bg-gray-100 text-gray-600', <Unlink key="i" size={14} />, 'Not connected'],
  };
  const [cls, icon, label] = map[status || 'disconnected'] || map.disconnected;
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>{icon}{label}</span>;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500 mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 min-w-0 truncate text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">{value}</code>
        <button
          type="button"
          aria-label={`Copy ${label}`}
          onClick={() => { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

const btn = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
const btnPrimary = `${btn} bg-blue-600 text-white hover:bg-blue-700`;
const btnGhost = `${btn} border border-gray-200 text-gray-700 hover:bg-gray-50`;
const input = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

const OAUTH_ERRORS: Record<string, string> = {
  encryption_key_missing: 'MARKETING_ENCRYPTION_KEY is not set on the server — credentials cannot be stored safely.',
  encryption_key_problem: 'The server encryption key is missing or does not match the saved credentials. See Settings → API keys for details; restore the original key before connecting.',
  meta_app_not_configured: 'META_APP_ID / META_APP_SECRET are not configured on the server.',
  google_app_not_configured: 'GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET are not configured on the server.',
  meta_state_invalid: 'The Meta sign-in link expired or was opened in another session. Please try again.',
  google_state_invalid: 'The Google sign-in link expired or was opened in another session. Please try again.',
  meta_denied: 'Meta sign-in was cancelled or permissions were declined.',
  google_denied: 'Google consent was cancelled.',
};

export default function MarketingManager() {
  const [view, setView] = useState<View>('dashboard');
  const [status, setStatus] = useState<any>(null);
  const [flash, setFlash] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await api('/api/marketing/status'));
    } catch (e) {
      setFlash({ ok: false, text: (e as Error).message });
    }
  }, []);

  useEffect(() => {
    loadStatus();
    const sp = new URLSearchParams(window.location.search);
    const connected = sp.get('connected');
    const error = sp.get('error');
    if (connected || error) {
      setView('integrations');
      setFlash(connected ? { ok: true, text: `${connected === 'meta' ? 'Meta' : 'Google'} connected. Choose your assets below.` } : { ok: false, text: OAUTH_ERRORS[error!] || `Connection failed (${error}). See Sync history for details.` });
      sp.delete('connected');
      sp.delete('error');
      window.history.replaceState(null, '', `${window.location.pathname}?${sp.toString()}`);
    }
  }, [loadStatus]);

  const run = async (key: string, fn: () => Promise<unknown>, ok?: string) => {
    setBusy(key);
    setFlash(null);
    try {
      await fn();
      if (ok) setFlash({ ok: true, text: ok });
      await loadStatus();
    } catch (e) {
      setFlash({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const isAdmin = !!status?.isAdmin;
  const tabs: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={15} /> },
    { id: 'search', label: 'Search Console', icon: <Search size={15} /> },
    { id: 'analytics', label: 'Analytics (GA4)', icon: <BarChart3 size={15} /> },
    { id: 'integrations', label: 'Integrations', icon: <Link2 size={15} /> },
    { id: 'events', label: 'Conversion log', icon: <ListChecks size={15} /> },
    { id: 'history', label: 'Sync history', icon: <History size={15} /> },
    { id: 'settings', label: 'Settings', icon: <Settings2 size={15} /> },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Megaphone size={22} className="text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-900">Marketing &amp; Ads</h1>
      </div>
      <p className="text-gray-500 text-sm mb-4">Meta &amp; Google connections, CRM-confirmed results, and conversion delivery to ad platforms.</p>

      <div className="flex gap-1 overflow-x-auto pb-1 mb-4 -mx-1 px-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={view === t.id}
            onClick={() => setView(t.id)}
            className={`${btn} whitespace-nowrap ${view === t.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {flash && (
        <div role="status" className={`mb-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${flash.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {flash.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
          <span>{flash.text}</span>
          <button className="ml-auto text-xs underline" onClick={() => setFlash(null)}>Dismiss</button>
        </div>
      )}

      {!status ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-200 animate-pulse" />)}</div>
      ) : (
        <>
          {view === 'dashboard' && <DashboardView status={status} />}
          {view === 'search' && <SearchConsoleView status={status} isAdmin={isAdmin} reload={loadStatus} />}
          {view === 'analytics' && <AnalyticsView status={status} isAdmin={isAdmin} reload={loadStatus} />}
          {view === 'integrations' && <IntegrationsView status={status} isAdmin={isAdmin} busy={busy} run={run} />}
          {view === 'events' && <EventsView isAdmin={isAdmin} />}
          {view === 'history' && <HistoryView isAdmin={isAdmin} />}
          {view === 'settings' && (
            <div className="space-y-5">
              <CredentialsPanel status={status} isAdmin={isAdmin} onSaved={loadStatus} />
              <SettingsView status={status} isAdmin={isAdmin} busy={busy} run={run} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ───────────────────────────── Dashboard ─────────────────────────────
function DashboardView({ status }: { status: any }) {
  const [filters, setFilters] = useState({ from: ymd(new Date(Date.now() - 29 * 86_400_000)), to: ymd(new Date()), channel: '', campaign: '', loanType: '', status: '' });
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const qs = useMemo(() => new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString(), [filters]);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api(`/api/marketing/dashboard?${qs}`)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [qs]);

  const t = data?.crm?.totals;
  const set = (k: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-5">
      <Card title="Filters" right={status.isAdmin && (
        <div className="flex gap-2">
          <a className={btnGhost} href={`/api/marketing/export?type=attribution&${qs}`}><Download size={14} />Attribution CSV</a>
          <a className={btnGhost} href={`/api/marketing/export?type=events&${qs}`}><Download size={14} />Events CSV</a>
        </div>
      )}>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <label className="text-xs text-gray-500">From<input type="date" className={input} value={filters.from} onChange={set('from')} /></label>
          <label className="text-xs text-gray-500">To<input type="date" className={input} value={filters.to} onChange={set('to')} /></label>
          <label className="text-xs text-gray-500">Channel
            <select className={input} value={filters.channel} onChange={set('channel')}><option value="">All</option>{CHANNELS.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}</select>
          </label>
          <label className="text-xs text-gray-500">Campaign
            <select className={input} value={filters.campaign} onChange={set('campaign')}><option value="">All</option>{(data?.crm?.byCampaign || []).map((c: any) => <option key={c.campaign} value={c.campaign}>{c.campaign}</option>)}</select>
          </label>
          <label className="text-xs text-gray-500">Loan type<input className={input} placeholder="e.g. Used Car Loan" value={filters.loanType} onChange={set('loanType')} /></label>
          <label className="text-xs text-gray-500">Lead status
            <select className={input} value={filters.status} onChange={set('status')}><option value="">All</option>{LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          </label>
        </div>
      </Card>

      {error && <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
      {loading && !data && <div className="h-40 bg-white rounded-2xl border border-gray-200 animate-pulse" />}

      {data && (
        <div className={loading ? 'opacity-60 transition' : 'transition'}>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">CRM-confirmed (EzyLoan database)</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
            <Stat label="Leads" value={fmtNum(t.leads)} hint={`${fmtNum(t.consented)} with ad consent`} />
            <Stat label="Qualified" value={fmtNum(t.qualified)} hint={`${fmtPct(data.crm.rates.leadToQualified)} of leads`} />
            <Stat label="Applications" value={fmtNum(t.applications)} hint={`${fmtPct(data.crm.rates.qualifiedToApplication)} of qualified`} />
            <Stat label="Approved" value={fmtNum(t.approvals)} hint={`${fmtPct(data.crm.rates.applicationToApproval)} of applications`} />
            <Stat label="Disbursed" value={fmtNum(t.disbursements)} hint={`${fmtPct(data.crm.rates.approvalToDisbursal)} of approvals`} />
          </div>
          <p className="text-[11px] text-gray-400 mb-5">
            All loan applications in range (incl. those not linked to a lead): {fmtNum(data.crm.loanPipeline.applications)} submitted · {fmtNum(data.crm.loanPipeline.approved)} approved/sanctioned · {fmtNum(data.crm.loanPipeline.disbursed)} disbursed.
          </p>

          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Advertising (spend reported by the platforms)</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-5">
            {(['meta', 'google'] as const).map((p) => {
              const m = data.platform[p];
              return (
                <Card key={p} title={p === 'meta' ? 'Meta (Facebook / Instagram)' : 'Google Ads'} icon={p === 'meta' ? <Facebook size={15} className="text-blue-600" /> : <Search size={15} className="text-amber-600" />}
                  right={<span className="text-[11px] text-gray-400">{m.lastFetchedAt ? `Spend synced ${fmtDate(m.lastFetchedAt)}` : 'Spend not synced'}</span>}>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <dt className="text-gray-500">Spend</dt><dd className="text-right font-medium">{fmtMoney(m.spend, m.currency)}</dd>
                    <dt className="text-gray-500">CRM leads from channel</dt><dd className="text-right font-medium">{fmtNum(m.crmLeads)}</dd>
                    <dt className="text-gray-500">Cost per lead</dt><dd className="text-right font-medium">{fmtMoney(m.cpl, m.currency)}</dd>
                    <dt className="text-gray-500">Cost per qualified lead</dt><dd className="text-right font-medium">{fmtMoney(m.costPerQualified, m.currency)}</dd>
                    <dt className="text-gray-500">Configured value</dt><dd className="text-right font-medium">{m.configuredValue === null ? 'No values set' : fmtMoney(m.configuredValue, m.currency)}</dd>
                    <dt className="text-gray-500">ROAS (configured value ÷ spend)</dt><dd className="text-right font-medium">{m.roas === null ? '—' : `${m.roas}×`}</dd>
                  </dl>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-5">
            <Card title="Leads by source (CRM)">
              <Table rows={data.crm.bySource} cols={[['_id', 'Source'], ['leads', 'Leads'], ['qualified', 'Qualified'], ['applications', 'Apps'], ['disbursements', 'Disbursed']]} />
            </Card>
            <Card title="Leads by acquisition channel (CRM)">
              <Table rows={data.crm.byChannel.map((r: any) => ({ ...r, _id: String(r._id).replace(/_/g, ' ') }))} cols={[['_id', 'Channel'], ['leads', 'Leads'], ['qualified', 'Qualified'], ['applications', 'Apps'], ['disbursements', 'Disbursed']]} />
            </Card>
          </div>

          <Card title="Campaigns — CRM-confirmed results">
            <Table
              rows={data.crm.byCampaign.map((c: any) => ({ ...c, spendLabel: c.spend === null ? '—' : fmtMoney(c.spend), cplLabel: c.cpl === null ? '—' : fmtMoney(c.cpl), cpqLabel: c.costPerQualified === null ? '—' : fmtMoney(c.costPerQualified) }))}
              cols={[['campaign', 'Campaign'], ['leads', 'Leads'], ['qualified', 'Qualified'], ['applications', 'Apps'], ['approvals', 'Approved'], ['disbursements', 'Disbursed'], ['spendLabel', 'Meta spend*'], ['cplLabel', 'CPL'], ['cpqLabel', 'Cost / qualified']]}
            />
            <p className="text-[11px] text-gray-400 mt-2">* Spend is joined only where the CRM lead carries the exact Meta campaign ID (Lead Ads). Google spend is shown below by campaign, not joined to leads.</p>
          </Card>

          <div className="mt-5">
            <Card title="Campaigns — as reported by the ad platforms" right={<span className="text-[11px] text-gray-400">Platform conversions are the platform&apos;s own count, not CRM leads</span>}>
              <Table
                rows={data.platform.campaigns.map((c: any) => ({ ...c, spendLabel: fmtMoney(c.spend, c.currency) }))}
                cols={[['provider', 'Platform'], ['campaignName', 'Campaign'], ['spendLabel', 'Spend'], ['impressions', 'Impr.'], ['clicks', 'Clicks'], ['platformConversions', 'Platform conv.']]}
                empty="No platform data — connect an ad account with reporting access, then run “Sync spend now”."
              />
            </Card>
          </div>

          <ul className="mt-4 space-y-1">
            {data.notes.map((n: string) => <li key={n} className="flex gap-1.5 text-[11px] text-gray-500"><Info size={12} className="mt-0.5 shrink-0" />{n}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function Table({ rows, cols, empty = 'No data for this range.' }: { rows: any[]; cols: [string, string][]; empty?: string }) {
  if (!rows?.length) return <p className="text-sm text-gray-400 py-6 text-center">{empty}</p>;
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[420px]">
        <thead>
          <tr className="border-b border-gray-100">{cols.map(([k, l], i) => <th key={k} className={`py-2 px-1 text-xs font-semibold text-gray-500 ${i ? 'text-right' : 'text-left'}`}>{l}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-b border-gray-50 last:border-0">
              {cols.map(([k], i) => <td key={k} className={`py-2 px-1 ${i ? 'text-right tabular-nums' : 'text-left font-medium text-gray-800 max-w-[220px] truncate'}`}>{typeof r[k] === 'number' ? fmtNum(r[k]) : r[k] ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ───────────────────────────── Integrations ─────────────────────────────
function IntegrationsView({ status, isAdmin, busy, run }: { status: any; isAdmin: boolean; busy: string | null; run: (k: string, fn: () => Promise<unknown>, ok?: string) => Promise<void> }) {
  const env = status.environment;
  const meta = status.meta;
  const google = status.google;
  const [capiToken, setCapiToken] = useState('');
  const [datasetId, setDatasetId] = useState(meta.meta?.datasetId || '');
  const [pixels, setPixels] = useState<any[] | null>(null);
  const [customerId, setCustomerId] = useState(google.google?.customerId || '');
  const [loginId, setLoginId] = useState(google.google?.loginCustomerId || '');
  const [backfillDays, setBackfillDays] = useState(7);
  const post = (url: string, body: unknown) => api(url, { method: 'POST', body: JSON.stringify(body) });
  const lastOf = (provider: string, kind: string) => status.lastSync.find((l: any) => l.provider === provider && l.kind === kind);

  const missingEnv = [
    !env.encryptionKeySet && 'Encryption key (MARKETING_ENCRYPTION_KEY or a writable app folder)',
    !env.metaAppIdSet && 'Meta App ID',
    !env.metaAppSecretSet && 'Meta App Secret',
    !env.googleClientSet && 'Google OAuth Client ID / Secret',
    !env.googleDeveloperTokenSet && 'Google Ads developer token (reporting & account lists only)',
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      {missingEnv.length > 0 && (
        <div className="rounded-xl bg-amber-50 text-amber-800 text-sm px-4 py-3">
          <p className="font-medium mb-1">API keys missing: add them in the Settings tab → API keys</p>
          <ul className="list-disc ml-5 text-xs space-y-0.5">{missingEnv.map((m) => <li key={String(m)}>{m}</li>)}</ul>
        </div>
      )}

      <div className="grid xl:grid-cols-2 gap-5">
        {/* ── Meta ── */}
        <Card title="Meta (Facebook / Instagram)" icon={<Facebook size={16} className="text-blue-600" />} right={<HealthPill status={meta.status} />}>
          <div className="space-y-4 text-sm">
            {meta.status !== 'disconnected' && (
              <dl className="grid grid-cols-2 gap-y-1 text-xs">
                <dt className="text-gray-500">Account</dt><dd className="text-right">{meta.accountName || '—'}</dd>
                <dt className="text-gray-500">Last successful call</dt><dd className="text-right">{fmtDate(meta.lastSuccessAt)}</dd>
                <dt className="text-gray-500">Last checked</dt><dd className="text-right">{fmtDate(meta.lastCheckedAt)}</dd>
                <dt className="text-gray-500">Token expires</dt><dd className="text-right">{meta.tokenExpiresAt ? fmtDate(meta.tokenExpiresAt) : 'No expiry reported'}</dd>
                <dt className="text-gray-500">Data access expires</dt><dd className="text-right">{fmtDate(meta.dataAccessExpiresAt)}</dd>
              </dl>
            )}
            {meta.missingScopes?.length > 0 && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">Missing permissions: {meta.missingScopes.join(', ')}. Reconnect and grant them.</p>}
            {meta.lastError?.message && meta.status !== 'connected' && <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">{meta.lastError.message} <span className="text-red-400">({fmtDate(meta.lastError.at)})</span></p>}
            {env.legacyManualPageTokenSet && <p className="text-[11px] text-gray-500">A manual Page token is also saved under Automations → Facebook Lead Ads; it is used only as a fallback for pages not connected here.</p>}

            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                <a href="/api/marketing/meta/connect" className={btnPrimary}><Link2 size={14} />{meta.status === 'disconnected' ? 'Connect Meta' : 'Reconnect'}</a>
                {meta.status !== 'disconnected' && (
                  <>
                    <button className={btnGhost} disabled={!!busy} onClick={() => run('meta-health', () => post('/api/marketing/meta/assets', { action: 'healthcheck' }), 'Meta connection checked.')}><RefreshCw size={14} className={busy === 'meta-health' ? 'animate-spin' : ''} />Check now</button>
                    <button className={btnGhost} disabled={!!busy} onClick={() => run('meta-refresh', () => post('/api/marketing/meta/assets', { action: 'refresh' }), 'Pages and ad accounts reloaded.')}>Reload assets</button>
                    <button className={`${btn} border border-red-200 text-red-700 hover:bg-red-50`} disabled={!!busy} onClick={() => confirm('Disconnect Meta? Page webhooks will be unsubscribed and tokens deleted.') && run('meta-disc', () => post('/api/marketing/meta/disconnect', {}), 'Meta disconnected.')}><Unlink size={14} />Disconnect</button>
                  </>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <CopyField label="Webhook callback URL (Meta app → Webhooks → Page → leadgen)" value={env.metaWebhookUrl} />
              <CopyField label="OAuth redirect URI (Facebook Login → Valid OAuth Redirect URIs)" value={env.metaRedirectUri} />
              {!env.metaVerifyTokenSet && <p className="text-[11px] text-amber-700">No webhook Verify Token set — save one under Automations → Facebook Lead Ads.</p>}
            </div>

            {meta.meta?.pages?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-1">Pages — Lead Ads webhook subscription</p>
                <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl">
                  {meta.meta.pages.map((p: any) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-400">{p.subscribed ? `Subscribed · ${p.forms.length} form(s)` : 'Not subscribed'}{!p.hasToken && ' · no page token'}</p>
                      </div>
                      {isAdmin && (
                        <button className={p.subscribed ? btnGhost : btnPrimary} disabled={!!busy} onClick={() => run(`sub-${p.id}`, () => post('/api/marketing/meta/assets', { action: 'subscribe', pageId: p.id, subscribe: !p.subscribed }), p.subscribed ? 'Page unsubscribed.' : 'Page subscribed to Lead Ads.')}>
                          {p.subscribed ? 'Unsubscribe' : 'Subscribe'}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isAdmin && meta.status !== 'disconnected' && (
              <div className="border-t border-gray-100 pt-3 space-y-3">
                <p className="text-xs font-semibold text-gray-700">Reporting &amp; Conversions API</p>
                {meta.meta?.adAccounts?.length > 0 ? (
                  <div>
                    <p className="text-[11px] text-gray-500 mb-1">Ad accounts used for spend reporting</p>
                    <div className="flex flex-wrap gap-2">
                      {meta.meta.adAccounts.map((a: any) => {
                        const on = meta.meta.selectedAdAccountIds.includes(a.id);
                        return (
                          <button key={a.id} className={`${btn} text-xs ${on ? 'bg-blue-600 text-white' : 'border border-gray-200'}`} disabled={!!busy}
                            onClick={() => run('acct', () => post('/api/marketing/meta/assets', { action: 'select', adAccountIds: on ? meta.meta.selectedAdAccountIds.filter((x: string) => x !== a.id) : [...meta.meta.selectedAdAccountIds, a.id] }))}>
                            {a.name} {a.currency ? `(${a.currency})` : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : <p className="text-[11px] text-gray-500">No ad accounts available (needs the ads_read permission).</p>}
                <div className="grid sm:grid-cols-2 gap-2">
                  <label className="text-[11px] text-gray-500">Dataset / Pixel ID
                    <div className="flex gap-1">
                      <input className={input} value={datasetId} onChange={(e) => setDatasetId(e.target.value.replace(/\D/g, ''))} placeholder="e.g. 1234567890" />
                      <button type="button" className={btnGhost} onClick={async () => { try { setPixels((await post('/api/marketing/meta/assets', { action: 'pixels' })).pixels); } catch (e) { alert((e as Error).message); } }}>List</button>
                    </div>
                  </label>
                  <label className="text-[11px] text-gray-500">Conversions API access token {meta.meta?.capiTokenSet && <span className="text-green-600">(saved)</span>}
                    <input className={input} type="password" autoComplete="off" value={capiToken} onChange={(e) => setCapiToken(e.target.value)} placeholder={meta.meta?.capiTokenSet ? '•••••••• (leave blank to keep)' : 'From Events Manager → Settings'} />
                  </label>
                </div>
                {pixels && <p className="text-[11px] text-gray-500">{pixels.length ? pixels.map((p) => `${p.name}: ${p.id}`).join(' · ') : 'No pixels found on the selected ad accounts.'}</p>}
                <div className="flex flex-wrap gap-2">
                  <button className={btnPrimary} disabled={!!busy} onClick={() => run('capi', async () => { await post('/api/marketing/meta/assets', { action: 'select', datasetId, capiToken: capiToken || undefined }); setCapiToken(''); }, 'Conversions API settings saved.')}>Save</button>
                  <button className={btnGhost} disabled={!!busy} onClick={() => run('testev', async () => { const r = await post('/api/marketing/meta/test-event', {}); if (!r.ok) throw new Error(r.reason || 'Meta did not confirm the test event.'); }, 'Test event received by Meta — check Events Manager → Test events.')}>Send test event</button>
                </div>
                <div className="flex flex-wrap items-end gap-2 border-t border-gray-100 pt-3">
                  <label className="text-[11px] text-gray-500">Backfill Lead Ads (days)
                    <input type="number" min={1} max={90} className={`${input} w-24`} value={backfillDays} onChange={(e) => setBackfillDays(Number(e.target.value))} />
                  </label>
                  <button className={btnGhost} disabled={!!busy} onClick={() => run('backfill', async () => { const r = await post('/api/marketing/meta/backfill', { days: backfillDays }); setTimeout(() => alert(`Backfill: ${r.seen} lead(s) seen, ${r.queued} new.${r.errors?.length ? `\nErrors: ${r.errors.join('; ')}` : ''}`), 10); })}>Run backfill</button>
                  {lastOf('meta', 'backfill') && <span className="text-[11px] text-gray-400">Last: {fmtDate(lastOf('meta', 'backfill').at)}</span>}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ── Google ── */}
        <Card title="Google Ads" icon={<Search size={16} className="text-amber-600" />} right={<HealthPill status={google.status} />}>
          <div className="space-y-4 text-sm">
            {google.status !== 'disconnected' && (
              <dl className="grid grid-cols-2 gap-y-1 text-xs">
                <dt className="text-gray-500">Account</dt><dd className="text-right">{google.accountName || 'Not selected'}</dd>
                <dt className="text-gray-500">Last successful call</dt><dd className="text-right">{fmtDate(google.lastSuccessAt)}</dd>
                <dt className="text-gray-500">Last checked</dt><dd className="text-right">{fmtDate(google.lastCheckedAt)}</dd>
                <dt className="text-gray-500">Refresh token</dt><dd className="text-right">{google.google?.refreshTokenSet ? 'Stored (encrypted)' : 'Missing'}</dd>
              </dl>
            )}
            {google.missingScopes?.length > 0 && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">Missing scopes: {google.missingScopes.join(', ')}</p>}
            {google.lastError?.message && google.status !== 'connected' && <p className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">{google.lastError.message}</p>}
            <p className="text-[11px] text-gray-500">Conversions are uploaded through Google&apos;s Data Manager API (Google requires it for new offline-conversion integrations since 15 June 2026). Account lists, conversion actions and spend reporting use the Google Ads API and need an approved developer token.</p>
            {isAdmin && (
              <div className="flex flex-wrap gap-2">
                <a href="/api/marketing/google/connect" className={btnPrimary}><Link2 size={14} />{google.status === 'disconnected' ? 'Connect Google' : 'Reconnect'}</a>
                {google.status !== 'disconnected' && (
                  <>
                    <button className={btnGhost} disabled={!!busy} onClick={() => run('g-health', () => post('/api/marketing/google/assets', { action: 'healthcheck' }), 'Google connection checked.')}><RefreshCw size={14} className={busy === 'g-health' ? 'animate-spin' : ''} />Check now</button>
                    <button className={btnGhost} disabled={!!busy} onClick={() => run('g-refresh', () => post('/api/marketing/google/assets', { action: 'refresh' }), 'Accessible accounts loaded.')}>List accounts</button>
                    <button className={`${btn} border border-red-200 text-red-700 hover:bg-red-50`} disabled={!!busy} onClick={() => confirm('Disconnect Google Ads? The refresh token will be revoked.') && run('g-disc', () => post('/api/marketing/google/disconnect', {}), 'Google disconnected.')}><Unlink size={14} />Disconnect</button>
                  </>
                )}
              </div>
            )}
            <CopyField label="OAuth redirect URI (Google Cloud → Credentials → Authorized redirect URIs)" value={env.googleRedirectUri} />
            {isAdmin && google.status !== 'disconnected' && (
              <div className="border-t border-gray-100 pt-3 space-y-2">
                {google.google?.accessibleCustomers?.length > 0 && (
                  <p className="text-[11px] text-gray-500">Accessible: {google.google.accessibleCustomers.map((c: any) => `${c.name || 'Account'} ${c.id}${c.manager ? ' (manager)' : ''}`).join(' · ')}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-2">
                  <label className="text-[11px] text-gray-500">Customer ID<input className={input} value={customerId} onChange={(e) => setCustomerId(e.target.value)} placeholder="123-456-7890" /></label>
                  <label className="text-[11px] text-gray-500">Manager (login) customer ID — optional<input className={input} value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="only if accessed via an MCC" /></label>
                </div>
                <button className={btnPrimary} disabled={!!busy} onClick={() => run('g-select', () => post('/api/marketing/google/assets', { action: 'select', customerId, loginCustomerId: loginId || undefined }), 'Google Ads account selected; conversion actions loaded.')}>Use this account</button>
                {google.google?.conversionActions?.length > 0 && (
                  <p className="text-[11px] text-gray-500">{google.google.conversionActions.length} enabled conversion action(s) available — map them in Settings.</p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card title="Queue & background worker" right={isAdmin && (
        <div className="flex gap-2">
          <button className={btnGhost} disabled={!!busy} onClick={() => run('worker', () => api('/api/marketing/worker', { method: 'POST' }), 'Queue processed.')}><Play size={14} />Process queue now</button>
          <button className={btnGhost} disabled={!!busy} onClick={() => run('insights', async () => { const r = await api('/api/marketing/insights', { method: 'POST' }); const msg = (p: any, n: string) => `${n}: ${p.error || p.skipped || `${p.rows} rows`}`; setTimeout(() => alert(`${msg(r.meta, 'Meta')}\n${msg(r.google, 'Google')}`), 10); })}><RefreshCw size={14} />Sync spend now</button>
        </div>
      )}>
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-semibold text-gray-700 mb-1">Conversion events</p>
            <div className="flex flex-wrap gap-1.5">{Object.entries(status.queue.events).map(([k, v]) => <span key={k} className="inline-flex items-center gap-1"><Badge status={k} /> {String(v)}</span>)}{!Object.keys(status.queue.events).length && <span className="text-gray-400">None yet</span>}</div>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">Lead Ads fetch queue</p>
            <div className="flex flex-wrap gap-1.5">{Object.entries(status.queue.leadReceipts).map(([k, v]) => <span key={k} className="px-2 py-0.5 bg-gray-100 rounded-full">{k}: {String(v)}</span>)}{!Object.keys(status.queue.leadReceipts).length && <span className="text-gray-400">No Lead Ads notifications yet</span>}</div>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          Background worker: {env.workerEnabled ? 'running inside the web server (every 30 s)' : 'disabled — trigger POST /api/marketing/worker from cron'}.
          {status.periodic.map((p: any) => ` ${p.job.replace('marketing:', '')} last ran ${fmtDate(p.lastRunAt)}.`)}
        </p>
      </Card>
    </div>
  );
}

// ───────────────────────────── Events log ─────────────────────────────
function EventsView({ isAdmin }: { isAdmin: boolean }) {
  const [f, setF] = useState({ platform: '', status: '', crmEvent: '', test: '', review: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const load = useCallback(async () => {
    const qs = new URLSearchParams({ ...Object.fromEntries(Object.entries(f).filter(([, v]) => v)), page: String(page) });
    try { setData(await api(`/api/marketing/events?${qs}`)); } catch (e) { setMsg((e as Error).message); }
  }, [f, page]);
  useEffect(() => { load(); }, [load]);

  const act = async (id: string, action: string) => {
    if (action === 'retract' && !confirm('Retract this conversion? For Google this uploads a RETRACTION adjustment.')) return;
    try {
      await api(`/api/marketing/events/${id}`, { method: 'POST', body: JSON.stringify({ action }) });
      setMsg(`Done: ${action.replace('_', ' ')}.`);
      setDetail(null);
      load();
    } catch (e) { setMsg((e as Error).message); }
  };
  const sel = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLSelectElement>) => { setPage(1); setF((x) => ({ ...x, [k]: e.target.value })); };

  return (
    <div className="space-y-4">
      <Card title="Conversion delivery log" right={isAdmin && f.status && ['dead', 'failed', 'rejected', 'skipped', 'blocked_consent', 'unverified'].includes(f.status) ? (
        <button className={btnGhost} onClick={async () => { if (!confirm(`Re-queue ALL "${f.status}" events?`)) return; try { const r = await api('/api/marketing/events', { method: 'POST', body: JSON.stringify({ action: 'retry_all', status: f.status }) }); setMsg(`${r.requeued} event(s) re-queued.`); load(); } catch (e) { setMsg((e as Error).message); } }}>Retry all “{f.status}”</button>
      ) : null}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
          <select aria-label="Platform" className={input} value={f.platform} onChange={sel('platform')}><option value="">All platforms</option><option value="meta">Meta</option><option value="google">Google</option></select>
          <select aria-label="Status" className={input} value={f.status} onChange={sel('status')}><option value="">All statuses</option>{Object.keys(STATUS_STYLE).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>
          <select aria-label="CRM event" className={input} value={f.crmEvent} onChange={sel('crmEvent')}><option value="">All CRM events</option>{CRM_EVENTS.map((e) => <option key={e} value={e}>{EVENT_LABEL[e]}</option>)}</select>
          <select aria-label="Traffic" className={input} value={f.test} onChange={sel('test')}><option value="">Test + production</option><option value="0">Production only</option><option value="1">Test only</option></select>
          <select aria-label="Review" className={input} value={f.review} onChange={sel('review')}><option value="">All</option><option value="1">Needs review</option></select>
        </div>
        {msg && <p className="text-xs bg-blue-50 text-blue-800 rounded-lg px-3 py-2 mb-2">{msg}</p>}
        {!data ? <div className="h-32 animate-pulse bg-gray-50 rounded-xl" /> : data.items.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">No conversion events match.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead><tr className="border-b border-gray-100 text-xs text-gray-500">
                <th className="text-left py-2">When</th><th className="text-left">Platform</th><th className="text-left">CRM event</th><th className="text-left">Lead</th><th className="text-left">Status</th><th className="text-right">Tries</th><th className="text-left pl-3">Detail</th><th />
              </tr></thead>
              <tbody>
                {data.items.map((e: any) => (
                  <tr key={e._id} className="border-b border-gray-50 align-top">
                    <td className="py-2 whitespace-nowrap text-xs text-gray-600">{fmtDate(e.createdAt)}</td>
                    <td className="capitalize">{e.platform}{e.testMode && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">TEST</span>}</td>
                    <td>{EVENT_LABEL[e.crmEvent] || e.crmEvent}<div className="text-[10px] text-gray-400">{e.platformEventName}</div></td>
                    <td className="text-xs">{e.leadLabel}<div className="text-[10px] text-gray-400">{e.channel?.replace(/_/g, ' ')}</div></td>
                    <td><Badge status={e.status} />{e.needsReview && <div className="text-[10px] text-amber-700 mt-0.5">needs review</div>}</td>
                    <td className="text-right tabular-nums">{e.attempts}</td>
                    <td className="pl-3 text-xs text-gray-600 max-w-[260px]"><span className="line-clamp-2">{e.lastError || e.consentReason || STATUS_HELP[e.status] || '—'}</span></td>
                    <td className="text-right whitespace-nowrap">
                      <button className="text-xs text-blue-600 underline mr-2" onClick={async () => setDetail((await api(`/api/marketing/events/${e._id}`)).event)}>History</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-end gap-2 mt-3 text-xs">
            <button className={btnGhost} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span>Page {data.page} of {data.pages}</span>
            <button className={btnGhost} disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        )}
      </Card>

      {detail && (
        <div role="dialog" aria-modal="true" aria-label="Event history" className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setDetail(null)}>
          <div className="bg-white w-full sm:max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="font-semibold">{EVENT_LABEL[detail.crmEvent]} → {detail.platform}</h3>
                <p className="text-xs text-gray-500 break-all">Event ID {detail.eventId} · event time {fmtDate(detail.eventTime)}</p>
              </div>
              <button className="text-sm text-gray-500" onClick={() => setDetail(null)} aria-label="Close">✕</button>
            </div>
            <dl className="grid grid-cols-2 gap-y-1 text-xs mb-3">
              <dt className="text-gray-500">Status</dt><dd><Badge status={detail.status} /></dd>
              <dt className="text-gray-500">Consent</dt><dd>{detail.consentState} — {detail.consentReason}</dd>
              <dt className="text-gray-500">Send mode</dt><dd>{detail.sendMode || '—'}</dd>
              <dt className="text-gray-500">Value</dt><dd>{detail.value ? fmtMoney(detail.value, detail.currency) : '—'}</dd>
              <dt className="text-gray-500">Platform reference</dt><dd className="break-all">{detail.platformTraceId || detail.platformRequestId || '—'}</dd>
              {detail.needsReview && (<><dt className="text-gray-500">Review</dt><dd className="text-amber-700">{detail.needsReview}</dd></>)}
            </dl>
            <ol className="border-l border-gray-200 ml-1 space-y-2">
              {[...(detail.history || [])].reverse().map((h: any, i: number) => (
                <li key={i} className="ml-3 text-xs"><span className="text-gray-400">{fmtDate(h.at)}</span> <Badge status={h.status} /> <span className="text-gray-700">{h.message}</span></li>
              ))}
            </ol>
            {isAdmin && (
              <div className="flex flex-wrap gap-2 mt-4">
                {['dead', 'failed', 'rejected', 'skipped', 'blocked_consent', 'unverified'].includes(detail.status) && <button className={btnPrimary} onClick={() => act(detail._id, 'retry')}>Retry</button>}
                {['sent', 'submitted', 'accepted', 'unverified'].includes(detail.status) && <button className={`${btn} border border-red-200 text-red-700`} onClick={() => act(detail._id, 'retract')}>Retract</button>}
                {detail.needsReview && <button className={btnGhost} onClick={() => act(detail._id, 'dismiss_review')}>Dismiss review</button>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────── Sync history ─────────────────────────────
function HistoryView({ isAdmin }: { isAdmin: boolean }) {
  const [tab, setTab] = useState<'logs' | 'receipts'>('logs');
  const [provider, setProvider] = useState('');
  const [data, setData] = useState<any>(null);
  const load = useCallback(async () => {
    const qs = new URLSearchParams(tab === 'receipts' ? { view: 'receipts' } : provider ? { provider } : {});
    setData(await api(`/api/marketing/sync-logs?${qs}`).catch(() => ({ items: [] })));
  }, [tab, provider]);
  useEffect(() => { setData(null); load(); }, [load]);
  const dot: Record<string, string> = { ok: 'bg-green-500', error: 'bg-red-500', partial: 'bg-amber-500', info: 'bg-blue-400' };

  return (
    <Card title="Integration history" right={
      <div className="flex gap-1">
        <button className={`${btn} text-xs ${tab === 'logs' ? 'bg-blue-600 text-white' : 'border border-gray-200'}`} onClick={() => setTab('logs')}>Sync log</button>
        <button className={`${btn} text-xs ${tab === 'receipts' ? 'bg-blue-600 text-white' : 'border border-gray-200'}`} onClick={() => setTab('receipts')}>Lead Ads deliveries</button>
      </div>
    }>
      {tab === 'logs' && (
        <select aria-label="Provider" className={`${input} max-w-[200px] mb-3`} value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="">All</option><option value="meta">Meta</option><option value="google">Google</option><option value="system">System</option>
        </select>
      )}
      {!data ? <div className="h-32 animate-pulse bg-gray-50 rounded-xl" /> : data.items.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">Nothing recorded yet.</p> : tab === 'logs' ? (
        <ul className="divide-y divide-gray-100">
          {data.items.map((l: any) => (
            <li key={l._id} className="py-2 flex gap-3 text-sm">
              <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dot[l.status] || 'bg-gray-400'}`} />
              <div className="min-w-0">
                <p className="text-gray-800 break-words">{l.message}</p>
                <p className="text-[11px] text-gray-400">{fmtDate(l.createdAt)} · {l.provider} · {l.kind}{l.durationMs ? ` · ${l.durationMs} ms` : ''}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead><tr className="text-xs text-gray-500 border-b border-gray-100"><th className="text-left py-2">Received</th><th className="text-left">Leadgen ID</th><th className="text-left">Via</th><th className="text-left">Status</th><th className="text-right">Deliveries</th><th className="text-left pl-3">Error</th><th /></tr></thead>
            <tbody>
              {data.items.map((r: any) => (
                <tr key={r._id} className="border-b border-gray-50">
                  <td className="py-2 text-xs">{fmtDate(r.createdAt)}</td>
                  <td className="font-mono text-xs">{r.leadgenId}</td>
                  <td className="text-xs">{r.receivedVia}{!r.signatureVerified && r.receivedVia === 'webhook' ? ' (unsigned)' : ''}</td>
                  <td className="text-xs">{r.status}{r.leadCreated === false && r.status === 'done' ? ' (matched existing lead)' : ''}</td>
                  <td className="text-right text-xs">{r.deliveries}</td>
                  <td className="pl-3 text-xs text-red-700 max-w-[240px] truncate">{r.lastError || ''}</td>
                  <td>{isAdmin && ['failed', 'dead'].includes(r.status) && <button className="text-xs text-blue-600 underline" onClick={async () => { await api('/api/marketing/sync-logs', { method: 'POST', body: JSON.stringify({ action: 'retry_receipt', id: r._id }) }); load(); }}>Retry</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// ───────────────────────────── Settings ─────────────────────────────
function SettingsView({ status, isAdmin, busy, run }: { status: any; isAdmin: boolean; busy: string | null; run: (k: string, fn: () => Promise<unknown>, ok?: string) => Promise<void> }) {
  const [s, setS] = useState<any>(() => JSON.parse(JSON.stringify(status.settings)));
  const actions: any[] = status.google.google?.conversionActions || [];
  const upd = (i: number, path: string[], v: unknown) => setS((prev: any) => {
    const next = JSON.parse(JSON.stringify(prev));
    let o = next.eventMappings[i];
    for (const k of path.slice(0, -1)) o = o[k] = o[k] || {};
    o[path[path.length - 1]] = v;
    return next;
  });
  const disabled = !isAdmin;

  return (
    <div className="space-y-5">
      {!isAdmin && <p className="text-xs text-gray-500">Read-only — only admins can change marketing settings.</p>}
      <Card title="CRM event → ad platform mapping">
        <p className="text-xs text-gray-500 mb-3">Events are queued only when the CRM condition really happens (a lead is created, its status becomes qualified, an application is submitted, a loan is approved/sanctioned or disbursed). Each event is sent at most once per platform. Values are your configured business values — customer loan amounts are never sent.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead><tr className="text-xs text-gray-500 border-b border-gray-100"><th className="text-left py-2">CRM event</th><th className="text-left">Meta</th><th className="text-left">Meta event name</th><th className="text-left">Google</th><th className="text-left">Google conversion action</th><th className="text-left">Enhanced</th><th className="text-left">Value (₹)</th></tr></thead>
            <tbody>
              {s.eventMappings.map((m: any, i: number) => (
                <tr key={m.crmEvent} className="border-b border-gray-50">
                  <td className="py-2 font-medium">{EVENT_LABEL[m.crmEvent]}</td>
                  <td><input type="checkbox" aria-label={`Send ${m.crmEvent} to Meta`} disabled={disabled} checked={!!m.meta?.enabled} onChange={(e) => upd(i, ['meta', 'enabled'], e.target.checked)} /></td>
                  <td><input className={`${input} max-w-[180px]`} disabled={disabled} value={m.meta?.eventName || ''} onChange={(e) => upd(i, ['meta', 'eventName'], e.target.value)} /></td>
                  <td><input type="checkbox" aria-label={`Send ${m.crmEvent} to Google`} disabled={disabled || !m.google?.conversionActionId} checked={!!m.google?.enabled} onChange={(e) => upd(i, ['google', 'enabled'], e.target.checked)} /></td>
                  <td>
                    <select className={`${input} max-w-[220px]`} disabled={disabled} value={m.google?.conversionActionId || ''} onChange={(e) => { upd(i, ['google', 'conversionActionId'], e.target.value || undefined); if (!e.target.value) upd(i, ['google', 'enabled'], false); }}>
                      <option value="">— none —</option>
                      {actions.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
                      {m.google?.conversionActionId && !actions.some((a) => a.id === m.google.conversionActionId) && <option value={m.google.conversionActionId}>ID {m.google.conversionActionId}</option>}
                    </select>
                  </td>
                  <td><input type="checkbox" aria-label={`Enhanced conversions for ${m.crmEvent}`} disabled={disabled} checked={!!m.google?.enhanced} onChange={(e) => upd(i, ['google', 'enhanced'], e.target.checked)} /></td>
                  <td><input type="number" min={0} className={`${input} max-w-[110px]`} disabled={disabled} value={m.value ?? ''} onChange={(e) => upd(i, ['value'], e.target.value === '' ? undefined : Number(e.target.value))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-gray-400 mt-2">Meta: Lead and SubmitApplication are standard events; QualifiedLead, ApprovedApplication and LoanDisbursed are custom/CRM events (usable for Conversion Leads optimisation and custom conversions, not automatically for standard-event optimisation). Google: map each event to its own conversion action; don&apos;t map “New lead” if the website tag already counts it.</p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Qualification & currency">
          <p className="text-xs text-gray-500 mb-2">A lead counts as qualified when its status changes to one of:</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {LEAD_STATUSES.map((st) => {
              const on = s.qualifiedStatuses.includes(st);
              return <button key={st} type="button" disabled={disabled} className={`${btn} text-xs ${on ? 'bg-blue-600 text-white' : 'border border-gray-200'}`} onClick={() => setS({ ...s, qualifiedStatuses: on ? s.qualifiedStatuses.filter((x: string) => x !== st) : [...s.qualifiedStatuses, st] })}>{st}</button>;
            })}
          </div>
          <label className="text-xs text-gray-500">Currency<input className={`${input} max-w-[100px]`} disabled={disabled} value={s.currency} onChange={(e) => setS({ ...s, currency: e.target.value.toUpperCase() })} /></label>
          <label className="text-xs text-gray-500 block mt-2">CRM name reported to Meta (lead_event_source)<input className={input} disabled={disabled} value={s.leadEventSourceName} onChange={(e) => setS({ ...s, leadEventSourceName: e.target.value })} /></label>
        </Card>

        <Card title="Consent & test mode">
          <div className="space-y-3 text-sm">
            <label className="flex items-start gap-2"><input type="checkbox" className="mt-1" disabled={disabled} checked={!!s.consent.allowLeadIdOnlyForLeadAds} onChange={(e) => setS({ ...s, consent: { ...s.consent, allowLeadIdOnlyForLeadAds: e.target.checked } })} />
              <span><span className="font-medium">Lead Ads: send Meta lead_id only when no explicit consent is recorded</span><span className="block text-xs text-gray-500">The person submitted the form on Meta, so Meta already holds the lead. With this on, lifecycle events for those leads carry only Meta&apos;s lead_id — no email, phone or name. Off by default; enable only after legal review.</span></span>
            </label>
            <label className="text-xs text-gray-500 block">Lead Ads consent checkbox key (custom disclaimer) — optional
              <input className={input} disabled={disabled} value={s.consent.metaLeadFormConsentKey || ''} onChange={(e) => setS({ ...s, consent: { ...s.consent, metaLeadFormConsentKey: e.target.value } })} placeholder="checkbox key from your Instant Form" />
            </label>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <label className="flex items-center gap-2"><input type="checkbox" disabled={disabled} checked={!!s.testMode.meta} onChange={(e) => setS({ ...s, testMode: { ...s.testMode, meta: e.target.checked } })} /><span>Meta test mode (events go to Events Manager → Test events only)</span></label>
              <input className={input} disabled={disabled} value={s.testMode.metaTestEventCode || ''} onChange={(e) => setS({ ...s, testMode: { ...s.testMode, metaTestEventCode: e.target.value } })} placeholder="Test event code, e.g. TEST12345" />
              <label className="flex items-center gap-2"><input type="checkbox" disabled={disabled} checked={!!s.testMode.google} onChange={(e) => setS({ ...s, testMode: { ...s.testMode, google: e.target.checked } })} /><span>Google test mode (validateOnly — Google checks the request, ingests nothing)</span></label>
              <p className="text-[11px] text-gray-400">Test events are stored separately and never block the real event from being sent later.</p>
            </div>
          </div>
        </Card>
      </div>

      {isAdmin && (
        <div className="flex justify-end">
          <button className={btnPrimary} disabled={!!busy} onClick={() => run('settings', () => api('/api/marketing/settings', { method: 'PUT', body: JSON.stringify({ eventMappings: s.eventMappings, qualifiedStatuses: s.qualifiedStatuses, currency: s.currency, consent: s.consent, testMode: s.testMode, leadEventSourceName: s.leadEventSourceName }) }), 'Settings saved.')}>Save settings</button>
        </div>
      )}
    </div>
  );
}
