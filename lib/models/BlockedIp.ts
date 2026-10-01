import mongoose, { Schema, Document, Model } from 'mongoose';

// A single blocked client IP. Submissions (contact / loan forms) from a blocked
// IP are rejected before anything is saved or any email is sent. Entries are
// added automatically (honeypot hit, repeated rate-limit abuse) or manually by
// an admin from the "Blocked IPs" tab.
export interface IBlockedIp extends Document {
  ip: string;
  reason: string;
  createdBy: string; // 'auto' or an admin username
  hits: number; // how many submissions we've blocked from this IP
  createdAt: Date;
  updatedAt: Date;
}

const BlockedIpSchema = new Schema<IBlockedIp>(
  {
    ip: { type: String, required: true, unique: true, index: true },
    reason: { type: String, default: 'manual' },
    createdBy: { type: String, default: 'auto' },
    hits: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BlockedIp: Model<IBlockedIp> =
  (mongoose.models.BlockedIp as Model<IBlockedIp>) ||
  mongoose.model<IBlockedIp>('BlockedIp', BlockedIpSchema);
