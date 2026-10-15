import mongoose, { Schema, Model } from 'mongoose';

// One row per Meta Lead Ads leadgen_id (UNIQUE). It is both the replay /
// duplicate-delivery guard for the webhook and the durable retry queue for
// fetching the lead's field data: a Graph API outage no longer produces an
// empty "Unknown Lead" — the receipt is retried until the data is fetched.

export interface IMetaLeadReceipt {
  _id: mongoose.Types.ObjectId;
  leadgenId: string;
  pageId?: string;
  formId?: string;
  adId?: string;
  adgroupId?: string;
  createdTime?: Date;
  receivedVia: 'webhook' | 'backfill';
  signatureVerified: boolean;
  deliveries: number;
  status: 'pending' | 'processing' | 'retry' | 'done' | 'failed' | 'dead';
  attempts: number;
  nextAttemptAt: Date;
  lockedUntil?: Date | null;
  lastError?: string;
  leadId?: mongoose.Types.ObjectId;
  leadCreated?: boolean;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MetaLeadReceiptSchema = new Schema<IMetaLeadReceipt>(
  {
    leadgenId: { type: String, required: true, unique: true },
    pageId: String,
    formId: String,
    adId: String,
    adgroupId: String,
    createdTime: Date,
    receivedVia: { type: String, enum: ['webhook', 'backfill'], default: 'webhook' },
    signatureVerified: { type: Boolean, default: false },
    deliveries: { type: Number, default: 1 },
    status: { type: String, enum: ['pending', 'processing', 'retry', 'done', 'failed', 'dead'], default: 'pending' },
    attempts: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, default: Date.now },
    lockedUntil: { type: Date, default: null },
    lastError: String,
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
    leadCreated: Boolean,
    processedAt: Date,
  },
  { timestamps: true, collection: 'meta_lead_receipts' }
);

MetaLeadReceiptSchema.index({ status: 1, nextAttemptAt: 1 });
MetaLeadReceiptSchema.index({ createdAt: -1 });

export const MetaLeadReceipt: Model<IMetaLeadReceipt> =
  (mongoose.models.MetaLeadReceipt as Model<IMetaLeadReceipt>) ||
  mongoose.model<IMetaLeadReceipt>('MetaLeadReceipt', MetaLeadReceiptSchema);
