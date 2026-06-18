import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) return unauthorized('Invalid token');
  return NextResponse.json({ user });
}
