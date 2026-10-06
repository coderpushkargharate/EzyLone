import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import { Blog, BlogStatus, BLOG_STATUSES } from '@/lib/models/Blog';
import { isValidObjectId } from 'mongoose';
import { requireAuth, forbidden } from '@/lib/auth';
import { canTransition, runSeoChecklist, isPublicStatus } from '@/lib/blog';
import { plainText } from '@/lib/blogHtml';

// Employees can only submit a post for review or pull it back to draft.
// Publishing, rejecting, archiving and un-publishing are admin decisions.
const EMPLOYEE_TARGETS: BlogStatus[] = ['pending', 'draft'];

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/blogs/:id/status — change publishing status (Blog Manager access;
// approval actions are admin-only).
// Body: { status: BlogStatus, rejectionReason?: string }
// The workflow (draft → pending → published / rejected / archived) is enforced
// server-side; the client status is never trusted. Publishing runs the SEO
// checklist and refuses if there are critical errors.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { permission: 'blogs' });
  if ('error' in gate) return gate.error;
  const isAdminUser = gate.auth.role === 'admin';
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });

  try {
    const { status, rejectionReason } = (await req.json()) as {
      status: BlogStatus;
      rejectionReason?: string;
    };

    if (!status || !BLOG_STATUSES.includes(status)) {
      return NextResponse.json({ message: 'Invalid target status' }, { status: 400 });
    }

    await connectDB();
    const blog = await Blog.findById(params.id);
    if (!blog) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });

    // Legacy docs (no status) behave like 'published' for transition purposes.
    const from: BlogStatus = (blog.status as BlogStatus) || 'published';
    if (!isAdminUser && (!EMPLOYEE_TARGETS.includes(status) || isPublicStatus(blog.status))) {
      return forbidden();
    }
    if (!canTransition(from, status)) {
      return NextResponse.json(
        { message: `Cannot change status from "${from}" to "${status}".` },
        { status: 400 }
      );
    }

    // Publishing gate: block on critical SEO/quality errors.
    if (status === 'published') {
      const check = runSeoChecklist({
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt,
        image: blog.image,
        featuredImageAlt: blog.featuredImageAlt,
        category: blog.category,
        author: blog.author,
        seoTitle: blog.seoTitle,
        seoDescription: blog.seoDescription,
        focusKeyword: blog.focusKeyword,
        canonicalUrl: blog.canonicalUrl,
      });
      if (check.errors.length > 0) {
        return NextResponse.json(
          { message: 'Cannot publish: fix the SEO/quality errors first.', errors: check.errors },
          { status: 422 }
        );
      }
    }

    if (status === 'rejected') {
      blog.rejectionReason = plainText(rejectionReason, 500) || 'No reason provided';
    } else {
      blog.rejectionReason = undefined;
    }

    if (status === 'published') {
      if (!blog.publishedAt) blog.publishedAt = new Date(); // set ONCE on first publish
      blog.modifiedAt = new Date();
    }

    blog.status = status;
    await blog.save();

    // Refresh public surfaces immediately (listing, detail, sitemap).
    try {
      revalidatePath('/blogs');
      revalidatePath('/sitemap.xml');
      revalidatePath(`/blog/${blog.slug}`);
      // Product pages list related articles (components/RelatedArticles) — refresh them too.
      if (status === 'published' || from === 'published') revalidatePath('/', 'layout');
    } catch {
      /* best-effort */
    }

    return NextResponse.json({ message: `Blog ${status}`, blog });
  } catch (error) {
    console.error('Blog status error:', error);
    return NextResponse.json({ message: 'Failed to update status' }, { status: 500 });
  }
}
