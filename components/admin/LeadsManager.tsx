'use client';

// Lead Management — ported from EzyLoanCrm's Clients list + client-detail pages
// into a single self-contained admin tab, restyled to the admin's blue theme.
// Reads/writes the shared `leads`/`activities` collections via /api/leads and
// /api/activities, so it stays in sync with the standalone CRM.

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  Filter,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Trash2,
  X,
  Phone,
  MessageCircle,
  Send,
  Smartphone,
  ChevronDown,
  MoreVertical,
  Check,
  Activity as ActivityIcon,
  CheckSquare,
  Square,
} from 'lucide-react';
import { GROUPS, groupStyle } from '@/lib/groups';
import { cn } from '@/lib/utils';

export interface Lead {
  _id: string;
  name: string;
  displayName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
  status: string;
  groups?: string[];
  source?: string;
  opportunitySize?: string;
  leadStage?: string;
  followUpDate?: string;
  lastActivity?: string;
  createdAt: string;
}

interface ActivityItem {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
}

const TABS = [
  { key: 'all', label: 'All Clients' },
  { key: 'uncontacted', label: 'Uncontacted' },
  { key: 'followups', label: 'Follow Ups' },
];

const STATUS_OPTIONS = [
  'All Statuses',
  'New',
  'No Response',
  'Cold',
  'Warm',
  '1. Interested',
  '0. Not Interested',
  'Lost',
  'Converted',
  'Out Of Odisha',
];

const STATUS_STYLES: Record<string, string> = {
  'New': 'bg-blue-100 text-blue-700',
  'No Response': 'bg-pink-100 text-pink-700',
  'Cold': 'bg-sky-100 text-sky-700',
  'Warm': 'bg-orange-100 text-orange-700',
  '1. Interested': 'bg-green-100 text-green-700',
  '0. Not Interested': 'bg-gray-800 text-white',
  'Lost': 'bg-red-500 text-white',
  'Converted': 'bg-emerald-500 text-white',
  'Out Of Odisha': 'bg-purple-100 text-purple-700',
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600';
  const label = status.length > 12 ? status.slice(0, 12) + '...' : status;
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap', style)}
      title={status}
    >
      {label}
    </span>
  );
}

function GroupBadge({ group }: { group: string }) {
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap', groupStyle(group))}
      title={group}
    >
      {group}
    </span>
  );
}

// Build a compact list of page numbers with ellipses, e.g. [1, '...', 4, 5, 6, '...', 20]
function getPageRange(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const range: (number | string)[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) range.push('...');
  for (let i = start; i <= end; i++) range.push(i);
  if (end < total - 1) range.push('...');
  range.push(total);
  return range;
}

export default function LeadsManager() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    return <LeadDetail id={selectedId} onBack={() => setSelectedId(null)} />;
  }
  return <LeadsList onOpen={setSelectedId} />;
}

/* ============================ LIST ============================ */

function LeadsList({ onOpen }: { onOpen: (id: string) => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [groupFilter, setGroupFilter] = useState('All Groups');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilter, setShowFilter] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ tab: activeTab, page: String(page) });
    if (search) params.set('search', search);
    if (statusFilter !== 'All Statuses') params.set('status', statusFilter);
    if (groupFilter !== 'All Groups') params.set('group', groupFilter);

    const res = await fetch(`/api/leads?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads);
      setTotal(data.total);
      setPages(data.pages || 1);
    }
    setLoading(false);
  }, [activeTab, search, statusFilter, groupFilter, page]);

  useEffect(() => {
    const timer = setTimeout(fetchLeads, 300);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  // Reset to page 1 whenever the filters/tab/search change
  useEffect(() => {
    setPage(1);
  }, [activeTab, search, statusFilter, groupFilter]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === leads.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(leads.map((l) => l._id)));
  }

  async function deleteSelected() {
    if (!confirm(`Delete ${selectedIds.size} client(s)?`)) return;
    await Promise.all(
      Array.from(selectedIds).map((id) => fetch(`/api/leads/${id}`, { method: 'DELETE' }))
    );
    setSelectedIds(new Set());
    fetchLeads();
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Website enquiries &amp; CRM clients in one place</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={16} />
          Add New Client
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-gray-100">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setSelectedIds(new Set()); }}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                activeTab === t.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              <Filter size={13} />
              Filter
            </button>

            {showFilter && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All Groups">All Groups</option>
                  {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </>
            )}

            {selectedIds.size > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-100 transition"
              >
                <Trash2 size={13} />
                Delete ({selectedIds.size})
              </button>
            )}
          </div>

          <span className="ml-auto text-xs text-gray-400">{total} clients</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-10 px-4 py-3">
                  <button onClick={toggleSelectAll} className="text-gray-400">
                    {selectedIds.size === leads.length && leads.length > 0
                      ? <CheckSquare size={15} className="text-blue-600" />
                      : <Square size={15} />}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Phone Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Groups</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Follow Up</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Last Activity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">Date Added</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={9} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-gray-400 text-sm">
                    No clients found. Add your first client!
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className={cn(
                      'border-b border-gray-50 hover:bg-gray-50/70 transition-colors cursor-pointer group',
                      selectedIds.has(lead._id) ? 'bg-blue-50/60' : ''
                    )}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleSelect(lead._id)} className="text-gray-400">
                        {selectedIds.has(lead._id)
                          ? <CheckSquare size={15} className="text-blue-600" />
                          : <Square size={15} />}
                      </button>
                    </td>
                    <td className="px-4 py-3" onClick={() => onOpen(lead._id)}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                          {lead.name}
                        </span>
                        <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-400" />
                      </div>
                      {lead.phone && (
                        <div className="mt-0.5 sm:hidden">
                          <span className="text-xs text-gray-500">{lead.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell" onClick={() => onOpen(lead._id)}>
                      {lead.phone || '-'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell" onClick={() => onOpen(lead._id)}>
                      <span className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{lead.notes || '-'}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell" onClick={() => onOpen(lead._id)}>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell" onClick={() => onOpen(lead._id)}>
                      {lead.groups && lead.groups.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {lead.groups.map((g) => <GroupBadge key={g} group={g} />)}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-500" onClick={() => onOpen(lead._id)}>
                      {lead.followUpDate ? (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(lead.followUpDate)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-sm text-gray-500" onClick={() => onOpen(lead._id)}>
                      {formatDate(lead.lastActivity)}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-sm text-gray-500" onClick={() => onOpen(lead._id)}>
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="flex items-center justify-center gap-1.5 py-5 border-t border-gray-100">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {getPageRange(page, pages).map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} className="w-8 text-center text-gray-400 text-sm select-none">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={cn(
                    'min-w-8 h-8 px-2 flex items-center justify-center rounded-full text-sm font-medium transition',
                    page === p ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => { setShowAddModal(false); fetchLeads(); }}
        />
      )}
    </div>
  );
}

/* ============================ DETAIL ============================ */

const DETAIL_STATUS_OPTIONS = [
  'New', 'No Response', 'Cold', 'Warm',
  '1. Interested', '0. Not Interested', 'Lost', 'Converted', 'Out Of Odisha',
];

const ACTIVITY_ICONS: Record<string, string> = {
  note: '📝', call: '📞', email: '📧', meeting: '🤝',
  status_change: '🔄', created: '✨', follow_up: '📅',
};

function statusPillClass(status: string) {
  if (status === 'New') return 'bg-blue-600 text-white';
  if (status === 'Converted') return 'bg-emerald-500 text-white';
  if (status === 'Lost' || status === '0. Not Interested') return 'bg-gray-700 text-white';
  if (status === '1. Interested' || status === 'Warm') return 'bg-indigo-500 text-white';
  return 'bg-sky-500 text-white';
}

function LeadDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusOpen, setStatusOpen] = useState(false);
  const [followOpen, setFollowOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [addingActivity, setAddingActivity] = useState(false);
  const [newNote, setNewNote] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/leads/${id}`);
    if (res.ok) {
      const data = await res.json();
      setLead(data.lead);
      setActivities(data.activities || []);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function patch(fields: Partial<Lead>) {
    if (!lead) return;
    setLead({ ...lead, ...fields });
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });
    if (res.ok) {
      const data = await res.json();
      setLead(data.lead);
      if (fields.status) load(); // status change adds an activity — refresh timeline
    }
  }

  function toggleGroup(group: string) {
    if (!lead) return;
    const current = lead.groups || [];
    const next = current.includes(group) ? current.filter((g) => g !== group) : [...current, group];
    patch({ groups: next });
  }

  async function addActivity() {
    if (!newNote.trim()) return;
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId: id, type: 'note', description: newNote }),
    });
    setNewNote('');
    setAddingActivity(false);
    load();
  }

  async function handleDelete() {
    if (!confirm('Delete this client? This cannot be undone.')) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    onBack();
  }

  function formatDate(d?: string) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-8 w-64 bg-gray-200 rounded" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white rounded-2xl border border-gray-200" />
          <div className="h-96 bg-white rounded-2xl border border-gray-200" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Client not found.</p>
        <button onClick={onBack} className="text-blue-600 text-sm font-medium mt-2 inline-block">← Back to Leads</button>
      </div>
    );
  }

  const waNumber = (lead.whatsapp || lead.phone || '').replace(/[^0-9]/g, '');

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
        <button onClick={onBack} className="hover:text-gray-700 font-medium">Lead Management</button>
        <span>›</span>
        <span className="text-gray-700">{lead.name}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
        <div className="flex items-center gap-2">
          <a
            href={waNumber ? `https://wa.me/${waNumber}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
          >
            <Send size={14} /> Send Quick Response
          </a>
          <span className="hidden sm:flex items-center gap-1.5 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold">
            View on App <Smartphone size={14} />
          </span>
          <div className="relative">
            <button
              onClick={() => setOptionsOpen((o) => !o)}
              className="flex items-center gap-1 text-sm text-gray-600 px-2 py-2 rounded-lg hover:bg-gray-100"
            >
              Options <MoreVertical size={15} />
            </button>
            {optionsOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete Client
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status + Follow up row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <button
            onClick={() => { setStatusOpen((o) => !o); setFollowOpen(false); }}
            className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide shadow-sm', statusPillClass(lead.status))}
          >
            <ActivityIcon size={15} />
            {lead.status === 'New' ? 'Uncontacted' : lead.status}
            <ChevronDown size={15} />
          </button>
          {statusOpen && (
            <div className="absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 max-h-72 overflow-y-auto">
              {DETAIL_STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { patch({ status: s }); setStatusOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {s}
                  {lead.status === s && <Check size={14} className="text-blue-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => { setFollowOpen((o) => !o); setStatusOpen(false); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50"
          >
            <Calendar size={15} className="text-gray-400" />
            {lead.followUpDate
              ? new Date(lead.followUpDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : 'No Follow Up Scheduled'}
            <ChevronDown size={15} />
          </button>
          {followOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-30">
              <label className="text-xs text-gray-500 mb-1 block">Schedule a follow up</label>
              <input
                type="date"
                value={lead.followUpDate ? lead.followUpDate.slice(0, 10) : ''}
                onChange={(e) => patch({ followUpDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {lead.followUpDate && (
                <button
                  onClick={() => { patch({ followUpDate: '' }); setFollowOpen(false); }}
                  className="mt-2 text-xs text-red-500 hover:text-red-600"
                >
                  Clear follow up
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Client Info</h2>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-5">
                <EditableField label="DISPLAY NAME" value={lead.displayName} placeholder="No Display Name" onSave={(v) => patch({ displayName: v })} />
                <EditableField label="MOBILE NUMBER" value={lead.phone} placeholder="Click to add..." onSave={(v) => patch({ phone: v })}
                  action={lead.phone ? <a href={`tel:${lead.phone}`} className="text-blue-600"><Phone size={17} /></a> : null} />
                <EditableField label="WHATSAPP NUMBER" value={lead.whatsapp || lead.phone} placeholder="Click to add..." onSave={(v) => patch({ whatsapp: v })}
                  action={waNumber ? <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="text-green-500"><MessageCircle size={17} /></a> : null} />
                <EditableField label="EMAIL ADDRESS" value={lead.email} placeholder="Click to add..." onSave={(v) => patch({ email: v })} />
                <EditableField label="OPPORTUNITY SIZE" value={lead.opportunitySize} placeholder="Click to enter a value..." onSave={(v) => patch({ opportunitySize: v })} />
                <EditableField label="LEAD STAGE" value={lead.leadStage} placeholder="Click to select a value..." onSave={(v) => patch({ leadStage: v })} />
              </div>

              <div className="space-y-5">
                {/* Groups */}
                <div className="relative">
                  <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5">GROUPS</p>
                  <button onClick={() => setGroupsOpen((o) => !o)} className="w-full text-left">
                    {lead.groups && lead.groups.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {lead.groups.map((g) => (
                          <span key={g} className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold', groupStyle(g))}>{g}</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Click to add groups</span>
                    )}
                  </button>
                  {groupsOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 max-h-72 overflow-y-auto">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-500">Select Groups</span>
                        <button onClick={() => setGroupsOpen(false)}><X size={14} className="text-gray-400" /></button>
                      </div>
                      {GROUPS.map((g) => {
                        const active = (lead.groups || []).includes(g);
                        return (
                          <button
                            key={g}
                            onClick={() => toggleGroup(g)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            <span className="flex items-center gap-2">
                              <span className={cn('w-3 h-3 rounded-sm', groupStyle(g).split(' ')[0])} />
                              <span className="text-gray-700">{g}</span>
                            </span>
                            {active && <Check size={14} className="text-blue-500" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Source */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5">SOURCE</p>
                  <p className="text-sm text-gray-700">{lead.source || 'Manual'}</p>
                </div>

                {/* Notes */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5">NOTES</p>
                  <EditableNotes value={lead.notes} onSave={(v) => patch({ notes: v })} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right rail: Timeline */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Timeline</h2>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              {!addingActivity ? (
                <button
                  onClick={() => setAddingActivity(true)}
                  className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-4"
                >
                  <span className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center"><Plus size={13} /></span>
                  Add Activity
                </button>
              ) : (
                <div className="mb-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log a note, call, or meeting..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={addActivity} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">Save</button>
                    <button onClick={() => { setAddingActivity(false); setNewNote(''); }} className="px-3 py-1.5 text-gray-500 text-xs">Cancel</button>
                  </div>
                </div>
              )}

              {activities.length === 0 ? (
                <p className="text-sm text-gray-400">No activity yet.</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((a) => (
                    <div key={a._id} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-xs">
                        {ACTIVITY_ICONS[a.type] || '•'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">{formatDate(a.createdAt)}</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{a.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- inline editable text field ---- */
function EditableField({
  label, value, placeholder, onSave, action,
}: {
  label: string;
  value?: string;
  placeholder: string;
  onSave: (v: string) => void;
  action?: React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? '');

  useEffect(() => { setVal(value ?? ''); }, [value]);

  function commit() {
    setEditing(false);
    if ((val ?? '') !== (value ?? '')) onSave(val.trim());
  }

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-500 tracking-wide mb-1.5">{label}</p>
        {editing ? (
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setVal(value ?? ''); setEditing(false); } }}
            autoFocus
            className="w-full px-2 py-1 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <button onClick={() => setEditing(true)} className="text-left w-full">
            <span className={value ? 'text-sm text-gray-800' : 'text-sm text-gray-400'}>
              {value || placeholder}
            </span>
          </button>
        )}
      </div>
      {action && <div className="pt-5 flex-shrink-0">{action}</div>}
    </div>
  );
}

/* ---- inline editable notes ---- */
function EditableNotes({ value, onSave }: { value?: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value ?? '');

  useEffect(() => { setVal(value ?? ''); }, [value]);

  if (editing) {
    return (
      <div>
        <textarea
          value={val}
          onChange={(e) => setVal(e.target.value)}
          rows={5}
          autoFocus
          className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => { setEditing(false); onSave(val); }}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
          >
            Save
          </button>
          <button onClick={() => { setVal(value ?? ''); setEditing(false); }} className="px-3 py-1.5 text-gray-500 text-xs">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="text-left w-full">
      {value ? (
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">{value}</p>
      ) : (
        <span className="text-sm text-gray-400">Click to add notes...</span>
      )}
    </button>
  );
}

/* ---- add client modal ---- */
const ADD_STATUS_OPTIONS = [
  'New', 'No Response', 'Cold', 'Warm',
  '1. Interested', '0. Not Interested', 'Lost', 'Converted', 'Out Of Odisha',
];

const SOURCE_OPTIONS = [
  'Manual', 'Website Form', 'Facebook Lead', 'Instagram', 'Referral', 'WhatsApp', 'Other',
];

function AddClientModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: '', displayName: '', phone: '', whatsapp: '', email: '', notes: '',
    status: 'New', source: 'Manual', followUpDate: '', groups: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleGroup(group: string) {
    setForm((prev) => ({
      ...prev,
      groups: prev.groups.includes(group) ? prev.groups.filter((g) => g !== group) : [...prev.groups, group],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    setError('');

    const body: Record<string, unknown> = { ...form };
    if (!body.followUpDate) delete body.followUpDate;

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Failed to save');
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Add New Client</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Client Name *</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Display Name</label>
              <input type="text" value={form.displayName} onChange={(e) => update('displayName', e.target.value)} placeholder="e.g. Rahul"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Mobile Number</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">WhatsApp Number</label>
              <input type="tel" value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="+91 98765 43210"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="rahul@email.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {ADD_STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Source</label>
              <select value={form.source} onChange={(e) => update('source', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {SOURCE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Follow Up Date</label>
              <input type="date" value={form.followUpDate} onChange={(e) => update('followUpDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Notes</label>
              <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Add notes about this client..." rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Groups</label>
              <div className="flex flex-wrap gap-1.5">
                {GROUPS.map((g) => {
                  const active = form.groups.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGroup(g)}
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap border transition',
                        active ? groupStyle(g) + ' border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      )}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
              {loading ? 'Saving...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
