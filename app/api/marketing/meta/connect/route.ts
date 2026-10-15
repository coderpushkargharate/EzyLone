import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { createOAuthState } from '@/lib/marketing/oauthState';
import { metaAuthorizeUrl } from '@/lib/marketing/meta/oauth';
import { encryptionConfigured } from '@/lib/marketing/secrets';
import { backToAdmin } from '@/lib/marketing/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/marketing/meta/connect — admin only. Starts Facebook Login.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-oauth', { windowMs: 10 * 60_000, max: 20, message: 'Too many connection attempts.' });
  if (limited) return limited;
  if (!encryptionConfigured()) return backToAdmin({ error: 'encryption_key_missing' });
  try {
    const { state } = await createOAuthState('meta', gate.auth);
    return NextResponse.redirect(await metaAuthorizeUrl(state), { status: 303 });
  } catch {
    return backToAdmin({ error: 'meta_app_not_configured' });
  }
}
