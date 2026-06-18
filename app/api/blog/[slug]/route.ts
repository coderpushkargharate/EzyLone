import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/blog/:slug — public single blog
export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const blog = await Blog.findOne({ slug: params.slug }).lean();
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(blog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
