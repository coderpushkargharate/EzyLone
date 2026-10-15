import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { marketingOverview } from '@/lib/marketing/overview';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/marketing/overview — marketing snapshot for the admin Overview page.
// Same permission as the Marketing tab; Overview hides the card on 403.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: 'marketing' });
  if ('error' in gate) return gate.error;
  return NextResponse.json(await marketingOverview(), { headers: { 'Cache-Control': 'private, no-store' } });
}
