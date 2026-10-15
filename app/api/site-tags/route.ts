import { NextResponse } from 'next/server';
import { getCredential } from '@/lib/credentials';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/site-tags — public. The tracking IDs saved in the admin panel
// (Meta Pixel ID, GA4 Measurement ID). These IDs are public by nature (they
// appear in every page's HTML); only strictly validated values are returned.
export async function GET() {
  const [pixel, ga4] = await Promise.all([getCredential('META_PIXEL_ID'), getCredential('GA4_MEASUREMENT_ID')]);
  return NextResponse.json(
    {
      metaPixelId: pixel && /^\d{5,20}$/.test(pixel) ? pixel : null,
      ga4MeasurementId: ga4 && /^G-[A-Z0-9]{4,20}$/.test(ga4) ? ga4 : null,
    },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300', 'X-Robots-Tag': 'noindex' } }
  );
}
