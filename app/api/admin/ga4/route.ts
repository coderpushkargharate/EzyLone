import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { analyticsReport } from '@/lib/marketing/google/reporting';
import { PlatformError } from '@/lib/marketing/types';
import { MarketingConfigError } from '@/lib/marketing/secrets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Google Analytics 4 summary for the "SEO & Traffic" tab, read through the
// Google account connected in Marketing & Ads. ?days=7|28|90, ?refresh=1.

const ymd = (d: Date) => d.toISOString().slice(0, 10);

export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: ['seoTraffic', 'marketing'] });
  if ('error' in gate) return gate.error;
  const headers = { 'Cache-Control': 'private, no-store' };
  const sp = req.nextUrl.searchParams;
  const asked = Number(sp.get('days'));
  const days = [7, 28, 90].includes(asked) ? asked : 28;
  let fresh = sp.get('refresh') === '1';
  if (fresh && checkRateLimit(req, 'seo-ga4-fresh', { windowMs: 5 * 60_000, max: 10, message: 'Refreshed recently.' })) fresh = false;

  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  try {
    const r = await analyticsReport(ymd(start), ymd(end), { fresh });
    return NextResponse.json({ data: { status: 'ok', days, ...r } }, { headers });
  } catch (e) {
    let status = 'api_error';
    let message = 'Unexpected error — see server logs.';
    if (e instanceof PlatformError) {
      message = e.message;
      status = e.kind === 'config' ? (/property/i.test(e.message) ? 'no_property' : 'not_configured') : e.kind === 'auth' ? 'auth_failed' : e.kind === 'permission' ? 'no_access' : 'api_error';
    } else if (e instanceof MarketingConfigError) {
      status = 'not_configured';
      message = e.message;
    } else {
      console.error('[ga4]', e instanceof Error ? e.message : e);
    }
    return NextResponse.json({ data: { status, message } }, { headers });
  }
}
