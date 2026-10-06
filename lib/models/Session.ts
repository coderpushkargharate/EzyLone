import mongoose, { Schema, Document, Model } from 'mongoose';

// Server-side record of every admin/employee login. The JWT in the auth cookie
// only carries this session's id (`sid`); each privileged request looks the
// session up, so a session can be revoked instantly (logout, password change,
// account disabled/deleted, role change) instead of living until the JWT expires.
export interface ISession extends Document {
  sid: string;
  userId: mongoose.Types.ObjectId;
  ip?: string;
  userAgent?: string;
  expiresAt: Date;
  lastSeenAt: Date;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    sid: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ip: { type: String },
    userAgent: { type: String },
    // TTL index: MongoDB removes the document once expiresAt passes.
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Session: Model<ISession> =
  (mongoose.models.Session as Model<ISession>) || mongoose.model<ISession>('Session', SessionSchema);
