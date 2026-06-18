import type { MetadataRoute } from 'next';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';

const BASE_URL = 'https://www.ezyloan.co.in';

// Refresh the sitemap hourly so newly published blogs get picked up.
export const revalidate = 3600;

/**
 * Static, indexable routes.
 * NOTE: /admin, /login and /ThankYouPage are intentionally excluded — they are
 * either private or post-conversion pages that should not appear in search.
 * /blog/[slug] is dynamic; add a data source here to emit blog URLs.
 */
const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/apply-now', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/blogs', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/personal-loan', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/car-loan', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/car-loan-balance-transfer', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/car-loan-refinance', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/car-loan-topup', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/commercial-vehicle-loan', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/property-loan', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/emi-calculator', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/lending-partners', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/careers', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/compliance', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/loan-disclosure', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms-and-conditions', priority: 0.3, changeFrequency: 'yearly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = routes.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  // Dynamic: every published blog post.
  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    await connectDB();
    const blogs = await Blog.find({}, 'slug updatedAt createdAt').lean();
    blogEntries = blogs.map((b: any) => ({
      url: `${BASE_URL}/blog/${b.slug}`,
      lastModified: b.updatedAt || b.createdAt || now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    // If the DB is briefly unavailable, still return the static sitemap.
  }

  return [...staticEntries, ...blogEntries];
}
