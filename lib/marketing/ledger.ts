import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { ConversionEvent } from '@/lib/models/ConversionEvent';
import type { IConversionEvent } from '@/lib/models/ConversionEvent';
import type { CrmEvent, EventStatus, Platform } from './types';

// Idempotent writes to the conversion ledger.

export interface EnqueueInput {
  platform: Platform;
  crmEvent: CrmEvent;
  /** What the event is about: `lead:<id>` or `loan:<id>`. One event per platform+event+subject. */
  subject: { kind: 'lead' | 'loan'; id: string };
  leadId?: string | null;
  loanId?: string | null;
  eventTime: Date;
  testMode: boolean;
  platformEventName?: string;
  /** Overrides the generated id (e.g. the browser Pixel's eventID for website Lead events). */
  eventId?: string;
  consentState: string;
  consentReason: string;
  sendMode?: string;
  allowed: boolean;
  actionSource?: string;
  value?: number;
  currency?: string;
  source?: string;
  channel?: string;
}

export function idempotencyKey(i: Pick<EnqueueInput, 'platform' | 'crmEvent' | 'subject' | 'testMode'>): string {
  return `${i.platform}:${i.crmEvent}:${i.subject.kind}:${i.subject.id}${i.testMode ? ':test' : ''}`;
}

/** Stable event id — identical on every retry, so the platforms de-duplicate re-sends. */
export function stableEventId(i: Pick<EnqueueInput, 'platform' | 'crmEvent' | 'subject' | 'testMode'>): string {
  const base = i.platform === 'google'
    ? `ezy-${i.crmEvent}-${i.subject.id}` // Google transactionId (≤ 64 chars)
    : `ezy_${i.crmEvent}_${i.subject.id}`;
  return i.testMode ? `${base}${i.platform === 'google' ? '-t' : '_test'}` : base;
}

export async function enqueueConversion(i: EnqueueInput): Promise<{ created: boolean; id?: string }> {
  await connectDB();
  const key = idempotencyKey(i);
  const status: EventStatus = i.allowed ? 'pending' : 'blocked_consent';
  const now = new Date();
  const doc: Partial<IConversionEvent> = {
    idempotencyKey: key,
    platform: i.platform,
    crmEvent: i.crmEvent,
    platformEventName: i.platformEventName,
    eventId: i.eventId || stableEventId(i),
    eventTime: i.eventTime,
    leadId: i.leadId ? new mongoose.Types.ObjectId(i.leadId) : undefined,
    loanId: i.loanId ? new mongoose.Types.ObjectId(i.loanId) : undefined,
    source: i.source,
    channel: i.channel,
    consentState: i.consentState,
    consentReason: i.consentReason,
    sendMode: i.sendMode,
    actionSource: i.actionSource,
    value: i.value,
    currency: i.currency,
    testMode: i.testMode,
    status,
    attempts: 0,
    verifyAttempts: 0,
    nextAttemptAt: now,
    history: [{ at: now, status, message: i.allowed ? 'Queued' : i.consentReason }],
  };
  try {
    const res = await ConversionEvent.updateOne({ idempotencyKey: key }, { $setOnInsert: doc }, { upsert: true });
    if (res.upsertedCount) return { created: true, id: String(res.upsertedId) };
    return { created: false };
  } catch (e) {
    // Two concurrent upserts on the same key: the loser gets E11000 — the event already exists.
    if ((e as { code?: number }).code === 11000) return { created: false };
    throw e;
  }
}
