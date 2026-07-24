import mongoose, { Schema, Document, Model } from 'mongoose';

// Shared `content` collection (message templates, files, links) — same as
// EzyLoanCrm's Content model so the admin Content tab and the CRM stay in sync.

export type ContentType = 'document' | 'image' | 'link' | 'article';

export interface IContent extends Document {
  title: string;
  type: ContentType;
  url?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContent>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['document', 'image', 'link', 'article'],
      default: 'link',
    },
    url: { type: String, trim: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const Content: Model<IContent> =
  (mongoose.models.Content as Model<IContent>) || mongoose.model<IContent>('Content', ContentSchema);
