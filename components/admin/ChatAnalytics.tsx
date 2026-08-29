'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart3, RefreshCw, MessageSquare, Mic, CheckCircle2, HelpCircle,
  TrendingUp, Award, Globe, MessageCircle,
} from 'lucide-react';

// Ezy AI — Insights. A read-only analytics dashboard over the chatbot's
// conversation log (ChatLog): volume, answer rate, voice-vs-typed usage,
// channel split, a daily trend bar chart, top questions and top served answers.
// Powered entirely by the site's own data — /api/admin/chat-analytics.

interface Analytics {
  rangeDays: number;
  totals: { total: number; answered: number; unanswered: number; answerRate: number; avgConfidence: number };
  voice: { voice: number; text: number; voiceShare: number };
  byChannel: { channel: string; count: number }[];
  bySource: { source: string; count: number }[];
  daily: { date: string; total: number; unanswered: number; voice: number }[];
  topQuestions: { question: string; count: number; answered: number }[];
  topServed: { _id: string; question: string; hits: number; category: string; enabled: boolean }[];
  recentUnanswered: { _id: string; question: string; channel?: string; via?: string; score: number; createdAt: string }[];
}

const RANGES = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

const SOURCE_LABEL: Record<string, string> = {
  knowledge: 'Trained answer',
  engine: 'Rule engine',
  llm: 'AI backup',
  fallback: 'Unanswered',
};

export default function ChatAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(30);
  const [channel, setChannel] = useState<'all' | 'web' | 'whatsapp'>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/chat-analytics?days=${days}&channel=${channel}&_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      setData(res.data);
    } catch {
      alert('Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, channel]);

  const maxDaily = data ? Math.max(1, ...data.daily.map((d) => d.total)) : 1;

  const stat = (
    icon: React.ReactNode, label: string, value: React.ReactNode, sub?: string,
  ) => (
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
      <div className="mb-6 flex items-center gap-3">
        <BarChart3 className="h-7 w-7 text-blue-600" />
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Ezy AI Insights</h3>
          <p className="text-gray-600 text-sm">How visitors use the chatbot — volume, answer rate, and voice usage.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex rounded-md overflow-hidden border border-gray-200">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={`px-3 py-1.5 text-xs font-medium ${days === r.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-md overflow-hidden border border-gray-200">
          {(['all', 'web', 'whatsapp'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setChannel(c)}
              className={`px-3 py-1.5 text-xs font-medium capitalize ${channel === c ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              {c === 'all' ? 'All channels' : c === 'web' ? 'Website' : 'WhatsApp'}
            </button>
          ))}
        </div>
        <button onClick={fetchData} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm flex items-center gap-1">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading && !data ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : !data ? null : data.totals.total === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 text-center py-16 text-gray-500">
          No conversations recorded in this period yet.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stat(<MessageSquare className="h-5 w-5" />, 'Total chats', data.totals.total.toLocaleString(), `last ${data.rangeDays} days`)}
            {stat(<CheckCircle2 className="h-5 w-5" />, 'Answer rate', `${data.totals.answerRate}%`, `${data.totals.answered} answered`)}
            {stat(<HelpCircle className="h-5 w-5" />, 'Needs training', data.totals.unanswered.toLocaleString(), 'unanswered questions')}
            {stat(<Mic className="h-5 w-5" />, 'Voice usage', `${data.voice.voiceShare}%`, `${data.voice.voice} by mic · ${data.voice.text} typed`)}
          </div>

          {/* Daily trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-gray-800">Daily chat volume</h4>
              <span className="text-xs text-gray-400">(orange = unanswered)</span>
            </div>
            <div className="flex items-end gap-1 h-40 overflow-x-auto">
              {data.daily.map((d) => (
                <div key={d.date} className="flex flex-col items-center justify-end flex-1 min-w-[10px] group relative">
                  <div className="w-full rounded-t bg-blue-500 relative" style={{ height: `${(d.total / maxDaily) * 100}%` }}>
                    {d.unanswered > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 rounded-t bg-orange-400" style={{ height: `${(d.unanswered / d.total) * 100}%` }} />
                    )}
                  </div>
                  <div className="hidden group-hover:block absolute bottom-full mb-1 z-10 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[10px] text-white">
                    {d.date}: {d.total} chats · {d.unanswered} unanswered · {d.voice} voice
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel + source breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Where chats come from</h4>
              <div className="space-y-2 mb-4">
                {data.byChannel.map((c) => {
                  const pct = Math.round((c.count / data.totals.total) * 100);
                  return (
                    <div key={c.channel}>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span className="flex items-center gap-1 capitalize">
                          {c.channel === 'whatsapp' ? <MessageCircle className="h-4 w-4 text-green-600" /> : <Globe className="h-4 w-4 text-indigo-600" />}
                          {c.channel === 'whatsapp' ? 'WhatsApp' : 'Website'}
                        </span>
                        <span className="font-medium">{c.count} · {pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={c.channel === 'whatsapp' ? 'h-full bg-green-500' : 'h-full bg-indigo-500'} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <h4 className="font-semibold text-gray-800 mb-2 mt-4">Answered by</h4>
              <div className="flex flex-wrap gap-2">
                {data.bySource.map((s) => (
                  <span key={s.source} className={`px-2.5 py-1 text-xs rounded-full ${s.source === 'fallback' ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                    {SOURCE_LABEL[s.source] || s.source}: {s.count}
                  </span>
                ))}
              </div>
            </div>

            {/* Top served knowledge */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-800">Most-used trained answers</h4>
              </div>
              {data.topServed.filter((e) => e.hits > 0).length === 0 ? (
                <p className="text-sm text-gray-400">No answers served yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {data.topServed.filter((e) => e.hits > 0).map((e) => (
                    <div key={e._id} className="py-2 flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-700 truncate">{e.question}</span>
                      <span className="text-xs font-medium text-blue-600 whitespace-nowrap">{e.hits}×</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top questions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h4 className="font-semibold text-gray-800 mb-3">Top questions visitors asked</h4>
            <div className="divide-y divide-gray-100">
              {data.topQuestions.map((q, i) => (
                <div key={i} className="py-2 flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-700 truncate">{q.question}</span>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    {q.answered < q.count && (
                      <span className="text-xs text-orange-600">{q.count - q.answered} missed</span>
                    )}
                    <span className="text-xs font-medium text-gray-500">{q.count}×</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent unanswered */}
          {data.recentUnanswered.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <h4 className="font-semibold text-gray-800 mb-1">Recent questions to train</h4>
              <p className="text-xs text-gray-400 mb-3">Teach these in the “Ezy AI Brain” tab so the bot answers them next time.</p>
              <div className="divide-y divide-gray-100">
                {data.recentUnanswered.map((l) => (
                  <div key={l._id} className="py-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-700 truncate">{l.question}</span>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {l.via === 'voice' && <Mic className="h-3.5 w-3.5 text-purple-500" />}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${l.channel === 'whatsapp' ? 'bg-green-50 text-green-700' : 'bg-indigo-50 text-indigo-700'}`}>
                        {l.channel === 'whatsapp' ? 'WhatsApp' : 'Website'}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(l.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
