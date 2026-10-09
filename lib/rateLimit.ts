import { NextRequest, NextResponse } from 'next/server';
import { sendSecurityAlert } from './email';
import { ipSourceConfigured, resolveClientIp } from './clientIp';

// Simple in-memory fixed-window rate limiter, keyed by client IP. No external
// dependency — good enough to blunt login brute-force and public-form spam on a
// single VPS instance. (For multi-instance scaling, swap to a Redis backend.)

interface Record {
  count: number;
  resetAt: number;
}

interface Bucket {
  hits: Map<string, Record>;
  windowMs: number;
  max: number;
  message: string;
}

// Buckets live on the global so they survive dev hot-reloads.
declare global {
  // eslint-disable-next-line no-var
  var _rateBuckets: Map<string, Bucket> | undefined;
}
const buckets = global._rateBuckets || new Map<string, Bucket>();
global._rateBuckets = buckets;

let warnedUntrustedIp = false;

/**
 * Client IP for rate limiting / blocking — see lib/clientIp.ts for how
 * TRUSTED_IP_HEADER / TRUSTED_PROXY_HOPS make it trustworthy. Without either,
 * the value is spoofable: it is still used for rate limits, but lib/blocklist.ts
 * refuses to auto-block on it.
 */
export function getClientIp(req: NextRequest): string {
  if (!warnedUntrustedIp && process.env.NODE_ENV === 'production' && !ipSourceConfigured()) {
    warnedUntrustedIp = true;
    console.warn(
      'SECURITY: neither TRUSTED_IP_HEADER nor TRUSTED_PROXY_HOPS is set — client IPs come from the ' +
        'spoofable X-Forwarded-For header, so automatic IP blocking is disabled. See docs/EZYLOAN_AUDIT_REPORT.md.'
    );
  }
  return resolveClientIp(req.headers).ip;
}

/**
 * Returns a NextResponse (429) if the caller has exceeded the limit for `name`,
 * otherwise null (request allowed).
 */
// Fixed-window counter. Returns seconds-until-reset when over the limit, else 0.
function hit(name: string, key: string, opts: { windowMs: number; max: number; message: string }): number {
  let bucket = buckets.get(name);
  if (!bucket) {
    bucket = { hits: new Map(), windowMs: opts.windowMs, max: opts.max, message: opts.message };
    buckets.set(name, bucket);
  }
  const now = Date.now();
  // Opportunistic cleanup so the map can't grow without bound under a flood.
  if (bucket.hits.size > 10_000) {
    bucket.hits.forEach((r, k) => {
      if (r.resetAt <= now) bucket!.hits.delete(k);
    });
  }
  const rec = bucket.hits.get(key);
  if (!rec || rec.resetAt <= now) {
    bucket.hits.set(key, { count: 1, resetAt: now + bucket.windowMs });
    return 0;
  }
  rec.count += 1;
  return rec.count > bucket.max ? Math.ceil((rec.resetAt - now) / 1000) : 0;
}

function tooMany(message: string, retryAfter: number) {
  return NextResponse.json(
    { message },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

export function checkRateLimit(
  req: NextRequest,
  name: string,
  opts: { windowMs: number; max: number; message: string }
): NextResponse | null {
  const ip = getClientIp(req);
  const retryAfter = hit(name, ip, opts);
  if (!retryAfter) return null;
  // Someone is hammering this endpoint — alert (throttled inside the helper).
  sendSecurityAlert(`ratelimit-${name}`, `Rate limit hit on "${name}"`, {
    IP: ip,
    Endpoint: req.nextUrl?.pathname || name,
    'User agent': req.headers.get('user-agent') || 'unknown',
  }).catch(() => {});
  return tooMany(opts.message, retryAfter);
}

/** Per-account login throttle — independent of IP, so IP rotation doesn't help. */
export function loginIdentifierLimit(identifier: string): NextResponse | null {
  const opts = {
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts. Try again later.',
  };
  const retryAfter = hit('login-id', identifier, opts);
  return retryAfter ? tooMany(opts.message, retryAfter) : null;
}

// Presets matching the old Express server.
export const loginRateLimit = (req: NextRequest) =>
  checkRateLimit(req, 'login', {
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: 'Too many login attempts. Try again later.',
  });

// Tightened from 20 → 8 per 10 min: a real person submits once or twice, so a
// burst from one IP is spam. Repeated 429s here earn strikes toward an auto-block
// (see recordStrike in the form routes).
export const formRateLimit = (req: NextRequest) =>
  checkRateLimit(req, 'form', {
    windowMs: 10 * 60 * 1000,
    max: 8,
    message: 'Too many submissions. Please try again later.',
  });
