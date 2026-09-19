import mongoose, { Schema, Document, Model } from 'mongoose';

// Publishing workflow states. A blog is ONLY visible to the public when its
// status is 'published' (see PUBLIC_BLOG_FILTER in lib/blog.ts). Legacy records
// created before this workflow existed have no `status` field at all — those are
// treated as published too, so nothing that was live before silently disappears.
export type BlogStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
export const BLOG_STATUSES: BlogStatus[] = ['draft', 'pending', 'published', 'rejected', 'archived'];

export interface IBlog extends Document {
  // --- existing fields (unchanged, fully backward compatible) ---
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  image: string;

  // --- workflow ---
  status: BlogStatus;
  rejectionReason?: string;
  publishedAt?: Date;
  modifiedAt?: Date;

  // --- slug history for 301 redirects when a published slug changes ---
  previousSlugs: string[];

  // --- authorship (real, admin-entered) ---
  author?: string;
  authorBio?: string;

  // --- taxonomy ---
  tags: string[];

  // --- image SEO ---
  featuredImageAlt?: string;

  // --- SEO overrides (fall back to title/excerpt/image when empty) ---
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  secondaryKeywords: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;

  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: String,
    slug: { type: String, unique: true },
    content: String,
    excerpt: String,
    category: String,
    image: String,

    status: {
      type: String,
      enum: BLOG_STATUSES,
      default: 'draft',
      index: true,
    },
    rejectionReason: String,
    publishedAt: Date,
    modifiedAt: Date,

    previousSlugs: { type: [String], default: [] },

    author: String,
    authorBio: String,

    tags: { type: [String], default: [] },

    featuredImageAlt: String,

    seoTitle: String,
    seoDescription: String,
    focusKeyword: String,
    secondaryKeywords: { type: [String], default: [] },
    canonicalUrl: String,
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Fast lookups when an old slug is requested (301 redirect path).
BlogSchema.index({ previousSlugs: 1 });

export const Blog: Model<IBlog> =
  (mongoose.models.Blog as Model<IBlog>) || mongoose.model<IBlog>('Blog', BlogSchema);
