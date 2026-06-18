import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';
import { generateBlog } from '@/lib/blogGenerator';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/blogs — public list (auto-generates one if empty, same as before)
export async function GET() {
  try {
    await connectDB();
    let blogs = await Blog.find().sort({ createdAt: -1 }).lean();
    if (blogs.length === 0) {
      await generateBlog();
      blogs = await Blog.find().sort({ createdAt: -1 }).lean();
    }
    return NextResponse.json(blogs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/blogs — create (admin only)
export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();

  try {
    const { title, slug, excerpt, content, category, image } = await req.json();

    if (!title || !slug || !excerpt || !content) {
      return NextResponse.json(
        { message: 'Title, slug, excerpt, and content are required' },
        { status: 400 }
      );
    }

    await connectDB();
    const existing = await Blog.findOne({ slug });
    if (existing) {
      return NextResponse.json({ message: 'A blog with this slug already exists' }, { status: 400 });
    }

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      category: category || 'Personal Loan',
      image: image || 'https://via.placeholder.com/800x400?text=Blog+Image',
    });

    return NextResponse.json({ message: 'Blog created successfully', blog }, { status: 201 });
  } catch (error: any) {
    console.error('❌ Create blog error:', error);
    return NextResponse.json({ message: 'Failed to create blog', error: error.message }, { status: 500 });
  }
}
