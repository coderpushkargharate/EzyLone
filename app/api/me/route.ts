import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/me — the logged-in admin, shaped like the CRM's /api/me so the
// Team tab can render it. EzyLone admins only have a username, so name = username
// and role is always 'admin'.
export async function GET(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized();

  return NextResponse.json({
    user: { name: user.username, email: '', role: 'admin' },
  });
}
