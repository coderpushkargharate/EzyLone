import { NextResponse } from 'next/server';
import { publicBaseUrl } from './config';
import { PlatformError } from './types';
import { MarketingConfigError } from './secrets';

// Small helpers shared by the marketing API routes.

/** Redirect back to the admin Marketing tab. Fixed path only — never a caller-supplied URL. */
export function backToAdmin(params: Record<string, string>): NextResponse {
  const url = new URL('/ezyadmin', publicBaseUrl());
  url.searchParams.set('tab', 'marketing');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v.slice(0, 200));
  return NextResponse.redirect(url, { status: 303 });
}

/** Turn an integration error into a safe JSON response (no stack, no secrets). */
export function errorResponse(e: unknown): NextResponse {
  if (e instanceof PlatformError) {
    const status = e.kind === 'config' ? 412 : e.kind === 'auth' || e.kind === 'permission' ? 409 : e.kind === 'rate_limit' ? 429 : e.kind === 'invalid' ? 400 : e.kind === 'not_found' ? 404 : 502;
    return NextResponse.json({ message: e.message, kind: e.kind }, { status });
  }
  if (e instanceof MarketingConfigError) return NextResponse.json({ message: e.message, kind: 'config' }, { status: 412 });
  console.error('Marketing API error:', e instanceof Error ? e.message : e);
  return NextResponse.json({ message: 'Unexpected error — see server logs.' }, { status: 500 });
}
