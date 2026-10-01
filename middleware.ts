import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Kept in sync with TOKEN_COOKIE in lib/auth.ts. Inlined here (not imported)
// because middleware runs on the Edge runtime and importing lib/auth would pull
// in mongoose, which isn't Edge-compatible.
const TOKEN_COOKIE = 'token';

// Guard the admin UI: without a valid auth cookie, redirect to /ezylogin.
// (API routes additionally verify the token themselves — defence in depth.)
// The admin panel + login live on obscured paths (/ezyadmin, /ezylogin) so bots
// scanning for /admin or /login find nothing.
// Uses `jose` because middleware runs on the Edge runtime where `jsonwebtoken`
// (Node crypto) isn't available. The token is HS256-signed, which jose verifies.
export const config = {
  matcher: ['/ezyadmin', '/ezyadmin/:path*'],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  const loginUrl = new URL('/ezylogin', req.url);

  if (!token) return NextResponse.redirect(loginUrl);

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(loginUrl);
  }
}
