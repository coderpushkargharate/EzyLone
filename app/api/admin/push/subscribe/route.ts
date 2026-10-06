import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { PushSubscription } from '@/lib/models/PushSubscription';
import { requireAuth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/admin/push/subscribe
// The admin app calls this after the staff member allows notifications. It saves
// (upserts by endpoint) the browser's PushSubscription so the server can later
// push message/lead alerts to this device even when the app is closed.
export async function POST(req: NextRequest) {
  // Only staff who can see WhatsApp chats or leads receive these alerts.
  const gate = await requireAuth(req, { permission: ['whatsappChats', 'leads', 'dashboard'] });
  if ('error' in gate) return gate.error;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  const endpoint: string | undefined = body?.endpoint;
  const p256dh: string | undefined = body?.keys?.p256dh;
  const auth: string | undefined = body?.keys?.auth;
  if (
    typeof endpoint !== 'string' || !endpoint.startsWith('https://') || endpoint.length > 1000 ||
    typeof p256dh !== 'string' || p256dh.length > 200 || typeof auth !== 'string' || auth.length > 100
  ) {
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
          userAgent: (req.headers.get('user-agent') || '').slice(0, 300),
          userId: gate.auth.userId,
        },
      },
      { upsert: true, new: true },
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Push subscribe error:', error);
    return NextResponse.json({ message: 'Failed to save subscription' }, { status: 500 });
  }
}
