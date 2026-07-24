'use client';

// Account (Profile / Settings / Subscription) — ported from EzyLoanCrm's account
// page, restyled to the admin blue theme. Reached from the top-bar profile
// dropdown, not the sidebar. `accountInitialTab` deep-links to a sub-tab.

import { useEffect, useState } from 'react';
import {
  User as UserIcon, Bell, Tags, CreditCard, MessageCircle, BookOpen, CheckCircle2,
  Pencil, Save, ChevronDown, ExternalLink, SlidersHorizontal, Settings as SettingsIcon,
} from 'lucide-react';
import { GROUPS, groupStyle } from '@/lib/groups';
import { cn } from '@/lib/utils';

interface Me {
  name: string;
  email: string;
  role: string;
  phone?: string;
  whatsapp?: string;
  company?: string;
  settings?: {
    leadAlertEmail?: boolean;
    dailySummary?: 'always' | 'updates' | 'never';
    summaryHour?: string;
  };
}

const SETTINGS_SUB = [
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'personalisation', label: 'Personalisation', icon: SlidersHorizontal },
  { key: 'groups', label: 'Client Groups', icon: Tags },
];

const VALID_TABS = ['profile', 'notifications', 'personalisation', 'groups', 'subscription'];

const HOURS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM',
];

export default function AccountManager({ accountInitialTab }: { accountInitialTab?: string }) {
  const [tab, setTab] = useState('profile');
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '', company: '' });
  const [settings, setSettings] = useState({
    leadAlertEmail: false,
    dailySummary: 'updates' as 'always' | 'updates' | 'never',
    summaryHour: '5:00 PM',
  });

  // Deep-link to a sub-tab when opened from the profile dropdown.
  useEffect(() => {
    if (accountInitialTab && VALID_TABS.includes(accountInitialTab)) setTab(accountInitialTab);
  }, [accountInitialTab]);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((data) => {
        const u: Me = data.user;
        setMe(u);
        setForm({ name: u.name || '', phone: u.phone || '', whatsapp: u.whatsapp || '', company: u.company || '' });
        if (u.settings) {
          setSettings({
            leadAlertEmail: u.settings.leadAlertEmail ?? false,
            dailySummary: u.settings.dailySummary ?? 'updates',
            summaryHour: u.settings.summaryHour ?? '5:00 PM',
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile() {
    setSaving(true);
    setSaved(false);
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setMe(data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  }

  async function saveSettings() {
    setSaving(true);
    setSaved(false);
    const res = await fetch('/api/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  }

  const initials = (me?.name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account</h1>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-[220px_1fr]">
          {/* Sub-nav */}
          <div className="border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/40 p-3">
            <button
              onClick={() => setTab('profile')}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition mb-0.5',
                tab === 'profile' ? 'bg-white text-blue-600 shadow-sm border-l-2 border-blue-500' : 'text-gray-600 hover:bg-white/70'
              )}
            >
              <UserIcon size={16} className={tab === 'profile' ? 'text-blue-500' : 'text-gray-400'} />
              Edit Profile
            </button>

            <button
              onClick={() => setSettingsOpen((o) => !o)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white/70 transition"
            >
              <span className="flex items-center gap-2.5"><SettingsIcon size={16} className="text-gray-400" /> Settings</span>
              <ChevronDown size={15} className={cn('text-gray-400 transition-transform', settingsOpen && 'rotate-180')} />
            </button>
            {settingsOpen && (
              <div className="ml-3 pl-3 border-l border-gray-200 mb-1">
                {SETTINGS_SUB.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition',
                      tab === key ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:bg-white/70'
                    )}
                  >
                    <Icon size={14} className={tab === key ? 'text-blue-500' : 'text-gray-400'} />
                    {label}
                  </button>
                ))}
              </div>
            )}

            <a href="https://wa.me/916372977626" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white/70">
              <MessageCircle size={16} className="text-gray-400" /> Chat With Us
            </a>

            <button
              onClick={() => setTab('subscription')}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition mb-0.5',
                tab === 'subscription' ? 'bg-white text-blue-600 shadow-sm border-l-2 border-blue-500' : 'text-gray-600 hover:bg-white/70'
              )}
            >
              <CreditCard size={16} className={tab === 'subscription' ? 'text-blue-500' : 'text-gray-400'} />
              Subscription
            </button>

            <a href="/faq" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-white/70">
              <BookOpen size={16} className="text-gray-400" /> User Guide <ExternalLink size={12} className="text-gray-300" />
            </a>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8 min-h-[420px]">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-14 w-14 bg-gray-200 rounded-full" />
                <div className="h-10 bg-gray-100 rounded" />
                <div className="h-10 bg-gray-100 rounded" />
              </div>
            ) : tab === 'profile' ? (
              <div className="max-w-xl">
                <p className="text-sm font-semibold text-gray-700 mb-2">Profile Photo</p>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-lg font-bold">
                    {initials}
                  </div>
                  <button className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold">
                    <Pencil size={13} /> Edit
                  </button>
                </div>

                <Field label="Name" required value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
                <Field label="Phone Number" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} prefix="+91" placeholder="098765 43210" />
                <Field label="WhatsApp Number" value={form.whatsapp} onChange={(v) => setForm((f) => ({ ...f, whatsapp: v }))} prefix="+91" placeholder="098765 43210" />

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
                    {me?.email || '—'}
                    {me?.email && <CheckCircle2 size={16} className="text-blue-500" />}
                  </div>
                </div>

                <Field label="Company Name" value={form.company} onChange={(v) => setForm((f) => ({ ...f, company: v }))} placeholder="ezyloan.co.in" />

                <div className="flex items-center gap-3 mt-6">
                  <button onClick={saveProfile} disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
                    <Save size={15} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  {saved && <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 size={15} /> Saved</span>}
                </div>
              </div>
            ) : tab === 'notifications' ? (
              <div className="max-w-xl">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Get notified on-the-go!</p>
                  <p className="text-xs text-blue-700 mt-1">Manage how EzyLoan alerts you about new leads and daily activity.</p>
                </div>

                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">New Lead Alerts</p>
                <div className="flex items-center justify-between py-2 mb-5 border-b border-gray-100">
                  <span className="text-sm text-gray-700">Send me an immediate email alert when a new lead is received</span>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, leadAlertEmail: !s.leadAlertEmail }))}
                    className={cn('w-11 h-6 rounded-full transition relative flex-shrink-0', settings.leadAlertEmail ? 'bg-blue-600' : 'bg-gray-300')}
                  >
                    <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all', settings.leadAlertEmail ? 'left-[22px]' : 'left-0.5')} />
                  </button>
                </div>

                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Daily Summary Email</p>
                <p className="text-sm text-gray-600 mb-2">Send me a daily summary of new leads, upcoming follow-ups and activities:</p>
                <div className="space-y-2 mb-5">
                  {([
                    { v: 'always', label: 'Always send' },
                    { v: 'updates', label: 'Send if there are updates' },
                    { v: 'never', label: 'Never send' },
                  ] as const).map((o) => (
                    <label key={o.v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={settings.dailySummary === o.v}
                        onChange={() => setSettings((s) => ({ ...s, dailySummary: o.v }))}
                        className="accent-blue-600 w-4 h-4" />
                      <span className={cn('text-sm', settings.dailySummary === o.v ? 'text-blue-600 font-semibold' : 'text-gray-600')}>{o.label}</span>
                    </label>
                  ))}
                </div>

                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Daily Summary Email Timing</p>
                <select value={settings.summaryHour} onChange={(e) => setSettings((s) => ({ ...s, summaryHour: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {HOURS.map((h) => <option key={h}>{h}</option>)}
                </select>

                <div className="flex items-center gap-3 mt-6">
                  <button onClick={saveSettings} disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
                    <Save size={15} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  {saved && <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 size={15} /> Saved</span>}
                </div>
              </div>
            ) : tab === 'personalisation' ? (
              <div className="max-w-xl">
                <p className="text-sm font-semibold text-gray-700 mb-1">Personalisation</p>
                <p className="text-sm text-gray-500 mb-5">Control how your details appear to clients when you message or share content with them.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Display Name</p>
                      <p className="text-xs text-gray-500 mt-0.5">Shown to clients instead of your full name.</p>
                    </div>
                    <span className="text-sm text-gray-700">{form.name || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Company Name</p>
                      <p className="text-xs text-gray-500 mt-0.5">Appears in your shared pages and messages.</p>
                    </div>
                    <span className="text-sm text-gray-700">{form.company || 'ezyloan.co.in'}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Contact Number</p>
                      <p className="text-xs text-gray-500 mt-0.5">Used for WhatsApp Quick Responses.</p>
                    </div>
                    <span className="text-sm text-gray-700">{form.whatsapp || form.phone || '—'}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">Edit these values in the <button onClick={() => setTab('profile')} className="text-blue-600 font-medium">Edit Profile</button> tab.</p>
              </div>
            ) : tab === 'groups' ? (
              <div className="max-w-xl">
                <p className="text-sm font-semibold text-gray-700 mb-1">Client Groups</p>
                <p className="text-sm text-gray-500 mb-5">These colored groups are used to organise and filter your leads across the CRM.</p>
                <div className="flex flex-wrap gap-2">
                  {GROUPS.map((g) => (
                    <span key={g} className={cn('inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold', groupStyle(g))}>{g}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-xl">
                <p className="text-sm font-semibold text-gray-700 mb-4">Subscription</p>
                <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900">EzyLoan CRM</p>
                      <p className="text-sm text-gray-600 mt-0.5">{me?.company || 'ezyloan.co.in'}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-3 py-1 rounded-full font-semibold">
                      <CheckCircle2 size={13} /> Active
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-gray-500">Plan</p><p className="font-semibold text-gray-900">Full Access</p></div>
                    <div><p className="text-gray-500">Role</p><p className="font-semibold text-gray-900 capitalize">{me?.role}</p></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, required, prefix, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  prefix?: string;
  placeholder?: string;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-gray-400 text-xs">*Required</span>}
      </label>
      <div className="flex items-stretch">
        {prefix && (
          <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg text-sm text-gray-600">
            🇮🇳 {prefix}
          </span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full px-3 py-2.5 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
            prefix ? 'rounded-r-lg' : 'rounded-lg'
          )}
        />
      </div>
    </div>
  );
}
