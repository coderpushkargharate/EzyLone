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
  if (!publicKey || !privateKey) {
    // Loud so it shows up in PM2 logs — a silent skip here is the #1 reason
    // background push "mysteriously" never arrives in production.
    console.warn(
      '[push] VAPID keys missing — background push DISABLED. ' +
        `VAPID_PUBLIC_KEY=${publicKey ? 'set' : 'MISSING'} ` +
        `VAPID_PRIVATE_KEY=${privateKey ? 'set' : 'MISSING'}`,
    );
    return false;
  }
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

/**
 * Runtime push diagnostics for the /api/admin/push/debug endpoint. Tells you, on
 * the LIVE server, whether the keys are loaded and how many devices are
 * subscribed — without exposing secrets.
 */
export async function getPushDiagnostics(): Promise<{
  vapidConfigured: boolean;
  serverPublicKeyPresent: boolean;
  serverPrivateKeyPresent: boolean;
  nextPublicKeyPresentOnServer: boolean;
  serverAndClientKeysMatch: boolean | null;
  subject: string;
  subscriptionCount: number;
  subscriptions: { endpointHost: string; userAgent: string; updatedAt: Date }[];
}> {
  const serverPublic = process.env.VAPID_PUBLIC_KEY || '';
  const nextPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  let subscriptionCount = 0;
  let subscriptions: { endpointHost: string; userAgent: string; updatedAt: Date }[] = [];
  try {
    await connectDB();
    const subs = await PushSubscription.find().lean();
    subscriptionCount = subs.length;
    subscriptions = subs.map((s: any) => {
      let host = '';
      try {
        host = new URL(s.endpoint).host;
      } catch {
        host = String(s.endpoint).slice(0, 40);
      }
      return { endpointHost: host, userAgent: s.userAgent || '', updatedAt: s.updatedAt };
    });
  } catch (e) {
    console.error('[push] diagnostics DB read failed:', e);
  }
  return {
    vapidConfigured: ensureConfigured(),
    serverPublicKeyPresent: !!serverPublic,
    serverPrivateKeyPresent: !!process.env.VAPID_PRIVATE_KEY,
    nextPublicKeyPresentOnServer: !!nextPublic,
    // Note: this compares the two SERVER-side vars. The value actually baked into
    // the browser bundle can only be checked in the client (see debug route note).
    serverAndClientKeysMatch: serverPublic && nextPublic ? serverPublic === nextPublic : null,
    subject: process.env.VAPID_SUBJECT || 'mailto:admin@ezyloan.co.in',
    subscriptionCount,
    subscriptions,
  };
}

export interface PushSendResult {
  configured: boolean;
  total: number;
  sent: number;
  removed: number;
  failed: number;
  errors: { endpointHost: string; statusCode?: number; message?: string }[];
}

export interface AdminPushInput {
  title: string;
  body: string;
  url?: string;      // where clicking the notification should take the admin
  tag?: string;      // groups/replaces notifications of the same kind
  dedupeId?: string; // stable id for THIS event (e.g. Twilio MessageSid). The
                     // service worker uses it to ignore webhook retries so the
                     // icon badge doesn't over-count the same message.
}

/**
 * Push a notification to every registered admin device. Prunes any subscription
 * the push service reports as gone (404/410). Never throws.
 *
 * Returns a result summary so a diagnostics endpoint can report exactly what the
 * push service did per device. Fire-and-forget callers can ignore the return.
 */
export async function sendAdminPush(input: AdminPushInput): Promise<PushSendResult> {
  const result: PushSendResult = { configured: false, total: 0, sent: 0, removed: 0, failed: 0, errors: [] };
  if (!ensureConfigured()) return result; // keys not set — logged in ensureConfigured()
  result.configured = true;

  const hostOf = (ep: string) => {
    try {
      return new URL(ep).host;
    } catch {
      return String(ep).slice(0, 40);
    }
  };

  try {
    await connectDB();
    const subs = await PushSubscription.find().lean();
    result.total = subs.length;
    if (!subs.length) {
      console.warn('[push] no subscriptions in DB — nothing to deliver to.');
      return result;
    }

    const payload = JSON.stringify({
      title: input.title,
      body: input.body,
      url: input.url || '/admin',
      tag: input.tag || 'ezy-admin',
      ...(input.dedupeId ? { dedupeId: input.dedupeId } : {}),
    });

    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: s.keys as { p256dh: string; auth: string } },
            payload,
          );
          result.sent++;
        } catch (err: any) {
          const code = err?.statusCode;
          // 404/410 = the browser dropped this subscription. Remove it so we
          // don't keep pushing to a dead endpoint.
          if (code === 404 || code === 410) {
            result.removed++;
            try {
              await PushSubscription.deleteOne({ endpoint: s.endpoint });
            } catch {
              /* ignore */
            }
          } else {
            result.failed++;
            result.errors.push({ endpointHost: hostOf(s.endpoint), statusCode: code, message: err?.message });
            // 403 here almost always = client bundle built with a DIFFERENT
            // NEXT_PUBLIC_VAPID_PUBLIC_KEY than the server's VAPID_PRIVATE_KEY.
            console.error('[push] send failed:', code || err?.message || err, hostOf(s.endpoint));
          }
        }
      }),
    );
  } catch (e) {
    console.error('sendAdminPush failed (ignored):', e);
  }
  return result;
}
