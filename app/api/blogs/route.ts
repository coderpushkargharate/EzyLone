import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { PUBLIC_BLOG_FILTER, sanitizeSlug, isValidSlug } from '@/lib/blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/blogs
//  - Public (no valid admin/employee token): only PUBLISHED blogs, trimmed fields.
//  - Authenticated admin/employee: ALL blogs (any status) for the admin manager.
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const auth = verifyAuth(req);

    if (auth) {
      // Admin view — everything, newest first.
      const blogs = await Blog.find().sort({ updatedAt: -1, createdAt: -1 }).lean();
      return NextResponse.json(blogs);
    }

    // Public view — published only. (No auto-generated placeholder content:
    // mass-generated thin posts violate Google's spam policies.)
    const blogs = await Blog.find(PUBLIC_BLOG_FILTER, {
      title: 1, slug: 1, excerpt: 1, image: 1, featuredImageAlt: 1,
      category: 1, author: 1, tags: 1, publishedAt: 1, createdAt: 1, updatedAt: 1,
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();
    return NextResponse.json(blogs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/blogs — create (admin/employee only). Always created unpublished
// (draft by default; 'pending' allowed). Publishing happens via the status
// endpoint so the approval checklist always runs. Never trust a client status.
export async function POST(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) return unauthorized();

  try {
    const body = await req.json();
    const { title, excerpt, content, category, image } = body;

    if (!title || !content) {
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
      excerpt: excerpt || '',
      content,
      category: category || 'Personal',
      image: image || '',
      featuredImageAlt: body.featuredImageAlt || '',
      author: body.author || auth.name || auth.username || '',
      authorBio: body.authorBio || '',
      tags: normalizeList(body.tags),
      status: requestedStatus,
      seoTitle: body.seoTitle || '',
      seoDescription: body.seoDescription || '',
      focusKeyword: body.focusKeyword || '',
      secondaryKeywords: normalizeList(body.secondaryKeywords),
      canonicalUrl: body.canonicalUrl || '',
      ogTitle: body.ogTitle || '',
      ogDescription: body.ogDescription || '',
      ogImage: body.ogImage || '',
    });

    return NextResponse.json({ message: 'Blog created', blog }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Create blog error:', error);
    return NextResponse.json({ message: 'Failed to create blog', error: error.message }, { status: 500 });
  }
}

// Accept comma-separated strings or arrays for tag/keyword lists.
function normalizeList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map((x) => x.trim()).filter(Boolean);
  return [];
}
