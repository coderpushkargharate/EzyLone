import { connectDB } from './db';
import { BlockedIp } from './models/BlockedIp';

// IP blocklist for the public lead forms. The hot path (every form POST) checks
// an in-memory Set so there's no per-request DB round-trip; the Set is seeded
// from MongoDB once per process and kept in sync on every write. Persisting to
// Mongo means blocks survive restarts and are shared knowledge for the admin UI.
//
// A separate in-memory "strikes" map auto-blocks an IP that keeps tripping the
// rate limiter — a persistent spammer rotating phone numbers from one IP gets
// permanently blocked after a few violations within the window.

declare global {
  // eslint-disable-next-line no-var
  var _ipBlocklist: Set<string> | undefined;
  // eslint-disable-next-line no-var
  var _ipBlocklistLoaded: boolean | undefined;
  // eslint-disable-next-line no-var
  var _ipStrikes: Map<string, { count: number; resetAt: number }> | undefined;
}

const blocked = global._ipBlocklist || new Set<string>();
global._ipBlocklist = blocked;
const strikes = global._ipStrikes || new Map<string, { count: number; resetAt: number }>();
global._ipStrikes = strikes;

function usableIp(ip: string | undefined | null): ip is string {
  return !!ip && ip !== 'unknown';
}

// Seed the in-memory Set from the DB once per process. Safe to call on every
// request — it's a no-op after the first successful load.
async function ensureLoaded(): Promise<void> {
  if (global._ipBlocklistLoaded) return;
  try {
    await connectDB();
    const docs = await BlockedIp.find({}, { ip: 1 }).lean();
    docs.forEach((d) => blocked.add(d.ip));
    global._ipBlocklistLoaded = true;
  } catch (e) {
    // If the DB is briefly unreachable, fail OPEN (don't block legit users).
    // We'll try again on the next request.
    console.error('Blocklist load failed (failing open):', e);
  }
}

/** True if this IP is currently blocked. Loads the list from DB on first use. */
export async function isBlocked(ip: string | undefined | null): Promise<boolean> {
  if (!usableIp(ip)) return false;
  await ensureLoaded();
  return blocked.has(ip);
}

/** Add an IP to the blocklist (in-memory + persisted). `by` = 'auto' or admin username. */
export async function blockIp(ip: string, reason = 'manual', by = 'auto'): Promise<void> {
  if (!usableIp(ip)) return;
  blocked.add(ip);
  strikes.delete(ip);
  try {
    await connectDB();
    await BlockedIp.updateOne(
      { ip },
      { $setOnInsert: { ip, reason, createdBy: by }, $inc: { hits: 1 } },
      { upsert: true }
    );
  } catch (e) {
    console.error('Blocklist persist failed:', e);
  }
}

/** Remove an IP from the blocklist (in-memory + persisted). */
export async function unblockIp(ip: string): Promise<void> {
  blocked.delete(ip);
  strikes.delete(ip);
  try {
    await connectDB();
    await BlockedIp.deleteOne({ ip });
  } catch (e) {
    console.error('Blocklist unblock failed:', e);
  }
}

/** Bump the blocked-hit counter for an already-blocked IP (for admin visibility). */
export async function noteBlockedHit(ip: string): Promise<void> {
  if (!usableIp(ip)) return;
  try {
    await connectDB();
    await BlockedIp.updateOne({ ip }, { $inc: { hits: 1 } });
  } catch {
    /* best effort */
  }
}

/** Full list for the admin UI, newest first. */
export async function listBlocked() {
  await connectDB();
  return BlockedIp.find().sort({ createdAt: -1 }).lean();
}

/**
 * Record a rate-limit / abuse strike against an IP. After `threshold` strikes
 * within `windowMs`, the IP is auto-blocked. Returns true if it was just blocked.
 */
export async function recordStrike(
  ip: string | undefined | null,
  reason: string,
  threshold = 3,
  windowMs = 60 * 60 * 1000 // 1 hour
): Promise<boolean> {
  if (!usableIp(ip)) return false;
  const now = Date.now();
  const rec = strikes.get(ip);
  if (!rec || rec.resetAt <= now) {
    strikes.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  rec.count += 1;
  if (rec.count >= threshold) {
    await blockIp(ip, reason, 'auto');
    return true;
  }
  return false;
}
