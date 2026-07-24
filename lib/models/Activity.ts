import mongoose, { Schema, Document, Model } from 'mongoose';

// Timeline entries for a Lead. Same `activities` collection as EzyLoanCrm so
// the two apps share one history per lead.

export interface IActivity extends Document {
  leadId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  type: 'note' | 'call' | 'email' | 'meeting' | 'status_change' | 'created' | 'follow_up';
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    leadId: { type: Schema.Types.ObjectId, ref: 'Lead', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: ['note', 'call', 'email', 'meeting', 'status_change', 'created', 'follow_up'],
      required: true,
    },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Activity: Model<IActivity> =
  (mongoose.models.Activity as Model<IActivity>) || mongoose.model<IActivity>('Activity', ActivitySchema);
