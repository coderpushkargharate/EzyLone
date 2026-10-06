import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';
import { PUBLIC_BLOG_FILTER } from '@/lib/blog';
import { TOPIC_CLUSTERS } from '@/lib/seo';

interface Card {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
}

/**
 * Server component: up to 3 published articles from the same topic cluster as a
 * product page (pillar → supporting content). Renders nothing when there are no
 * matching posts, so a page never shows an empty section.
 */
export default async function RelatedArticles({ topic, heading }: { topic?: string; heading: string }) {
  let posts: Card[] = [];
  try {
    await connectDB();
    const recent = (await Blog.find(PUBLIC_BLOG_FILTER, 'title slug excerpt category tags')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(60)
      .lean()) as unknown as Card[];
    const cluster = TOPIC_CLUSTERS.find((c) => c.key === topic);
    posts = (cluster
      ? recent.filter((b) => cluster.match.test([b.category, ...(b.tags || []), b.title].join(' ')))
      : recent
    ).slice(0, 3);
  } catch {
    return null; // never break a product page because the blog query failed
  }
  if (!posts.length) return null;

  return (
    <section aria-labelledby="related-articles-heading" className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 id="related-articles-heading" className="text-2xl font-bold text-gray-900 mb-6">{heading}</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {posts.map((p) => (
            <li key={p._id}>
              <Link
                href={`/blog/${p.slug}`}
                className="block h-full rounded-xl bg-white border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition"
              >
                {p.category && <span className="text-xs font-medium text-blue-700">{p.category}</span>}
                <span className="mt-1 block font-semibold text-gray-900 leading-snug">{p.title}</span>
                {p.excerpt && <span className="mt-2 block text-sm text-gray-600 line-clamp-3">{p.excerpt}</span>}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm">
          <Link href="/blogs" className="text-blue-700 font-medium hover:underline">Browse all loan guides →</Link>
        </p>
      </div>
    </section>
  );
}
