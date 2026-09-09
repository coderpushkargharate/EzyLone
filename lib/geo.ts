import { NextRequest } from 'next/server';
import { getClientIp } from '@/lib/rateLimit';

// India-only IP gate. The owner wants leads ONLY from visitors inside India;
// out-of-country submissions must be blocked AND every lead should record the
// IP + detected country. This complements the phone-number check in the form
// routes (which blocks non-Indian numbers) with a network-level check.
//
// Design choices:
//  - Fail OPEN on any uncertainty (private/local IP, lookup timeout, provider
//    error). Losing a genuine Indian lead because a free geo-API blinked is far
//    worse than letting the occasional unresolved IP through — the phone check
//    is still a second gate. Confirmed non-IN countries are blocked.
//  - Results are cached in-memory per IP (24h) so repeat submissions and the
//    handful of daily leads never hammer the provider.
//  - Set DISABLE_GEO_BLOCK=true to turn the blocking off (still records country).

export interface GeoInfo {
  ip: string;
  country: string | null;      // e.g. "India"
  countryCode: string | null;  // e.g. "IN"
}

export interface GeoGateResult extends GeoInfo {
  allowed: boolean;
  reason: string;
}

interface CacheEntry {
  country: string | null;
  countryCode: string | null;
  at: number;
}

// Cache on the global so it survives dev hot-reloads.
declare global {
  // eslint-disable-next-line no-var
  var _geoCache: Map<string, CacheEntry> | undefined;
}
const cache = global._geoCache || new Map<string, CacheEntry>();
global._geoCache = cache;

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

// RFC1918 / loopback / link-local / IPv6 local — can't be geolocated and are
// usually dev machines, the VPS itself, or a mis-configured proxy. Allow them.
function isPrivateOrLocal(ip: string): boolean {
  if (!ip || ip === 'unknown') return true;
  if (ip === '::1' || ip.startsWith('::ffff:127.') || ip.startsWith('fe80:') || ip.startsWith('fc') || ip.startsWith('fd')) return true;
  const v4 = ip.replace(/^::ffff:/, '');
  if (v4 === '127.0.0.1' || v4.startsWith('10.') || v4.startsWith('192.168.')) return true;
  if (v4.startsWith('169.254.')) return true;
  const m = v4.match(/^172\.(\d+)\./);
  if (m) {
    const second = parseInt(m[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

// Look up a public IP's country. Returns { country, countryCode } or nulls on
// failure. Uses ipwho.is (free, HTTPS, no API key, generous limits). Cached.
async function lookupCountry(ip: string): Promise<{ country: string | null; countryCode: string | null }> {
  const cached = cache.get(ip);
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return { country: cached.country, countryCode: cached.countryCode };
  }

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 2500);
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country,country_code`, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'EzyLoan-GeoGate' },
    });
    const data = await res.json();
    if (data && data.success) {
      const entry: CacheEntry = {
        country: data.country || null,
        countryCode: (data.country_code || '').toUpperCase() || null,
        at: Date.now(),
      };
      cache.set(ip, entry);
      return { country: entry.country, countryCode: entry.countryCode };
    }
    // Provider answered but couldn't resolve — don't cache a miss aggressively.
    return { country: null, countryCode: null };
  } catch {
    return { country: null, countryCode: null };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Resolve a request's client IP + country and decide if it may submit a lead.
 * Fails open (allowed:true) for private/unresolvable IPs and provider errors.
 */
export async function geoGateIndia(req: NextRequest): Promise<GeoGateResult> {
  const ip = getClientIp(req);

  if (isPrivateOrLocal(ip)) {
    return { ip, country: null, countryCode: null, allowed: true, reason: 'private-or-local-ip' };
  }

  const { country, countryCode } = await lookupCountry(ip);

  if (!countryCode) {
    return { ip, country, countryCode, allowed: true, reason: 'geo-lookup-unavailable' };
  }

  if (process.env.DISABLE_GEO_BLOCK === 'true') {
    return { ip, country, countryCode, allowed: true, reason: 'geo-block-disabled' };
  }

  const allowed = countryCode === 'IN';
  return { ip, country, countryCode, allowed, reason: allowed ? 'india' : `blocked-${countryCode}` };
}
