import type { Metadata } from 'next';
import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';

// Server-rendered so search engines & social crawlers get full content + meta
// tags. Regenerated at most every 10 min (fresh after admin edits, still fast).
export const revalidate = 600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ezyloan.co.in';

interface BlogDoc {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Cached per-request so generateMetadata and the page share one DB query.
const getBlog = cache(async (slug: string): Promise<BlogDoc | null> => {
  try {
    await connectDB();
    return (await Blog.findOne({ slug }).lean()) as BlogDoc | null;
  } catch {
    return null;
  }
});

// ---- Per-blog SEO metadata (title, description, OG image, canonical) ----
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlog(params.slug);
  if (!blog) return { title: 'Blog Not Found', robots: { index: false, follow: true } };

  const url = `${SITE_URL}/blog/${blog.slug}`;
  const description = (blog.excerpt || blog.title).slice(0, 160);
  const keywords = [
    blog.category,
    'loan', 'EzyLoan', 'loan tips', 'personal loan', 'car loan',
    ...blog.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
  ].filter(Boolean) as string[];

  return {
    title: blog.title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: blog.title,
      description,
      siteName: 'EzyLoan',
      images: blog.image ? [{ url: blog.image, alt: blog.title }] : undefined,
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt || blog.createdAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description,
      images: blog.image ? [blog.image] : undefined,
    },
  };
}

export default async function BlogDetails({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug);
  if (!blog) notFound();

  const url = `${SITE_URL}/blog/${blog.slug}`;

  // Article structured data — helps Google show rich results.
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.image || `${SITE_URL}/og-image.jpg`,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    author: { '@type': 'Organization', name: 'EzyLoan (Dibyansh Associates)' },
    publisher: {
      '@type': 'Organization',
      name: 'EzyLoan',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  // Breadcrumb structured data — matches the visible breadcrumb, so Google can
  // show the Home › Blogs › Title trail in search results.
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blogs', item: `${SITE_URL}/blogs` },
      { '@type': 'ListItem', position: 3, name: blog.title, item: url },
    ],
  };

  return (
    <article style={{ maxWidth: '800px', margin: 'auto', padding: '20px', marginTop: '40px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Breadcrumb */}
      <nav style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#666' }}>
        <Link href="/" style={{ color: '#1a73e8', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <Link href="/blogs" style={{ color: '#1a73e8', textDecoration: 'none' }}>Blogs</Link>
        <span style={{ margin: '0 8px' }}>›</span>
        <span style={{ color: '#333' }}>{blog.title}</span>
      </nav>

      <Link href="/blogs" style={{ color: '#1a73e8', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '20px', textDecoration: 'none', fontWeight: 500 }}>
        ← Back to Blogs
      </Link>

      {/* Featured image */}
      {blog.image && (
        <figure style={{ margin: '20px 0' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.image}
            alt={blog.title}
            style={{ width: '100%', borderRadius: '12px', maxHeight: '400px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
        </figure>
      )}

      {/* Header */}
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px', lineHeight: 1.3, color: '#1a1a1a' }}>{blog.title}</h1>
        <div style={{ display: 'flex', gap: '16px', color: '#666', fontSize: '0.9rem', flexWrap: 'wrap' }}>
          {blog.createdAt && (
            <span>📅 {new Date(blog.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          )}
          {blog.category && <span>🏷️ {blog.category}</span>}
        </div>
      </header>

      {/* Content (server-rendered HTML — fully crawlable) */}
      <div dangerouslySetInnerHTML={{ __html: blog.content }} style={{ lineHeight: 1.8, color: '#333', fontSize: '1.1rem' }} className="blog-content" />

      {/* Share */}
      <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ color: '#666', fontSize: '0.9rem' }}>Share:</span>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', backgroundColor: '#1da1f2', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Twitter</a>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', backgroundColor: '#0a66c2', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>LinkedIn</a>
        <a href={`https://wa.me/?text=${encodeURIComponent(blog.title + ' ' + url)}`} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', backgroundColor: '#25d366', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>WhatsApp</a>
      </div>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link href="/blogs" style={{ display: 'inline-block', padding: '12px 32px', backgroundColor: '#1a73e8', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>← View All Blogs</Link>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .blog-content h1, .blog-content h2, .blog-content h3 { margin: 1.5em 0 0.8em; color: #1a1a1a; line-height: 1.4; }
        .blog-content h1 { font-size: 1.8rem; } .blog-content h2 { font-size: 1.5rem; } .blog-content h3 { font-size: 1.3rem; }
        .blog-content p { margin: 1em 0; color: #333; }
        .blog-content ul, .blog-content ol { margin: 1em 0; padding-left: 24px; }
        .blog-content li { margin: 0.5em 0; color: #444; }
        .blog-content a { color: #1a73e8; text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
        .blog-content a:hover { border-bottom-color: #1a73e8; }
        .blog-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; }
        .blog-content blockquote { margin: 1.5em 0; padding: 16px 20px; border-left: 4px solid #1a73e8; background: #f8fafc; color: #475569; font-style: italic; }
        .blog-content code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.95em; }
        .blog-content pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 1.5em 0; }
      ` }} />
    </article>
  );
}
