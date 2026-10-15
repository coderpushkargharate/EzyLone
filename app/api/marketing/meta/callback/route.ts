import { NextRequest } from 'next/server';
import { audit } from '@/lib/audit';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { consumeOAuthState } from '@/lib/marketing/oauthState';
import { exchangeMetaCode, saveMetaConnection } from '@/lib/marketing/meta/oauth';
import { backToAdmin } from '@/lib/marketing/http';
import { syncLog } from '@/lib/marketing/log';
import { PlatformError } from '@/lib/marketing/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/marketing/meta/callback — Facebook Login redirect target.
// The state must match a single-use state created by THIS admin session.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-oauth-cb', { windowMs: 10 * 60_000, max: 20, message: 'Too many attempts.' });
  if (limited) return limited;

  const sp = req.nextUrl.searchParams;
  const state = await consumeOAuthState('meta', sp.get('state'), gate.auth);
  if (!state) return backToAdmin({ error: 'meta_state_invalid' });
  if (sp.get('error')) {
    await syncLog('meta', 'oauth', 'error', `Meta login cancelled or denied: ${sp.get('error_reason') || sp.get('error')}`);
    return backToAdmin({ error: 'meta_denied' });
  }
  const code = sp.get('code');
  if (!code || code.length > 2000) return backToAdmin({ error: 'meta_no_code' });

  try {
    const token = await exchangeMetaCode(code);
    await saveMetaConnection(token, gate.auth.username);
    await audit(gate.auth, 'integration_connect', 'meta', undefined, req);
    return backToAdmin({ connected: 'meta' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await syncLog('meta', 'oauth', 'error', `Meta connection failed: ${msg}`);
    return backToAdmin({ error: `meta_${e instanceof PlatformError ? e.kind : 'failed'}` });
  }
}
