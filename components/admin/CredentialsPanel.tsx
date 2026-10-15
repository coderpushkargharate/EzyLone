'use client';

// Admin → Marketing & Ads → Settings: setup checklist, API keys form and the
// webhook / redirect URLs to paste into Meta, Google and form tools.
// Secrets are write-only: the server only ever reports whether they are set.

import { useState } from 'react';
import { CheckCircle2, Circle, KeyRound, ExternalLink, Copy, Check, Wand2, ListChecks, Link2 } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */

const btn = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
const input = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const GROUPS: { id: string; title: string }[] = [
  { id: 'meta', title: 'Meta (Facebook / Instagram)' },
  { id: 'google', title: 'Google (Ads, Search Console, Analytics)' },
  { id: 'webhooks', title: 'Other webhooks' },
];

function Copyable({ label, value, note }: { label: string; value: string; note?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <div>
      <p className="text-xs font-medium text-gray-700">{label}</p>
      {note && <p className="text-[11px] text-gray-500 mb-1">{note}</p>}
      <div className="flex items-center gap-2">
        <code className="flex-1 min-w-0 truncate text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">{value}</code>
        <button type="button" aria-label={`Copy ${label}`} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50" onClick={() => { navigator.clipboard?.writeText(value); setOk(true); setTimeout(() => setOk(false), 1500); }}>
          {ok ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function CredentialsPanel({ status, isAdmin, onSaved }: { status: any; isAdmin: boolean; onSaved: () => void }) {
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [generated, setGenerated] = useState<{ name: string; value: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const creds: any[] = status.credentials || [];
  const setup: any[] = status.setup || [];
  const urls = status.urls || {};
  const key = status.environment?.encryptionKey;
  const required = setup.filter((s) => !s.optional);
  const doneCount = required.filter((s) => s.done).length;

  const save = async (values: Record<string, string>) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/marketing/credentials', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ values }) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Save failed');
      setDraft({});
      setMsg({ ok: true, text: `Saved: ${body.saved.join(', ') || 'nothing changed'}. Integrations pick up new keys within 30 seconds.` });
      onSaved();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  };

  const generate = async (name: string) => {
    if (!confirm('Generate a new random value? Anything using the old value (Meta webhook / form tool) must be updated.')) return;
    const res = await fetch('/api/marketing/credentials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generate', name }) });
    const body = await res.json();
    if (!res.ok) return setMsg({ ok: false, text: body.message });
    setGenerated({ name, value: body.value });
    onSaved();
  };

  return (
    <div className="space-y-5">
      {/* Setup checklist */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900"><ListChecks size={16} className="text-blue-600" />Setup checklist</h2>
          <span className="text-xs text-gray-500">{doneCount} / {required.length} required steps done</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full mb-4"><div className="h-2 bg-green-500 rounded-full transition-all" style={{ width: `${required.length ? (doneCount / required.length) * 100 : 0}%` }} /></div>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
          {setup.map((s) => (
            <div key={s.id} className="flex items-start gap-2 text-sm">
              {s.done ? <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" /> : <Circle size={16} className="text-gray-300 mt-0.5 shrink-0" />}
              <div>
                <p className={s.done ? 'text-gray-500' : 'text-gray-800'}><span className="text-[10px] uppercase tracking-wide text-gray-400 mr-1">{s.group}</span>{s.title}{s.optional && <span className="text-[11px] text-gray-400"> (optional)</span>}</p>
                {!s.done && <p className="text-[11px] text-gray-500">{s.hint}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* API keys */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1"><KeyRound size={16} className="text-amber-600" />API keys</h2>
        <p className="text-xs text-gray-500 mb-2">
          Secrets are encrypted on the server and are never shown again after saving. A value set in the server environment overrides the panel.
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Encryption key:{' '}
          {key?.source === 'env' && 'MARKETING_ENCRYPTION_KEY (server environment).'}
          {key?.source === 'file' && <>key file <code className="text-[11px]">{key.file}</code>. Back this file up; without it, saved secrets cannot be read.</>}
          {!key?.source && !key?.problem && <>none yet. One is created at <code className="text-[11px]">{key?.defaultFile}</code> when you save the first secret.</>}
        </p>
        {key?.problem && (
          <div role="alert" className="text-xs rounded-lg px-3 py-2 mb-4 bg-red-50 text-red-800">
            <p className="font-semibold mb-1">Encryption key problem: saving secrets is blocked</p>
            <p>{key.problem}</p>
            <p className="mt-1">Expected location: <code>{key.file || key.defaultFile}</code> (or set MARKETING_ENCRYPTION_KEY). Restore it from your backup, then restart the app.</p>
          </div>
        )}
        {msg && <p className={`text-xs rounded-lg px-3 py-2 mb-3 ${msg.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>{msg.text}</p>}
        {generated && (
          <div className="text-xs rounded-lg px-3 py-2 mb-3 bg-amber-50 text-amber-900">
            <p className="font-medium mb-1">New value for {generated.name}. Copy it now, it won&apos;t be shown again:</p>
            <Copyable label={generated.name} value={generated.value} />
            <button className="mt-2 underline" onClick={() => setGenerated(null)}>Done</button>
          </div>
        )}
        <div className="space-y-6">
          {GROUPS.map((g) => (
            <div key={g.id}>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">{g.title}</p>
              <div className="grid lg:grid-cols-2 gap-4">
                {creds.filter((c) => c.group === g.id).map((c) => (
                  <div key={c.name} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label htmlFor={`cred-${c.name}`} className="text-sm font-medium text-gray-800">{c.label}{c.required && <span className="text-red-500"> *</span>}</label>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.unreadable ? 'bg-red-50 text-red-700' : c.set ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.unreadable ? 'saved, unreadable (key mismatch)' : c.set ? (c.source === 'env' ? 'set on server' : 'saved') : 'not set'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mb-2">{c.help} {c.link && <a href={c.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-blue-600 underline">Open <ExternalLink size={10} /></a>}</p>
                    {isAdmin && c.source !== 'env' ? (
                      <div className="flex gap-2">
                        <input
                          id={`cred-${c.name}`}
                          className={input}
                          type={c.secret ? 'password' : 'text'}
                          autoComplete="off"
                          spellCheck={false}
                          placeholder={c.set ? (c.secret ? '•••••••• (leave blank to keep)' : c.value) : c.formatHint}
                          value={draft[c.name] ?? ''}
                          onChange={(e) => setDraft({ ...draft, [c.name]: e.target.value })}
                        />
                        {c.generate && <button type="button" title="Generate random value" className={`${btn} border border-gray-200`} onClick={() => generate(c.name)}><Wand2 size={14} /></button>}
                        {c.set && <button type="button" className={`${btn} border border-gray-200 text-xs`} disabled={busy} onClick={() => confirm(`Remove ${c.label}?`) && save({ [c.name]: '' })}>Clear</button>}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">{c.value ? <code>{c.value}</code> : c.set ? 'Set in server environment' : isAdmin ? '' : 'Only admins can edit keys.'}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {isAdmin && (
          <div className="flex justify-end mt-4">
            <button className={`${btn} bg-blue-600 text-white hover:bg-blue-700`} disabled={busy || !Object.values(draft).some((v) => v.trim())} onClick={() => save(Object.fromEntries(Object.entries(draft).filter(([, v]) => v.trim())))}>Save API keys</button>
          </div>
        )}
      </section>

      {/* URLs to hand over */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3"><Link2 size={16} className="text-blue-600" />Webhook &amp; redirect URLs to configure</h2>
        <div className="grid lg:grid-cols-2 gap-4">
          <Copyable label="Meta → Webhooks → Page → field “leadgen” → Callback URL" value={urls.metaWebhook || ''} note="Verify token = the “Webhook verify token” above." />
          <Copyable label="Meta → Facebook Login (for Business) → Valid OAuth Redirect URI" value={urls.metaOAuthRedirect || ''} />
          <Copyable label="Google Cloud → OAuth client → Authorized redirect URI" value={urls.googleOAuthRedirect || ''} />
          <Copyable label="Form tools (Zapier / Make / other sites) → POST leads to" value={urls.leadWebhook || ''} note="Header x-webhook-secret = the “Lead webhook secret”. JSON: name, email, phone, message, source." />
          <Copyable label="Meta app & Google consent screen → Privacy Policy URL" value={urls.privacyPolicy || ''} />
          <Copyable label="Meta app & Google consent screen → Terms of Service URL" value={urls.terms || ''} />
          <Copyable label="Meta app → App domains / Google → Authorized domain" value={urls.siteDomain || ''} />
        </div>
      </section>
    </div>
  );
}
