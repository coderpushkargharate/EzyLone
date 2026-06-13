'use client';

import Script from 'next/script';

/**
 * Meta (Facebook) Pixel — base code + PageView.
 *
 * Set your numeric Pixel ID (from Meta Events Manager) in the environment as
 * `NEXT_PUBLIC_META_PIXEL_ID` (e.g. in `.env.local` or your host's env vars).
 * Until that is set the Pixel stays inert, so nothing breaks in dev or before
 * the Meta ad account is ready. Once set, Meta ads / retargeting / conversions
 * will track automatically site-wide.
 */
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

/** Fire a Meta "Lead" conversion event (safe no-op if the Pixel isn't loaded). */
export function trackMetaLead(data?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Lead', data);
  }
}

export default function MetaPixel() {
  if (!META_PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
