'use client';

import { useEffect } from 'react';
import { META_PIXEL_ID } from '@/components/MetaPixel';
import { GA4_MEASUREMENT_ID } from '@/lib/ads';

// Starts the Meta Pixel / GA4 with IDs saved in Admin → Marketing & Ads →
// Settings → API keys, so they work without a rebuild. IDs baked in at build
// time (NEXT_PUBLIC_META_PIXEL_ID / NEXT_PUBLIC_GA4_MEASUREMENT_ID) take
// precedence, and then nothing is fetched. Runs after the page is idle so it
// stays off the critical rendering path.

/* eslint-disable @typescript-eslint/no-explicit-any */

function startPixel(id: string) {
  const w = window as any;
  if (w.fbq) return;
  const n: any = function (...args: unknown[]) {
    if (n.callMethod) n.callMethod.call(n, ...args);
    else n.queue.push(args);
  };
  w.fbq = n;
  if (!w._fbq) w._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = '2.0';
  n.queue = [];
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  w.fbq('init', id);
  w.fbq('track', 'PageView');
}

function startGa4(id: string) {
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) w.gtag = function () { w.dataLayer.push(arguments); }; // eslint-disable-line prefer-rest-params
  w.gtag('config', id, process.env.NODE_ENV === 'production' ? {} : { debug_mode: true });
}

export default function SiteTags() {
  useEffect(() => {
    if (META_PIXEL_ID && GA4_MEASUREMENT_ID) return;
    const run = () =>
      fetch('/api/site-tags')
        .then((r) => (r.ok ? r.json() : null))
        .then((t) => {
          if (!t) return;
          if (!META_PIXEL_ID && t.metaPixelId) startPixel(t.metaPixelId);
          if (!GA4_MEASUREMENT_ID && t.ga4MeasurementId) startGa4(t.ga4MeasurementId);
        })
        .catch(() => undefined);
    const w = window as any;
    const handle = w.requestIdleCallback ? w.requestIdleCallback(run, { timeout: 4000 }) : window.setTimeout(run, 2500);
    return () => (w.cancelIdleCallback && w.requestIdleCallback ? w.cancelIdleCallback(handle) : window.clearTimeout(handle));
  }, []);
  return null;
}
