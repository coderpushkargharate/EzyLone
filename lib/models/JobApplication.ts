import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IJobApplication extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  jobTitle: string;
  experience?: string;
  currentCTC?: string;
  resumeUrl?: string;
  resumePublicId?: string;
  whyHire?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    jobTitle: { type: String, required: true },
    experience: { type: String },
    currentCTC: { type: String },
    resumeUrl: { type: String },
    resumePublicId: { type: String },
    whyHire: { type: String },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const JobApplication: Model<IJobApplication> =
  (mongoose.models.JobApplication as Model<IJobApplication>) ||
  mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
