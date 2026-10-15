import mongoose, { Schema, Model } from 'mongoose';
import { CRM_EVENTS, EVENT_STATUSES, PLATFORMS } from '../marketing/types';
import type { CrmEvent, EventStatus, Platform } from '../marketing/types';

// Durable conversion-event ledger. One row per (platform, CRM event, subject),
// enforced by the UNIQUE idempotencyKey, so repeated status changes, webhook
// redeliveries, worker restarts or concurrent requests can never create a
// second upload for the same business moment.

export interface IAttemptLog {
  at: Date;
  status: EventStatus;
  message?: string;
  httpStatus?: number;
  traceId?: string;
}

export interface IConversionEvent {
  _id: mongoose.Types.ObjectId;
  idempotencyKey: string;
  platform: Platform;
  crmEvent: CrmEvent;
  platformEventName?: string; // Meta event_name / Google conversion action id
  eventId: string; // Meta event_id / Google transactionId — stable across retries
  eventTime: Date; // when the CRM business condition was met
  leadId?: mongoose.Types.ObjectId;
  loanId?: mongoose.Types.ObjectId;
  source?: string; // CRM lead source
  channel?: string;
  consentState: string;
  consentReason?: string;
  sendMode?: string;
  actionSource?: string;
  value?: number;
  currency?: string;
  testMode: boolean;
  status: EventStatus;
  attempts: number;
  nextAttemptAt: Date;
  lockedUntil?: Date | null;
  lockId?: string | null;
  lastError?: string;
  errorKind?: string;
  platformRequestId?: string; // Google Data Manager requestId
  platformTraceId?: string; // Meta fbtrace_id
  verifyAttempts: number;
  deliveredAt?: Date;
  needsReview?: string;
  history: IAttemptLog[];
  createdAt: Date;
  updatedAt: Date;
}

const AttemptSchema = new Schema<IAttemptLog>(
  { at: Date, status: String, message: String, httpStatus: Number, traceId: String },
  { _id: false }
);

const ConversionEventSchema = new Schema<IConversionEvent>(
  {
    idempotencyKey: { type: String, required: true, unique: true },
    platform: { type: String, enum: PLATFORMS, required: true },
    crmEvent: { type: String, enum: CRM_EVENTS, required: true },
    platformEventName: String,
    eventId: { type: String, required: true },
    eventTime: { type: Date, required: true },
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    loanId: { type: Schema.Types.ObjectId, ref: 'LoanApplication' },
    source: String,
    channel: String,
    consentState: { type: String, default: 'unknown' },
    consentReason: String,
    sendMode: String,
    actionSource: String,
    value: Number,
    currency: String,
    testMode: { type: Boolean, default: false },
    status: { type: String, enum: EVENT_STATUSES, default: 'pending' },
    attempts: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, default: Date.now },
    lockedUntil: { type: Date, default: null },
    lockId: { type: String, default: null },
    lastError: String,
    errorKind: String,
    platformRequestId: String,
    platformTraceId: String,
    verifyAttempts: { type: Number, default: 0 },
    deliveredAt: Date,
    needsReview: String,
    history: { type: [AttemptSchema], default: [] },
  },
  { timestamps: true, collection: 'conversion_events' }
);

// Worker claim scan, dashboard/log filters.
ConversionEventSchema.index({ status: 1, nextAttemptAt: 1 });
ConversionEventSchema.index({ createdAt: -1 });
ConversionEventSchema.index({ leadId: 1 });
ConversionEventSchema.index({ platform: 1, crmEvent: 1, status: 1 });

export const ConversionEvent: Model<IConversionEvent> =
  (mongoose.models.ConversionEvent as Model<IConversionEvent>) ||
  mongoose.model<IConversionEvent>('ConversionEvent', ConversionEventSchema);
