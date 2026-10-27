'use client';

// Admin-only history of sensitive actions (GET /api/admin/audit-log).
import { useEffect, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */

const ACTIONS = ['', 'config_change', 'integration_connect', 'integration_disconnect', 'export', 'user_create', 'user_update', 'user_delete', 'blog_status', 'conversion_retry', 'conversion_retract', 'conversion_retry_bulk', 'lead_backfill', 'sitemap_submit'];

export default function AuditLogManager() {
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const qs = new URLSearchParams({ page: String(page), ...(action ? { action } : {}) });
    fetch(`/api/admin/audit-log?${qs}`)
      .then(async (r) => { const b = await r.json(); if (!r.ok) throw new Error(b.message || 'Failed'); setData(b); })
      .catch((e) => setError(e.message));
  }, [action, page]);

  return (
    <div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <select aria-label="Action" className="border border-gray-200 rounded-xl px-3 py-2 text-sm mb-3" value={action} onChange={(e) => { setPage(1); setAction(e.target.value); }}>
          {ACTIONS.map((a) => <option key={a} value={a}>{a ? a.replace(/_/g, ' ') : 'All actions'}</option>)}
        </select>
        {error && <p className="text-sm text-red-700">{error}</p>}
        {!data ? <div className="h-32 bg-gray-50 animate-pulse rounded-xl" /> : data.items.length === 0 ? <p className="text-sm text-gray-400 text-center py-8">Nothing recorded yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead><tr className="text-xs text-gray-500 border-b border-gray-100"><th className="text-left py-2">When</th><th className="text-left">Who</th><th className="text-left">Action</th><th className="text-left">Target</th><th className="text-left">Details</th></tr></thead>
              <tbody>
                {data.items.map((r: any) => (
                  <tr key={r._id} className="border-b border-gray-50 align-top">
                    <td className="py-2 text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleString('en-IN')}</td>
                    <td className="text-xs">{r.username || '—'}<div className="text-[10px] text-gray-400">{r.role}{r.ip ? ` · ${r.ip}` : ''}</div></td>
                    <td className="text-xs">{r.action.replace(/_/g, ' ')}</td>
                    <td className="text-xs break-all max-w-[220px]">{r.target}</td>
                    <td className="text-[11px] text-gray-600 font-mono break-all max-w-[280px]">{r.details ? JSON.stringify(r.details) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.pages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-3 text-xs">
            <button className="px-3 py-1.5 border rounded-lg disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {data.page} of {data.pages}</span>
            <button className="px-3 py-1.5 border rounded-lg disabled:opacity-50" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
