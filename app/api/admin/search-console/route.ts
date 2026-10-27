import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { SITE_URL } from '@/lib/seo';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import { inspectUrl, listSitemaps, searchPerformance } from '@/lib/marketing/google/reporting';
import { PlatformError } from '@/lib/marketing/types';
import { MarketingConfigError } from '@/lib/marketing/secrets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Live Google Search Console numbers for the "SEO & Traffic" tab, in the shape
// components/admin/sa/SearchConsolePanel.tsx expects. Uses the Google account
// connected in Marketing & Ads (OAuth) — no separate service account needed.
// Reports are cached in report_cache by lib/marketing/google/reporting.ts;
// ?refresh=1 fetches fresh numbers.

const ymd = (d: Date) => d.toISOString().slice(0, 10);
function range(days: number) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 1); // up to yesterday
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { startDate: ymd(start), endDate: ymd(end) };
}

type Row = { key: string; clicks: number; impressions: number; ctr: number | null; position: number | null };
const slim = (r: Row) => ({ key: r.key, clicks: r.clicks, impressions: r.impressions, ctr: r.ctr ?? 0, position: r.position ?? 0 });
const totals = (t: { clicks: number; impressions: number; ctr: number | null; position: number | null }) =>
  ({ clicks: t.clicks, impressions: t.impressions, ctr: t.ctr ?? 0, position: t.position ?? 0 });

function statusOf(e: unknown): { status: string; message: string } {
  if (e instanceof PlatformError) {
    if (e.kind === 'config') return { status: /property/i.test(e.message) ? 'no_access' : 'not_configured', message: e.message };
    if (e.kind === 'auth') return { status: 'auth_failed', message: e.message };
    if (e.kind === 'permission') return { status: /not been used|disabled/i.test(e.message) ? 'api_disabled' : 'no_access', message: e.message };
    return { status: 'api_error', message: e.message };
  }
  if (e instanceof MarketingConfigError) return { status: 'not_configured', message: e.message };
  console.error('[search-console]', e instanceof Error ? e.message : e);
  return { status: 'api_error', message: 'Unexpected error — see server logs.' };
}

export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: ['seoTraffic', 'marketing'] });
  if ('error' in gate) return gate.error;
  const headers = { 'Cache-Control': 'private, no-store' };
  const sp = req.nextUrl.searchParams;
  const asked = Number(sp.get('days'));
  const days = [7, 28, 90].includes(asked) ? asked : 28;
  let fresh = sp.get('refresh') === '1';
  if (fresh && checkRateLimit(req, 'seo-sc-fresh', { windowMs: 5 * 60_000, max: 10, message: 'Refreshed recently.' })) fresh = false;

  try {
    const cur = range(days);
    const perf = await searchPerformance(cur.startDate, cur.endDate, { fresh });
    await connectDB();
    const conn = await MarketingConnection.findOne({ provider: 'google' }).lean();
    const permission = conn?.google?.sites?.find((s) => s.siteUrl === perf.site)?.permissionLevel || '';

    const [sitemaps, home] = await Promise.all([
      listSitemaps().catch(() => [] as Awaited<ReturnType<typeof listSitemaps>>),
      inspectUrl(`${SITE_URL}/`).catch(() => null),
    ]);

    // One point per day (missing days = 0) so the chart has no gaps.
    const byDate = new Map(perf.trend.map((r) => [r.key, r]));
    const daily: { date: string; clicks: number; impressions: number; position: number }[] = [];
    for (let d = new Date(cur.startDate + 'T00:00:00Z'); ymd(d) <= cur.endDate; d.setUTCDate(d.getUTCDate() + 1)) {
      const r = byDate.get(ymd(d));
      daily.push({ date: ymd(d), clicks: r?.clicks || 0, impressions: r?.impressions || 0, position: r?.position || 0 });
    }

    const data = {
      status: 'ok',
      days,
      fetchedAt: perf.fetchedAt,
      site: perf.site,
      permission,
      range: cur,
      totals: totals(perf.totals),
      previous: totals(perf.previousTotals),
      daily,
      queries: perf.queries.slice(0, 50).map(slim),
      pages: perf.pages.slice(0, 50).map(slim),
      countries: perf.countries.map(slim),
      devices: perf.devices.map(slim),
      sitemaps: sitemaps.map((m) => {
        const contents = (m.contents as { submitted?: string }[] | undefined) || [];
        return {
          path: String(m.path || ''),
          lastSubmitted: (m.lastSubmitted as string) || null,
          lastDownloaded: (m.lastDownloaded as string) || null,
          pending: !!m.isPending,
          errors: Number(m.errors || 0),
          warnings: Number(m.warnings || 0),
          submitted: contents.reduce((a, c) => a + Number(c.submitted || 0), 0),
        };
      }),
      homepage: home
        ? {
            url: home.url,
            verdict: String(home.verdict || 'UNKNOWN'),
            coverage: String(home.coverageState || ''),
            lastCrawl: (home.lastCrawlTime as string) || null,
            canonical: String(home.googleCanonical || ''),
            robots: String(home.robotsTxtState || ''),
            fetch: String(home.pageFetchState || ''),
          }
        : null,
    };
    return NextResponse.json({ data }, { headers });
  } catch (e) {
    return NextResponse.json({ data: statusOf(e) }, { headers });
  }
}
