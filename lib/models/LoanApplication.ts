import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoanApplication extends Document {
  fullName: string;
  email?: string;
  phoneNumber: string;
  loanType: string;
  employmentType: string;
  city: string;
  pincode: string;
  cibilScore: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const LoanApplicationSchema = new Schema<ILoanApplication>(
  {
    fullName: { type: String, required: true },
    email: { type: String },
    phoneNumber: { type: String, required: true },
    loanType: { type: String, required: true },
    employmentType: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    cibilScore: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

export const LoanApplication: Model<ILoanApplication> =
  (mongoose.models.LoanApplication as Model<ILoanApplication>) ||
  mongoose.model<ILoanApplication>('LoanApplication', LoanApplicationSchema);
