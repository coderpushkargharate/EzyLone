import mongoose, { Schema, Document, Model } from 'mongoose';

// Lead-source integration credentials (Facebook / WhatsApp), stored in the
// shared `integrations` collection — same model EzyLoanCrm uses.

export type IntegrationProvider = 'facebook' | 'whatsapp';

export interface IIntegration extends Document {
  provider: IntegrationProvider;
  enabled: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>;
  connectedAt?: Date;
  updatedAt: Date;
}

const IntegrationSchema = new Schema<IIntegration>(
  {
    provider: { type: String, required: true, unique: true, enum: ['facebook', 'whatsapp'] },
    enabled: { type: Boolean, default: false },
    config: { type: Schema.Types.Mixed, default: {} },
    connectedAt: { type: Date },
  },
  { timestamps: true }
);

export const Integration: Model<IIntegration> =
  (mongoose.models.Integration as Model<IIntegration>) ||
  mongoose.model<IIntegration>('Integration', IntegrationSchema);
