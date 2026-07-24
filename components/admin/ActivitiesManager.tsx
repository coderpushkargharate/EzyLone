'use client';

// Activities feed — ported from EzyLoanCrm, restyled to the admin blue theme.
// Reads the shared activity log via GET /api/activities.

import { useEffect, useMemo, useState } from 'react';
import { Phone, Mail, MessageSquare, RefreshCw, Star, Calendar, Plus, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  _id: string;
  type: string;
  description: string;
  createdAt: string;
  leadId?: { _id: string; name: string; phone: string };
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  note: { icon: <MessageSquare size={14} />, color: 'bg-blue-100 text-blue-600', label: 'Note' },
  call: { icon: <Phone size={14} />, color: 'bg-green-100 text-green-600', label: 'Call' },
  email: { icon: <Mail size={14} />, color: 'bg-orange-100 text-orange-600', label: 'Email' },
  status_change: { icon: <RefreshCw size={14} />, color: 'bg-purple-100 text-purple-600', label: 'Status Changed' },
  created: { icon: <Plus size={14} />, color: 'bg-teal-100 text-teal-600', label: 'Lead Created' },
  follow_up: { icon: <Calendar size={14} />, color: 'bg-yellow-100 text-yellow-600', label: 'Follow Up' },
  meeting: { icon: <Star size={14} />, color: 'bg-pink-100 text-pink-600', label: 'Meeting' },
};

const FILTERS = [
  { key: 'all', label: 'All Activities' },
  { key: 'note', label: 'Notes' },
  { key: 'call', label: 'Calls' },
  { key: 'status_change', label: 'Status Changes' },
  { key: 'created', label: 'Created' },
];

export default function ActivitiesManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/activities')
      .then((r) => r.json())
      .then((data) => {
        setActivities(data.activities || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? activities : activities.filter((a) => a.type === filter)),
    [activities, filter]
  );

  const groups = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of filtered) {
      const key = new Date(a.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries());
  }, [filtered]);

  function formatTime(d: string) {
    return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total activities logged across all clients</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100 overflow-x-auto">
          <Filter size={15} className="text-gray-400 flex-shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition',
                filter === f.key ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading activities…</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-600 font-semibold">No activities yet</p>
            <p className="text-gray-400 text-sm mt-1">Add clients, log calls and notes — they will appear here.</p>
          </div>
        ) : (
          <div className="p-6">
            {groups.map(([day, items]) => (
              <div key={day} className="mb-6 last:mb-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{day}</span>
                  <span className="h-px flex-1 bg-gray-100" />
                </div>
                <div className="space-y-1">
                  {items.map((a) => {
                    const config = TYPE_CONFIG[a.type] || { icon: <MessageSquare size={14} />, color: 'bg-gray-100 text-gray-600', label: a.type };
                    return (
                      <div key={a._id} className="flex gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50/70 transition">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', config.color)}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              {a.leadId && <p className="text-sm font-semibold text-gray-900">{a.leadId.name}</p>}
                              <p className="text-sm text-gray-600 mt-0.5 break-words">{a.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', config.color)}>{config.label}</span>
                              <p className="text-xs text-gray-400 mt-1">{formatTime(a.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
