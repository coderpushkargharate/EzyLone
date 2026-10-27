import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { trafficReport } from '@/lib/siteAnalytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// First-party website traffic for the "SEO & Traffic" tab.
// ?days=1|7|30|90 — today, or the last N India-time days including today.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: ['seoTraffic', 'dashboard'] });
  if ('error' in gate) return gate.error;
  const d = Number(req.nextUrl.searchParams.get('days'));
  const days = [1, 7, 30, 90].includes(d) ? d : 7;
  try {
    return NextResponse.json({ data: await trafficReport(days) }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    console.error('[traffic]', e);
    return NextResponse.json({ error: { message: 'Could not load website traffic' } }, { status: 500 });
  }
}
