import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ConditionalHeader from '@/components/ConditionalHeader';
import ConditionalFooter from '@/components/ConditionalFooter';
import ScrollReveal from '@/components/ScrollReveal';
import Script from 'next/script';
import MetaPixel from '@/components/MetaPixel';
import { GOOGLE_ADS_ID } from '@/lib/ads';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  // Don't preload the font: on slow 4G it competes with the LCP hero image for
  // bandwidth. With display:swap, text paints instantly in the fallback and
  // swaps to Inter once loaded, while the high-priority image wins the pipe.
  preload: false,
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true,
});

const BASE_URL = 'https://www.ezyloan.co.in';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'EzyLoan - Quick & Easy Loans Online | Personal, Business, Car Loans',
    template: '%s | EzyLoan',
  },
  description:
    'Get instant approval on personal loans, business loans, car loans & more. Low interest rates*, minimal documentation, 100% online process with EzyLoan. *Rates subject to lender approval.',
  keywords: [
    'personal loan', 'business loan', 'car loan', 'loan online', 'instant loan',
    'ezyloan', 'quick loan', 'low interest loan', 'loan against property',
    'loan facilitator', 'DSA', 'NBFC partner', 'RBI compliant loans',
    'Cuttack loans', 'Odisha loans', 'loan calculator', 'EMI calculator',
  ],
  authors: [{ name: 'EzyLoan (Dibyansh Associates)', url: BASE_URL }],
  creator: 'EzyLoan (Dibyansh Associates)',
  publisher: 'EzyLoan (Dibyansh Associates)',
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    // Google's search-result favicon crawler (and every browser) auto-discovers
    // /favicon.ico first, so it's listed as the primary square icon. The old
    // /favicon.webp was the WIDE horizontal wordmark — at 16px it collapsed into
    // an unrecognizable orange blob in Google results. These are square crops of
    // the actual EzyLoan hexagon mark. (Apple icon was the unrelated orange
    // "touch" glyph — replaced with the brand mark too.)
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'EzyLoan',
    title: 'EzyLoan - Quick & Easy Loans Online',
    description:
      'Get instant approval on personal, business & car loans. Low rates*, minimal docs. *Subject to lender approval.',
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'EzyLoan - Easy Loan Solutions | DSA Partner',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EzyLoan - Quick & Easy Loans Online',
    description: 'Get instant approval on personal, business & car loans. *Rates subject to approval.',
    images: [`${BASE_URL}/og-image.jpg`],
    creator: '@ezyloan',
    site: '@ezyloan',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // NOTE: No global `canonical` here on purpose. A canonical set in the root
  // layout is inherited by EVERY page, making them all point to the homepage,
  // which de-indexes them. Each page declares its own self-referencing canonical.
  verification: { google: 'c3pN2EwCNU3FYYKl5rZC633St33eRYWNDgSouS9nmI0' },
  other: {
    'financial-service-type': 'loan-facilitation',
    'rbi-compliant': 'true',
    'dsa-entity': 'Dibyansh Associates',
    'service-area': 'India',
    'lender-disclaimer':
      'EzyLoan is a DSA, not a direct lender. Rates* and approval subject to partner NBFC/bank policy.',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'EzyLoan (Dibyansh Associates)',
    url: BASE_URL,
    // Google reads this for the Search/Knowledge-panel logo. It must be a real,
    // crawlable raster file — /logo.png is the brand wordmark (600x454, PNG).
    logo: `${BASE_URL}/logo.png`,
    image: `${BASE_URL}/og-image.jpg`,
    description:
      'EzyLoan is a loan facilitation service provider (DSA) connecting borrowers with RBI-regulated partner banks and NBFCs across India. We are not a direct lender.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur',
      addressLocality: 'Cuttack',
      addressRegion: 'Odisha',
      postalCode: '753011',
      addressCountry: 'IN',
    },
    geo: { '@type': 'GeoCoordinates', latitude: 20.4618, longitude: 85.8812 },
    priceRange: '₹',
    areaServed: 'IN',
    availableLanguage: ['en', 'hi', 'or'],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-6372977626',
      contactType: 'Customer Service',
      email: 'care@ezyloan.co.in',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '19:00',
      },
    },
    // sameAs links Google to your OFFICIAL social profiles. Wrong/non-existent
    // URLs hurt entity trust, so the previous GUESSED handles were removed.
    // TODO: add the real profile URLs here, e.g.
    //   'https://www.facebook.com/<real>', 'https://www.instagram.com/<real>',
    //   'https://www.linkedin.com/company/<real>'
    sameAs: [],
    additionalType: 'DirectSellingAgent',
    regulatoryCompliance: ['RBI-DSA-Guidelines', 'IT-Act-2000', 'PMLA-KYC'],
    disclaimer:
      'EzyLoan does not sanction, disburse, or collect loans. All loan decisions are made by partner lenders.',
  };

  const webSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EzyLoan',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-IN',
  };

  return (
    <html lang="en-IN" className={inter.variable}>
      <head>
        {/* GEO & COMPLIANCE META */}
        <meta name="geo.region" content="IN-OR" />
        <meta name="geo.placename" content="Cuttack, Odisha, India" />
        <meta name="geo.position" content="20.4618;85.8812" />
        <meta name="financial-service-type" content="loan-facilitation" />
        <meta name="rbi-compliant" content="true" />
        <meta name="dsa-entity" content="Dibyansh Associates" />
        <meta
          name="lender-disclaimer"
          content="EzyLoan is a DSA, not a direct lender. All loan terms determined by partner institutions."
        />

        {/* ✅ RESOURCE HINTS - dns-prefetch only (gtag loads via worker; preconnect was unused) */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />

        {/* LCP image preloads are emitted automatically by next/image via the
            `priority` prop on the mobile hero <Image>, with the correct responsive
            srcset. No manual preload needed (avoids duplicate/un-gated preloads). */}

        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />

        {/* ✅ INLINE CRITICAL CSS - Eliminates 670ms render-blocking */}
        <style dangerouslySetInnerHTML={{ __html: `
          .hero-section{position:relative;background:linear-gradient(135deg,#eff6ff,#fff,#ecfeff);padding-top:4rem}
          @media(min-width:640px){.hero-section{padding-top:5rem}}
          @media(min-width:1024px){.hero-section{padding-top:6rem}}
          .hero-section .rounded-full{border-radius:9999px}
          .max-w-7xl{max-width:80rem;margin-left:auto;margin-right:auto}
          .px-4{padding-left:1rem;padding-right:1rem}
          @media(min-width:640px){.px-4{padding-left:1.5rem;padding-right:1.5rem}}
          @media(min-width:1024px){.px-4{padding-left:2rem;padding-right:2rem}}
        `}} />

        {/* STRUCTURED DATA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>

      <body
        suppressHydrationWarning
        className={`${inter.className} antialiased min-h-screen flex flex-col bg-white text-gray-900`}
      >
        {/* Skip link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>

        <ConditionalHeader />
        <ScrollReveal />
        <main id="main-content" className="flex-grow min-h-[calc(100vh-400px)]" role="main">
          {children}
        </main>
        <ConditionalFooter />

        <div id="cookie-consent" className="hidden" role="region" aria-label="Cookie consent" />

        {/* ✅ META (FACEBOOK) PIXEL - base code + PageView, site-wide.
            Inert until NEXT_PUBLIC_META_PIXEL_ID is set (see components/MetaPixel.tsx). */}
        <MetaPixel />

        {/* ✅ GOOGLE ADS - loaded ONCE here for the whole site.
            The inline init runs `afterInteractive` so window.gtag + dataLayer
            exist immediately — any early conversion call just queues into
            dataLayer. The heavy 140KB gtag.js loader is `lazyOnload` (after the
            load event) so it stays OFF the LCP/TBT critical path; it drains the
            queued dataLayer the moment it arrives, so conversions (apply-now,
            ThankYouPage, hero CTA) still fire. The previous `worker` strategy
            needed Partytown, which is not configured, so it never ran reliably.
            Do NOT re-add per-page copies of this snippet — single source of truth. */}
        <Script
          id="google-ads-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GOOGLE_ADS_ID}',{'send_page_view':true});`,
          }}
        />
        <Script
          id="google-ads-gtag"
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        />
      </body>
    </html>
  );
}