import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { createOAuthState } from '@/lib/marketing/oauthState';
import { googleAuthorizeUrl } from '@/lib/marketing/google/oauth';
import { encryptionConfigured } from '@/lib/marketing/secrets';
import { backToAdmin } from '@/lib/marketing/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/marketing/google/connect — admin only. Starts Google OAuth (PKCE).
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-oauth', { windowMs: 10 * 60_000, max: 20, message: 'Too many connection attempts.' });
  if (limited) return limited;
  if (!encryptionConfigured()) return backToAdmin({ error: 'encryption_key_missing' });
  try {
    const { state, codeChallenge } = await createOAuthState('google', gate.auth, true);
    return NextResponse.redirect(await googleAuthorizeUrl(state, codeChallenge!), { status: 303 });
  } catch {
    return backToAdmin({ error: 'google_app_not_configured' });
  }
}
