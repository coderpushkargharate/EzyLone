import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from './db';
import { User } from './models/User';

export const TOKEN_COOKIE = 'token';
const MAX_AGE_SECONDS = 60 * 60 * 24; // 24h, same as the old Express server

export interface AuthPayload {
  userId: string;
  username: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set. Add it to .env.local');
  return secret;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '24h' });
}

/** Verify a raw token string. Returns the payload or null if invalid/expired. */
export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, getSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

/**
 * Read + verify the auth cookie from an incoming request.
 * Returns the payload, or null if missing/invalid. Routes use this as a guard:
 *   const user = verifyAuth(req); if (!user) return unauthorized();
 */
export function verifyAuth(req: NextRequest): AuthPayload | null {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function unauthorized(message = 'Access token required') {
  return NextResponse.json({ message }, { status: 401 });
}

/** Attach the auth cookie (httpOnly) to a response after a successful login. */
export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set(TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Bootstrap the first admin from env (ADMIN_USERNAME / ADMIN_PASSWORD) if it
 * doesn't already exist. No hardcoded credentials. Called lazily on login.
 */
export async function ensureAdmin(): Promise<void> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return;

  await connectDB();
  const exists = await User.findOne({ username });
  if (!exists) {
    await User.create({ username, password });
  }
}
