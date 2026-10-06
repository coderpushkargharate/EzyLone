import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';
import { issueFormToken } from '@/lib/formGuard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/form-token — public. Issues the signed timestamp the lead forms must
// echo back on submit (see lib/formGuard.ts). Cheap: no database access.
export async function GET(req: NextRequest) {
  const limited = checkRateLimit(req, 'form-token', {
    windowMs: 10 * 60 * 1000,
    max: 60,
    message: 'Too many requests. Please try again later.',
  });
  if (limited) return limited;
  return NextResponse.json(
    { token: issueFormToken() },
    { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } }
  );
}
