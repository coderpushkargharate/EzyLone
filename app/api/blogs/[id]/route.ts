import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { sanitizeSlug, isValidSlug, isPublicStatus } from '@/lib/blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalizeList(v: unknown): string[] | undefined {
  if (v === undefined) return undefined;
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(',').map((x) => x.trim()).filter(Boolean);
  return [];
}

// PUT /api/blogs/:id — update (admin/employee only).
// Handles slug changes safely: when a PUBLISHED post's slug changes, the old
// slug is preserved in previousSlugs so /blog/<old> 301-redirects to /blog/<new>
// (no broken indexed URL).
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();

  try {
    const { id } = params;
    const body = await req.json();
    await connectDB();

    const current = await Blog.findById(id);
    if (!current) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });

    const update: Record<string, unknown> = {};

    if (body.title !== undefined) update.title = body.title;
    if (body.excerpt !== undefined) update.excerpt = body.excerpt;
    if (body.content !== undefined) update.content = body.content;
    if (body.category !== undefined) update.category = body.category;
    if (body.image !== undefined) update.image = body.image;
    if (body.featuredImageAlt !== undefined) update.featuredImageAlt = body.featuredImageAlt;
    if (body.author !== undefined) update.author = body.author;
    if (body.authorBio !== undefined) update.authorBio = body.authorBio;
    if (body.seoTitle !== undefined) update.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) update.seoDescription = body.seoDescription;
    if (body.focusKeyword !== undefined) update.focusKeyword = body.focusKeyword;
    if (body.canonicalUrl !== undefined) update.canonicalUrl = body.canonicalUrl;
    if (body.ogTitle !== undefined) update.ogTitle = body.ogTitle;
    if (body.ogDescription !== undefined) update.ogDescription = body.ogDescription;
    if (body.ogImage !== undefined) update.ogImage = body.ogImage;

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
        // Keep old slug for redirects (only meaningful once it was public, but
        // harmless to always retain — dedup + drop the new slug if it recurs).
        const history = new Set([...(current.previousSlugs || []), current.slug]);
        history.delete(newSlug);
        update.previousSlugs = Array.from(history);
      }
    }

    // Editing an already-published post => bump modifiedAt (dateModified).
    if (isPublicStatus(current.status) && current.status === 'published') {
      update.modifiedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(id, update, { new: true, runValidators: true });

    // Refresh public caches so edits show without a restart.
    revalidateBlog(blog?.slug, oldSlug);

    return NextResponse.json({ message: 'Blog updated', blog });
  } catch (error: any) {
    console.error('❌ Update blog error:', error);
    return NextResponse.json({ message: 'Failed to update blog', error: error.message }, { status: 500 });
  }
}

// DELETE /api/blogs/:id — delete (admin/employee only).
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();

  try {
    await connectDB();
    const blog = await Blog.findByIdAndDelete(params.id);
    if (!blog) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    revalidateBlog(blog.slug, null);
    return NextResponse.json({ message: 'Blog deleted' });
  } catch (error: any) {
    console.error('❌ Delete blog error:', error);
    return NextResponse.json({ message: 'Failed to delete blog', error: error.message }, { status: 500 });
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
