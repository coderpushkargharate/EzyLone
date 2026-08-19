'use client';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  MessageSquareText, RefreshCw, Search, Trash2, User, Bot, Phone, AlertCircle, ChevronLeft, Clock,
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

function fullTime(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleString();
}

const SOURCE_LABEL: Record<string, string> = {
  knowledge: 'Trained answer',
  engine: 'Assistant flow',
  llm: 'AI backup',
  fallback: 'Not answered',
  flow: 'Guided flow',
};

export default function WhatsAppChatsManager() {
  const [convos, setConvos] = useState<Convo[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loadingConvo, setLoadingConvo] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchConvo = useCallback(async (phone: string) => {
    setSelected(phone);
    setLoadingConvo(true);
    setMessages([]);
    try {
      const res = await axios.get(`/api/admin/whatsapp-chats/${encodeURIComponent(phone)}?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      setMessages(Array.isArray(res.data?.messages) ? res.data.messages : []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not load this conversation.');
    } finally {
      setLoadingConvo(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  <button
                    onClick={() => deleteConvo(selected)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-red-600 text-xs font-medium hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 max-h-[60vh]">
                  {loadingConvo ? (
                    <div className="text-center text-gray-400 text-sm py-8">Loading conversation…</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">No messages.</div>
                  ) : (
                    messages.map((m) => (
                      <div key={m._id} className="space-y-2">
                        {/* User bubble (right) */}
                        <div className="flex justify-end">
                          <div className="max-w-[80%]">
                            <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-3.5 py-2 text-sm whitespace-pre-wrap break-words shadow-sm">
                              {m.userMessage || <span className="italic opacity-70">[non-text message]</span>}
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-1 pr-1">
                              <span className="text-[10px] text-gray-400">{fullTime(m.createdAt)}</span>
                              <User className="w-3 h-3 text-gray-400" />
                            </div>
                          </div>
                        </div>
                        {/* Bot bubble (left) */}
                        <div className="flex justify-start">
                          <div className="max-w-[80%]">
                            <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm whitespace-pre-wrap break-words shadow-sm">
                              {m.botReply || <span className="italic text-gray-400">[no reply]</span>}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 pl-1">
                              <Bot className="w-3 h-3 text-blue-500" />
                              <span className="text-[10px] text-gray-400">Ezy AI</span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                  m.matched ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {SOURCE_LABEL[m.source] || m.source}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
