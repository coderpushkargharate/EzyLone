import { NextRequest } from 'next/server';
import { audit } from '@/lib/audit';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { consumeOAuthState } from '@/lib/marketing/oauthState';
import { exchangeGoogleCode } from '@/lib/marketing/google/oauth';
import { backToAdmin } from '@/lib/marketing/http';
import { syncLog } from '@/lib/marketing/log';
import { PlatformError } from '@/lib/marketing/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/marketing/google/callback — Google OAuth redirect target.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-oauth-cb', { windowMs: 10 * 60_000, max: 20, message: 'Too many attempts.' });
  if (limited) return limited;

  const sp = req.nextUrl.searchParams;
  const state = await consumeOAuthState('google', sp.get('state'), gate.auth);
  if (!state || !state.codeVerifier) return backToAdmin({ error: 'google_state_invalid' });
  if (sp.get('error')) {
    await syncLog('google', 'oauth', 'error', `Google consent denied: ${sp.get('error')}`);
    return backToAdmin({ error: 'google_denied' });
  }
  const code = sp.get('code');
  if (!code || code.length > 2000) return backToAdmin({ error: 'google_no_code' });
  try {
    await exchangeGoogleCode(code, state.codeVerifier, gate.auth.username);
    await audit(gate.auth, 'integration_connect', 'google', undefined, req);
    return backToAdmin({ connected: 'google' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await syncLog('google', 'oauth', 'error', `Google connection failed: ${msg}`);
    return backToAdmin({ error: `google_${e instanceof PlatformError ? e.kind : 'failed'}` });
  }
}
