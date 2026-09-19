import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';
import { PUBLIC_BLOG_FILTER } from '@/lib/blog';

// Server-rendered so the full list is crawlable HTML (no JS-only navigation).
// Revalidated every 10 min; also refreshed immediately on publish/unpublish via
// revalidatePath('/blogs').
export const revalidate = 600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ezyloan.co.in';

interface BlogCard {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  featuredImageAlt?: string;
  category?: string;
  author?: string;
  publishedAt?: string;
  createdAt?: string;
}

async function getPublishedBlogs(): Promise<BlogCard[]> {
  try {
    await connectDB();
    return (await Blog.find(PUBLIC_BLOG_FILTER, {
      title: 1, slug: 1, excerpt: 1, image: 1, featuredImageAlt: 1,
      category: 1, author: 1, publishedAt: 1, createdAt: 1,
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean()) as unknown as BlogCard[];
  } catch {
    return [];
  }
}

function fmtDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default async function BlogsPage() {
  const blogs = await getPublishedBlogs();

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blogs` },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: blogs.slice(0, 50).map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/blog/${b.slug}`,
      name: b.title,
    })),
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {blogs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-6">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="text-blue-600 hover:underline">Home</Link></li>
          <li aria-hidden className="mx-1">›</li>
          <li aria-current="page" className="text-gray-700">Blog</li>
        </ol>
      </nav>

      <header className="mb-10 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">EzyLoan Blog</h1>
        <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
          Practical loan guides, eligibility tips, EMI help and financial advice for borrowers across Odisha and India.
        </p>
      </header>

      {blogs.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No articles published yet. Please check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <article key={b._id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <Link href={`/blog/${b.slug}`} className="block" aria-label={b.title}>
                {b.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.image}
                    alt={b.featuredImageAlt || b.title}
                    width={400}
                    height={225}
                    loading="lazy"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-cyan-50" />
                )}
              </Link>
              <div className="p-5 flex flex-col flex-grow">
                {b.category && (
                  <span className="self-start text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700 mb-2">
                    {b.category}
                  </span>
                )}
                <h2 className="text-lg font-semibold text-gray-900 leading-snug mb-2">
                  <Link href={`/blog/${b.slug}`} className="hover:text-blue-700">{b.title}</Link>
                </h2>
                {b.excerpt && <p className="text-sm text-gray-600 line-clamp-3 mb-4">{b.excerpt}</p>}
                <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                  <span>{b.author ? `${b.author} · ` : ''}{fmtDate(b.publishedAt || b.createdAt)}</span>
                  <Link href={`/blog/${b.slug}`} className="text-blue-600 font-medium hover:underline">Read more →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
