import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, unauthorized, isAdmin } from '@/lib/auth';
import { listBlocked, blockIp, unblockIp } from '@/lib/blocklist';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Only admins may view/manage the IP blocklist.
function guardAdmin(req: NextRequest) {
  const auth = verifyAuth(req);
  if (!auth) return { error: unauthorized() };
  if (!isAdmin(auth)) return { error: NextResponse.json({ message: 'Admins only' }, { status: 403 }) };
  return { auth };
}

// GET /api/admin/blocked-ips — list all blocked IPs (newest first).
export async function GET(req: NextRequest) {
  const { error } = guardAdmin(req);
  if (error) return error;
  const blocked = await listBlocked();
  return NextResponse.json({ blocked });
}

// POST /api/admin/blocked-ips  { ip, reason? } — manually block an IP.
export async function POST(req: NextRequest) {
  const { error, auth } = guardAdmin(req);
  if (error) return error;

  const { ip, reason } = await req.json();
  const clean = String(ip || '').trim();
  if (!clean) return NextResponse.json({ message: 'IP is required' }, { status: 400 });

  await blockIp(clean, String(reason || 'manual'), auth!.username || 'admin');
  return NextResponse.json({ message: 'IP blocked', ip: clean }, { status: 201 });
}

// DELETE /api/admin/blocked-ips?ip=1.2.3.4 — unblock an IP.
export async function DELETE(req: NextRequest) {
  const { error } = guardAdmin(req);
  if (error) return error;

  const ip = new URL(req.url).searchParams.get('ip');
  const clean = String(ip || '').trim();
  if (!clean) return NextResponse.json({ message: 'IP is required' }, { status: 400 });

  await unblockIp(clean);
  return NextResponse.json({ message: 'IP unblocked', ip: clean });
}
