import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { Banner } from '@/lib/models/Banner';
import { requireAuth } from '@/lib/auth';
import { invalidateBannerCache } from '@/lib/bannerCache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PUT /api/banners/:id/order — admin only
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const gate = await requireAuth(req, { permission: 'banners' });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    const { order } = await req.json();
    await connectDB();
    const banner = await Banner.findByIdAndUpdate(params.id, { order }, { new: true });
    invalidateBannerCache();
    return NextResponse.json(banner);
  } catch (error: any) {
    console.error('Error updating order', error);

    return NextResponse.json({ message: 'Error updating order' }, { status: 500 });
  }
}
