// Minimal service worker — its only real job is to make the site installable as
// a PWA (browsers want a registered SW with a fetch handler) and to serve a
// cached shell when offline. It deliberately does NOT cache API/admin data, so
// WhatsApp chats are always fetched fresh from the network.

const CACHE = 'ezyloan-shell-v2';
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
