'use client';
import { useEffect } from 'react';
import axios from 'axios';

// Registers this device for Web Push so admin alerts (new WhatsApp message /
// website chat handoff / new lead) arrive EVEN WHEN THE APP IS CLOSED — the
// piece the in-app poller (useWhatsAppUnread) can't do on its own.
//
// Flow: ensure the service worker is registered → ask notification permission →
// subscribe via the Push API using our VAPID public key → send the subscription
// to the server (/api/admin/push/subscribe), which stores it and later pushes to
// it. Everything is best-effort and guarded: an unsupported browser or a denied
// permission simply leaves the existing open-app badge behaviour untouched.

// VAPID public keys are base64url; the Push API needs them as a Uint8Array.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function subscribe(): Promise<void> {
  try {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) return; // keys not configured — skip silently

    // Only proceed once the admin has granted notification permission (the app
    // asks for it via requestNotifyPermission on entry).
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

    // Make sure the SW is registered + ready (idempotent — other components also
    // register it for install/offline).
    if (!(await navigator.serviceWorker.getRegistration())) {
      await navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    const reg = await navigator.serviceWorker.ready;

    // Reuse an existing subscription, else create one.
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // Cast: TS's DOM lib narrows to ArrayBuffer-backed views; a plain
        // Uint8Array is fine at runtime.
        applicationServerKey: urlBase64ToUint8Array(vapid) as unknown as BufferSource,
      });
    }

    // Upsert on the server (keyed by endpoint), so repeat calls are harmless.
    await axios.post('/api/admin/push/subscribe', sub.toJSON());
  } catch {
    /* unsupported / denied / offline — the open-app badge still works. */
  }
}

/**
 * Subscribe this device to admin Web Push. Safe to call on every admin app load;
 * it retries once shortly after mount in case notification permission was just
 * granted. Pass `enabled=false` before login to keep it dormant.
 */
export function usePushSubscribe(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    subscribe();
    // Permission may be granted a moment after entry (the prompt is async), so
    // try once more shortly after.
    const id = setTimeout(subscribe, 4000);
    return () => clearTimeout(id);
  }, [enabled]);
}

// Tell the service worker the admin has seen the messages, so it clears the
// closed-state icon badge too (the open-app path clears its own badge already).
export function notifySeenToSW(): void {
  try {
    if (typeof navigator !== 'undefined' && navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'seen' });
    }
  } catch {
    /* ignore */
  }
}
