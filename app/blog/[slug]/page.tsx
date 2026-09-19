import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';
import { PUBLIC_BLOG_FILTER } from '@/lib/blog';

// Server-rendered so search engines & social crawlers get full content + meta.
// Revalidated every 10 min; refreshed immediately on publish/edit/unpublish via
// revalidatePath(`/blog/<slug>`).
export const revalidate = 600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ezyloan.co.in';
const ORG_NAME = 'EzyLoan (Dibyansh Associates)';

interface BlogDoc {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category?: string;
  image?: string;
  featuredImageAlt?: string;
  author?: string;
  authorBio?: string;
  tags?: string[];
  focusKeyword?: string;
  secondaryKeywords?: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  publishedAt?: string;
  modifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Cached per-request so generateMetadata + the page share one DB query.
const getBlog = cache(async (slug: string): Promise<BlogDoc | null> => {
  try {
    await connectDB();
    return (await Blog.findOne({ slug, ...PUBLIC_BLOG_FILTER }).lean()) as BlogDoc | null;
  } catch {
    return null;
  }
});

// If a published post used this slug in the past, return its CURRENT slug so we
// can 301 the old URL to the new one (no broken indexed URLs).
const getRedirectTarget = cache(async (slug: string): Promise<string | null> => {
  try {
    await connectDB();
    const b = (await Blog.findOne({ previousSlugs: slug, ...PUBLIC_BLOG_FILTER }, 'slug').lean()) as
      | { slug: string }
      | null;
    return b?.slug || null;
  } catch {
    return null;
  }
});

const getRelated = cache(async (blog: BlogDoc): Promise<BlogDoc[]> => {
  try {
    await connectDB();
    const or: any[] = [];
    if (blog.category) or.push({ category: blog.category });
    if (blog.tags && blog.tags.length) or.push({ tags: { $in: blog.tags } });
    const match: any = { slug: { $ne: blog.slug }, ...PUBLIC_BLOG_FILTER };
    if (or.length) match.$and = [{ $or: or }];
    const rows = (await Blog.find(match, 'title slug excerpt image featuredImageAlt category publishedAt createdAt')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(3)
      .lean()) as unknown as BlogDoc[];
    return rows;
  } catch {
    return [];
  }
});

// ---- Per-blog SEO metadata ----
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlog(params.slug);
  if (!blog) return { title: 'Blog Not Found', robots: { index: false, follow: true } };

  const canonical = blog.canonicalUrl?.trim() || `${SITE_URL}/blog/${blog.slug}`;
  const title = (blog.seoTitle || blog.title).trim();
  const description = (blog.seoDescription || blog.excerpt || blog.title).slice(0, 160);
  const ogTitle = blog.ogTitle || title;
  const ogDescription = blog.ogDescription || description;
  const ogImage = blog.ogImage || blog.image;
  const keywords = [blog.focusKeyword, ...(blog.secondaryKeywords || []), ...(blog.tags || []), blog.category]
    .filter(Boolean) as string[];

  return {
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    authors: blog.author ? [{ name: blog.author }] : undefined,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: ogTitle,
      description: ogDescription,
      siteName: 'EzyLoan',
      images: ogImage ? [{ url: ogImage, alt: blog.featuredImageAlt || blog.title }] : undefined,
      publishedTime: blog.publishedAt || blog.createdAt,
      modifiedTime: blog.modifiedAt || blog.updatedAt || blog.createdAt,
      authors: blog.author ? [blog.author] : undefined,
      section: blog.category,
      tags: blog.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function BlogDetails({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug);

  if (!blog) {
    // Old slug of a still-published post? 301 to the new URL. Otherwise 404.
    const target = await getRedirectTarget(params.slug);
    if (target) permanentRedirect(`/blog/${target}`);
    notFound();
  }

  const url = blog.canonicalUrl?.trim() || `${SITE_URL}/blog/${blog.slug}`;
  const published = blog.publishedAt || blog.createdAt;
  const modified = blog.modifiedAt || blog.updatedAt || published;
  const related = await getRelated(blog);

  const keywords = [blog.focusKeyword, ...(blog.secondaryKeywords || []), ...(blog.tags || [])]
    .filter(Boolean) as string[];

  // BlogPosting structured data — mirrors the visible page.
  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title.slice(0, 110),
    description: blog.seoDescription || blog.excerpt,
    image: blog.image ? [blog.image] : [`${SITE_URL}/og-image.jpg`],
    datePublished: published,
    dateModified: modified,
    author: blog.author
      ? { '@type': 'Person', name: blog.author }
      : { '@type': 'Organization', name: ORG_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'EzyLoan',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    ...(blog.category ? { articleSection: blog.category } : {}),
    ...(keywords.length ? { keywords: keywords.join(', ') } : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blogs` },
      { '@type': 'ListItem', position: 3, name: blog.title, item: url },
    ],
  };

  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="text-blue-600 hover:underline">Home</Link></li>
          <li aria-hidden className="mx-1">›</li>
          <li><Link href="/blogs" className="text-blue-600 hover:underline">Blog</Link></li>
          {blog.category && (
            <>
              <li aria-hidden className="mx-1">›</li>
              <li className="text-gray-500">{blog.category}</li>
            </>
          )}
          <li aria-hidden className="mx-1">›</li>
          <li aria-current="page" className="text-gray-700 truncate max-w-[60vw]">{blog.title}</li>
        </ol>
      </nav>

      {/* Header — single H1 */}
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">{blog.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
          {blog.author && <span>By <strong className="font-medium text-gray-800">{blog.author}</strong></span>}
          {published && <time dateTime={new Date(published).toISOString()}>📅 {fmt(published)}</time>}
          {modified && modified !== published && (
            <time dateTime={new Date(modified).toISOString()}>Updated {fmt(modified)}</time>
          )}
          {blog.category && <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs">{blog.category}</span>}
        </div>
      </header>

      {/* Featured image (LCP) */}
      {blog.image && (
        <figure className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.image}
            alt={blog.featuredImageAlt || blog.title}
            width={768}
            height={432}
            fetchPriority="high"
            className="w-full rounded-xl object-cover max-h-[420px] shadow"
          />
          {blog.featuredImageAlt && <figcaption className="sr-only">{blog.featuredImageAlt}</figcaption>}
        </figure>
      )}

      {/* Content (server-rendered HTML — fully crawlable) */}
      <div
        dangerouslySetInnerHTML={{ __html: blog.content }}
        className="blog-content"
        style={{ lineHeight: 1.8, color: '#333', fontSize: '1.08rem' }}
      />

      {/* Author bio (E-E-A-T, trust for financial content) */}
      {blog.author && blog.authorBio && (
        <aside className="mt-10 p-5 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-sm font-semibold text-gray-800">About the author</p>
          <p className="text-sm text-gray-600 mt-1"><strong>{blog.author}</strong> — {blog.authorBio}</p>
        </aside>
      )}

      {/* CTA + internal links */}
      <div className="mt-10 p-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-center">
        <p className="text-lg font-semibold mb-3">Ready to apply for a loan?</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/apply-now" className="px-5 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50">Apply Now</Link>
          <Link href="/emi-calculator" className="px-5 py-2 bg-blue-700/40 rounded-lg font-semibold hover:bg-blue-700/60">EMI Calculator</Link>
          <Link href="/contact" className="px-5 py-2 bg-blue-700/40 rounded-lg font-semibold hover:bg-blue-700/60">Contact Us</Link>
        </div>
      </div>

      {/* Share */}
      <div className="mt-8 pt-5 border-t border-gray-100 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-500">Share:</span>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-md text-white text-sm font-medium" style={{ backgroundColor: '#1da1f2' }}>Twitter/X</a>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-md text-white text-sm font-medium" style={{ backgroundColor: '#0a66c2' }}>LinkedIn</a>
        <a href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + url)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-md text-white text-sm font-medium" style={{ backgroundColor: '#25d366' }}>WhatsApp</a>
      </div>

      {/* Related blogs (published only) */}
      {related.length > 0 && (
        <section className="mt-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-xl font-bold text-gray-900 mb-4">Related articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map((r) => (
              <Link key={r._id} href={`/blog/${r.slug}`} className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {r.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image} alt={r.featuredImageAlt || r.title} width={300} height={160} loading="lazy" className="w-full h-32 object-cover" />
                )}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{r.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Link href="/blogs" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">← View all articles</Link>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content h1, .blog-content h2, .blog-content h3 { margin: 1.5em 0 0.6em; color: #1a1a1a; line-height: 1.4; font-weight: 700; }
        .blog-content h2 { font-size: 1.5rem; } .blog-content h3 { font-size: 1.25rem; }
        /* Demote any stray H1 in body content so the page keeps exactly one H1 (the title). */
        .blog-content h1 { font-size: 1.5rem; }
        .blog-content p { margin: 1em 0; }
        .blog-content ul, .blog-content ol { margin: 1em 0; padding-left: 24px; }
        .blog-content li { margin: 0.5em 0; }
        .blog-content a { color: #1a73e8; text-decoration: underline; }
        .blog-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; }
        .blog-content table { width: 100%; border-collapse: collapse; margin: 1.5em 0; display: block; overflow-x: auto; }
        .blog-content th, .blog-content td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
        .blog-content blockquote { margin: 1.5em 0; padding: 12px 18px; border-left: 4px solid #1a73e8; background: #f8fafc; color: #475569; font-style: italic; }
        .blog-content code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        .blog-content pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 1.5em 0; }
      ` }} />
    </article>
  );
}
