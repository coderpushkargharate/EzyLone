import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContact extends Document {
  fullName: string;
  email: string;
  phoneNumber: string;
  loanType: string;
  loanAmount: string;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    loanType: { type: String, required: true },
    loanAmount: { type: String, required: true },
    message: { type: String },
  },
  { timestamps: true }
);

export const Contact: Model<IContact> =
  (mongoose.models.Contact as Model<IContact>) || mongoose.model<IContact>('Contact', ContactSchema);
