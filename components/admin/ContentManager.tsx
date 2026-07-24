'use client';

// Content (message templates / files / pages) — ported from EzyLoanCrm and
// restyled to the admin blue theme. Uses the shared `content` collection via
// /api/content. Add-content modal is inlined at the bottom.

import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Search, Folder, ChevronRight, Trash2, Zap, MessageSquare,
  Paperclip, FileText, Upload, Radio, Bot, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentItem {
  _id: string;
  title: string;
  type: string;
  url?: string;
  description?: string;
  createdAt: string;
}

const TABS = ['Sequences', 'Messages', 'Files', 'Pages'] as const;
type Tab = (typeof TABS)[number];

const SEQUENCES = [
  {
    badge: 'Manual', auto: false, title: 'NEW LEAD INTRO SEQUENCE',
    desc: 'This is the default sequence that will be suggested for all uncontacted leads. You can customise each step to suit your sales process.',
    steps: '3 steps over 4 days', clients: '3 clients in sequence',
  },
  {
    badge: 'Manual', auto: false, title: 'NEW LEAD INTRO SEQUENCE (1)',
    desc: 'This is the default sequence that will be suggested for all uncontacted leads. You can customise each step to suit your sales process.',
    steps: '3 steps over 4 days', clients: '0 clients in sequence',
  },
  {
    badge: 'Automated', auto: true, title: 'WHATSAPP AUTO-RESPONDER SEQUENCE FOR NEW LEADS',
    desc: 'This sequence was created by migrating your existing WhatsApp Auto-Responder template. You can now add more steps.',
    steps: '1 step', clients: '0 clients in sequence',
  },
];

export default function ContentManager() {
  const [tab, setTab] = useState<Tab>('Sequences');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/content');
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function remove(id: string) {
    if (!confirm('Delete this message template?')) return;
    await fetch(`/api/content/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i._id !== id));
  }

  const filtered = items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));

  const actionButton = {
    Sequences: { label: 'New Sequence' },
    Messages: { label: 'New Message' },
    Files: { label: 'Upload File' },
    Pages: { label: 'Create Page' },
  }[tab];

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Content</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          <Plus size={16} /> {actionButton.label}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-gray-100">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'pb-3 text-sm font-semibold border-b-2 -mb-px transition',
                tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'Sequences' && (
            <div>
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                <Zap size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">Manage Automated Sequence Triggers</p>
                  <p className="text-sm text-blue-600 mt-0.5">Configure lead automation rules to automatically add new leads to specific sequences.</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{SEQUENCES.length} Total Sequences</p>
                <span className="text-xs text-gray-400">Sort by: Title (A–Z)</span>
              </div>

              <div className="space-y-4">
                {SEQUENCES.map((s) => (
                  <div key={s.title} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded',
                        s.auto ? 'bg-green-100 text-green-700' : 'bg-slate-700 text-white'
                      )}>
                        {s.auto ? <Bot size={11} /> : <Radio size={11} />} {s.badge}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{s.title}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{s.desc}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span>{s.steps}</span>
                      <span className="text-gray-300">|</span>
                      <span>{s.clients}</span>
                      <span className="inline-flex items-center gap-1.5 text-green-600 font-medium ml-auto">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Messages' && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search messages"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 sm:w-64">
                  <span className="flex items-center gap-2"><Folder size={15} className="text-gray-400" /> All Folders</span>
                  <ChevronRight size={15} className="text-gray-400" />
                </button>
              </div>

              {loading ? (
                <div className="py-12 text-center text-gray-400 text-sm">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="py-14 text-center">
                  <MessageSquare size={30} className="text-blue-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-700">Welcome to your Message Templates</p>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Create auto-personalised message templates to connect and follow up with your leads in seconds.</p>
                  <button onClick={() => setShowModal(true)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
                    <Plus size={15} /> New Message
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2">Title</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 hidden md:table-cell">Message Preview</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide py-2 hidden sm:table-cell">Added</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr key={m._id} className="border-b border-gray-50 hover:bg-gray-50/60 group">
                        <td className="py-3 text-sm font-semibold text-gray-800">{m.title}</td>
                        <td className="py-3 text-sm text-gray-500 hidden md:table-cell max-w-xs truncate">{m.description || '—'}</td>
                        <td className="py-3 text-sm text-gray-500 hidden sm:table-cell">{formatDate(m.createdAt)}</td>
                        <td className="py-3">
                          <button onClick={() => remove(m._id)} className="p-1.5 text-gray-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'Files' && (
            <EmptyFolder
              search={search} setSearch={setSearch}
              icon={<Paperclip size={30} className="text-blue-400 mx-auto mb-3" />}
              title="Welcome to your Files"
              desc="Easily manage, share, and track your PDF documents all in one place."
              action="Upload File" onAction={() => setShowModal(true)} searchPlaceholder="Search files"
            />
          )}

          {tab === 'Pages' && (
            <EmptyFolder
              search={search} setSearch={setSearch}
              icon={<FileText size={30} className="text-blue-400 mx-auto mb-3" />}
              title="Welcome to your Pages"
              desc="Create, share, and track views on your custom pages to showcase your products, services, or events."
              action="Create Page" onAction={() => setShowModal(true)} searchPlaceholder="Search pages"
            />
          )}
        </div>
      </div>

      {showModal && (
        <AddContentModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); setTab('Messages'); fetchItems(); }} />
      )}
    </div>
  );
}

function EmptyFolder({
  search, setSearch, icon, title, desc, action, onAction, searchPlaceholder,
}: {
  search: string; setSearch: (v: string) => void;
  icon: React.ReactNode; title: string; desc: string; action: string; onAction: () => void; searchPlaceholder: string;
}) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 sm:w-64">
          <span className="flex items-center gap-2"><Folder size={15} className="text-gray-400" /> All Folders</span>
          <ChevronRight size={15} className="text-gray-400" />
        </button>
      </div>
      <div className="py-10 text-center">
        {icon}
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{desc}</p>
        <button onClick={onAction} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
          <Upload size={15} /> {action}
        </button>
      </div>
    </div>
  );
}

const TYPE_OPTIONS = [
  { value: 'document', label: 'Document' },
  { value: 'image', label: 'Image' },
  { value: 'link', label: 'Link' },
  { value: 'article', label: 'Article' },
];

function AddContentModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ title: '', type: 'link', url: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');

    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to save');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add Content</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Title *</label>
            <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Personal Loan Brochure"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Type</label>
            <select value={form.type} onChange={(e) => update('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Link / URL</label>
            <input type="url" value={form.url} onChange={(e) => update('url', e.target.value)} placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Description</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Short description..." rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
              {loading ? 'Saving...' : 'Add Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
