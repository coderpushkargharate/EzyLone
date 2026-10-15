import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { ConversionEvent } from '@/lib/models/ConversionEvent';
import type { IConversionEvent } from '@/lib/models/ConversionEvent';
import { JobLease } from '@/lib/models/MarketingSupport';
import { deliverMetaEvent } from './meta/capi';
import { deliverGoogleEvent, verifyGoogleEvent } from './google/deliver';
import type { DeliveryOutcome } from './delivery';
import { processDueReceipts } from './meta/leads';
import { checkGoogleHealth, checkMetaHealth } from './health';
import { syncGoogleMetrics, syncMetaInsights } from './insights';
import { backoffMs, shouldDeadLetter, MAX_ATTEMPTS } from './retry';
import { mlog, syncLog } from './log';

// Durable, restart-safe background processing on MongoDB (the deployment is a
// long-running `next start` under PM2 with no separate queue service).
//
//  - Work items are claimed atomically with findOneAndUpdate + a time-boxed
//    lease (lockedUntil). Several processes (PM2 cluster) can run safely.
//  - A process that dies mid-job leaves an expired lease; the item is reclaimed.
//    Re-sending is safe because Meta de-duplicates on event_id and Google on
//    transactionId, both stable per ledger row.
//  - Every failure is recorded on the row (history + lastError). Retries use
//    exponential backoff; after MAX_ATTEMPTS the row is dead-lettered ("dead"),
//    never dropped, and can be retried from the admin panel.

const LEASE_MS = 2 * 60_000;
const VERIFY_DELAY_MS = 15 * 60_000;
const OWNER = `${process.pid}-${crypto.randomBytes(4).toString('hex')}`;

async function claimEvent(): Promise<IConversionEvent | null> {
  const now = new Date();
  return ConversionEvent.findOneAndUpdate(
    {
      $or: [
        { status: { $in: ['pending', 'retry'] }, nextAttemptAt: { $lte: now } },
        { status: 'processing', lockedUntil: { $lt: now } },
      ],
    },
    { $set: { status: 'processing', lockedUntil: new Date(now.getTime() + LEASE_MS), lockId: OWNER }, $inc: { attempts: 1 } },
    { sort: { nextAttemptAt: 1 }, new: true }
  ).lean<IConversionEvent>();
}

async function claimVerification(): Promise<IConversionEvent | null> {
  const now = new Date();
  return ConversionEvent.findOneAndUpdate(
    { status: 'submitted', nextAttemptAt: { $lte: now }, $or: [{ lockedUntil: null }, { lockedUntil: { $lt: now } }] },
    { $set: { lockedUntil: new Date(now.getTime() + LEASE_MS), lockId: OWNER } },
    { sort: { nextAttemptAt: 1 }, new: true }
  ).lean<IConversionEvent>();
}

/** Persist a delivery outcome; only the lease holder may write (guards against a slow, superseded worker). */
export async function applyOutcome(ev: IConversionEvent, out: DeliveryOutcome, phase: 'deliver' | 'verify'): Promise<void> {
  let status = out.status;
  let nextAttemptAt = new Date();
  if (status === 'retry') {
    if (shouldDeadLetter(ev.attempts)) {
      status = 'dead';
      out = { ...out, message: `Dead-lettered after ${MAX_ATTEMPTS} attempts. Last error: ${out.message}` };
    } else {
      nextAttemptAt = new Date(Date.now() + backoffMs(ev.attempts, { rateLimited: out.rateLimited }));
    }
  }
  if (status === 'submitted') nextAttemptAt = new Date(Date.now() + VERIFY_DELAY_MS);

  const set: Record<string, unknown> = {
    status,
    nextAttemptAt,
    lockedUntil: null,
    lockId: null,
    errorKind: out.errorKind,
    lastError: ['sent', 'submitted', 'accepted', 'retracted'].includes(status) ? null : out.message.slice(0, 1000),
  };
  if (out.traceId) set.platformTraceId = out.traceId;
  if (out.requestId) set.platformRequestId = out.requestId;
  if ((status === 'sent' || status === 'submitted') && phase === 'deliver') set.deliveredAt = new Date();

  const update: Record<string, unknown> = {
    $set: set,
    $push: { history: { $each: [{ at: new Date(), status, message: out.message.slice(0, 1000), httpStatus: out.httpStatus, traceId: out.traceId }], $slice: -50 } },
  };
  if (phase === 'verify') update.$inc = { verifyAttempts: 1 };
  const res = await ConversionEvent.updateOne({ _id: ev._id, lockId: OWNER }, update);
  if (!res.modifiedCount) mlog('warn', 'outcome_dropped_lease_lost', { eventId: String(ev._id) });
}

async function deliver(ev: IConversionEvent): Promise<DeliveryOutcome> {
  try {
    return ev.platform === 'meta' ? await deliverMetaEvent(ev) : await deliverGoogleEvent(ev);
  } catch (e) {
    // Unexpected local error (DB blip, bug): retry with backoff, never drop.
    return { status: 'retry', errorKind: 'transient', message: `Unexpected error: ${e instanceof Error ? e.message : String(e)}` };
  }
}

export async function processDueEvents(limit = 50): Promise<Record<string, number>> {
  await connectDB();
  const counts: Record<string, number> = {};
  for (let i = 0; i < limit; i++) {
    const ev = await claimEvent();
    if (!ev) break;
    const out = await deliver(ev);
    await applyOutcome(ev, out, 'deliver');
    counts[out.status] = (counts[out.status] || 0) + 1;
  }
  for (let i = 0; i < limit; i++) {
    const ev = await claimVerification();
    if (!ev) break;
    let out: DeliveryOutcome;
    try {
      out = await verifyGoogleEvent(ev);
    } catch (e) {
      out = { status: 'submitted', message: `Status check error: ${e instanceof Error ? e.message : String(e)}` };
    }
    await applyOutcome(ev, out, 'verify');
    counts[`verify_${out.status}`] = (counts[`verify_${out.status}`] || 0) + 1;
  }
  return counts;
}

/** Run a periodic job at most once per interval across all processes. */
async function periodic(name: string, everyMs: number, fn: () => Promise<unknown>): Promise<void> {
  const now = new Date();
  let lease;
  try {
    lease = await JobLease.findOneAndUpdate(
      { _id: name, $or: [{ until: { $lt: now } }, { until: { $exists: false } }] },
      { $set: { owner: OWNER, until: new Date(now.getTime() + everyMs), lastRunAt: now } },
      { upsert: true, new: true }
    ).lean();
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return; // another process holds it
    throw e;
  }
  if (!lease || lease.owner !== OWNER) return;
  try {
    await fn();
  } catch (e) {
    mlog('error', 'periodic_job_failed', { job: name, error: e instanceof Error ? e.message : String(e) });
  }
}

let running = false;

/** One worker pass. Safe to call concurrently (re-entrancy guarded per process; DB leases across processes). */
export async function runWorkerTick(opts: { periodicJobs?: boolean } = {}): Promise<Record<string, unknown>> {
  if (running) return { skipped: 'already running' };
  running = true;
  const started = Date.now();
  try {
    await connectDB();
    const leads = await processDueReceipts(25);
    const events = await processDueEvents(50);
    if (opts.periodicJobs !== false) {
      await periodic('marketing:health', 6 * 3_600_000, async () => {
        await checkMetaHealth();
        await checkGoogleHealth();
      });
      await periodic('marketing:insights', 6 * 3_600_000, async () => {
        await syncMetaInsights(30).catch(() => undefined);
        await syncGoogleMetrics(30).catch(() => undefined);
      });
    }
    const summary = { leads, events, ms: Date.now() - started };
    const did = Object.keys(leads).length + Object.keys(events).length;
    if (did) await syncLog('system', 'worker', 'info', `Worker pass: leads ${JSON.stringify(leads)}, events ${JSON.stringify(events)}`, { durationMs: Date.now() - started });
    return summary;
  } finally {
    running = false;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _marketingWorker: NodeJS.Timeout | undefined;
}

/** Start the in-process scheduler (called once from instrumentation.ts). */
export function startMarketingWorker(intervalMs = 30_000): void {
  if (global._marketingWorker) return;
  global._marketingWorker = setInterval(() => {
    runWorkerTick().catch((e) => mlog('error', 'worker_tick_failed', { error: e instanceof Error ? e.message : String(e) }));
  }, intervalMs);
  global._marketingWorker.unref?.();
  mlog('info', 'worker_started', { intervalMs, owner: OWNER });
}
