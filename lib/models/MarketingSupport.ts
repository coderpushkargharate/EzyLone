import mongoose, { Schema, Model } from 'mongoose';

// Small supporting collections for the marketing integration layer.

// ── Sync / integration history (shown in Marketing → Sync history) ──────────
export interface IIntegrationSyncLog {
  provider: 'meta' | 'google' | 'system';
  kind: string; // webhook | lead_fetch | backfill | capi | google_upload | google_status | insights | token_check | oauth | worker
  status: 'ok' | 'error' | 'partial' | 'info';
  message: string;
  counts?: Record<string, number>;
  durationMs?: number;
  createdAt: Date;
}

const IntegrationSyncLogSchema = new Schema<IIntegrationSyncLog>(
  {
    provider: { type: String, required: true },
    kind: { type: String, required: true },
    status: { type: String, required: true },
    message: { type: String, required: true },
    counts: { type: Schema.Types.Mixed },
    durationMs: Number,
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'integration_sync_logs' }
);
// Keep 90 days of history.
IntegrationSyncLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 86_400 });
IntegrationSyncLogSchema.index({ provider: 1, kind: 1, createdAt: -1 });

export const IntegrationSyncLog: Model<IIntegrationSyncLog> =
  (mongoose.models.IntegrationSyncLog as Model<IIntegrationSyncLog>) ||
  mongoose.model<IIntegrationSyncLog>('IntegrationSyncLog', IntegrationSyncLogSchema);

// ── OAuth state (CSRF + replay protection for the connect flows) ────────────
export interface IOAuthState {
  state: string;
  provider: 'meta' | 'google';
  sid: string; // admin session that started the flow
  userId: string;
  codeVerifier?: string; // PKCE (Google)
  createdAt: Date;
}

const OAuthStateSchema = new Schema<IOAuthState>(
  {
    state: { type: String, required: true, unique: true },
    provider: { type: String, required: true },
    sid: { type: String, required: true },
    userId: { type: String, required: true },
    codeVerifier: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'oauth_states' }
);
// A state is only valid for 10 minutes (Mongo TTL sweep + an explicit age check in code).
OAuthStateSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

export const OAuthState: Model<IOAuthState> =
  (mongoose.models.OAuthState as Model<IOAuthState>) || mongoose.model<IOAuthState>('OAuthState', OAuthStateSchema);

// ── Platform-reported ad metrics (daily, per campaign) ───────────────────────
export interface IAdMetricDaily {
  provider: 'meta' | 'google';
  accountId: string;
  date: string; // YYYY-MM-DD (account time zone)
  campaignId: string;
  campaignName?: string;
  spend: number; // in account currency units
  currency?: string;
  impressions?: number;
  clicks?: number;
  platformLeads?: number; // as reported by the platform — NOT CRM-confirmed
  fetchedAt: Date;
}

const AdMetricDailySchema = new Schema<IAdMetricDaily>(
  {
    provider: { type: String, required: true },
    accountId: { type: String, required: true },
    date: { type: String, required: true },
    campaignId: { type: String, required: true },
    campaignName: String,
    spend: { type: Number, default: 0 },
    currency: String,
    impressions: Number,
    clicks: Number,
    platformLeads: Number,
    fetchedAt: { type: Date, required: true },
  },
  { collection: 'ad_metrics_daily' }
);
AdMetricDailySchema.index({ provider: 1, accountId: 1, date: 1, campaignId: 1 }, { unique: true });
AdMetricDailySchema.index({ date: 1 });

export const AdMetricDaily: Model<IAdMetricDaily> =
  (mongoose.models.AdMetricDaily as Model<IAdMetricDaily>) ||
  mongoose.model<IAdMetricDaily>('AdMetricDaily', AdMetricDailySchema);

// ── Cached report responses (Search Console / GA4) — protects API quotas ─────
export interface IReportCache {
  key: string;
  data: unknown;
  createdAt: Date;
}
const ReportCacheSchema = new Schema<IReportCache>(
  { key: { type: String, required: true, unique: true }, data: Schema.Types.Mixed },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'report_cache' }
);
ReportCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 6 * 3600 });
export const ReportCache: Model<IReportCache> =
  (mongoose.models.ReportCache as Model<IReportCache>) || mongoose.model<IReportCache>('ReportCache', ReportCacheSchema);

// ── Cross-process job lease (PM2 cluster / multiple instances) ───────────────
export interface IJobLease {
  _id: string;
  owner: string;
  until: Date;
  lastRunAt?: Date;
}

const JobLeaseSchema = new Schema<IJobLease>(
  { _id: { type: String }, owner: String, until: Date, lastRunAt: Date },
  { collection: 'job_leases', versionKey: false }
);

export const JobLease: Model<IJobLease> =
  (mongoose.models.JobLease as Model<IJobLease>) || mongoose.model<IJobLease>('JobLease', JobLeaseSchema);

// ── Encryption-key fingerprint (detects a missing or replaced key) ────────────
export interface IKeyCheck {
  _id: string; // 'encryption'
  fingerprint: string; // HMAC of the key — cannot be used to recover it
  createdAt: Date;
}

const KeyCheckSchema = new Schema<IKeyCheck>(
  { _id: { type: String }, fingerprint: { type: String, required: true }, createdAt: { type: Date, default: Date.now } },
  { collection: 'key_checks', versionKey: false }
);

export const KeyCheck: Model<IKeyCheck> =
  (mongoose.models.KeyCheck as Model<IKeyCheck>) || mongoose.model<IKeyCheck>('KeyCheck', KeyCheckSchema);
