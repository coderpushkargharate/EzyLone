import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { OAuthState } from '@/lib/models/MarketingSupport';
import type { AuthContext } from '@/lib/auth';

// OAuth `state` handling for the connect flows (CSRF + replay protection):
//  - 256-bit random state, stored server-side and bound to the admin SESSION
//    that started the flow;
//  - single use (deleted atomically when consumed) and valid for 10 minutes;
//  - Google additionally uses PKCE (S256) with a server-held code verifier.

const MAX_AGE_MS = 10 * 60_000;

export async function createOAuthState(provider: 'meta' | 'google', auth: AuthContext, pkce = false) {
  await connectDB();
  const state = crypto.randomBytes(32).toString('base64url');
  const codeVerifier = pkce ? crypto.randomBytes(48).toString('base64url') : undefined;
  await OAuthState.create({ state, provider, sid: auth.sid, userId: auth.userId, codeVerifier });
  const codeChallenge = codeVerifier ? crypto.createHash('sha256').update(codeVerifier).digest('base64url') : undefined;
  return { state, codeChallenge };
}

export async function consumeOAuthState(provider: 'meta' | 'google', state: string | null, auth: AuthContext) {
  if (!state || state.length > 200) return null;
  await connectDB();
  const doc = await OAuthState.findOneAndDelete({ state, provider }).lean();
  if (!doc) return null;
  if (doc.sid !== auth.sid || doc.userId !== auth.userId) return null;
  if (Date.now() - new Date(doc.createdAt).getTime() > MAX_AGE_MS) return null;
  return doc;
}
