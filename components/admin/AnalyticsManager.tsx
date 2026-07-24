'use client';

// Advanced Analytics — ported from EzyLoanCrm. The "Leads by Date Range" chart
// is rendered with plain CSS bars (EzyLone has no recharts dependency).

import { useEffect, useState } from 'react';
import { Users, TrendingUp, UserCheck, Target, Activity as ActivityIcon, LayoutGrid } from 'lucide-react';

interface AnalyticsData {
  stats: {
    totalLeads: number;
    newLeads: number;
    coldLeads: number;
    interestedLeads: number;
    lostLeads: number;
    convertedLeads: number;
    totalActivities: number;
  };
  monthlyLeads: Array<{ _id: { year: number; month: number }; count: number }>;
  statusBreakdown: Array<{ _id: string; count: number }>;
  sourceFunnel: Array<{ _id: string; total: number; interested: number; warm: number; converted: number }>;
  activityByType: Array<{ _id: string; count: number }>;
  dailyLeads: Array<{ _id: string; count: number }>;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ACTIVITY_META: Record<string, { label: string; color: string }> = {
  call: { label: 'Call', color: '#eab308' },
  meeting: { label: 'Meeting', color: '#22c55e' },
  note: { label: 'Note', color: '#3b82f6' },
  email: { label: 'Email', color: '#f97316' },
  status_change: { label: 'Status Change', color: '#a855f7' },
  created: { label: 'Lead Created', color: '#14b8a6' },
  follow_up: { label: 'Follow Up', color: '#ec4899' },
};

function Dashboard({ title, icon, pill, children }: { title: string; icon?: string; pill?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
      </div>
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm">{icon || '📊'}</span>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
        </div>
        {pill && <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">{pill}</span>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function AnalyticsManager() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics').then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Advanced Analytics</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-2xl border border-gray-200 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const stats = data.stats;
  const conversionRate = stats.totalLeads ? Math.round((stats.convertedLeads / stats.totalLeads) * 100) : 0;

  const statCards = [
    { label: 'Total Leads', value: stats.totalLeads, icon: <Users size={18} />, color: 'text-blue-600 bg-blue-50' },
    { label: 'Interested', value: stats.interestedLeads, icon: <UserCheck size={18} />, color: 'text-green-600 bg-green-50' },
    { label: 'Converted', value: stats.convertedLeads, icon: <Target size={18} />, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Activities', value: stats.totalActivities, icon: <ActivityIcon size={18} />, color: 'text-indigo-600 bg-indigo-50' },
  ];

  const dailyData = (data.dailyLeads || []).map((d) => {
    const dt = new Date(d._id);
    return { name: dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }), leads: d.count };
  });
  const monthlyData = (data.monthlyLeads || []).map((d) => ({ name: MONTHS[d._id.month - 1], leads: d.count }));
  const barData = dailyData.length > 0 ? dailyData : monthlyData;
  const maxBar = Math.max(1, ...barData.map((b) => b.leads));

  const activities = (data.activityByType || []).map((a) => ({
    ...a,
    meta: ACTIVITY_META[a._id] || { label: a._id, color: '#94a3b8' },
  }));
  const maxAct = Math.max(1, ...activities.map((a) => a.count));

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <LayoutGrid size={22} className="text-blue-500" />
        <h1 className="text-2xl font-bold text-gray-900">Advanced Analytics</h1>
      </div>
      <p className="text-gray-500 text-sm mb-6">Real-time insights into your leads, sales funnel, and activity — {conversionRate}% conversion rate.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <span className={`p-2 rounded-lg ${c.color}`}>{c.icon}</span>
              <span className="text-xs font-medium text-gray-500">{c.label}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Sales Funnel by Source */}
      <div className="mb-6">
        <Dashboard title="Sales Funnel by Source" icon="🎯" pill="This Year">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 pb-2">Source</th>
                  <th className="text-center text-xs font-semibold text-gray-500 pb-2">Total Leads</th>
                  <th className="text-center text-xs font-semibold text-gray-500 pb-2">😊 Interested</th>
                  <th className="text-center text-xs font-semibold text-gray-500 pb-2">🔥 Warm</th>
                  <th className="text-center text-xs font-semibold text-gray-500 pb-2">✅ Converted</th>
                </tr>
              </thead>
              <tbody>
                {data.sourceFunnel.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-gray-400 text-sm py-8">No leads yet</td></tr>
                ) : (
                  data.sourceFunnel.map((row) => (
                    <tr key={row._id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 text-sm font-medium text-gray-800">{row._id}</td>
                      <td className="py-2.5 text-sm text-center font-semibold text-gray-900">{row.total}</td>
                      <td className="py-2.5 text-sm text-center text-gray-600">{row.interested}</td>
                      <td className="py-2.5 text-sm text-center text-gray-600">{row.warm}</td>
                      <td className="py-2.5 text-sm text-center text-gray-600">{row.converted}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Dashboard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activities by Type */}
        <Dashboard title="Activities by Type" icon="⚡" pill="All Team Members">
          {activities.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No activities yet</div>
          ) : (
            <div className="space-y-3 py-2">
              {activities.map((a) => (
                <div key={a._id} className="flex items-center gap-3">
                  <span className="w-28 text-xs text-gray-600 flex-shrink-0">{a.meta.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div className="h-full rounded-full flex items-center justify-end pr-2" style={{ width: `${(a.count / maxAct) * 100}%`, background: a.meta.color, minWidth: 24 }}>
                      <span className="text-[10px] font-bold text-white">{a.count}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100 mt-3">
                {activities.map((a) => (
                  <span key={a._id} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: a.meta.color }} /> {a.meta.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Dashboard>

        {/* Leads by Date Range — pure CSS bars */}
        <Dashboard title="Leads by Date Range" icon="📅" pill="All Leads">
          {barData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No leads in this range</div>
          ) : (
            <div className="h-[220px] flex items-end gap-1.5 pt-4">
              {barData.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                  <span className="text-[10px] font-semibold text-gray-500 mb-1">{b.leads || ''}</span>
                  <div
                    className="w-full rounded-t bg-blue-400 hover:bg-blue-500 transition-colors"
                    style={{ height: `${Math.max(4, (b.leads / maxBar) * 170)}px` }}
                    title={`${b.name}: ${b.leads} lead(s)`}
                  />
                  <span className="text-[9px] text-gray-400 mt-1 truncate w-full text-center">{b.name}</span>
                </div>
              ))}
            </div>
          )}
        </Dashboard>
      </div>

      {/* Conversion banner */}
      <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-blue-50 text-sm font-medium flex items-center gap-1.5"><TrendingUp size={15} /> Conversion Rate</p>
          <p className="text-5xl font-bold mt-1">{conversionRate}%</p>
        </div>
        <p className="text-blue-50 text-sm max-w-xs">
          {stats.convertedLeads} of {stats.totalLeads} leads converted • {stats.interestedLeads} currently interested • {stats.newLeads} uncontacted.
        </p>
      </div>
    </div>
  );
}
