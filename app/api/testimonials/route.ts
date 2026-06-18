import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Testimonial } from '@/lib/models/Testimonial';
import { uploadBuffer } from '@/lib/cloudinary';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/testimonials — public
export async function GET() {
  try {
    await connectDB();
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json(testimonials, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600' },
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching testimonials', error: error.message }, { status: 500 });
  }
}

// POST /api/testimonials — create (admin only). multipart: fields + optional avatar file.
export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();

  try {
    const form = await req.formData();
    const name = (form.get('name') as string)?.trim();
    const quote = (form.get('quote') as string)?.trim();
    const location = (form.get('location') as string) || '';
    const rating = Number(form.get('rating')) || 5;
    let avatar = (form.get('avatar') as string) || '';
    const avatarFile = form.get('avatarFile') as File | null;

    if (!name || !quote) {
      return NextResponse.json({ message: 'Name and quote are required' }, { status: 400 });
    }

    if (avatarFile && avatarFile.size > 0) {
      if (!avatarFile.type.startsWith('image/')) {
        return NextResponse.json({ message: 'Avatar must be an image' }, { status: 400 });
      }
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const result = await uploadBuffer(buffer, { folder: 'testimonials', resource_type: 'image' });
      avatar = result.secure_url;
    }

    await connectDB();
    const testimonial = await Testimonial.create({
      name, quote, location, rating, avatar,
      order: Number(form.get('order')) || 0,
    });

    return NextResponse.json({ message: 'Testimonial created', testimonial }, { status: 201 });
  } catch (error: any) {
    console.error('Create testimonial error:', error);
    return NextResponse.json({ message: 'Failed to create testimonial', error: error.message }, { status: 500 });
  }
}
