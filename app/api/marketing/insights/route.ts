import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { syncGoogleMetrics, syncMetaInsights } from '@/lib/marketing/insights';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/marketing/insights — admin only. Fetch platform spend/performance now
// (only through the authorized APIs; reports why when access is missing).
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-insights', { windowMs: 5 * 60_000, max: 5, message: 'Synced recently — try again in a few minutes.' });
  if (limited) return limited;
  const [meta, google] = await Promise.all([
    syncMetaInsights(30).catch((e) => ({ rows: 0, error: e instanceof Error ? e.message : String(e) })),
    syncGoogleMetrics(30).catch((e) => ({ rows: 0, error: e instanceof Error ? e.message : String(e) })),
  ]);
  return NextResponse.json({ meta, google });
}
