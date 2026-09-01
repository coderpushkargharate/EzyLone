import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PushSubscription } from '@/lib/models/PushSubscription';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/admin/push/subscribe
// The admin app calls this after the staff member allows notifications. It saves
// (upserts by endpoint) the browser's PushSubscription so the server can later
// push message/lead alerts to this device even when the app is closed.
export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  const endpoint: string | undefined = body?.endpoint;
  const p256dh: string | undefined = body?.keys?.p256dh;
  const auth: string | undefined = body?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ message: 'Invalid subscription' }, { status: 400 });
  }

  try {
    await connectDB();
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        $set: {
          endpoint,
          keys: { p256dh, auth },
          userAgent: req.headers.get('user-agent') || '',
        },
      },
      { upsert: true, new: true },
    );
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ message: 'Failed to save subscription', error: error.message }, { status: 500 });
  }
}
