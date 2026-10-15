import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { audit } from '@/lib/audit';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { ConversionEvent } from '@/lib/models/ConversionEvent';
import type { IConversionEvent } from '@/lib/models/ConversionEvent';
import { DELIVERED_STATUSES, RETRYABLE_MANUALLY } from '@/lib/marketing/types';
import { retractGoogleEvent } from '@/lib/marketing/google/deliver';
import { syncLog } from '@/lib/marketing/log';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notFound = () => NextResponse.json({ message: 'Not found' }, { status: 404 });

// GET /api/marketing/events/:id — one event with its full attempt history.
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const gate = await requireAuth(req, { permission: 'marketing' });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(id)) return notFound();
  await connectDB();
  const ev = await ConversionEvent.findById(id).lean();
  return ev ? NextResponse.json({ event: ev }) : notFound();
}

// POST /api/marketing/events/:id { action: 'retry' | 'retract' | 'dismiss_review' } — admin only.
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-event-action', { windowMs: 60_000, max: 60, message: 'Too many actions.' });
  if (limited) return limited;
  if (!isValidObjectId(id)) return notFound();
  const { action } = (await req.json().catch(() => ({}))) as { action?: string };
  await connectDB();
  const ev = await ConversionEvent.findById(id).lean<IConversionEvent>();
  if (!ev) return notFound();
  const now = new Date();
  const who = gate.auth.username;

  if (action === 'retry') {
    if (!RETRYABLE_MANUALLY.includes(ev.status)) {
      return NextResponse.json({ message: `An event in status "${ev.status}" cannot be retried.` }, { status: 409 });
    }
    // Same idempotency key and event id: the platform de-duplicates if it already has it.
    await ConversionEvent.updateOne(
      { _id: id, status: ev.status },
      {
        $set: { status: 'pending', attempts: 0, nextAttemptAt: now, lockedUntil: null, lockId: null },
        $push: { history: { $each: [{ at: now, status: 'pending', message: `Manual retry by ${who}` }], $slice: -50 } },
      }
    );
  } else if (action === 'retract') {
    if (!DELIVERED_STATUSES.includes(ev.status)) {
      return NextResponse.json({ message: 'Only delivered conversions can be retracted.' }, { status: 409 });
    }
    const outcome =
      ev.platform === 'google'
        ? await retractGoogleEvent(ev)
        : { status: 'retracted' as const, message: 'Marked retracted locally. Meta’s Conversions API has no retraction call — the event stays in Meta.' };
    await ConversionEvent.updateOne(
      { _id: id },
      {
        $set: outcome.status === 'retracted' ? { status: 'retracted', needsReview: null } : { lastError: outcome.message },
        $push: { history: { $each: [{ at: now, status: outcome.status, message: `${outcome.message} (by ${who})` }], $slice: -50 } },
      }
    );
    await syncLog(ev.platform, 'retraction', outcome.status === 'retracted' ? 'ok' : 'error', `${ev.crmEvent} ${ev.eventId}: ${outcome.message}`);
    if (outcome.status !== 'retracted') return NextResponse.json({ message: outcome.message }, { status: 502 });
  } else if (action === 'dismiss_review') {
    await ConversionEvent.updateOne(
      { _id: id },
      { $set: { needsReview: null }, $push: { history: { $each: [{ at: now, status: ev.status, message: `Review dismissed by ${who}` }], $slice: -50 } } }
    );
  } else {
    return NextResponse.json({ message: 'Unknown action.' }, { status: 400 });
  }
  await audit(gate.auth, `conversion_${action}`, `${ev.platform}:${ev.crmEvent}:${ev.eventId}`, { previousStatus: ev.status }, req);
  return NextResponse.json({ event: await ConversionEvent.findById(id).lean() });
}
