import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Banner } from '@/lib/models/Banner';
import { destroyImageByUrl } from '@/lib/cloudinary';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { invalidateBannerCache } from '@/lib/bannerCache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// DELETE /api/banners/:id — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();

  try {
    await connectDB();
    // Delete the DB record first and respond fast. The Cloudinary cleanup is
    // slow (~5s) so we do it in the background — no need to make the admin wait.
    const banner = await Banner.findByIdAndDelete(params.id);
    if (!banner) {
      // Already gone from the DB but may still be in the in-memory cache (which
      // is why the admin list kept showing it). Clear the cache so the stale
      // banner disappears on the next fetch instead of looping 404s.
      invalidateBannerCache();
      return NextResponse.json({ message: 'Banner already deleted' }, { status: 404 });
    }

    invalidateBannerCache();

    if (banner.image?.startsWith('http')) {
      destroyImageByUrl(banner.image).catch((e: any) =>
        console.warn('⚠️ Cloudinary delete failed:', e.message)
      );
    }

    return NextResponse.json({ message: 'Banner deleted' });
  } catch (error: any) {
    console.error('Delete banner error:', error);
    return NextResponse.json({ message: 'Error deleting banner', error: error.message }, { status: 500 });
  }
}
