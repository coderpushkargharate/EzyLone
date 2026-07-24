import mongoose, { Schema, Document, Model } from 'mongoose';

// Lead lives in the SAME `leads` collection that EzyLoanCrm writes to. The
// marketing site already mirrors captured contacts here via lib/crm.ts, so the
// admin Lead Management tab reads/edits the exact same records the CRM does.

export type LeadStatus =
  | 'New'
  | 'No Response'
  | 'Cold'
  | 'Warm'
  | '1. Interested'
  | '0. Not Interested'
  | 'Lost'
  | 'Converted'
  | 'Out Of Odisha';

export interface ILead extends Document {
  name: string;
  displayName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  notes?: string;
  status: LeadStatus;
  source?: string;
  sourceMessageId?: string;
  opportunitySize?: string;
  leadStage?: string;
  followUpDate?: Date;
  lastActivity?: Date;
  assignedTo?: mongoose.Types.ObjectId;
  groups?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true },
    displayName: { type: String, trim: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    notes: { type: String },
    opportunitySize: { type: String, trim: true },
    leadStage: { type: String, trim: true },
    status: {
      type: String,
      enum: ['New', 'No Response', 'Cold', 'Warm', '1. Interested', '0. Not Interested', 'Lost', 'Converted', 'Out Of Odisha'],
      default: 'New',
    },
    source: { type: String, default: 'Manual' },
    sourceMessageId: { type: String, index: true },
    followUpDate: { type: Date },
    lastActivity: { type: Date, default: Date.now },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    groups: [{ type: String }],
  },
  { timestamps: true }
);

export const Lead: Model<ILead> =
  (mongoose.models.Lead as Model<ILead>) || mongoose.model<ILead>('Lead', LeadSchema);
