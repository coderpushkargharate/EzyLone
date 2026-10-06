import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Banner } from '@/lib/models/Banner';
import { uploadBuffer } from '@/lib/cloudinary';
import { requireAuth } from '@/lib/auth';
import { bannerCache as BANNER_CACHE, BANNER_TTL_MS, invalidateBannerCache } from '@/lib/bannerCache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/banners?page=home — public
export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get('page') || undefined;
    const key = page || '__all__';
    const now = Date.now();
    const cached = BANNER_CACHE.get(key);

    let banners: unknown[];
    const headers: Record<string, string> = {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    };

    if (cached && cached.expiresAt > now) {
      banners = cached.data;
      headers['X-Cache'] = 'HIT';
    } else {
      await connectDB();
      banners = await Banner.find(page ? { page } : {})
        .sort({ order: 1, createdAt: -1 })
        .lean();
      BANNER_CACHE.set(key, { data: banners, expiresAt: now + BANNER_TTL_MS });
      headers['X-Cache'] = 'MISS';
    }

    return NextResponse.json(banners, { headers });
  } catch (error: any) {
    console.error('Error fetching banners', error);

    return NextResponse.json({ message: 'Error fetching banners' }, { status: 500 });
  }
}

// POST /api/banners — upload banner (admin only)
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { permission: 'banners' });
  if ('error' in gate) return gate.error;

  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const page = formData.get('page') as string | null;

    if (!file || !page) {
      return NextResponse.json({ message: 'Image and page required' }, { status: 400 });
    }
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      return NextResponse.json({ message: 'Only images allowed' }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ message: 'Image must be under 8 MB' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadBuffer(buffer, { folder: 'banners', resource_type: 'image' });

    await connectDB();
    const banner = await Banner.create({
      image: result.secure_url,
      page: String(page).slice(0, 60),
      order: Number(formData.get('order')) || 0,
      isActive: true,
    });

    invalidateBannerCache();
    return NextResponse.json(banner, { status: 201 });
  } catch (error: any) {
    console.error('Banner error:', error);
    console.error('Error creating banner', error);

    return NextResponse.json({ message: 'Error creating banner' }, { status: 500 });
  }
}
