import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';
import { PUBLIC_BLOG_FILTER } from '@/lib/blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/blog/:slug — public single blog. Only PUBLISHED posts are exposed;
// drafts/pending/rejected/archived return 404 so they can't leak publicly.
export async function GET(_req: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug: params.slug, ...PUBLIC_BLOG_FILTER }).lean();
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(blog);
  } catch (error: any) {
    console.error('API error:', error);

    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
