import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';
import { requireAuth, forbidden } from '@/lib/auth';
import { sanitizeSlug, isValidSlug, isPublicStatus } from '@/lib/blog';
import { sanitizeBlogHtml, plainText } from '@/lib/blogHtml';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalizeList(v: unknown): string[] | undefined {
  if (v === undefined) return undefined;
  const raw = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [];
  return raw.map((x) => plainText(x, 60)).filter(Boolean).slice(0, 20);
}

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

// Short text fields and their max lengths.
const TEXT_FIELDS: Record<string, number> = {
  title: 200, excerpt: 500, category: 60, featuredImageAlt: 200, author: 100, authorBio: 500,
  seoTitle: 120, seoDescription: 320, focusKeyword: 100, ogTitle: 120, ogDescription: 320,
};
const URL_FIELDS = ['image', 'canonicalUrl', 'ogImage'];

// PUT /api/blogs/:id — update (Blog Manager access).
// Employees may only edit posts that are NOT live (draft/pending/rejected/
// archived); changing a published post's content needs an admin, so nothing
// reaches the public site without approval.
// Handles slug changes safely: when a PUBLISHED post's slug changes, the old
// slug is preserved in previousSlugs so /blog/<old> 301-redirects to /blog/<new>.
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAuth(req, { permission: 'blogs' });
  if ('error' in gate) return gate.error;
  const { auth } = gate;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });

  try {
    const { id } = params;
    const body = await req.json();
    await connectDB();

    const current = await Blog.findById(id);
    if (!current) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    if (auth.role !== 'admin' && isPublicStatus(current.status)) return forbidden();

    const update: Record<string, unknown> = {};
    for (const [field, max] of Object.entries(TEXT_FIELDS)) {
      if (body[field] !== undefined) update[field] = plainText(body[field], max);
    }
    for (const field of URL_FIELDS) {
      if (body[field] !== undefined) update[field] = safeUrl(body[field]);
    }
    if (body.content !== undefined) update.content = sanitizeBlogHtml(body.content);

    const tags = normalizeList(body.tags);
    if (tags !== undefined) update.tags = tags;
    const secondary = normalizeList(body.secondaryKeywords);
    if (secondary !== undefined) update.secondaryKeywords = secondary;

    // Slug change handling.
    let oldSlug: string | null = null;
    if (body.slug !== undefined) {
      const newSlug = sanitizeSlug(body.slug);
      if (!isValidSlug(newSlug)) {
        return NextResponse.json({ message: 'Invalid slug' }, { status: 400 });
      }
      if (newSlug !== current.slug) {
        const clash = await Blog.findOne({
          _id: { $ne: id },
          $or: [{ slug: newSlug }, { previousSlugs: newSlug }],
        }).lean();
        if (clash) {
          return NextResponse.json({ message: 'A blog with this slug already exists' }, { status: 400 });
        }
        update.slug = newSlug;
        oldSlug = current.slug;
        // Keep old slug for redirects (dedup + drop the new slug if it recurs).
        const history = new Set([...(current.previousSlugs || []), current.slug]);
        history.delete(newSlug);
        update.previousSlugs = Array.from(history);
      }
    }

    // Editing an already-published post => bump modifiedAt (dateModified).
    if (current.status === 'published') update.modifiedAt = new Date();

    const blog = await Blog.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    // Refresh public caches so edits show without a restart.
    revalidateBlog(blog?.slug, oldSlug);

    return NextResponse.json({ message: 'Blog updated', blog });
  } catch (error) {
    console.error('Update blog error:', error);
    return NextResponse.json({ message: 'Failed to update blog' }, { status: 500 });
  }
}

// DELETE /api/blogs/:id — admins may delete anything; employees only posts that
// are not live (a published URL disappearing is an admin decision).
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAuth(req, { permission: 'blogs' });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });

  try {
    await connectDB();
    const existing = await Blog.findById(params.id, 'status slug').lean();
    if (!existing) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    if (gate.auth.role !== 'admin' && isPublicStatus(existing.status)) return forbidden();

    await Blog.deleteOne({ _id: params.id });
    revalidateBlog(existing.slug, null);
    return NextResponse.json({ message: 'Blog deleted' });
  } catch (error) {
    console.error('Delete blog error:', error);
    return NextResponse.json({ message: 'Failed to delete blog' }, { status: 500 });
  }
}

function revalidateBlog(slug?: string | null, oldSlug?: string | null) {
  try {
    revalidatePath('/blogs');
    revalidatePath('/sitemap.xml');
    if (slug) revalidatePath(`/blog/${slug}`);
    if (oldSlug) revalidatePath(`/blog/${oldSlug}`);
  } catch {
    /* revalidatePath is best-effort */
  }
}
