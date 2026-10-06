import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import {
  createSession,
  setAuthCookie,
  ensureAdmin,
  readSessionId,
  revokeSession,
} from '@/lib/auth';
import { loginRateLimit, loginIdentifierLimit, getClientIp } from '@/lib/rateLimit';
import { sendSecurityAlert } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Every failure path returns exactly this — never reveals whether the account
// exists, is locked, is disabled, or the password was wrong.
const INVALID = () => NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });

// Per-account lockout: after MAX_FAILS consecutive failures the account rejects
// logins (even correct ones) for LOCK_MINUTES. Counters reset on success.
const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

// Compared against when the user doesn't exist so response time doesn't reveal
// whether a username is valid.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-password', 12);

export async function POST(req: NextRequest) {
  const limited = loginRateLimit(req);
  if (limited) return limited;

  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent') || 'unknown';

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return INVALID();
  }
  const { username, password } = (body || {}) as Record<string, unknown>;
  if (typeof username !== 'string' || typeof password !== 'string') return INVALID();
  const identifier = username.trim();
  if (!identifier || identifier.length > 254 || !password || password.length > 128) return INVALID();

  // Throttle per identifier too, so rotating IPs can't brute-force one account.
  const idLimited = loginIdentifierLimit(identifier.toLowerCase());
  if (idLimited) return idLimited;

  try {
    await connectDB();
    await ensureAdmin();

    // Accept either a username (admins) or an email (employees). Both values are
    // plain strings (validated above), so this can't be turned into an operator query.
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }],
    }).select('password username name email role permissions disabled failedLogins lockedUntil');

    const locked = !!user?.lockedUntil && user.lockedUntil.getTime() > Date.now();
    const passwordOk = await bcrypt.compare(password, user?.password || DUMMY_HASH);

    if (!user || !passwordOk || locked || user.disabled) {
      if (user && !passwordOk) {
        const fails = (user.failedLogins || 0) + 1;
        const update: Record<string, unknown> = { failedLogins: fails };
        if (fails >= MAX_FAILS) {
          update.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
          update.failedLogins = 0;
          sendSecurityAlert('login-lock', 'Admin account temporarily locked', {
            Account: user.username,
            IP: ip,
            'User agent': userAgent,
          }).catch(() => {});
        }
        await User.updateOne({ _id: user._id }, { $set: update });
      }
      sendSecurityAlert('login-fail', 'Failed admin login attempt', {
        'Attempted username': identifier.slice(0, 80),
        IP: ip,
        'User agent': userAgent,
      }).catch(() => {});
      return INVALID();
    }

    // Success: reset counters, and rotate the session — any session id the
    // browser already carried is revoked, and a brand-new one is issued
    // (prevents session fixation).
    await User.updateOne(
      { _id: user._id },
      { $set: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() } }
    );
    await revokeSession(readSessionId(req)).catch(() => {});
    const token = await createSession(String(user._id), { ip, userAgent });

    sendSecurityAlert('login-success', 'Admin logged in successfully', {
      Username: user.username,
      Role: user.role || 'admin',
      IP: ip,
      'User agent': userAgent,
    }).catch(() => {});

    const res = NextResponse.json({
      user: {
        id: String(user._id),
        username: user.username,
        name: user.name || user.username,
        email: user.email || '',
        role: user.role === 'employee' ? 'employee' : 'admin',
        permissions: user.role === 'employee' ? user.permissions || [] : [],
      },
    });
    res.headers.set('Cache-Control', 'no-store');
    setAuthCookie(res, token);
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Unable to sign in right now. Please try again.' }, { status: 500 });
  }
}
