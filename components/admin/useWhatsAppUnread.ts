'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

// Tracks how many WhatsApp conversations have NEW activity since the admin last
// looked, and surfaces it three ways:
//   1) an in-app count (red circle on the WhatsApp app symbol / sidebar tab),
//   2) the installed app's home-screen icon badge (Badging API), and
//   3) a browser notification when fresh messages arrive while the app is open.
//
// "New" = a conversation whose latest message is newer than the timestamp we
// saved the last time the admin opened the chats. We have no per-message read
// state, so this conversation-level signal is the reliable proxy for "kitne
// naye message aaye".

const SEEN_KEY = 'wa_last_seen';

function getSeen(): number {
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(SEEN_KEY) || 0);
}

// Short "ring" when a new message arrives while the app is OPEN. Synthesised with
// the Web Audio API so we don't need to ship an audio asset; on a closed app the
// OS plays its own default notification sound for the pushed notification.
function playRing() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const beep = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = ctx.currentTime + start;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    };
    // Two quick rising tones — a friendly "ting-ting", WhatsApp-ish.
    beep(880, 0, 0.15);
    beep(1175, 0.16, 0.2);
    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch {
    /* autoplay blocked / unsupported — ignore. */
  }
}

// Let the service worker know the admin has seen the messages, so it clears the
// closed-state home-screen icon badge too (the open-app path clears its own).
function tellSWSeen() {
  try {
    if (typeof navigator !== 'undefined' && navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'seen' });
    }
  } catch {
    /* ignore */
  }
}

function setBadge(n: number) {
  try {
    const nav = navigator as any;
    if (n > 0 && typeof nav.setAppBadge === 'function') nav.setAppBadge(n);
    else if (typeof nav.clearAppBadge === 'function') nav.clearAppBadge();
  } catch {
    /* Badging API not supported — the in-app badge still works. */
  }
}

export function useWhatsAppUnread(enabled: boolean) {
  const [count, setCount] = useState(0);
  // Remember the last count so we only notify on a genuine increase, not on
  // every poll returning the same number.
  const prevCountRef = useRef(0);

  const read = useCallback(async () => {
    try {
      const res = await axios.get(`/api/admin/whatsapp-chats?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      });
      const rows: any[] = Array.isArray(res.data) ? res.data : [];
      const seen = getSeen();
      const fresh = rows.filter((c) => new Date(c.lastAt).getTime() > seen);
      const n = fresh.length;

      setCount(n);
      setBadge(n);

      // Notify only when the number goes UP (a new chat got activity) and the
      // admin has granted permission. Keeps it quiet on the first load.
      if (n > prevCountRef.current && prevCountRef.current >= 0 && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          const newest = fresh[0];
          new Notification('New WhatsApp message', {
            body: newest?.lastMessage ? String(newest.lastMessage).slice(0, 120) : `${n} chat(s) waiting for you.`,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: 'wa-unread',
          });
          playRing(); // audible ring while the app is open
        } catch {
          /* Notification construction can throw on some browsers — ignore. */
        }
      }
      prevCountRef.current = n;
    } catch {
      /* Not logged in / offline — leave the badge as-is. */
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    read();
    const id = setInterval(read, 20000); // poll every 20s
    return () => clearInterval(id);
  }, [enabled, read]);

  // Call when the admin opens the chats: everything up to now counts as seen.
  const markSeen = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.setItem(SEEN_KEY, String(Date.now()));
    prevCountRef.current = 0;
    setCount(0);
    setBadge(0);
    tellSWSeen(); // clear the closed-state (service-worker) icon badge too
  }, []);

  return { count, markSeen, refresh: read };
}

// Ask for notification permission once (no-op if already decided). Safe to call
// on a user gesture like entering the app.
export function requestNotifyPermission() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  } catch {
    /* ignore */
  }
}
