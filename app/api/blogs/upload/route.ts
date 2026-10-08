import { NextRequest, NextResponse } from 'next/server';
import { uploadBuffer } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/blogs/upload — upload a blog featured image (Blog Manager access).
// Kept separate from /api/banners so employees with only the Blog Manager tab
// can add images, and blog images don't get stored as banner rows.
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { permission: 'blogs' });
  if ('error' in gate) return gate.error;

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Image required' }, { status: 400 });
    }
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      return NextResponse.json({ message: 'Only images allowed' }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ message: 'Image must be under 8 MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadBuffer(buffer, { folder: 'blogs', resource_type: 'image' });

    return NextResponse.json({ image: result.secure_url }, { status: 201 });
  } catch (error) {
    console.error('Blog image upload error:', error);
    return NextResponse.json({ message: 'Failed to upload image' }, { status: 500 });
  }
}
