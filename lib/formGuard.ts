import crypto from 'crypto';
import { HONEYPOT_FIELD, FORM_TOKEN_FIELD, MIN_FILL_MS } from './formGuardFields';

// Server-side spam guard for the public lead forms (contact + loan apply).
// Invisible to real users — no puzzles. Layers:
//
//  1) Honeypot — a hidden field (`company_website`) real users never see. Bots
//     that fill every input set it → reject silently AND block the IP.
//  2) Signed form token — the form fetches a short-lived HMAC-signed timestamp
//     (GET /api/form-token) when the visitor starts interacting. Submissions
//     without a valid token (scripts POSTing straight at the API) are refused,
//     and so are ones sent faster than a human could fill the form.
//  3) Per-IP rate limit, strike-based auto-block and the India geo/phone gates
//     live in the routes themselves.

const TOKEN_MAX_AGE_MS = 12 * 60 * 60 * 1000;

function key(): Buffer {
  const base = process.env.FORM_GUARD_SECRET || process.env.JWT_SECRET;
  if (!base) throw new Error('JWT_SECRET (or FORM_GUARD_SECRET) is not set');
  // Domain-separated so a form token can never be confused with anything else.
  return crypto.createHmac('sha256', base).update('ezyloan-form-guard-v1').digest();
}

function sign(ts: string): string {
  return crypto.createHmac('sha256', key()).update(ts).digest('base64url');
}

export function issueFormToken(): string {
  const ts = String(Date.now());
  return `${ts}.${sign(ts)}`;
}

export type TokenProblem = 'missing' | 'invalid' | 'expired' | 'too-fast' | null;

export function checkFormToken(token: unknown, now = Date.now()): TokenProblem {
  if (typeof token !== 'string' || !token) return 'missing';
  const [ts, mac] = token.split('.');
  if (!ts || !mac || !/^\d{13}$/.test(ts)) return 'invalid';
  const expected = Buffer.from(sign(ts));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return 'invalid';
  const age = now - Number(ts);
  if (age < MIN_FILL_MS) return 'too-fast';
  if (age > TOKEN_MAX_AGE_MS) return 'expired';
  return null;
}

export interface GuardResult {
  /** Honeypot was filled — treat as a bot (reject silently + block the IP). */
  honeypot: boolean;
  /** Why the form token failed, or null when it's valid. */
  tokenProblem: TokenProblem;
}

export function inspectFormGuard(body: Record<string, unknown>): GuardResult {
  const hp = body[HONEYPOT_FIELD];
  const honeypot = typeof hp === 'string' && hp.trim().length > 0;
  return { honeypot, tokenProblem: checkFormToken(body[FORM_TOKEN_FIELD]) };
}
