import mongoose, { Schema, Document, Model } from 'mongoose';

// A KYC document attached to a loan file (uploaded to Cloudinary).
export interface ILoanDocument {
  name: string;
  url: string;
  type?: string;
  uploadedAt?: Date;
}

export type LoanPipelineStage =
  | 'New'
  | 'Login'
  | 'Sanctioned'
  | 'Disbursed'
  | 'Rejected'
  | 'On Hold';

export interface ILoanApplication extends Document {
  fullName: string;
  email?: string;
  phoneNumber: string;
  loanType: string;
  employmentType: string;
  city: string;
  pincode: string;
  cibilScore: string;
  monthlyIncome?: string;
  status: 'pending' | 'approved' | 'rejected';
  // ── Loan pipeline + commission (CRM) ──────────────────────────────
  pipelineStage: LoanPipelineStage;
  lender?: string;
  loanAmount?: number;
  sanctionedAmount?: number;
  disbursedAmount?: number;
  interestRate?: number;
  tenureMonths?: number;
  payoutPercent?: number;
  payoutAmount?: number; // auto = disbursedAmount × payoutPercent / 100
  // ── KYC documents + notes ─────────────────────────────────────────
  documents: ILoanDocument[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LoanDocumentSchema = new Schema<ILoanDocument>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

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
    monthlyIncome: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    // Loan pipeline + commission
    pipelineStage: {
      type: String,
      enum: ['New', 'Login', 'Sanctioned', 'Disbursed', 'Rejected', 'On Hold'],
      default: 'New',
    },
    lender: { type: String, trim: true },
    loanAmount: { type: Number },
    sanctionedAmount: { type: Number },
    disbursedAmount: { type: Number },
    interestRate: { type: Number },
    tenureMonths: { type: Number },
    payoutPercent: { type: Number },
    payoutAmount: { type: Number },
    // KYC documents + free-form notes
    documents: { type: [LoanDocumentSchema], default: [] },
    notes: { type: String },
  },
  { timestamps: true }
);

export const LoanApplication: Model<ILoanApplication> =
  (mongoose.models.LoanApplication as Model<ILoanApplication>) ||
  mongoose.model<ILoanApplication>('LoanApplication', LoanApplicationSchema);
