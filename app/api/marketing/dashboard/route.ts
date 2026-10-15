import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { buildDashboard, parseFilters } from '@/lib/marketing/dashboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/marketing/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD&channel=&campaign=&loanType=&status=
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: 'marketing' });
  if ('error' in gate) return gate.error;
  const f = parseFilters(req.nextUrl.searchParams);
  if (f.from > f.to) return NextResponse.json({ message: '"from" must be before "to".' }, { status: 400 });
  if (f.to.getTime() - f.from.getTime() > 400 * 86_400_000) return NextResponse.json({ message: 'Maximum range is 400 days.' }, { status: 400 });
  const data = await buildDashboard(f);
  return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
}
