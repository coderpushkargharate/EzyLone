import type { MetadataRoute } from 'next';

// PWA manifest — makes the site installable as an app on a phone's home screen
// ("Add to Home Screen" / the in-app Install button). The admin opens the
// installed app straight into the WhatsApp-chat "Access" mode (remembered in
// localStorage), giving a standalone, WhatsApp-like experience.
//
// Next.js serves this at /manifest.webmanifest and injects the <link> on every
// page automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EzyLoan Admin',
    short_name: 'EzyLoan',
    description: 'EzyLoan admin & WhatsApp chats',
    start_url: '/admin',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
      { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
