// Server-side Web Push sender for the admin app.
//
// Any time a customer does something a staff member should see immediately — a
// new WhatsApp message, a website-chat handoff, or a fresh CRM lead — the server
// calls sendAdminPush(). It pushes a notification to every device that installed
// the admin PWA and allowed notifications, so the alert (top-of-screen banner +
// home-screen icon count) arrives EVEN WHEN THE APP IS CLOSED.
//
// Contract: fire-and-forget, never throws. A push failure must never break the
// request (webhook reply, lead capture, chat reply) that triggered it.

import webpush from 'web-push';
import { connectDB } from '@/lib/db';
import { PushSubscription } from '@/lib/models/PushSubscription';

// Configure VAPID once at module load. If the keys aren't set we simply disable
// pushes (the rest of the app keeps working, and the in-app badge still runs).
let configured = false;
function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@ezyloan.co.in',
      publicKey,
      privateKey,
    );
    configured = true;
    return true;
  } catch (e) {
    console.error('Web Push VAPID config failed:', e);
    return false;
  }
}

export interface AdminPushInput {
  title: string;
  body: string;
  url?: string;   // where clicking the notification should take the admin
  tag?: string;   // groups/replaces notifications of the same kind
}

/**
 * Push a notification to every registered admin device. Prunes any subscription
 * the push service reports as gone (404/410). Never throws.
 */
export async function sendAdminPush(input: AdminPushInput): Promise<void> {
  if (!ensureConfigured()) return; // keys not set — skip silently

  try {
    await connectDB();
    const subs = await PushSubscription.find().lean();
    if (!subs.length) return;

    const payload = JSON.stringify({
      title: input.title,
      body: input.body,
      url: input.url || '/admin',
      tag: input.tag || 'ezy-admin',
    });

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: s.keys as { p256dh: string; auth: string } },
            payload,
          );
        } catch (err: any) {
          const code = err?.statusCode;
          // 404/410 = the browser dropped this subscription. Remove it so we
          // don't keep pushing to a dead endpoint.
          if (code === 404 || code === 410) {
            try {
              await PushSubscription.deleteOne({ endpoint: s.endpoint });
            } catch {
              /* ignore */
            }
          } else {
            console.error('Web Push send failed:', code || err?.message || err);
          }
        }
      }),
    );
  } catch (e) {
    console.error('sendAdminPush failed (ignored):', e);
  }
}
