'use client';

// Employee accounts + per-tab access control (admin only). Create an employee
// with an email + password, tick which admin tabs they can see, and they'll log
// in with that email and only see those tabs.

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Edit2, X, Mail, ShieldCheck, Loader2, Check } from 'lucide-react';
import { ASSIGNABLE_TABS } from '@/lib/adminTabs';
import { cn } from '@/lib/utils';

interface Employee {
  _id: string;
  name?: string;
  email?: string;
  permissions: string[];
  createdAt: string;
}

export default function EmployeesManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/employees');
    if (res.ok) {
      const data = await res.json();
      setEmployees(data.employees || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  async function remove(id: string) {
    if (!confirm('Delete this employee account? They will no longer be able to log in.')) return;
    await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    setEmployees((prev) => prev.filter((e) => e._id !== id));
  }

  function openCreate() { setEditing(null); setShowModal(true); }
  function openEdit(emp: Employee) { setEditing(emp); setShowModal(true); }

  function tabNames(perms: string[]) {
    if (!perms.length) return 'No access yet';
    return ASSIGNABLE_TABS.filter((t) => perms.includes(t.id)).map((t) => t.name).join(', ');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create staff logins and control which sections each can access</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Email (login)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Access</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400 text-sm">Loading…</td></tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center">
                    <ShieldCheck size={30} className="text-blue-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-700">No employees yet</p>
                    <p className="text-sm text-gray-500 mt-1">Add your first employee and choose what they can access.</p>
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp._id} className="border-b border-gray-50 hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {(emp.name || emp.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{emp.name || '—'}</p>
                          <p className="text-xs text-gray-500 sm:hidden truncate">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1.5"><Mail size={13} className="text-gray-400" />{emp.email}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500 line-clamp-2 max-w-md">{tabNames(emp.permissions)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(emp)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => remove(emp._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <EmployeeModal
          employee={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchEmployees(); }}
        />
      )}
    </div>
  );
}

function EmployeeModal({ employee, onClose, onSaved }: { employee: Employee | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = Boolean(employee);
  const [name, setName] = useState(employee?.name || '');
  const [email, setEmail] = useState(employee?.email || '');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<string[]>(employee?.permissions || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function togglePerm(id: string) {
    setPermissions((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  const allSelected = permissions.length === ASSIGNABLE_TABS.length;
  function toggleAll() {
    setPermissions(allSelected ? [] : ASSIGNABLE_TABS.map((t) => t.id));
  }

  async function save() {
    setError('');
    if (!isEdit && !email.trim()) { setError('Email is required'); return; }
    if (!isEdit && password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (isEdit && password && password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setSaving(true);
    const url = isEdit ? `/api/employees/${employee!._id}` : '/api/employees';
    const method = isEdit ? 'PATCH' : 'POST';
    const payload: Record<string, unknown> = { name, permissions };
    if (!isEdit) payload.email = email;
    if (password) payload.password = password;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'Failed to save');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Employee' : 'Add Employee'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Employee Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Login Email {isEdit && <span className="text-gray-400 normal-case">(cannot be changed)</span>}
            </label>
            <input type="email" value={email} disabled={isEdit} onChange={(e) => setEmail(e.target.value)} placeholder="employee@ezyloan.co.in"
              className={cn(
                'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                isEdit && 'bg-gray-50 text-gray-500'
              )} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              {isEdit ? 'New Password (leave blank to keep)' : 'Password'}
            </label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isEdit ? '••••••••' : 'At least 6 characters'}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
            <p className="text-[11px] text-gray-400 mt-1">Share this password with the employee — they log in at the same admin URL with their email + password.</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Access — which tabs can they see?</label>
              <button onClick={toggleAll} className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                {allSelected ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 border border-gray-200 rounded-xl p-3 max-h-64 overflow-y-auto">
              {ASSIGNABLE_TABS.map((t) => {
                const active = permissions.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => togglePerm(t.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition border',
                      active ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <span className={cn('w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border', active ? 'bg-blue-600 border-blue-600' : 'border-gray-300')}>
                      {active && <Check size={11} className="text-white" />}
                    </span>
                    <span className="truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{permissions.length} of {ASSIGNABLE_TABS.length} tabs selected.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
              Cancel
            </button>
            <button onClick={save} disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
