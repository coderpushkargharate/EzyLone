import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from './db';
import { User } from './models/User';
import { Session } from './models/Session';
import { AUTH_COOKIE } from './authCookie';

// ─────────────────────────────────────────────────────────────────────────────
// Central authentication + authorization for every privileged API.
//
//   const gate = await requireAuth(req, { permission: 'leads' });
//   if ('error' in gate) return gate.error;
//   const { auth } = gate;
//
// Deny-by-default. Identity, role and permissions are ALWAYS read from the
// database (never from the JWT, the request body, a query param or the client).
// The JWT only carries an opaque session id; the session row must exist, be
// unexpired and belong to an active user. Revoking the row (logout, password
// change, account disabled/deleted, permission change) cuts access immediately.
// ─────────────────────────────────────────────────────────────────────────────

export const TOKEN_COOKIE = AUTH_COOKIE;

// Absolute lifetime of a login (JWT + cookie). The installed admin/WhatsApp PWA
// relies on long sessions, so this stays 30 days — but a session idle for
// IDLE_DAYS is expired server-side, and any session can be revoked instantly.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const IDLE_MS = 1000 * 60 * 60 * 24 * 14;
const TOUCH_EVERY_MS = 1000 * 60 * 60; // extend idle expiry at most hourly
const CACHE_MS = 15_000; // per-process cache of a resolved session

export type Role = 'admin' | 'employee';

export interface AuthContext {
  userId: string;
  sid: string;
  username: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
}

interface TokenPayload {
  sid: string;
  sub: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET is missing or too short (need 32+ chars). Set it in .env.local');
  }
  return secret;
}

/** Legacy users stored without a role are the env-bootstrapped admin. Any
 *  other unknown value is treated as the least-privileged role. */
function normalizeRole(role: unknown): Role {
  if (role === undefined || role === null || role === 'admin') return 'admin';
  return 'employee';
}

// ── Session cache ────────────────────────────────────────────────────────────
declare global {
  // eslint-disable-next-line no-var
  var _authCache: Map<string, { ctx: AuthContext; at: number }> | undefined;
}
const cache = global._authCache || new Map<string, { ctx: AuthContext; at: number }>();
global._authCache = cache;

function dropCachedUser(userId: string) {
  cache.forEach((v, k) => {
    if (v.ctx.userId === userId) cache.delete(k);
  });
}

// ── Tokens / sessions ────────────────────────────────────────────────────────

/** Create a fresh server-side session and return the signed cookie token. */
export async function createSession(
  userId: string,
  meta: { ip?: string; userAgent?: string }
): Promise<string> {
  await connectDB();
  const sid = crypto.randomBytes(32).toString('base64url');
  await Session.create({
    sid,
    userId,
    ip: meta.ip,
    userAgent: (meta.userAgent || '').slice(0, 300),
    expiresAt: new Date(Date.now() + IDLE_MS),
    lastSeenAt: new Date(),
  });
  return jwt.sign({ sid } as Omit<TokenPayload, 'sub'>, getSecret(), {
    subject: userId,
    expiresIn: MAX_AGE_SECONDS,
    algorithm: 'HS256',
  });
}

function decodeToken(token: string | undefined): TokenPayload | null {
  if (!token) return null;
  try {
    const p = jwt.verify(token, getSecret(), { algorithms: ['HS256'] }) as Partial<TokenPayload>;
    if (typeof p.sid !== 'string' || typeof p.sub !== 'string') return null;
    return { sid: p.sid, sub: p.sub };
  } catch {
    return null;
  }
}

export function readSessionId(req: NextRequest): string | null {
  return decodeToken(req.cookies.get(TOKEN_COOKIE)?.value)?.sid || null;
}

export async function revokeSession(sid: string | null | undefined): Promise<void> {
  if (!sid) return;
  cache.delete(sid);
  await connectDB();
  await Session.deleteOne({ sid });
}

/** Revoke every session of a user (password change, disable, delete, role change). */
export async function revokeUserSessions(userId: string, exceptSid?: string): Promise<void> {
  dropCachedUser(userId);
  await connectDB();
  const filter: Record<string, unknown> = { userId };
  if (exceptSid) filter.sid = { $ne: exceptSid };
  await Session.deleteMany(filter);
}

/** Resolve the request's session to a live, active user — or null. */
export async function getAuth(req: NextRequest): Promise<AuthContext | null> {
  const payload = decodeToken(req.cookies.get(TOKEN_COOKIE)?.value);
  if (!payload) return null;

  const hit = cache.get(payload.sid);
  if (hit && Date.now() - hit.at < CACHE_MS && hit.ctx.userId === payload.sub) return hit.ctx;

  await connectDB();
  const session = await Session.findOne({ sid: payload.sid, expiresAt: { $gt: new Date() } }).lean();
  if (!session || String(session.userId) !== payload.sub) {
    cache.delete(payload.sid);
    return null;
  }

  const user = await User.findById(session.userId)
    .select('username name email role permissions disabled')
    .lean();
  if (!user || user.disabled) {
    cache.delete(payload.sid);
    return null;
  }

  const role = normalizeRole(user.role);
  const ctx: AuthContext = {
    userId: String(user._id),
    sid: payload.sid,
    username: user.username,
    name: user.name || user.username,
    email: user.email || '',
    role,
    permissions: role === 'employee' && Array.isArray(user.permissions) ? user.permissions : [],
  };
  cache.set(payload.sid, { ctx, at: Date.now() });

  // Sliding idle expiry, written at most once an hour per session.
  if (Date.now() - new Date(session.lastSeenAt).getTime() > TOUCH_EVERY_MS) {
    Session.updateOne(
      { sid: payload.sid },
      { $set: { lastSeenAt: new Date(), expiresAt: new Date(Date.now() + IDLE_MS) } }
    ).catch(() => {});
  }
  return ctx;
}

export function hasPermission(auth: AuthContext, permission: string | string[]): boolean {
  if (auth.role === 'admin') return true;
  const wanted = Array.isArray(permission) ? permission : [permission];
  return wanted.some((p) => auth.permissions.includes(p));
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defence in depth (on top of SameSite=Lax): a state-changing request that
 * carries an Origin header must come from this same host.
 */
function crossOrigin(req: NextRequest): boolean {
  if (SAFE_METHODS.has(req.method)) return false;
  const origin = req.headers.get('origin');
  if (!origin) return false;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

export function unauthorized() {
  return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ message: 'You do not have access to this resource.' }, { status: 403 });
}

/**
 * Gate a privileged route handler.
 *  - no options       → any active admin or employee
 *  - permission: tab  → admins, or employees granted that admin-panel tab (any of, if an array)
 *  - adminOnly: true  → admins only
 */
export async function requireAuth(
  req: NextRequest,
  opts: { permission?: string | string[]; adminOnly?: boolean } = {}
): Promise<{ auth: AuthContext } | { error: NextResponse }> {
  if (crossOrigin(req)) return { error: forbidden() };
  let auth: AuthContext | null;
  try {
    auth = await getAuth(req);
  } catch (e) {
    console.error('Auth lookup failed:', e);
    return { error: NextResponse.json({ message: 'Service unavailable.' }, { status: 503 }) };
  }
  if (!auth) return { error: unauthorized() };
  if (opts.adminOnly && auth.role !== 'admin') return { error: forbidden() };
  if (opts.permission && !hasPermission(auth, opts.permission)) return { error: forbidden() };
  return { auth };
}

// ── Cookies ──────────────────────────────────────────────────────────────────

const cookieBase = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
});

export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set(TOKEN_COOKIE, token, { ...cookieBase(), maxAge: MAX_AGE_SECONDS });
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set(TOKEN_COOKIE, '', { ...cookieBase(), maxAge: 0 });
  // Also clear the pre-hardening cookie name so stale tokens don't linger.
  res.cookies.set('token', '', { ...cookieBase(), maxAge: 0 });
}

/**
 * Bootstrap the first admin from env (ADMIN_USERNAME / ADMIN_PASSWORD) only when
 * NO admin exists at all. It never resets or re-creates an existing account.
 */
export async function ensureAdmin(): Promise<void> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;

  await connectDB();
  const anyAdmin = await User.exists({ $or: [{ role: 'admin' }, { role: { $exists: false } }] });
  if (!anyAdmin) {
    await User.create({ username, password, role: 'admin' });
  }
}
