import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PushSubscription } from '@/lib/models/PushSubscription';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/admin/push/unsubscribe — remove this device's subscription (e.g. the
// staff member turned notifications off or logged out).
export async function POST(req: NextRequest) {
  const gate = await requireAuth(req);
  if ('error' in gate) return gate.error;

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
    // A user can only remove their own device (or a legacy one with no owner).
    await PushSubscription.deleteOne({
      endpoint: String(endpoint),
      $or: [{ userId: gate.auth.userId }, { userId: { $exists: false } }],
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json({ message: 'Failed to remove subscription' }, { status: 500 });
  }
}
