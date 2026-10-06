import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { AUTH_COOKIE } from '@/lib/authCookie';

// First gate for the admin UI. This is NOT the security boundary — the admin
// page is a client shell with no data; every admin API independently validates
// the server-side session, account status, role and permissions
// (lib/auth.ts → requireAuth). Here we only keep obviously-unauthenticated
// visitors away from the shell and mark private pages as non-indexable,
// non-cacheable responses.
//
// Uses `jose` because middleware runs on the Edge runtime (no Node crypto).
export const config = {
  matcher: ['/ezyadmin', '/ezyadmin/:path*', '/ezylogin', '/ezylogin/:path*'],
};

function privateHeaders(res: NextResponse) {
  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.headers.set('Cache-Control', 'no-store, max-age=0');
  return res;
}

async function hasValidToken(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });
    return typeof payload.sid === 'string' && typeof payload.sub === 'string';
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/ezylogin')) return privateHeaders(NextResponse.next());

  if (!(await hasValidToken(req))) {
    return privateHeaders(NextResponse.redirect(new URL('/ezylogin', req.url)));
  }
  return privateHeaders(NextResponse.next());
}
