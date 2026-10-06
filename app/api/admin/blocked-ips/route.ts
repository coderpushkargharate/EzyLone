import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { listBlocked, blockIp, unblockIp } from '@/lib/blocklist';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Only admins may view/manage the IP blocklist.

const IP_RE = /^[0-9a-fA-F:.]{2,45}$/;

// GET /api/admin/blocked-ips — list all blocked IPs (newest first).
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const blocked = await listBlocked();
  return NextResponse.json({ blocked });
}

// POST /api/admin/blocked-ips  { ip, reason? } — manually block an IP.
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;

  const { ip, reason } = await req.json().catch(() => ({}));
  const clean = String(ip || '').trim();
  if (!IP_RE.test(clean)) return NextResponse.json({ message: 'A valid IP address is required' }, { status: 400 });

  await blockIp(clean, String(reason || 'manual').slice(0, 200), gate.auth.username);
  return NextResponse.json({ message: 'IP blocked', ip: clean }, { status: 201 });
}

// DELETE /api/admin/blocked-ips?ip=1.2.3.4 — unblock an IP.
export async function DELETE(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;

  const clean = String(new URL(req.url).searchParams.get('ip') || '').trim();
  if (!IP_RE.test(clean)) return NextResponse.json({ message: 'A valid IP address is required' }, { status: 400 });

  await unblockIp(clean);
  return NextResponse.json({ message: 'IP unblocked', ip: clean });
}
