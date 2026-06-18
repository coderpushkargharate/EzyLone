import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Banner } from '@/lib/models/Banner';
import { cloudinary, extractPublicIdFromUrl } from '@/lib/cloudinary';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { invalidateBannerCache } from '@/lib/bannerCache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// DELETE /api/banners/:id — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();

  try {
    await connectDB();
    const banner = await Banner.findById(params.id);
    if (!banner) return NextResponse.json({ message: 'Banner not found' }, { status: 404 });

    try {
      const publicId = extractPublicIdFromUrl(banner.image);
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudErr: any) {
      console.warn('⚠️ Cloudinary delete failed:', cloudErr.message);
    }

    await Banner.findByIdAndDelete(params.id);
    invalidateBannerCache();
    return NextResponse.json({ message: 'Banner deleted' });
  } catch (error: any) {
    console.error('Delete banner error:', error);
    return NextResponse.json({ message: 'Error deleting banner', error: error.message }, { status: 500 });
  }
}
