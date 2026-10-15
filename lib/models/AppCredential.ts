import mongoose, { Schema, Model } from 'mongoose';

// API keys / IDs entered in Admin → Marketing & Ads → Settings → API keys.
// Secret values are stored ONLY as AES-256-GCM ciphertext (`enc`); public IDs
// (app id, client id, pixel id, GA4 id) are stored as plain `value`.
// A server environment variable with the same name always takes precedence.

export interface IAppCredential {
  name: string;
  enc?: string;
  value?: string;
  updatedBy?: string;
  updatedAt: Date;
}

const AppCredentialSchema = new Schema<IAppCredential>(
  {
    name: { type: String, required: true, unique: true },
    enc: String,
    value: String,
    updatedBy: String,
  },
  { timestamps: { createdAt: false, updatedAt: true }, collection: 'app_credentials' }
);

export const AppCredential: Model<IAppCredential> =
  (mongoose.models.AppCredential as Model<IAppCredential>) ||
  mongoose.model<IAppCredential>('AppCredential', AppCredentialSchema);
