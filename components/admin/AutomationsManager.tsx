'use client';

// Automations — ported from EzyLoanCrm, restyled to the admin blue theme.
// - Email-to-Lead "Sync now" → POST /api/leads/sync-email (needs IMAP_USER/IMAP_PASS in .env.local)
// - Facebook / WhatsApp lead-source config → /api/integrations (stored in shared DB)
// ConfigureIntegrationModal is inlined at the bottom.

import { useEffect, useState, useCallback } from 'react';
import {
  Mail, Globe, Facebook, Instagram, Upload, Download, Zap, MessageCircle, RefreshCw,
  CheckCircle2, AlertCircle, X, Copy, Check, ExternalLink,
} from 'lucide-react';

type Provider = 'facebook' | 'whatsapp';

const AUTOMATIONS = [
  { icon: <MessageCircle size={18} className="text-green-600" />, title: 'WhatsApp Auto-Responder', desc: 'Instantly message new leads on WhatsApp', status: 'coming_soon' },
  { icon: <Zap size={18} className="text-orange-600" />, title: 'Lead Automation Rules', desc: 'Assign leads to team members via rules and/or round robin', status: 'coming_soon' },
  { icon: <Zap size={18} className="text-blue-600" />, title: 'Lead Distribution', desc: 'Forward a copy of new leads to one or more recipients', status: 'coming_soon' },
  { icon: <Zap size={18} className="text-purple-600" />, title: 'Duplicate Lead Merging', desc: 'New leads are de-duplicated by email/phone automatically', status: 'active' },
];

export default function AutomationsManager() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [modalProvider, setModalProvider] = useState<Provider | null>(null);

  const loadIntegrations = useCallback(async () => {
    const res = await fetch('/api/integrations');
    if (res.ok) {
      const data = await res.json();
      const map: Record<string, boolean> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data.items || []).forEach((i: any) => {
        const hasToken = i.config?.pageAccessToken_set || i.config?.accessToken_set;
        map[i.provider] = Boolean(i.enabled && hasToken);
      });
      setConnected(map);
    }
  }, []);

  useEffect(() => { loadIntegrations(); }, [loadIntegrations]);

  async function syncNow() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch('/api/leads/sync-email', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, text: `Checked inbox: ${data.created} new lead(s) added, ${data.skipped} already imported.` });
      } else {
        setResult({ ok: false, text: data.error || 'Sync failed. Check the Gmail App Password in your settings.' });
      }
    } catch {
      setResult({ ok: false, text: 'Could not reach the server. Try again.' });
    } finally {
      setSyncing(false);
    }
  }

  const sources = [
    {
      key: 'email', icon: <Mail size={20} className="text-blue-600" />, bg: 'bg-blue-50',
      title: 'Email-to-Lead', description: 'Form emails arriving at your connected inbox become leads',
      status: 'connected' as const,
    },
    {
      key: 'webhook', icon: <Globe size={20} className="text-indigo-600" />, bg: 'bg-indigo-50',
      title: 'Website Forms (Webhook)', description: 'Receive leads directly via POST to /api/webhook/lead',
      status: 'connected' as const,
    },
    {
      key: 'facebook', icon: <Facebook size={20} className="text-blue-600" />, bg: 'bg-blue-50',
      title: 'Facebook Lead Ads', description: 'Connect your Facebook Page to import Lead Ad submissions',
      status: 'configurable' as const, provider: 'facebook' as Provider,
    },
    {
      key: 'instagram', icon: <Instagram size={20} className="text-pink-600" />, bg: 'bg-pink-50',
      title: 'Instagram Lead Ads', description: 'Instagram leads flow through the connected Facebook Page',
      status: 'configurable' as const, provider: 'facebook' as Provider,
    },
    {
      key: 'whatsapp', icon: <MessageCircle size={20} className="text-green-600" />, bg: 'bg-green-50',
      title: 'WhatsApp Business', description: 'Turn incoming WhatsApp messages into leads automatically',
      status: 'configurable' as const, provider: 'whatsapp' as Provider,
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Automations</h1>
      </div>

      {/* Email-to-Lead */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Mail size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-blue-900">Email-to-Lead</p>
              <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle2 size={11} /> Connected
              </span>
            </div>
            <p className="text-xs text-blue-800 mt-1.5 leading-relaxed">
              Add your connected inbox to any website&rsquo;s contact form. When someone submits the form,
              the notification email lands in your inbox and is automatically turned into a lead here.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={syncNow}
                disabled={syncing}
                className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Checking inbox…' : 'Sync now'}
              </button>
              <span className="text-xs text-blue-700">Click to check your inbox for new lead emails immediately.</span>
            </div>
            {result && (
              <div className={`mt-3 flex items-start gap-2 text-xs rounded-lg p-2.5 ${result.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {result.ok ? <CheckCircle2 size={14} className="mt-px flex-shrink-0" /> : <AlertCircle size={14} className="mt-px flex-shrink-0" />}
                {result.text}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead Source Integrations */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Lead Source Integrations</h2>
          <p className="text-xs text-gray-500 mt-0.5">Connect each platform so its leads flow into your CRM</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {sources.map((s) => {
            const isConnected = s.status === 'connected' || (s.status === 'configurable' && connected[s.provider!]);
            return (
              <div key={s.key} className="p-5 hover:bg-gray-50/50 transition flex flex-col">
                <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>{s.icon}</div>
                <h3 className="text-sm font-semibold text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-500 mt-1 mb-3 flex-1">{s.description}</p>
                <div className="flex items-center justify-between">
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle2 size={12} /> Connected
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Not connected</span>
                  )}
                  {s.status === 'configurable' && (
                    <button
                      onClick={() => setModalProvider(s.provider!)}
                      className="text-xs text-blue-600 font-semibold hover:text-blue-700"
                    >
                      {connected[s.provider!] ? 'Manage ›' : 'Configure ›'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct Webhook info */}
      <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Direct Webhook (optional, instant)</p>
            <p className="text-xs text-gray-600 mt-1">
              If a form builder supports webhooks, point it at{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-xs">/api/webhook/lead</code> for instant capture.
            </p>
            <div className="mt-2 bg-gray-50 rounded-lg border border-gray-200 p-3">
              <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
{`{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 98765 43210",
  "message": "I need a loan",
  "source": "Website Form"
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Automations */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Lead Automations</h2>
          <p className="text-xs text-gray-500 mt-0.5">Rules that run whenever a lead is received</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {AUTOMATIONS.map((a) => (
            <div key={a.title} className="p-5 hover:bg-gray-50/50 transition">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">{a.icon}</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 mb-1.5">{a.desc}</p>
                  {a.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Coming soon</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Import / Export */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Import &amp; Export Data</h2>
          <p className="text-xs text-gray-500 mt-0.5">Bulk import clients from a spreadsheet or export your data</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Upload size={16} className="text-gray-600" /></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Import Clients from CSV</h3>
                <p className="text-xs text-gray-500 mt-0.5 mb-1.5">Bulk import contacts from a CSV file</p>
                <span className="text-xs text-gray-400">Coming soon</span>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Download size={16} className="text-gray-600" /></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Export Client List</h3>
                <p className="text-xs text-gray-500 mt-0.5 mb-1.5">Download your client list in CSV format</p>
                <span className="text-xs text-gray-400">Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalProvider && (
        <ConfigureIntegrationModal
          provider={modalProvider}
          onClose={() => setModalProvider(null)}
          onSaved={() => { setModalProvider(null); loadIntegrations(); }}
        />
      )}
    </div>
  );
}

/* ---- Configure integration modal ---- */
const META: Record<Provider, { title: string; webhookPath: string; docsUrl: string }> = {
  facebook: {
    title: 'Facebook & Instagram Lead Ads',
    webhookPath: '/api/webhook/facebook',
    docsUrl: 'https://developers.facebook.com/docs/marketing-api/guides/lead-ads/integration/',
  },
  whatsapp: {
    title: 'WhatsApp Business',
    webhookPath: '/api/webhook/whatsapp',
    docsUrl: 'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
  },
};

function randomToken() {
  return 'verify_' + Math.random().toString(36).slice(2, 12);
}

function ConfigureIntegrationModal({ provider, onClose, onSaved }: { provider: Provider; onClose: () => void; onSaved: () => void }) {
  const meta = META[provider];
  const [origin, setOrigin] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [pageAccessToken, setPageAccessToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [tokenSet, setTokenSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch('/api/integrations')
      .then((r) => r.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const found = (data.items || []).find((i: any) => i.provider === provider);
        const cfg = found?.config || {};
        setVerifyToken(cfg.verifyToken || randomToken());
        setPhoneNumberId(cfg.phoneNumberId || '');
        setTokenSet(Boolean(cfg.pageAccessToken_set || cfg.accessToken_set));
      })
      .finally(() => setLoading(false));
  }, [provider]);

  const webhookUrl = origin ? `${origin}${meta.webhookPath}` : meta.webhookPath;

  function copyWebhook() {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function save() {
    if (!verifyToken.trim()) { setError('Verify token is required'); return; }
    setSaving(true);
    setError('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config: Record<string, any> = { verifyToken: verifyToken.trim() };
    if (provider === 'facebook') {
      if (pageAccessToken.trim()) config.pageAccessToken = pageAccessToken.trim();
    } else {
      if (accessToken.trim()) config.accessToken = accessToken.trim();
      config.phoneNumberId = phoneNumberId.trim();
    }

    const res = await fetch('/api/integrations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, enabled: true, config }),
    });

    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to save');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Configure {meta.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : (
          <div className="p-6 space-y-5">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

            <ol className="text-xs text-gray-600 space-y-1.5 bg-gray-50 border border-gray-200 rounded-lg p-3 list-decimal list-inside">
              {provider === 'facebook' ? (
                <>
                  <li>Open your Facebook App → <strong>Webhooks</strong> → add a <strong>Page</strong> subscription.</li>
                  <li>Paste the <strong>Callback URL</strong> and <strong>Verify Token</strong> below into Facebook.</li>
                  <li>Subscribe to the <strong>leadgen</strong> field.</li>
                  <li>Generate a <strong>Page Access Token</strong> and paste it below, then Save.</li>
                </>
              ) : (
                <>
                  <li>Open Meta → <strong>WhatsApp → Configuration</strong>.</li>
                  <li>Paste the <strong>Callback URL</strong> and <strong>Verify Token</strong> below into Meta.</li>
                  <li>Subscribe to the <strong>messages</strong> field.</li>
                  <li>Paste your <strong>Access Token</strong> &amp; <strong>Phone Number ID</strong> below, then Save.</li>
                </>
              )}
            </ol>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Callback / Webhook URL</label>
              <div className="flex gap-2">
                <input readOnly value={webhookUrl}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-700 font-mono" />
                <button onClick={copyWebhook}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1">
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                </button>
              </div>
              {origin.includes('localhost') && (
                <p className="text-xs text-amber-600 mt-1">
                  Note: Facebook/Meta cannot reach localhost — use your deployed (https) URL for the real setup.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Verify Token</label>
              <input value={verifyToken} onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
              <p className="text-xs text-gray-400 mt-1">Any text you like — paste the exact same value into Meta.</p>
            </div>

            {provider === 'facebook' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Page Access Token {tokenSet && <span className="text-green-600 normal-case">(saved — leave blank to keep)</span>}
                </label>
                <input type="password" value={pageAccessToken} onChange={(e) => setPageAccessToken(e.target.value)}
                  placeholder={tokenSet ? '••••••••' : 'Paste Page Access Token'}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Access Token {tokenSet && <span className="text-green-600 normal-case">(saved — leave blank to keep)</span>}
                  </label>
                  <input type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)}
                    placeholder={tokenSet ? '••••••••' : 'Paste WhatsApp Access Token'}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number ID</label>
                  <input value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="e.g. 123456789012345"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                </div>
              </>
            )}

            <a href={meta.docsUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
              <ExternalLink size={11} /> Official setup guide
            </a>

            <div className="flex gap-3 pt-2">
              <button onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
                {saving ? 'Saving…' : 'Save & Connect'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
