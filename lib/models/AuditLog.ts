import mongoose, { Schema, Model } from 'mongoose';

// Append-only record of sensitive admin actions: configuration and credential
// changes, integration connect/disconnect, data exports, role/permission
// changes, manual conversion retries/retractions and blog publication changes.
// Details never contain secrets or customer contact data (see lib/audit.ts).

export interface IAuditLog {
  userId?: string;
  username?: string;
  role?: string;
  action: string;
  target: string;
  details?: Record<string, unknown>;
  ip?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: String,
    username: String,
    role: String,
    action: { type: String, required: true },
    target: { type: String, required: true },
    details: Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'audit_logs' }
);
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
// Retained for ~13 months.
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 400 * 86_400, name: 'ttl_createdAt' });

export const AuditLog: Model<IAuditLog> =
  (mongoose.models.AuditLog as Model<IAuditLog>) || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
