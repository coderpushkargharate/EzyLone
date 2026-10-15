import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import { inspectUrl, listSearchConsoleSites, listSitemaps, searchPerformance, submitSitemap } from '@/lib/marketing/google/reporting';
import { errorResponse } from '@/lib/marketing/http';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function csvCell(v: unknown): string {
  let s = v === undefined || v === null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

// GET /api/marketing/search?from&to&type=web&fresh=1[&format=csv&table=queries|pages]
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: 'marketing' });
  if ('error' in gate) return gate.error;
  const sp = req.nextUrl.searchParams;
  const fresh = sp.get('fresh') === '1';
  if (fresh) {
    const limited = checkRateLimit(req, 'marketing-sc-fresh', { windowMs: 5 * 60_000, max: 10, message: 'Refreshed recently — cached data is shown for a few minutes.' });
    if (limited) return limited;
  }
  try {
    const data = await searchPerformance(sp.get('from') || '', sp.get('to') || '', { fresh, type: sp.get('type') || 'web' });
    if (sp.get('format') === 'csv') {
      if (gate.auth.role !== 'admin') return NextResponse.json({ message: 'CSV export is admin only.' }, { status: 403 });
      const table = sp.get('table') === 'pages' ? 'pages' : 'queries';
      const rows = data[table];
      const csv = [['Key', 'Clicks', 'Impressions', 'CTR', 'Average position'], ...rows.map((r) => [r.key, r.clicks, r.impressions, r.ctr, r.position])]
        .map((r) => r.map(csvCell).join(','))
        .join('\r\n');
      await audit(gate.auth, 'export', `search_console_${table}`, { from: data.range.from, to: data.range.to, rows: rows.length }, req);
      return new NextResponse('﻿' + csv, {
        headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="search-console-${table}-${data.range.from}_${data.range.to}.csv"`, 'Cache-Control': 'private, no-store' },
      });
    }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    return errorResponse(e);
  }
}

// POST /api/marketing/search — admin only.
//   { action: 'sites' } | { action: 'select', siteUrl } | { action: 'sitemaps' }
//   { action: 'submit_sitemap', url } | { action: 'inspect', url }
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-sc-actions', { windowMs: 60_000, max: 20, message: 'Too many Search Console requests — slow down.' });
  if (limited) return limited;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    switch (body.action) {
      case 'sites':
        return NextResponse.json({ sites: await listSearchConsoleSites() });
      case 'select': {
        await connectDB();
        const siteUrl = String(body.siteUrl || '');
        const conn = await MarketingConnection.findOne({ provider: 'google' }).lean();
        if (!conn?.google?.sites?.some((s) => s.siteUrl === siteUrl)) return NextResponse.json({ message: 'Pick one of the listed properties.' }, { status: 400 });
        await MarketingConnection.updateOne({ provider: 'google' }, { $set: { 'google.searchConsoleSite': siteUrl } });
        await audit(gate.auth, 'config_change', 'search_console_property', { siteUrl });
        return NextResponse.json({ ok: true });
      }
      case 'sitemaps':
        return NextResponse.json({ sitemaps: await listSitemaps() });
      case 'submit_sitemap': {
        const url = String(body.url || '');
        await submitSitemap(url);
        await audit(gate.auth, 'sitemap_submit', url);
        return NextResponse.json({ ok: true, message: 'Submitted. Google decides when to fetch and process it.' });
      }
      case 'inspect':
        return NextResponse.json({ result: await inspectUrl(String(body.url || '').slice(0, 2048)) });
      default:
        return NextResponse.json({ message: 'Unknown action.' }, { status: 400 });
    }
  } catch (e) {
    return errorResponse(e);
  }
}
