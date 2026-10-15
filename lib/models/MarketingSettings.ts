import mongoose, { Schema, Model } from 'mongoose';
import type { CrmEvent } from '../marketing/types';

// Admin-editable configuration for conversion reporting (singleton row).
// Every platform mapping is OFF by default: nothing is sent to an ad platform
// until an admin explicitly maps a CRM event to it.

export interface IEventMapping {
  crmEvent: CrmEvent;
  meta: { enabled: boolean; eventName: string };
  google: { enabled: boolean; conversionActionId?: string; enhanced: boolean };
  /** Configured business value reported with the event (never a customer's loan amount). */
  value?: number;
}

export interface IMarketingSettings {
  key: 'default';
  eventMappings: IEventMapping[];
  /** Lead statuses that mean "qualified" in this CRM. */
  qualifiedStatuses: string[];
  currency: string;
  consent: {
    allowLeadIdOnlyForLeadAds: boolean;
    /** Lead Ads custom-disclaimer checkbox key that records ad-measurement consent. */
    metaLeadFormConsentKey?: string;
    websiteConsentTextVersion: string;
  };
  testMode: {
    meta: boolean;
    metaTestEventCode?: string;
    google: boolean; // validateOnly — Google checks the request but ingests nothing
  };
  leadEventSourceName: string;
  updatedBy?: string;
  updatedAt: Date;
}

export const DEFAULT_MAPPINGS: IEventMapping[] = [
  { crmEvent: 'Lead', meta: { enabled: false, eventName: 'Lead' }, google: { enabled: false, enhanced: false } },
  { crmEvent: 'QualifiedLead', meta: { enabled: false, eventName: 'QualifiedLead' }, google: { enabled: false, enhanced: true } },
  { crmEvent: 'SubmitApplication', meta: { enabled: false, eventName: 'SubmitApplication' }, google: { enabled: false, enhanced: true } },
  { crmEvent: 'ApprovedApplication', meta: { enabled: false, eventName: 'ApprovedApplication' }, google: { enabled: false, enhanced: true } },
  { crmEvent: 'LoanDisbursed', meta: { enabled: false, eventName: 'LoanDisbursed' }, google: { enabled: false, enhanced: true } },
];

const MappingSchema = new Schema<IEventMapping>(
  {
    crmEvent: { type: String, required: true },
    meta: { enabled: { type: Boolean, default: false }, eventName: String },
    google: { enabled: { type: Boolean, default: false }, conversionActionId: String, enhanced: { type: Boolean, default: false } },
    value: Number,
  },
  { _id: false }
);

const MarketingSettingsSchema = new Schema<IMarketingSettings>(
  {
    key: { type: String, default: 'default', unique: true },
    eventMappings: { type: [MappingSchema], default: () => DEFAULT_MAPPINGS },
    qualifiedStatuses: { type: [String], default: ['1. Interested'] },
    currency: { type: String, default: 'INR' },
    consent: {
      allowLeadIdOnlyForLeadAds: { type: Boolean, default: false },
      metaLeadFormConsentKey: String,
      websiteConsentTextVersion: { type: String, default: 'ad-measurement-v1' },
    },
    testMode: {
      meta: { type: Boolean, default: true },
      metaTestEventCode: String,
      google: { type: Boolean, default: true },
    },
    leadEventSourceName: { type: String, default: 'EzyLoan CRM' },
    updatedBy: String,
  },
  { timestamps: true, collection: 'marketing_settings' }
);

export const MarketingSettings: Model<IMarketingSettings> =
  (mongoose.models.MarketingSettings as Model<IMarketingSettings>) ||
  mongoose.model<IMarketingSettings>('MarketingSettings', MarketingSettingsSchema);
