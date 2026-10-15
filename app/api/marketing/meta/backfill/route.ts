import { NextRequest, NextResponse } from 'next/server';
import { audit } from '@/lib/audit';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { backfillLeads, processDueReceipts } from '@/lib/marketing/meta/leads';
import { errorResponse } from '@/lib/marketing/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/marketing/meta/backfill { days } — admin only. Reconcile Lead Ads
// leads from subscribed pages' forms (max 90 days). Already-seen leadgen ids
// are skipped by the unique receipt, so re-running is safe.
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-backfill', { windowMs: 10 * 60_000, max: 5, message: 'Backfill was run recently — wait a few minutes.' });
  if (limited) return limited;
  const body = (await req.json().catch(() => ({}))) as { days?: number };
  const days = Math.min(90, Math.max(1, Math.floor(Number(body.days) || 7)));
  try {
    const result = await backfillLeads(new Date(Date.now() - days * 86_400_000));
    const processed = await processDueReceipts(50);
    await audit(gate.auth, 'lead_backfill', 'meta', { days, queued: result.queued }, req);
    return NextResponse.json({ ...result, processed });
  } catch (e) {
    return errorResponse(e);
  }
}
