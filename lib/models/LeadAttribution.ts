import mongoose, { Schema, Model } from 'mongoose';
import type { ConsentRecord, Touch } from '../marketing/types';

// Marketing attribution + ad-measurement consent for a CRM lead, one row per
// lead. Kept in its OWN collection (not new fields on `leads`) because the
// `leads` collection is shared with the separate EzyLoanCrm app — this way that
// app's schema and saves can never drop or clash with attribution data.

export interface ILeadAttribution {
  _id: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId;
  crmSource?: string;
  /** Acquisition channel (first touch) — never overwritten by later visits. */
  channel: string;
  /** Channel of the most recent touch. */
  lastChannel?: string;
  firstTouch?: Touch;
  lastTouch?: Touch;
  touches: number;
  /** Most recent ad click ids seen on ANY touch — a later organic visit never erases them. */
  lastAdClick?: { gclid?: string; gbraid?: string; wbraid?: string; fbclid?: string; at?: Date };
  meta?: {
    leadgenId?: string;
    pageId?: string;
    formId?: string;
    formName?: string;
    adId?: string;
    adName?: string;
    adsetId?: string;
    adsetName?: string;
    campaignId?: string;
    campaignName?: string;
    platform?: string;
    isOrganic?: boolean;
    createdTime?: Date;
  };
  fbp?: string;
  fbc?: string;
  // Browser details needed for Meta "website" events. Stored only when the
  // visitor granted ad-measurement consent.
  clientIp?: string;
  userAgent?: string;
  eventSourceUrl?: string;
  pixelEventId?: string;
  loanType?: string;
  consent: ConsentRecord;
  consentHistory: ConsentRecord[];
  lifecycle: {
    leadAt?: Date;
    qualifiedAt?: Date;
    applicationAt?: Date;
    approvedAt?: Date;
    disbursedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TouchSchema = new Schema(
  {
    utmSource: String, utmMedium: String, utmCampaign: String, utmContent: String, utmTerm: String,
    gclid: String, gbraid: String, wbraid: String, fbclid: String,
    landingPage: String, referrer: String, at: Date,
  },
  { _id: false }
);

const ConsentSchema = new Schema(
  {
    adMeasurement: { type: String, enum: ['granted', 'denied', 'unknown'], default: 'unknown' },
    source: String,
    collectedAt: Date,
    textVersion: String,
  },
  { _id: false }
);

const LeadAttributionSchema = new Schema<ILeadAttribution>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true, unique: true },
    crmSource: String,
    channel: { type: String, default: 'unknown', index: true },
    lastChannel: String,
    firstTouch: TouchSchema,
    lastTouch: TouchSchema,
    touches: { type: Number, default: 1 },
    lastAdClick: { gclid: String, gbraid: String, wbraid: String, fbclid: String, at: Date },
    meta: {
      leadgenId: { type: String, index: true, sparse: true },
      pageId: String, formId: String, formName: String,
      adId: String, adName: String, adsetId: String, adsetName: String,
      campaignId: String, campaignName: String, platform: String, isOrganic: Boolean, createdTime: Date,
    },
    fbp: String,
    fbc: String,
    clientIp: String,
    userAgent: String,
    eventSourceUrl: String,
    pixelEventId: String,
    loanType: String,
    consent: { type: ConsentSchema, default: () => ({ adMeasurement: 'unknown' }) },
    consentHistory: { type: [ConsentSchema], default: [] },
    lifecycle: { leadAt: Date, qualifiedAt: Date, applicationAt: Date, approvedAt: Date, disbursedAt: Date },
  },
  { timestamps: true, collection: 'lead_attributions' }
);

LeadAttributionSchema.index({ createdAt: -1 });
LeadAttributionSchema.index({ 'meta.campaignId': 1 });
LeadAttributionSchema.index({ 'lastTouch.utmCampaign': 1 });

export const LeadAttribution: Model<ILeadAttribution> =
  (mongoose.models.LeadAttribution as Model<ILeadAttribution>) ||
  mongoose.model<ILeadAttribution>('LeadAttribution', LeadAttributionSchema);
