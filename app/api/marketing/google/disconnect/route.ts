import { NextRequest, NextResponse } from 'next/server';
import { audit } from '@/lib/audit';
import { requireAuth } from '@/lib/auth';
import { disconnectGoogle } from '@/lib/marketing/google/oauth';
import { errorResponse } from '@/lib/marketing/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/marketing/google/disconnect — admin only. Revokes and deletes the refresh token.
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  try {
    await disconnectGoogle();
    await audit(gate.auth, 'integration_disconnect', 'google', undefined, req);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
