import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookie, readSessionId, revokeSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Revoke the server-side session (so a copied cookie stops working) and clear it.
export async function POST(req: NextRequest) {
  await revokeSession(readSessionId(req)).catch((e) => console.error('Logout revoke failed:', e));
  const res = NextResponse.json({ message: 'Logged out' });
  clearAuthCookie(res);
  return res;
}
