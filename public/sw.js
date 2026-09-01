// Minimal service worker — its only real job is to make the site installable as
// a PWA (browsers want a registered SW with a fetch handler) and to serve a
// cached shell when offline. It deliberately does NOT cache API/admin data, so
// WhatsApp chats are always fetched fresh from the network.

const CACHE = 'ezyloan-shell-v3';
// Precache both app shells: "/" for the customer website app and "/admin" for
// the admin/WhatsApp app.
const SHELL = ['/', '/admin', '/favicon.ico', '/icon-192.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Only handle GET navigations/assets. Never touch API calls — those must be
  // live (auth cookies, chat data) so we let them go straight to the network.
  if (req.method !== 'GET' || new URL(req.url).pathname.startsWith('/api')) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Cache a copy of successful navigations/assets for offline fallback.
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(req).then(
          // Offline fallback: admin routes fall back to the admin shell, every
          // other page to the customer website home.
          (hit) => hit || caches.match(new URL(req.url).pathname.startsWith('/admin') ? '/admin' : '/'),
        ),
      ),
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Web Push — the part that makes notifications work with the app CLOSED.
//
// The server (lib/push.ts) pushes a small JSON payload to this SW even when no
// tab is open. We show the system notification, and keep a running "unread"
// counter in IndexedDB (SW globals don't survive restarts) so the installed
// app's home-screen icon shows how many messages arrived — WhatsApp style. The
// counter resets when the admin opens/clicks into the app.
// ─────────────────────────────────────────────────────────────────────────────

const BADGE_DB = 'ezy-push';
const BADGE_STORE = 'kv';
const BADGE_KEY = 'unread';

function badgeDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BADGE_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(BADGE_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function badgeGet() {
  return badgeDb()
    .then(
      (db) =>
        new Promise((resolve) => {
          const r = db.transaction(BADGE_STORE, 'readonly').objectStore(BADGE_STORE).get(BADGE_KEY);
          r.onsuccess = () => resolve(Number(r.result) || 0);
          r.onerror = () => resolve(0);
        }),
    )
    .catch(() => 0);
}

function badgeSet(n) {
  return badgeDb()
    .then(
      (db) =>
        new Promise((resolve) => {
          const tx = db.transaction(BADGE_STORE, 'readwrite');
          tx.objectStore(BADGE_STORE).put(n, BADGE_KEY);
          tx.oncomplete = () => resolve(n);
          tx.onerror = () => resolve(n);
        }),
    )
    .catch(() => n);
}

// Reflect a count on the installed app icon (Badging API). Silently ignored on
// platforms that don't support it — the in-app red circle still works there.
function applyAppBadge(n) {
  try {
    if (n > 0 && self.navigator && navigator.setAppBadge) return navigator.setAppBadge(n);
    if (self.navigator && navigator.clearAppBadge) return navigator.clearAppBadge();
  } catch {
    /* not supported */
  }
}

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'New notification', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'EzyLone';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'ezy-admin',
    renotify: true, // buzz again even if a notification with this tag exists
    data: { url: data.url || '/admin' },
  };

  event.waitUntil(
    badgeGet()
      .then((n) => badgeSet(n + 1))
      .then((n) => {
        applyAppBadge(n);
        return self.registration.showNotification(title, options);
      }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/admin';

  event.waitUntil(
    (async () => {
      // Opening the app = the admin has seen the alerts. Clear the count.
      await badgeSet(0);
      applyAppBadge(0);

      const all = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      // Focus an already-open admin window if there is one, else open a new one.
      const existing = all.find((c) => c.url.includes('/admin'));
      if (existing) return existing.focus();
      if (clients.openWindow) return clients.openWindow(url);
    })(),
  );
});

// The page tells us "the admin looked at the messages" (opened the chats/panel)
// so we clear the closed-state badge too, keeping the icon count in sync.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'seen') {
    event.waitUntil(badgeSet(0).then(() => applyAppBadge(0)));
  }
});
