import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PushSubscription } from '@/lib/models/PushSubscription';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/admin/push/unsubscribe — remove this device's subscription (e.g. the
// staff member turned notifications off or logged out).
export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  const endpoint: string | undefined = body?.endpoint;
  if (!endpoint) return NextResponse.json({ message: 'Missing endpoint' }, { status: 400 });

  try {
    await connectDB();
    await PushSubscription.deleteOne({ endpoint });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to remove subscription', error: error.message }, { status: 500 });
  }
}
