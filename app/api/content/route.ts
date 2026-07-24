import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Content } from '@/lib/models/Content';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  await connectDB();
  const items = await Content.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  await connectDB();
  const body = await req.json();

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const item = await Content.create({
    title: body.title.trim(),
    type: body.type || 'link',
    url: body.url?.trim() || undefined,
    description: body.description?.trim() || undefined,
  });

  return NextResponse.json({ item }, { status: 201 });
}
