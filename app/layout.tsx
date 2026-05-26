import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VoiceAssistant from '@/components/VoiceAssistant';
import Script from 'next/script';
import FixedFooter from '@/components/FixedFooter';
 
const BASE_URL = 'https://www.ezyloan.co.in';
 
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'EzyLoan - Quick & Easy Loans Online | Personal, Business, Car Loans',
    template: '%s | EzyLoan',
  },
  description: 'Get instant approval on personal loans, business loans, car loans & more. Low interest rates*, minimal documentation, 100% online process with EzyLoan. *Rates subject to lender approval.',
  keywords: [
    'personal loan', 'business loan', 'car loan', 'loan online', 'instant loan',
    'ezyloan', 'quick loan', 'low interest loan', 'loan against property', 'gold loan',
    'loan facilitator', 'DSA', 'NBFC partner', 'RBI compliant loans', 'Cuttack loans',
    'Odisha loans', 'loan calculator', 'EMI calculator',
  ],
  authors: [{ name: 'EzyLoan (Dibyansh Associates)', url: BASE_URL }],
  creator: 'EzyLoan (Dibyansh Associates)',
  publisher: 'EzyLoan (Dibyansh Associates)',
  formatDetection: { email: false, address: false, telephone: false },
 
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.webp', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.webp', sizes: '180x180', type: 'image/png' }],
    other: [
      { rel: 'icon', type: 'image/png', sizes: '192x192', url: '/icon-192x192.webp' },
      { rel: 'icon', type: 'image/png', sizes: '512x512', url: '/icon-512x512.webp' },
    ],
  },
  manifest: '/site.webmanifest',
 
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: BASE_URL,
    siteName: 'EzyLoan',
    title: 'EzyLoan - Quick & Easy Loans Online',
    description: 'Get instant approval on personal, business & car loans. Low rates*, minimal docs. *Subject to lender approval.',
    images: [{ url: `${BASE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'EzyLoan - Easy Loan Solutions | DSA Partner', type: 'image/jpeg' }],
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
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
 
  alternates: {
    canonical: BASE_URL,
    languages: { 'en-IN': BASE_URL, 'hi-IN': `${BASE_URL}/hi` },
  },
 
  verification: { google: 'c3pN2EwCNU3FYYKl5rZC633St33eRYWNDgSouS9nmI0' },
 
  other: {
    'financial-service-type': 'loan-facilitation',
    'rbi-compliant': 'true',
    'dsa-entity': 'Dibyansh Associates',
    'service-area': 'India',
    'lender-disclaimer': 'EzyLoan is a DSA, not a direct lender. Rates* and approval subject to partner NBFC/bank policy.',
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
    logo: `${BASE_URL}/logo.webp`,
    image: `${BASE_URL}/og-image.jpg`,
    description: 'EzyLoan is a loan facilitation service provider (DSA) connecting borrowers with RBI-regulated partner banks and NBFCs across India. We are not a direct lender.',
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
    sameAs: [
      'https://www.facebook.com/ezyloan',
      'https://twitter.com/ezyloan',
      'https://www.linkedin.com/company/ezyloan',
    ],
    additionalType: 'DirectSellingAgent',
    regulatoryCompliance: ['RBI-DSA-Guidelines', 'IT-Act-2000', 'PMLA-KYC'],
    disclaimer: 'EzyLoan does not sanction, disburse, or collect loans. All loan decisions are made by partner lenders.',
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
    <html lang="en-IN" className="scroll-smooth">
      <head>
        <meta name="geo.region" content="IN-OR" />
        <meta name="geo.placename" content="Cuttack, Odisha, India" />
        <meta name="geo.position" content="20.4618;85.8812" />
        <meta name="financial-service-type" content="loan-facilitation" />
        <meta name="rbi-compliant" content="true" />
        <meta name="dsa-entity" content="Dibyansh Associates" />
        <meta name="lender-disclaimer" content="EzyLoan is a DSA, not a direct lender. All loan terms determined by partner institutions." />
 
        {/* ✅ FIX: Only preconnect to origins actually used in critical path */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
 
        {/* ✅ FIX: Preload LCP images — prevents LCP delay */}
        <link
          rel="preload"
          as="image"
          href="/_next/image?url=%2Fhomebanner%2Fimage1.webp&w=384&q=75"
          media="(max-width: 768px)"
        />
        <link
          rel="preload"
          as="image"
          href="/_next/image?url=%2Fhomebanner%2Fbannerimg.webp&w=640&q=75"
          media="(min-width: 769px)"
        />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* ✅ DNS PREFETCH */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* ✅ ICON */}
        <link rel="icon" href="/favicon.ico" />

        {/* ✅ STRUCTURED DATA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-white text-gray-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>
 
        <Header />
 
        {/* ✅ FIX: Reserve space for header to prevent CLS */}
        <main id="main-content" className="flex-grow min-h-[calc(100vh-400px)]" role="main">
          {children}
        </main>
 
        <Footer />
        <VoiceAssistant />
        <FixedFooter />
 
        <div id="cookie-consent" className="hidden" role="region" aria-label="Cookie consent" />
 
        {/* ✅ FIX: Google Ads loaded AFTER page — afterInteractive so it never blocks LCP/FCP */}
        <Script
          id="google-ads-gtag"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=AW-18024243962"
        />
        <Script
          id="google-ads-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-18024243962',{'send_page_view':true});`,
          }}
        />
      </body>
    </html>
  );
}