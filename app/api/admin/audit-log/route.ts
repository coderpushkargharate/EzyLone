import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { AuditLog } from '@/lib/models/AuditLog';
import { pageParams } from '@/lib/leadInput';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/admin/audit-log?action=&page= — admin only. Sensitive-action history.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  await connectDB();
  const sp = req.nextUrl.searchParams;
  const q: Record<string, unknown> = {};
  const action = sp.get('action');
  if (action && /^[a-z_]{2,40}$/.test(action)) q.action = action;
  const { page, limit, skip } = pageParams(sp, 50);
  const [items, total] = await Promise.all([
    AuditLog.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(q),
  ]);
  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) }, { headers: { 'Cache-Control': 'private, no-store' } });
}
