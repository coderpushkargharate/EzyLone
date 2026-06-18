import { NextRequest, NextResponse } from 'next/server';

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

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * Returns a NextResponse (429) if the caller has exceeded the limit for `name`,
 * otherwise null (request allowed).
 */
export function checkRateLimit(
  req: NextRequest,
  name: string,
  opts: { windowMs: number; max: number; message: string }
): NextResponse | null {
  let bucket = buckets.get(name);
  if (!bucket) {
    bucket = { hits: new Map(), windowMs: opts.windowMs, max: opts.max, message: opts.message };
    buckets.set(name, bucket);
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const rec = bucket.hits.get(ip);

  if (!rec || rec.resetAt <= now) {
    bucket.hits.set(ip, { count: 1, resetAt: now + bucket.windowMs });
    return null;
  }

  rec.count += 1;
  if (rec.count > bucket.max) {
    const retryAfter = Math.ceil((rec.resetAt - now) / 1000);
    return NextResponse.json(
      { message: bucket.message },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }
  return null;
}

// Presets matching the old Express server.
export const loginRateLimit = (req: NextRequest) =>
  checkRateLimit(req, 'login', {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts. Try again in 15 minutes.',
  });

export const formRateLimit = (req: NextRequest) =>
  checkRateLimit(req, 'form', {
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: 'Too many submissions. Please try again later.',
  });
