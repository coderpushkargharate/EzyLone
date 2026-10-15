import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { safeEqual } from '@/lib/webhookAuth';
import { checkRateLimit } from '@/lib/rateLimit';
import { cronSecret } from '@/lib/marketing/config';
import { runWorkerTick } from '@/lib/marketing/worker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/marketing/worker — run one worker pass now.
// Callers: an admin ("Process queue now"), or a cron job sending
// `x-cron-secret: $MARKETING_CRON_SECRET` (for deployments that set
// MARKETING_WORKER_ENABLED=false). Without the secret configured, only admins.
export async function POST(req: NextRequest) {
  const limited = checkRateLimit(req, 'marketing-worker', { windowMs: 60_000, max: 12, message: 'Too many runs.' });
  if (limited) return limited;
  const secret = cronSecret();
  const provided = req.headers.get('x-cron-secret');
  if (!(secret && provided && safeEqual(provided, secret))) {
    const gate = await requireAuth(req, { adminOnly: true });
    if ('error' in gate) return gate.error;
  }
  const summary = await runWorkerTick({ periodicJobs: true });
  return NextResponse.json(summary);
}
