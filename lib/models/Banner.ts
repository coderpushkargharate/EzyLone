import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
  image: string;
  page: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    image: { type: String, required: true },
    page: {
      type: String,
      required: true,
      enum: [
        'home', 'about', 'contact', 'apply', 'car-refinance', 'used-car-refinance',
        'car-balance-transfer', 'car-top-up', 'new-car-loan', 'personal-loan',
        'property-loan', 'commercial-vehicle-loan', 'blog',
        'bank-partners', 'loan-options',
      ],
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Banner: Model<IBanner> =
  (mongoose.models.Banner as Model<IBanner>) || mongoose.model<IBanner>('Banner', BannerSchema);
