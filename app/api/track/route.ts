import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getClientIp } from '@/lib/rateLimit';
import { deviceOf, isBot, locate, recordEvents, sourceOf, visitorId, type SiteEvent } from '@/lib/siteAnalytics';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Receives page views, clicks, searches and "still here" heartbeats from
// components/SiteTracker.tsx (sent with navigator.sendBeacon). Anonymous and
// cookieless — see lib/siteAnalytics.ts. Always answers 204 so a bad request
// tells a caller nothing.

type Raw = Record<string, unknown>;
const str = (v: unknown, max: number) => (typeof v === 'string' && v.length <= max ? v : undefined);
const isPath = (v: unknown): v is string => typeof v === 'string' && v.length <= 300 && v.startsWith('/');

// Quiet per-IP limit (the shared rate limiter sends security alerts, which
// would be noise for an analytics beacon).
const hits = new Map<string, { n: number; reset: number }>();
function limited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 20_000) hits.clear();
  const h = hits.get(ip);
  if (!h || h.reset < now) { hits.set(ip, { n: 1, reset: now + 10 * 60_000 }); return false; }
  return ++h.n > 300;
}

const ok = () => new NextResponse(null, { status: 204 });

export async function POST(req: NextRequest) {
  const ua = req.headers.get('user-agent') || '';
  if (isBot(ua)) return ok();
  const ip = getClientIp(req);
  if (limited(ip)) return ok();

  let body: Raw;
  try { body = JSON.parse(await req.text()); } catch { return ok(); }
  const list = Array.isArray(body?.e) ? (body.e as Raw[]).slice(0, 20) : [];
  if (!list.length) return ok();

  // The team's own browsing would skew the numbers — skip signed-in staff.
  const staff = await getAuth(req).catch(() => null);
  if (staff) return ok();

  const vid = visitorId(ip, ua);
  const host = new URL(process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).hostname;
  const at = new Date().toISOString();
  // Behind Cloudflare the real visitor IP is in its own header.
  const geo = await locate(req.headers.get('cf-connecting-ip') || req.headers.get('true-client-ip') || ip);

  const events: SiteEvent[] = [];
  for (const e of list) {
    if (!e || typeof e !== 'object' || !isPath(e.p)) continue;
    const p = e.p.split('?')[0].slice(0, 200) || '/';
    if (e.k === 'pv') {
      const r = str(e.r, 500);
      const u = str(e.u, 60);
      const w = typeof e.w === 'number' && e.w >= 0 && e.w <= 10000 ? Math.round(e.w) : undefined;
      // Only the first page of a visit says where it came from.
      const landing = r !== undefined || u !== undefined;
      events.push({ at, kind: 'pv', path: p, vid, source: landing ? sourceOf(r || '', u || '', host) || undefined : undefined, device: deviceOf(ua, w), ...geo });
    } else if (e.k === 'click') {
      const l = str(e.l, 80)?.trim();
      if (!l) continue;
      events.push({ at, kind: 'click', path: p, vid, label: l, href: str(e.h, 200), device: deviceOf(ua), ...geo });
    } else if (e.k === 'search') {
      const l = str(e.l, 80)?.replace(/\s+/g, ' ').trim();
      if (!l || l.length < 2) continue;
      events.push({ at, kind: 'search', path: p, vid, label: l, device: deviceOf(ua), ...geo });
    } else if (e.k === 'hb') {
      events.push({ at, kind: 'hb', path: p, vid, ...geo });
    }
  }
  try { await recordEvents(events); } catch (err) { console.warn('[track]', err instanceof Error ? err.message : err); }
  return ok();
}
