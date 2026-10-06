import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';
import { getAuth, hasPermission, requireAuth } from '@/lib/auth';
import { PUBLIC_BLOG_FILTER, sanitizeSlug, isValidSlug } from '@/lib/blog';
import { sanitizeBlogHtml, plainText } from '@/lib/blogHtml';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/blogs
//  - Public (or a session without blog access): only PUBLISHED blogs, trimmed fields.
//  - Admin / employee with the Blog Manager (or Overview) tab: ALL blogs.
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = await getAuth(req).catch(() => null);

    if (auth && hasPermission(auth, ['blogs', 'dashboard'])) {
      const blogs = await Blog.find().sort({ updatedAt: -1, createdAt: -1 }).lean();
      return NextResponse.json(blogs, { headers: { 'Cache-Control': 'private, no-store' } });
    }

    // Public view — published only.
    const blogs = await Blog.find(PUBLIC_BLOG_FILTER, {
      title: 1, slug: 1, excerpt: 1, image: 1, featuredImageAlt: 1,
      category: 1, author: 1, tags: 1, publishedAt: 1, createdAt: 1, updatedAt: 1,
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(200)
      .lean();
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('List blogs error:', error);
    return NextResponse.json({ message: 'Failed to load blogs' }, { status: 500 });
  }
}

// POST /api/blogs — create (Blog Manager access). Always created unpublished
// (draft by default; 'pending' allowed). Publishing happens via the status
// endpoint so the approval checklist always runs. Never trust a client status.
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { permission: 'blogs' });
  if ('error' in gate) return gate.error;
  const { auth } = gate;

  try {
    const body = await req.json();
    const title = plainText(body.title, 200);
    const content = sanitizeBlogHtml(body.content);

    if (!title || !content.trim()) {
      return NextResponse.json({ message: 'Title and content are required' }, { status: 400 });
    }

    // Slug: use provided, else derive from title. Always sanitized + validated.
    const slug = sanitizeSlug(body.slug || title);
    if (!isValidSlug(slug)) {
      return NextResponse.json({ message: 'Could not build a valid slug from the title' }, { status: 400 });
    }

    await connectDB();

    // Uniqueness across current slugs AND historical slugs (avoid resurrecting a
    // redirected URL as a different post).
    const clash = await Blog.findOne({ $or: [{ slug }, { previousSlugs: slug }] }).lean();
    if (clash) {
      return NextResponse.json({ message: 'A blog with this slug already exists' }, { status: 400 });
    }

    const requestedStatus = body.status === 'pending' ? 'pending' : 'draft';

    const blog = await Blog.create({
      title,
      slug,
      excerpt: plainText(body.excerpt, 500),
      content,
      category: plainText(body.category, 60) || 'Personal',
      image: safeUrl(body.image),
      featuredImageAlt: plainText(body.featuredImageAlt, 200),
      author: plainText(body.author, 100) || auth.name,
      authorBio: plainText(body.authorBio, 500),
      tags: normalizeList(body.tags),
      status: requestedStatus,
      seoTitle: plainText(body.seoTitle, 120),
      seoDescription: plainText(body.seoDescription, 320),
      focusKeyword: plainText(body.focusKeyword, 100),
      secondaryKeywords: normalizeList(body.secondaryKeywords),
      canonicalUrl: safeUrl(body.canonicalUrl),
      ogTitle: plainText(body.ogTitle, 120),
      ogDescription: plainText(body.ogDescription, 320),
      ogImage: safeUrl(body.ogImage),
    });

    return NextResponse.json({ message: 'Blog created', blog }, { status: 201 });
  } catch (error) {
    console.error('Create blog error:', error);
    return NextResponse.json({ message: 'Failed to create blog' }, { status: 500 });
  }
}

// Accept comma-separated strings or arrays for tag/keyword lists.
function normalizeList(v: unknown): string[] {
  const raw = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [];
  return raw.map((x) => plainText(x, 60)).filter(Boolean).slice(0, 20);
}

/** Only http(s) URLs (or site-relative paths) are stored for images/canonicals. */
function safeUrl(v: unknown): string {
  const s = String(v ?? '').trim();
  if (!s) return '';
  if (s.startsWith('/') && !s.startsWith('//')) return s.slice(0, 2000);
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? s.slice(0, 2000) : '';
  } catch {
    return '';
  }
}
