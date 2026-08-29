import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Contact } from '@/lib/models/Contact';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ezyloan.co.in').replace(/\/$/, '');

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Fetch a URL with a timeout; never throws. Returns status + timing + headers.
async function probe(url: string, ms = 8000): Promise<{
  ok: boolean; status: number; ms: number; headers: Record<string, string>;
}> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': 'EzyLoan-HealthCheck' } });
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k] = v; });
    return { ok: res.ok, status: res.status, ms: Date.now() - started, headers };
  } catch {
    return { ok: false, status: 0, ms: Date.now() - started, headers: {} };
  } finally {
    clearTimeout(t);
  }
}

// GET /api/admin/site-health — real leads/activity metrics from the DB, plus a
// live security + SEO self-check of the production site. Page-speed/SEO scores are
// a separate (slower) endpoint so this dashboard loads fast.
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();

    const today = startOfToday();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const last7 = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
    const last30 = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

    const [
      total, todayCount, yesterdayCount, last7Count, last30Count,
      bySource, byStatus, daily, contactsCount, loansCount,
      home, robots, sitemap,
    ] = await Promise.all([
      Lead.estimatedDocumentCount(),
      Lead.countDocuments({ createdAt: { $gte: today } }),
      Lead.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
      Lead.countDocuments({ createdAt: { $gte: last7 } }),
      Lead.countDocuments({ createdAt: { $gte: last30 } }),
      Lead.aggregate([
        { $match: { createdAt: { $gte: last30 } } },
        { $group: { _id: { $ifNull: ['$source', 'Unknown'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Lead.aggregate([
        { $group: { _id: { $ifNull: ['$status', 'New'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Lead.aggregate([
        { $match: { createdAt: { $gte: new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Contact.estimatedDocumentCount().catch(() => 0),
      LoanApplication.estimatedDocumentCount().catch(() => 0),
      probe(SITE_URL),
      probe(`${SITE_URL}/robots.txt`),
      probe(`${SITE_URL}/sitemap.xml`),
    ]);

    const h = home.headers;
    const has = (k: string) => !!h[k];

    // Security + SEO self-checks against the live site.
    const checks = [
      { key: 'reachable', label: 'Website reachable', ok: home.ok, detail: home.ok ? `HTTP ${home.status}` : 'No response / error', severity: 'critical' },
      { key: 'https', label: 'HTTPS / SSL', ok: SITE_URL.startsWith('https://') && home.ok, detail: SITE_URL.startsWith('https://') ? 'Served over HTTPS' : 'Not HTTPS', severity: 'critical' },
      { key: 'speed', label: 'Server response time', ok: home.ms < 1500, detail: `${home.ms} ms (home HTML)`, severity: 'warn' },
      { key: 'hsts', label: 'HSTS header', ok: has('strict-transport-security'), detail: has('strict-transport-security') ? 'Present' : 'Missing — recommended for security', severity: 'warn' },
      { key: 'xcto', label: 'X-Content-Type-Options', ok: has('x-content-type-options'), detail: has('x-content-type-options') ? 'Present' : 'Missing — prevents MIME sniffing', severity: 'warn' },
      { key: 'xfo', label: 'Clickjacking protection', ok: has('x-frame-options') || has('content-security-policy'), detail: has('x-frame-options') || has('content-security-policy') ? 'Protected' : 'Missing X-Frame-Options / CSP', severity: 'warn' },
      { key: 'referrer', label: 'Referrer-Policy', ok: has('referrer-policy'), detail: has('referrer-policy') ? 'Present' : 'Missing', severity: 'info' },
      { key: 'robots', label: 'robots.txt (SEO)', ok: robots.ok, detail: robots.ok ? 'Found' : 'Not found', severity: 'warn' },
      { key: 'sitemap', label: 'sitemap.xml (SEO)', ok: sitemap.ok, detail: sitemap.ok ? 'Found' : 'Not found', severity: 'warn' },
    ];

    const passed = checks.filter((c) => c.ok).length;
    const criticalFailing = checks.filter((c) => !c.ok && c.severity === 'critical').length;

    return NextResponse.json({
      site: SITE_URL,
      checkedAt: new Date().toISOString(),
      health: {
        score: Math.round((passed / checks.length) * 100),
        passed,
        total: checks.length,
        status: criticalFailing > 0 ? 'critical' : passed === checks.length ? 'good' : 'warn',
      },
      checks,
      leads: {
        today: todayCount,
        yesterday: yesterdayCount,
        last7: last7Count,
        last30: last30Count,
        total,
        avgPerDay: Math.round((last30Count / 30) * 10) / 10,
        bySource: bySource.map((s: any) => ({ source: s._id, count: s.count })),
        byStatus: byStatus.map((s: any) => ({ status: s._id, count: s.count })),
        daily: daily.map((d: any) => ({ date: d._id, count: d.count })),
      },
      activity: { contacts: contactsCount, loanApplications: loansCount },
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error building site health', error: error.message }, { status: 500 });
  }
}
