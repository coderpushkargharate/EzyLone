import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PUT /api/blogs/:id — update (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();

  try {
    const { id } = params;
    const { title, slug, excerpt, content, category, image } = await req.json();

    await connectDB();
    if (slug) {
      const existing = await Blog.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ message: 'A blog with this slug already exists' }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = {
      ...(title && { title }),
      ...(slug && { slug }),
      ...(excerpt && { excerpt }),
      ...(content && { content }),
      ...(category && { category }),
      ...(image && { image }),
    };

    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!blog) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });

    return NextResponse.json({ message: 'Blog updated successfully', blog });
  } catch (error: any) {
    console.error('❌ Update blog error:', error);
    return NextResponse.json({ message: 'Failed to update blog', error: error.message }, { status: 500 });
  }
}

// DELETE /api/blogs/:id — delete (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();

  try {
    await connectDB();
    const blog = await Blog.findByIdAndDelete(params.id);
    if (!blog) return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error: any) {
    console.error('❌ Delete blog error:', error);
    return NextResponse.json({ message: 'Failed to delete blog', error: error.message }, { status: 500 });
  }
}
