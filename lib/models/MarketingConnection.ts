import mongoose, { Schema, Model } from 'mongoose';

// OAuth connection to an ad platform (one row per platform). Every token field
// holds AES-256-GCM ciphertext (lib/marketing/secrets.ts) — never plaintext —
// and no API route ever returns these fields to the browser.

export type ConnectionStatus = 'disconnected' | 'connected' | 'needs_attention' | 'expired' | 'error';

export interface IMetaPageAsset {
  id: string;
  name: string;
  tokenEnc?: string;
  tasks?: string[];
  subscribed?: boolean;
  subscribedAt?: Date;
  forms?: { id: string; name: string; status?: string }[];
}

export interface IMarketingConnection {
  _id: mongoose.Types.ObjectId;
  provider: 'meta' | 'google';
  status: ConnectionStatus;
  accountId?: string;
  accountName?: string;
  scopes: string[];
  missingScopes: string[];
  tokenEnc?: string;
  refreshTokenEnc?: string;
  tokenExpiresAt?: Date | null;
  dataAccessExpiresAt?: Date | null;
  connectedAt?: Date;
  connectedBy?: string;
  lastCheckedAt?: Date;
  lastSuccessAt?: Date;
  lastError?: { at: Date; message: string; kind?: string };
  meta?: {
    pages: IMetaPageAsset[];
    adAccounts: { id: string; name: string; currency?: string; status?: number }[];
    selectedAdAccountIds: string[];
    datasetId?: string; // Pixel / dataset id used for the Conversions API
    capiTokenEnc?: string; // Events Manager dataset access token (encrypted)
  };
  google?: {
    customerId?: string;
    loginCustomerId?: string;
    accessibleCustomers: { id: string; name?: string; currency?: string; manager?: boolean }[];
    conversionActions: { id: string; name: string; type?: string; status?: string; category?: string }[];
    currency?: string;
    searchConsoleSite?: string; // e.g. "sc-domain:ezyloan.co.in" or "https://www.ezyloan.co.in/"
    sites?: { siteUrl: string; permissionLevel?: string }[];
    ga4PropertyId?: string; // numeric property id
    ga4Properties?: { id: string; name: string; account?: string }[];
  };
  updatedAt: Date;
  createdAt: Date;
}

const MarketingConnectionSchema = new Schema<IMarketingConnection>(
  {
    provider: { type: String, enum: ['meta', 'google'], required: true, unique: true },
    status: { type: String, enum: ['disconnected', 'connected', 'needs_attention', 'expired', 'error'], default: 'disconnected' },
    accountId: String,
    accountName: String,
    scopes: { type: [String], default: [] },
    missingScopes: { type: [String], default: [] },
    tokenEnc: String,
    refreshTokenEnc: String,
    tokenExpiresAt: Date,
    dataAccessExpiresAt: Date,
    connectedAt: Date,
    connectedBy: String,
    lastCheckedAt: Date,
    lastSuccessAt: Date,
    lastError: { at: Date, message: String, kind: String },
    meta: {
      pages: { type: [Schema.Types.Mixed], default: [] },
      adAccounts: { type: [Schema.Types.Mixed], default: [] },
      selectedAdAccountIds: { type: [String], default: [] },
      datasetId: String,
      capiTokenEnc: String,
    },
    google: {
      customerId: String,
      loginCustomerId: String,
      accessibleCustomers: { type: [Schema.Types.Mixed], default: [] },
      conversionActions: { type: [Schema.Types.Mixed], default: [] },
      currency: String,
      searchConsoleSite: String,
      sites: { type: [Schema.Types.Mixed], default: [] },
      ga4PropertyId: String,
      ga4Properties: { type: [Schema.Types.Mixed], default: [] },
    },
  },
  { timestamps: true, collection: 'marketing_connections' }
);

export const MarketingConnection: Model<IMarketingConnection> =
  (mongoose.models.MarketingConnection as Model<IMarketingConnection>) ||
  mongoose.model<IMarketingConnection>('MarketingConnection', MarketingConnectionSchema);
