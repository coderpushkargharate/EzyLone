import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { audit } from '@/lib/audit';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { ConversionEvent } from '@/lib/models/ConversionEvent';
import { Lead } from '@/lib/models/Lead';
import { pageParams } from '@/lib/leadInput';
import { CRM_EVENTS, EVENT_STATUSES, PLATFORMS, RETRYABLE_MANUALLY } from '@/lib/marketing/types';
import type { EventStatus } from '@/lib/marketing/types';
import { syncLog } from '@/lib/marketing/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Short, non-identifying label for a lead in delivery logs: "Rahul S."
function maskName(name?: string): string {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '—';
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
}

// GET /api/marketing/events — conversion delivery log with filters.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: 'marketing' });
  if ('error' in gate) return gate.error;
  await connectDB();
  const sp = req.nextUrl.searchParams;
  const q: Record<string, unknown> = {};
  const platform = sp.get('platform');
  const status = sp.get('status');
  const crmEvent = sp.get('crmEvent');
  if (platform && (PLATFORMS as readonly string[]).includes(platform)) q.platform = platform;
  if (status && (EVENT_STATUSES as readonly string[]).includes(status)) q.status = status;
  if (crmEvent && (CRM_EVENTS as readonly string[]).includes(crmEvent)) q.crmEvent = crmEvent;
  if (sp.get('review') === '1') q.needsReview = { $exists: true, $ne: null };
  if (sp.get('test') === '0') q.testMode = false;
  if (sp.get('test') === '1') q.testMode = true;
  const { page, limit, skip } = pageParams(sp, 50);

  const [rows, total] = await Promise.all([
    ConversionEvent.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-history').lean(),
    ConversionEvent.countDocuments(q),
  ]);
  const leads = await Lead.find({ _id: { $in: rows.map((r) => r.leadId).filter(Boolean) } }).select('name').lean();
  const names = new Map(leads.map((l) => [String(l._id), maskName(l.name)]));

  return NextResponse.json({
    items: rows.map((r) => ({ ...r, leadLabel: r.leadId ? names.get(String(r.leadId)) || '(deleted lead)' : '—' })),
    total,
    page,
    pages: Math.ceil(total / limit),
    canManage: gate.auth.role === 'admin',
  });
}

// POST /api/marketing/events { action: 'retry_all', status } — admin only. Re-queue every
// event in a manually-retryable status (e.g. all dead-lettered events after fixing a token).
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-retry-all', { windowMs: 60_000, max: 5, message: 'Too many bulk retries.' });
  if (limited) return limited;
  const body = (await req.json().catch(() => ({}))) as { action?: string; status?: string };
  if (body.action !== 'retry_all' || !RETRYABLE_MANUALLY.includes(body.status as EventStatus)) {
    return NextResponse.json({ message: 'Specify action "retry_all" and a retryable status.' }, { status: 400 });
  }
  await connectDB();
  const now = new Date();
  const res = await ConversionEvent.updateMany(
    { status: body.status },
    {
      $set: { status: 'pending', attempts: 0, nextAttemptAt: now, lockedUntil: null, lockId: null },
      $push: { history: { $each: [{ at: now, status: 'pending', message: `Bulk manual retry by ${gate.auth.username}` }], $slice: -50 } },
    }
  );
  await audit(gate.auth, 'conversion_retry_bulk', String(body.status), { requeued: res.modifiedCount }, req);
  await syncLog('system', 'manual_retry', 'info', `${gate.auth.username} re-queued ${res.modifiedCount} "${body.status}" event(s)`);
  return NextResponse.json({ requeued: res.modifiedCount });
}
