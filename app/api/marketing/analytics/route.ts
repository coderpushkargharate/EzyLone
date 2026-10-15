import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import { analyticsReport, listGa4Properties } from '@/lib/marketing/google/reporting';
import { errorResponse } from '@/lib/marketing/http';
import { audit } from '@/lib/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/marketing/analytics?from&to&fresh=1 — GA4 Data API report for the selected property.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: 'marketing' });
  if ('error' in gate) return gate.error;
  const sp = req.nextUrl.searchParams;
  const fresh = sp.get('fresh') === '1';
  if (fresh) {
    const limited = checkRateLimit(req, 'marketing-ga4-fresh', { windowMs: 5 * 60_000, max: 10, message: 'Refreshed recently — cached data is shown for a few minutes.' });
    if (limited) return limited;
  }
  try {
    return NextResponse.json(await analyticsReport(sp.get('from') || '', sp.get('to') || '', { fresh }), { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (e) {
    return errorResponse(e);
  }
}

// POST /api/marketing/analytics — admin only. { action: 'properties' } | { action: 'select', propertyId }
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  try {
    if (body.action === 'properties') return NextResponse.json({ properties: await listGa4Properties() });
    if (body.action === 'select') {
      await connectDB();
      const id = String(body.propertyId || '');
      const conn = await MarketingConnection.findOne({ provider: 'google' }).lean();
      if (!conn?.google?.ga4Properties?.some((p) => p.id === id)) return NextResponse.json({ message: 'Pick one of the listed properties.' }, { status: 400 });
      await MarketingConnection.updateOne({ provider: 'google' }, { $set: { 'google.ga4PropertyId': id } });
      await audit(gate.auth, 'config_change', 'ga4_property', { propertyId: id });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ message: 'Unknown action.' }, { status: 400 });
  } catch (e) {
    return errorResponse(e);
  }
}
