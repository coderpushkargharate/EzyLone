'use client';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  MessageSquareText, RefreshCw, Search, Trash2, User, Bot, Phone, AlertCircle, ChevronLeft, Clock,
  Send, Zap, Hand, Loader2,
} from 'lucide-react';

// WhatsApp Chats — read the actual conversations users have with the Ezy AI
// WhatsApp bot. Left pane lists every user (newest activity first); click one to
// read their full transcript on the right as chat bubbles. The point is training:
// seeing the real questions people ask (and which ones the bot couldn't answer)
// shows what to teach the "WhatsApp AI Brain" next.
//
// Data comes from the durable WhatsAppMessage store via /api/admin/whatsapp-chats.

interface Convo {
  phone: string;
  count: number;
  unanswered: number;
  lastMessage: string;
  lastReply: string;
  lastAt: string;
  firstAt: string;
}

interface Msg {
  _id: string;
  phone: string;
  userMessage: string;
  botReply: string;
  source: string;
  matched: boolean;
  score: number;
  inFlow: boolean;
  createdAt: string;
}

// WhatsApp addresses arrive as "whatsapp:+9198..." (Twilio) or bare digits
// (Meta). Show a clean, human-readable number.
function prettyPhone(raw: string): string {
  if (!raw) return 'Unknown';
  let p = raw.replace(/^whatsapp:/i, '').trim();
  if (p && !p.startsWith('+') && /^\d+$/.test(p)) p = `+${p}`;
  return p || 'Unknown';
}

function timeAgo(iso: string): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const s = Math.floor((Date.now() - then) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

// Human-friendly date + clock time (e.g. "26 Aug 2026, 3:45 PM") so admins can
// see exactly when each message arrived, without noisy seconds.
function fullTime(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const SOURCE_LABEL: Record<string, string> = {
  knowledge: 'Trained answer',
  engine: 'Assistant flow',
  llm: 'AI backup',
  fallback: 'Not answered',
  flow: 'Guided flow',
  admin: 'You (manual)',
  inbound: 'Awaiting reply',
};

type Mode = 'auto' | 'manual';

export default function WhatsAppChatsManager() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loadingConvo, setLoadingConvo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('auto');
  const [modeSaving, setModeSaving] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const fetchList = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      const res = await axios.get(`/api/admin/whatsapp-chats?search=${encodeURIComponent(search)}&_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      setConvos(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not load conversations.');
    } finally {
      setLoadingList(false);
    }
  }, [search]);

  const fetchConvo = useCallback(async (phone: string, silent = false) => {
    if (!silent) {
      setSelected(phone);
      setLoadingConvo(true);
      setMessages([]);
    }
    try {
      const res = await axios.get(`/api/admin/whatsapp-chats/${encodeURIComponent(phone)}?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      setMessages(Array.isArray(res.data?.messages) ? res.data.messages : []);
      if (res.data?.mode) setMode(res.data.mode === 'manual' ? 'manual' : 'auto');
    } catch (e: any) {
      if (!silent) setError(e?.response?.data?.message || 'Could not load this conversation.');
    } finally {
      if (!silent) setLoadingConvo(false);
    }
  }, []);

  // Change a conversation's mode: 'auto' (bot replies) vs 'manual' (human replies).
  const changeMode = useCallback(async (phone: string, next: Mode) => {
    setModeSaving(true);
    setSendError(null);
    // Optimistic — the toggle should feel instant.
    setMode(next);
    try {
      await axios.patch(`/api/admin/whatsapp-chats/${encodeURIComponent(phone)}`, { mode: next });
    } catch (e: any) {
      setMode(next === 'manual' ? 'auto' : 'manual'); // revert on failure
      setSendError(e?.response?.data?.message || 'Could not change mode.');
    } finally {
      setModeSaving(false);
    }
  }, []);

  // Send a manual reply to the selected user. On success the server flips the
  // conversation to manual, so we reflect that and reload the transcript.
  const sendManual = useCallback(async () => {
    const phone = selected;
    const text = draft.trim();
    if (!phone || !text) return;
    setSending(true);
    setSendError(null);
    try {
      await axios.post(`/api/admin/whatsapp-chats/${encodeURIComponent(phone)}`, { message: text });
      setDraft('');
      setMode('manual');
      await fetchConvo(phone, true);
      fetchList();
    } catch (e: any) {
      setSendError(e?.response?.data?.message || 'Could not send the message.');
    } finally {
      setSending(false);
    }
  }, [selected, draft, fetchConvo, fetchList]);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live refresh of the open conversation so new inbound messages (and manual
  // sends) appear without a manual reload. Every 8s while a chat is selected.
  useEffect(() => {
    if (!selected) return;
    const id = setInterval(() => fetchConvo(selected, true), 8000);
    return () => clearInterval(id);
  }, [selected, fetchConvo]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchList();
  };

  const deleteConvo = async (phone: string) => {
    if (!confirm(`Delete the entire conversation with ${prettyPhone(phone)}? This cannot be undone.`)) return;
    try {
      await axios.delete(`/api/admin/whatsapp-chats/${encodeURIComponent(phone)}`);
      if (selected === phone) {
        setSelected(null);
        setMessages([]);
      }
      setConvos((prev) => prev.filter((c) => c.phone !== phone));
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Delete failed.');
    }
  };

  const selectedConvo = convos.find((c) => c.phone === selected);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MessageSquareText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">WhatsApp Chats</h2>
            <p className="text-sm text-gray-500">Read real conversations users have with the Ezy AI WhatsApp bot.</p>
          </div>
        </div>
        <button
          onClick={fetchList}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ── Conversation list ─────────────────────────────── */}
        <div className={`lg:col-span-4 ${selected ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <form onSubmit={onSearch} className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by number or message…"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </form>

            <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-100">
              {loadingList ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading conversations…</div>
              ) : convos.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No WhatsApp conversations yet. They'll appear here as users chat with the bot.
                </div>
              ) : (
                convos.map((c) => (
                  <button
                    key={c.phone}
                    onClick={() => fetchConvo(c.phone)}
                    className={`w-full text-left px-4 py-3 hover:bg-blue-50/60 transition flex items-start gap-3 ${
                      selected === c.phone ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-900 text-sm truncate">{prettyPhone(c.phone)}</span>
                        <span className="text-[11px] text-gray-400 flex-shrink-0">{timeAgo(c.lastAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastMessage || '—'}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                          {c.count} {c.count === 1 ? 'msg' : 'msgs'}
                        </span>
                        {c.unanswered > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                            {c.unanswered} unanswered
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Conversation transcript ───────────────────────── */}
        <div className={`lg:col-span-8 ${selected ? '' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-[65vh]">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-gray-400">
                <MessageSquareText className="w-12 h-12 mb-3 text-gray-300" />
                <p className="text-sm">Select a user on the left to read their conversation.</p>
              </div>
            ) : (
              <>
                {/* Conversation header */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => { setSelected(null); setMessages([]); }}
                      className="lg:hidden p-1.5 rounded-lg hover:bg-white/70"
                      aria-label="Back to list"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{prettyPhone(selected)}</div>
                      {selectedConvo && (
                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {selectedConvo.count} messages · started {timeAgo(selectedConvo.firstAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Auto / Manual takeover toggle */}
                    <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
                      <button
                        onClick={() => changeMode(selected, 'auto')}
                        disabled={modeSaving}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${
                          mode === 'auto' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Bot replies automatically"
                      >
                        <Zap className="w-3.5 h-3.5" /> Auto
                      </button>
                      <button
                        onClick={() => changeMode(selected, 'manual')}
                        disabled={modeSaving}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition ${
                          mode === 'manual' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="You reply manually; bot stays silent"
                      >
                        <Hand className="w-3.5 h-3.5" /> Manual
                      </button>
                    </div>
                    <button
                      onClick={() => deleteConvo(selected)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-red-600 text-xs font-medium hover:bg-red-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

                {/* Mode hint banner */}
                <div
                  className={`px-4 py-2 text-xs flex items-center gap-2 border-b ${
                    mode === 'manual'
                      ? 'bg-blue-50 border-blue-100 text-blue-700'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}
                >
                  {mode === 'manual' ? (
                    <>
                      <Hand className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Manual mode — the auto-reply bot is paused for this user. Type below to reply yourself.</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Auto mode — the Ezy AI bot is replying automatically. Switch to Manual to chat yourself.</span>
                    </>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 max-h-[60vh]">
                  {loadingConvo ? (
                    <div className="text-center text-gray-400 text-sm py-8">Loading conversation…</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">No messages.</div>
                  ) : (
                    messages.map((m) => {
                      const isAdmin = m.source === 'admin';
                      return (
                        <div key={m._id} className="space-y-2">
                          {/* User bubble (right) — only when the user actually said something */}
                          {m.userMessage && (
                            <div className="flex justify-end">
                              <div className="max-w-[80%]">
                                <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-3.5 py-2 text-sm whitespace-pre-wrap break-words shadow-sm">
                                  {m.userMessage}
                                </div>
                                <div className="flex items-center justify-end gap-1 mt-1 pr-1">
                                  <span className="text-[10px] text-gray-400">{fullTime(m.createdAt)}</span>
                                  <User className="w-3 h-3 text-gray-400" />
                                </div>
                              </div>
                            </div>
                          )}
                          {/* Reply bubble (left) — either the Ezy AI bot or your manual reply */}
                          {m.botReply && (
                            <div className="flex justify-start">
                              <div className="max-w-[80%]">
                                <div
                                  className={`rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm whitespace-pre-wrap break-words shadow-sm ${
                                    isAdmin
                                      ? 'bg-green-600 text-white'
                                      : 'bg-white border border-gray-200 text-gray-800'
                                  }`}
                                >
                                  {m.botReply}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 pl-1">
                                  {isAdmin ? (
                                    <>
                                      <User className="w-3 h-3 text-green-600" />
                                      <span className="text-[10px] text-gray-400">You</span>
                                    </>
                                  ) : (
                                    <>
                                      <Bot className="w-3 h-3 text-blue-500" />
                                      <span className="text-[10px] text-gray-400">Ezy AI</span>
                                    </>
                                  )}
                                  <span className="text-[10px] text-gray-400">· {fullTime(m.createdAt)}</span>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                      isAdmin
                                        ? 'bg-green-100 text-green-700'
                                        : m.matched
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : 'bg-amber-100 text-amber-700'
                                    }`}
                                  >
                                    {SOURCE_LABEL[m.source] || m.source}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Composer — send a manual WhatsApp reply to this user */}
                <div className="border-t border-gray-100 p-3 bg-white">
                  {sendError && (
                    <div className="flex items-center gap-2 mb-2 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {sendError}
                    </div>
                  )}
                  {mode === 'auto' && (
                    <div className="text-[11px] text-gray-400 mb-2">
                      Sending a message will switch this chat to <span className="font-semibold text-blue-600">Manual</span> so the bot won't reply over you.
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendManual();
                        }
                      }}
                      rows={1}
                      placeholder="Type a message to reply on WhatsApp…"
                      className="flex-1 resize-none max-h-32 px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    />
                    <button
                      onClick={sendManual}
                      disabled={sending || !draft.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
