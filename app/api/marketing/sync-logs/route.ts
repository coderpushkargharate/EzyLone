import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { IntegrationSyncLog } from '@/lib/models/MarketingSupport';
import { MetaLeadReceipt } from '@/lib/models/MetaLeadReceipt';
import { pageParams } from '@/lib/leadInput';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/marketing/sync-logs?provider=&status=&view=receipts — integration history.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: 'marketing' });
  if ('error' in gate) return gate.error;
  await connectDB();
  const sp = req.nextUrl.searchParams;
  const { page, limit, skip } = pageParams(sp, 50);

  if (sp.get('view') === 'receipts') {
    const q: Record<string, unknown> = {};
    const st = sp.get('status');
    if (st && ['pending', 'processing', 'retry', 'done', 'failed', 'dead'].includes(st)) q.status = st;
    const [items, total] = await Promise.all([
      MetaLeadReceipt.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      MetaLeadReceipt.countDocuments(q),
    ]);
    return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
  }

  const q: Record<string, unknown> = {};
  const provider = sp.get('provider');
  const status = sp.get('status');
  if (provider && ['meta', 'google', 'system'].includes(provider)) q.provider = provider;
  if (status && ['ok', 'error', 'partial', 'info'].includes(status)) q.status = status;
  const [items, total] = await Promise.all([
    IntegrationSyncLog.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    IntegrationSyncLog.countDocuments(q),
  ]);
  return NextResponse.json({ items, total, page, pages: Math.ceil(total / limit) });
}

// POST /api/marketing/sync-logs { action: 'retry_receipt', id } — admin only. Re-queue a failed/dead Lead Ads fetch.
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const body = (await req.json().catch(() => ({}))) as { action?: string; id?: string };
  if (body.action !== 'retry_receipt' || !body.id || !/^[a-f0-9]{24}$/.test(body.id)) {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }
  await connectDB();
  const res = await MetaLeadReceipt.updateOne(
    { _id: body.id, status: { $in: ['failed', 'dead'] } },
    { $set: { status: 'pending', attempts: 0, nextAttemptAt: new Date(), lockedUntil: null } }
  );
  return NextResponse.json({ requeued: res.modifiedCount });
}
