import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Testimonial } from '@/lib/models/Testimonial';
import { uploadBuffer } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PUT /api/testimonials/:id — update (admin only). multipart: fields + optional avatar file.
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { permission: 'testimonials' });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    const form = await req.formData();
    const update: Record<string, unknown> = {};

    const name = form.get('name') as string | null;
    const quote = form.get('quote') as string | null;
    const location = form.get('location') as string | null;
    const rating = form.get('rating') as string | null;
    const avatar = form.get('avatar') as string | null;
    const order = form.get('order') as string | null;
    const isActive = form.get('isActive') as string | null;
    const avatarFile = form.get('avatarFile') as File | null;

    if (name) update.name = name.trim();
    if (quote) update.quote = quote.trim();
    if (location !== null) update.location = location;
    if (rating) update.rating = Number(rating);
    if (avatar) update.avatar = avatar;
    if (order !== null) update.order = Number(order);
    if (isActive !== null) update.isActive = isActive === 'true';

    if (avatarFile && avatarFile.size > 0) {
      if (!avatarFile.type.startsWith('image/') || avatarFile.type === 'image/svg+xml') {
        return NextResponse.json({ message: 'Avatar must be an image' }, { status: 400 });
      }
      if (avatarFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ message: 'Avatar must be under 5 MB' }, { status: 400 });
      }
      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      const result = await uploadBuffer(buffer, { folder: 'testimonials', resource_type: 'image' });
      update.avatar = result.secure_url;
    }

    await connectDB();
    const testimonial = await Testimonial.findByIdAndUpdate(params.id, update, { new: true, runValidators: true });
    if (!testimonial) return NextResponse.json({ message: 'Testimonial not found' }, { status: 404 });

    return NextResponse.json({ message: 'Testimonial updated', testimonial });
  } catch (error: any) {
    console.error('Update testimonial error:', error);
    console.error('Failed to update testimonial', error);

    return NextResponse.json({ message: 'Failed to update testimonial' }, { status: 500 });
  }
}

// DELETE /api/testimonials/:id — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { permission: 'testimonials' });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    await connectDB();
    const testimonial = await Testimonial.findByIdAndDelete(params.id);
    if (!testimonial) return NextResponse.json({ message: 'Testimonial not found' }, { status: 404 });
    return NextResponse.json({ message: 'Testimonial deleted' });
  } catch (error: any) {
    console.error('Error deleting testimonial', error);

    return NextResponse.json({ message: 'Error deleting testimonial' }, { status: 500 });
  }
}
