'use client';

// Team — ported from EzyLoanCrm, restyled to the admin blue theme. Pulls totals
// from /api/analytics and the current admin from /api/me.

import { useEffect, useState } from 'react';
import { Users, BarChart2, CheckCircle, Clock, Info, Plus, UserPlus, Network, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
  totalLeads: number;
  newLeads: number;
  coldLeads: number;
  interestedLeads: number;
  lostLeads: number;
  convertedLeads: number;
  totalActivities: number;
}

interface Me { name: string; email: string; role: string; }

const TABS = [
  { key: 'dashboard', label: 'Team Dashboard' },
  { key: 'members', label: 'Team Members' },
  { key: 'subteams', label: 'Subteams' },
  { key: 'assignment', label: 'Lead Assignment' },
];

export default function TeamManager() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((r) => r.json()),
      fetch('/api/me').then((r) => r.json()),
    ]).then(([a, m]) => {
      setStats(a.stats);
      setMe(m.user);
    }).finally(() => setLoading(false));
  }, []);

  const contacted = stats ? stats.totalLeads - stats.newLeads : 0;
  const contactedPct = stats?.totalLeads ? Math.round((contacted / stats.totalLeads) * 100) : 0;

  const statCards = [
    { label: 'TEAM MEMBERS', value: '1', sub: 'Activated accounts', icon: <Users size={16} className="text-gray-400" /> },
    { label: 'ASSIGNED CLIENTS', value: loading ? '…' : String(stats?.totalLeads ?? 0), sub: `of ${stats?.totalLeads ?? 0} added`, icon: <BarChart2 size={16} className="text-gray-400" /> },
    { label: 'CONTACTED CLIENTS', value: loading ? '…' : String(contacted), sub: `${contactedPct}% of assigned`, icon: <CheckCircle size={16} className="text-gray-400" /> },
    { label: 'AVERAGE RESPONSE TIME', value: '-', sub: 'for contacted clients', icon: <Clock size={16} className="text-gray-400" /> },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team</h1>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-6 px-6 pt-4 border-b border-gray-100 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'pb-3 text-sm font-semibold border-b-2 -mb-px whitespace-nowrap transition',
                tab === t.key ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === 'dashboard' && (
            <>
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"><Users size={14} /> All Groups <span className="text-gray-400">›</span></div>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"><Clock size={14} /> Last 7 days <span className="text-gray-400">▾</span></div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((card) => (
                  <div key={card.label} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</span>
                      <Info size={14} className="text-gray-300" />
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{card.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
                  </div>
                ))}
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-8">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Team Member</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Assigned</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Contacted</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Activities</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 bg-gray-50/50 font-semibold">
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 text-sm text-gray-900">TOTAL</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700">{stats?.totalLeads ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 hidden md:table-cell">{stats ? contacted : '-'}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 hidden lg:table-cell">{stats?.totalActivities ?? '-'}</td>
                    </tr>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm text-gray-400">1</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900">{me?.name || 'Admin'}</p>
                        <p className="text-xs text-gray-400">{me?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-blue-600 font-semibold">{stats?.totalLeads ?? '-'}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 hidden md:table-cell">{stats ? contacted : '-'}</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-700 hidden lg:table-cell">{stats?.totalActivities ?? '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'members' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <p className="text-sm text-gray-500">Invite team members to collaborate on leads and track their performance.</p>
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  <UserPlus size={16} /> Invite Team Member
                </button>
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{me?.name || 'Admin'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">{me?.email}</td>
                      <td className="px-4 py-3"><span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 capitalize">{me?.role || 'admin'}</span></td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'subteams' && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Create subteams to organise your team members and control what clients they can access.</p>
                  <p className="text-xs text-gray-400 mt-1">0 SUBTEAMS</p>
                </div>
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                >
                  <Plus size={16} /> Create Subteam
                </button>
              </div>
              <div className="py-14 text-center">
                <Users size={30} className="text-blue-400 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">Welcome to your Subteams</p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Organize your team into subteams to control who can view specific clients more effectively.</p>
              </div>
            </div>
          )}

          {tab === 'assignment' && (
            <div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">You don&apos;t have any team members</p>
                <p className="text-sm text-blue-600 mt-1">Lead assignment can only be configured once you have team members. Start inviting team members via your Team Members tab.</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4">
                  <Network size={24} className="text-white" />
                </div>
                <p className="text-lg font-bold text-gray-900">Lead Assignment via Round Robin</p>
                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">Automatically distribute incoming leads from Facebook, Instagram, WhatsApp, and website forms evenly across your team members.</p>
                <div className="flex items-center justify-center gap-3 mt-6">
                  {['Team Member 1', 'Team Member 2', 'Team Member 3'].map((m) => (
                    <div key={m} className="text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-1"><Users size={18} className="text-gray-400" /></div>
                      <p className="text-[11px] text-gray-400">{m}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPlanModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold text-gray-900">Available on request</h2>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-600 mt-3">Adding team members and subteams can be enabled for your EzyLoan CRM account. Reach out to us to set it up.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPlanModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Close</button>
              <a href="https://wa.me/916372977626" target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700">Let&apos;s Talk</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
