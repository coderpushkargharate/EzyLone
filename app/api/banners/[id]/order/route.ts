import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Banner } from '@/lib/models/Banner';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { invalidateBannerCache } from '@/lib/bannerCache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PUT /api/banners/:id/order — admin only
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();

  try {
    const { order } = await req.json();
    await connectDB();
    const banner = await Banner.findByIdAndUpdate(params.id, { order }, { new: true });
    invalidateBannerCache();
    return NextResponse.json(banner);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating order', error: error.message }, { status: 500 });
  }
}
