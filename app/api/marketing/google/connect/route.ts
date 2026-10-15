import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { createOAuthState } from '@/lib/marketing/oauthState';
import { googleAuthorizeUrl } from '@/lib/marketing/google/oauth';
import { ensureEncryptionKey } from '@/lib/marketing/keyManager';
import { syncLog } from '@/lib/marketing/log';
import { backToAdmin } from '@/lib/marketing/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/marketing/google/connect — admin only. Starts Google OAuth (PKCE).
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-oauth', { windowMs: 10 * 60_000, max: 20, message: 'Too many connection attempts.' });
  if (limited) return limited;
  try {
    await ensureEncryptionKey();
  } catch (e) {
    await syncLog('system', 'encryption_key', 'error', e instanceof Error ? e.message : String(e));
    return backToAdmin({ error: 'encryption_key_problem' });
  }
  try {
    const { state, codeChallenge } = await createOAuthState('google', gate.auth, true);
    return NextResponse.redirect(await googleAuthorizeUrl(state, codeChallenge!), { status: 303 });
  } catch {
    return backToAdmin({ error: 'google_app_not_configured' });
  }
}
