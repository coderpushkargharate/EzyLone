import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ezyloan.co.in').replace(/\/$/, '');

// GET /api/admin/site-health/pagespeed?strategy=mobile
// Real Google PageSpeed Insights (Lighthouse) scores for the homepage:
// performance, SEO, accessibility, best-practices + Core Web Vitals.
// Works without a key at low volume; set PAGESPEED_API_KEY for reliability.
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();

  const strategy = req.nextUrl.searchParams.get('strategy') === 'desktop' ? 'desktop' : 'mobile';
  const key = process.env.PAGESPEED_API_KEY;

  const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  api.searchParams.set('url', SITE_URL);
  api.searchParams.set('strategy', strategy);
  ['performance', 'seo', 'accessibility', 'best-practices'].forEach((c) => api.searchParams.append('category', c));
  if (key) api.searchParams.set('key', key);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 55000);
  try {
    const res = await fetch(api.toString(), { signal: ctrl.signal });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return NextResponse.json(
        {
          message: 'PageSpeed API error',
          hint: res.status === 429 ? 'Rate limited — add PAGESPEED_API_KEY to .env.local for reliable results.' : (body?.error?.message || `HTTP ${res.status}`),
        },
        { status: 502 },
      );
    }
    const data = await res.json();
    const cats = data?.lighthouseResult?.categories || {};
    const audits = data?.lighthouseResult?.audits || {};

    const pct = (v: any) => (typeof v === 'number' ? Math.round(v * 100) : null);
    const metric = (id: string) => audits[id]?.displayValue || '—';

    return NextResponse.json({
      strategy,
      url: SITE_URL,
      fetchedAt: new Date().toISOString(),
      usingKey: !!key,
      scores: {
        performance: pct(cats.performance?.score),
        seo: pct(cats.seo?.score),
        accessibility: pct(cats.accessibility?.score),
        bestPractices: pct(cats['best-practices']?.score),
      },
      vitals: {
        fcp: metric('first-contentful-paint'),
        lcp: metric('largest-contentful-paint'),
        cls: metric('cumulative-layout-shift'),
        tbt: metric('total-blocking-time'),
        speedIndex: metric('speed-index'),
      },
    });
  } catch (e: any) {
    const aborted = e?.name === 'AbortError';
    return NextResponse.json(
      { message: aborted ? 'PageSpeed timed out. Please try again.' : 'PageSpeed request failed', error: e?.message },
      { status: 504 },
    );
  } finally {
    clearTimeout(timer);
  }
}
