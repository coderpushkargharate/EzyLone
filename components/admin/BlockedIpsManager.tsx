'use client';

// Blocked IPs (admin only). Spammers are auto-blocked when they trip the
// honeypot or keep hammering the lead forms; this tab lets an admin review the
// list, block an IP by hand, or lift a block. A blocked IP can't submit the
// contact / loan forms at all (403 before anything is saved or emailed).

import { useEffect, useState, useCallback } from 'react';
import { Ban, Trash2, Loader2, ShieldAlert, Plus } from 'lucide-react';

interface Blocked {
  _id: string;
  ip: string;
  reason: string;
  createdBy: string;
  hits: number;
  createdAt: string;
}

export default function BlockedIpsManager() {
  const [rows, setRows] = useState<Blocked[]>([]);
  const [loading, setLoading] = useState(true);
  const [ip, setIp] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchRows = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/blocked-ips');
    if (res.ok) {
      const data = await res.json();
      setRows(data.blocked || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  async function blockManual() {
    const clean = ip.trim();
    if (!clean) return;
    setSaving(true);
    setError('');
    const res = await fetch('/api/admin/blocked-ips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: clean, reason: 'manual' }),
    });
    setSaving(false);
    if (res.ok) {
      setIp('');
      fetchRows();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.message || 'Could not block this IP');
    }
  }

  async function unblock(addr: string) {
    if (!confirm(`Unblock ${addr}? They will be able to submit the forms again.`)) return;
    await fetch(`/api/admin/blocked-ips?ip=${encodeURIComponent(addr)}`, { method: 'DELETE' });
    setRows((prev) => prev.filter((r) => r.ip !== addr));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-600" /> Blocked IPs
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Spammers are blocked automatically; you can also block or unblock an IP here.
        </p>
      </div>

      {/* Manual block */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <input
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') blockManual(); }}
          placeholder="Enter IP address to block (e.g. 203.0.113.5)"
          className="flex-1 min-w-[220px] px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={blockManual}
          disabled={saving || !ip.trim()}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium px-4 py-2.5 rounded-lg"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Block IP
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Ban className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No blocked IPs yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">IP Address</th>
                <th className="text-left px-4 py-3 font-medium">Reason</th>
                <th className="text-left px-4 py-3 font-medium">Blocked by</th>
                <th className="text-left px-4 py-3 font-medium">Hits</th>
                <th className="text-left px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-900">{r.ip}</td>
                  <td className="px-4 py-3 text-gray-700">{r.reason}</td>
                  <td className="px-4 py-3 text-gray-700">{r.createdBy}</td>
                  <td className="px-4 py-3 text-gray-700">{r.hits}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => unblock(r.ip)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                    >
                      <Trash2 className="w-4 h-4" /> Unblock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
