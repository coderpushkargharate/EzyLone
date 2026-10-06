import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Validate the session AND return the user's *current* role/permissions from the
// DB — so an employee's access reflects the latest admin changes on refresh.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req);
  if ('error' in gate) return gate.error;
  const { auth } = gate;
  return NextResponse.json(
    {
      user: {
        id: auth.userId,
        username: auth.username,
        name: auth.name,
        email: auth.email,
        role: auth.role,
        permissions: auth.permissions,
      },
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
