'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Brain, Plus, Trash2, Edit, Save, X, GraduationCap, RefreshCw, Check, MessageCircle,
} from 'lucide-react';

// Ezy AI — "Brain" manager. Two tabs:
//   • Knowledge Base — the trained Q&A the bot answers from (add / edit / delete).
//   • Needs Training — real visitor questions the bot couldn't confidently answer;
//     teach an answer in one click and it becomes a new knowledge entry.
// All answering happens with the site's own algorithm — no external AI API.
//
// The SAME component powers two admin sections via the `scope` prop:
//   • scope="web"      → "Ezy AI Brain"      (website chat; new entries = shared 'both')
//   • scope="whatsapp" → "WhatsApp AI Brain" (WhatsApp auto-replies; new entries = 'whatsapp')
// Each brain shows its own entries (shared 'both' entries appear in both).

type Scope = 'web' | 'whatsapp';

interface KEntry {
  _id: string;
  question: string;
  variants: string[];
  keywords: string[];
  answer: string;
  category: string;
  channel?: string;
  enabled: boolean;
  hits: number;
  updatedAt: string;
}

interface ChatLog {
  _id: string;
  question: string;
  answer: string;
  source: string;
  matched: boolean;
  score: number;
  channel?: string;
  createdAt: string;
}

interface FormState {
  question: string;
  variants: string;
  keywords: string;
  answer: string;
  category: string;
  channel: string;
  enabled: boolean;
}

const EMPTY_FORM: FormState = {
  question: '', variants: '', keywords: '', answer: '', category: 'General', channel: 'both', enabled: true,
};

export default function EzyBrainManager({ scope = 'web' }: { scope?: Scope }) {
  const isWa = scope === 'whatsapp';
  // A brand-new entry defaults to this channel for the current brain.
  const defaultChannel = isWa ? 'whatsapp' : 'both';

  const [tab, setTab] = useState<'kb' | 'training'>('kb');
  const [entries, setEntries] = useState<KEntry[]>([]);
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  // Needs-Training channel filter. The WhatsApp brain is locked to WhatsApp logs.
  const [logChannel, setLogChannel] = useState<'all' | 'web' | 'whatsapp'>(isWa ? 'whatsapp' : 'all');

  // Add/edit form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/knowledge?scope=${scope}&_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
      setEntries(res.data);
    } catch {
      alert('Failed to load knowledge base.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/chatlogs?status=unanswered&channel=${logChannel}&_t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
      setLogs(res.data);
    } catch {
      alert('Failed to load training questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'kb') fetchEntries();
    else fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, logChannel]);

  const openAdd = (prefill?: Partial<FormState>) => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, channel: defaultChannel, ...prefill });
    setShowForm(true);
  };

  const openEdit = (e: KEntry) => {
    setEditingId(e._id);
    setForm({
      question: e.question,
      variants: (e.variants || []).join(', '),
      keywords: (e.keywords || []).join(', '),
      answer: e.answer,
      category: e.category || 'General',
      channel: e.channel || 'both',
      enabled: e.enabled,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      alert('Question and answer are both required.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`/api/admin/knowledge/${editingId}`, form);
      } else {
        await axios.post(`/api/admin/knowledge`, form);
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchEntries();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (e: KEntry) => {
    setEntries((prev) => prev.map((x) => (x._id === e._id ? { ...x, enabled: !x.enabled } : x)));
    try {
      await axios.put(`/api/admin/knowledge/${e._id}`, { enabled: !e.enabled });
    } catch {
      fetchEntries();
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this knowledge entry? The bot will stop answering from it.')) return;
    setEntries((prev) => prev.filter((x) => x._id !== id));
    try {
      await axios.delete(`/api/admin/knowledge/${id}`);
    } catch {
      fetchEntries();
    }
  };

  // Teach: prefill the add-form from a logged question, then jump to the KB tab.
  const teach = (log: ChatLog) => {
    setTab('kb');
    openAdd({ question: log.question, variants: log.question });
    // Remember which log to resolve after a successful save.
    pendingLogRef.current = log._id;
  };

  const pendingLogRef = React.useRef<string | null>(null);

  // After a save that originated from "Teach", mark the source log resolved.
  const saveAndResolve = async () => {
    await save();
    const logId = pendingLogRef.current;
    if (logId) {
      try { await axios.patch(`/api/admin/chatlogs/${logId}`, { resolved: true }); } catch { /* ignore */ }
      pendingLogRef.current = null;
    }
  };

  const dismissLog = async (id: string) => {
    setLogs((prev) => prev.filter((x) => x._id !== id));
    try { await axios.patch(`/api/admin/chatlogs/${id}`, { resolved: true }); } catch { fetchLogs(); }
  };

  const deleteLog = async (id: string) => {
    setLogs((prev) => prev.filter((x) => x._id !== id));
    try { await axios.delete(`/api/admin/chatlogs/${id}`); } catch { fetchLogs(); }
  };

  const filtered = entries.filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [e.question, e.answer, e.category, ...(e.keywords || []), ...(e.variants || [])]
      .some((v) => String(v || '').toLowerCase().includes(q));
  });

  const input = 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm';

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        {isWa ? <MessageCircle className="h-7 w-7 text-green-600" /> : <Brain className="h-7 w-7 text-blue-600" />}
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{isWa ? 'WhatsApp AI Brain' : 'Ezy AI Brain'}</h3>
          <p className="text-gray-600 text-sm">
            {isWa
              ? 'Train what your WhatsApp bot auto-replies — from your own database, no external AI API.'
              : 'Train the chatbot from your own database — no external AI API.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('kb')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'kb' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
        >
          Knowledge Base ({entries.length})
        </button>
        <button
          onClick={() => setTab('training')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${tab === 'training' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
        >
          <GraduationCap className="h-4 w-4" /> Needs Training {logs.length > 0 && tab !== 'training' ? `(${logs.length})` : ''}
        </button>
      </div>

      {/* ── Knowledge Base tab ─────────────────────────────────────────────── */}
      {tab === 'kb' && (
        <div>
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <input className={`${input} flex-1 min-w-[220px]`} placeholder="Search questions, answers, keywords…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button onClick={() => fetchEntries()} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center gap-1"><RefreshCw className="h-4 w-4" /> Refresh</button>
            <button onClick={() => openAdd()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1"><Plus className="h-4 w-4" /> Add Q&A</button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-200"><h4 className="font-semibold text-gray-800">Showing {filtered.length} of {entries.length}</h4></div>
            {loading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No knowledge entries yet. Click “Add Q&A” to teach the bot.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filtered.map((e) => (
                  <div key={e._id} className="p-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">{e.question}</span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-700">{e.category}</span>
                        {(e.channel || 'both') === 'whatsapp' && <span className="px-2 py-0.5 text-xs rounded-full bg-green-50 text-green-700">WhatsApp only</span>}
                        {(e.channel || 'both') === 'web' && <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700">Website only</span>}
                        {(e.channel || 'both') === 'both' && <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">Shared</span>}
                        {!e.enabled && <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">Disabled</span>}
                        <span className="text-xs text-gray-400">· served {e.hits}×</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2 whitespace-pre-wrap">{e.answer}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => toggleEnabled(e)} title={e.enabled ? 'Disable' : 'Enable'} className={`p-1.5 rounded-full ${e.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}><Check className="h-4 w-4" /></button>
                      <button onClick={() => openEdit(e)} title="Edit" className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"><Edit className="h-4 w-4" /></button>
                      <button onClick={() => remove(e._id)} title="Delete" className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Needs Training tab ─────────────────────────────────────────────── */}
      {tab === 'training' && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <p className="text-sm text-gray-600">
              {isWa
                ? 'WhatsApp questions the bot couldn’t confidently answer. Teach an answer and it auto-replies next time.'
                : 'Questions the bot couldn’t confidently answer. Teach an answer and it learns instantly.'}
            </p>
            <div className="flex items-center gap-2">
              {/* Channel filter — hidden in the WhatsApp brain (locked to WhatsApp). */}
              {!isWa && (
                <div className="flex rounded-md overflow-hidden border border-gray-200">
                  {(['all', 'web', 'whatsapp'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setLogChannel(c)}
                      className={`px-3 py-1.5 text-xs font-medium capitalize ${logChannel === c ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      {c === 'all' ? 'All' : c === 'web' ? 'Website' : 'WhatsApp'}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => fetchLogs()} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center gap-1"><RefreshCw className="h-4 w-4" /> Refresh</button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            {loading ? (
              <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">🎉 Nothing to train right now — the bot answered everything confidently.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {logs.map((l) => (
                  <div key={l._id} className="p-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900">{l.question}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${l.channel === 'whatsapp' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                          {l.channel === 'whatsapp' ? 'WhatsApp' : 'Website'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(l.createdAt).toLocaleString()} · best match {(l.score * 100).toFixed(0)}% · {l.source}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => teach(l)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs flex items-center gap-1"><GraduationCap className="h-4 w-4" /> Teach</button>
                      <button onClick={() => dismissLog(l._id)} title="Dismiss" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"><Check className="h-4 w-4" /></button>
                      <button onClick={() => deleteLog(l._id)} title="Delete" className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add / Edit form modal ──────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full my-8">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">{editingId ? 'Edit Q&A' : 'Teach a new answer'}</h3>
              <button onClick={() => { setShowForm(false); pendingLogRef.current = null; }} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question <span className="text-red-500">*</span></label>
                <input className={input} value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="e.g. What is the processing fee?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer <span className="text-red-500">*</span></label>
                <textarea className={`${input} min-h-[120px]`} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} placeholder="The reply the bot should give. Markdown like *bold* works." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alternate phrasings <span className="text-gray-400">(optional, comma-separated)</span></label>
                <input className={input} value={form.variants} onChange={(e) => setForm({ ...form, variants: e.target.value })} placeholder="how much fee, charges, processing charges" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords <span className="text-gray-400">(optional, comma-separated)</span></label>
                <input className={input} value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} placeholder="fee, charge, cost" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Where it applies</label>
                  <select className={input} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                    <option value="both">Both (Website + WhatsApp)</option>
                    <option value="whatsapp">WhatsApp only</option>
                    <option value="web">Website only</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700 mt-6 whitespace-nowrap">
                  <input type="checkbox" checked={form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> Enabled
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => { setShowForm(false); pendingLogRef.current = null; }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">Cancel</button>
              <button onClick={() => (pendingLogRef.current ? saveAndResolve() : save())} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1 disabled:opacity-60">
                <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
