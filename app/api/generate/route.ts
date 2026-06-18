import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { generateBlog } from '@/lib/blogGenerator';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/generate — admin only (manual blog generation)
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  await connectDB();
  const blog = await generateBlog();
  return NextResponse.json({ success: true, blog: blog?.title || 'Skipped' });
}
