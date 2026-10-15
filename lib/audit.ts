import type { NextRequest } from 'next/server';
import { connectDB } from './db';
import { AuditLog } from './models/AuditLog';
import type { AuthContext } from './auth';
import { getClientIp } from './rateLimit';

// Record a sensitive admin action. Never throws — an audit-store hiccup must not
// fail the action itself (it is logged to stderr instead).
//
// Secret-looking keys are dropped from `details` before storage.
const SECRET_KEY = /token|secret|password|key|credential|cookie/i;

function scrub(details?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!details) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(details)) {
    if (SECRET_KEY.test(k)) {
      out[k] = '[redacted]';
      continue;
    }
    out[k] = typeof v === 'string' ? v.slice(0, 300) : Array.isArray(v) ? v.slice(0, 50) : v;
  }
  return out;
}

export async function audit(
  auth: Pick<AuthContext, 'userId' | 'username' | 'role'> | null,
  action: string,
  target: string,
  details?: Record<string, unknown>,
  req?: NextRequest
): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      userId: auth?.userId,
      username: auth?.username,
      role: auth?.role,
      action,
      target: target.slice(0, 300),
      details: scrub(details),
      ip: req ? getClientIp(req) : undefined,
    });
  } catch (e) {
    console.error('Audit log write failed:', e instanceof Error ? e.message : e);
  }
}
