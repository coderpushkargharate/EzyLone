import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import VoiceAssistant from '@/components/VoiceAssistant'
import FixedFooter from '@/components/FixedFooter'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: {
    default: 'EzyLoan – Fast Car & Personal Loans in India',
    template: '%s | EzyLoan',
  },
  description:
    'EzyLoan is a trusted loan facilitation platform offering car loans, personal loans, property loans and more across India. Get quick approvals and competitive rates.',
  keywords: [
    'car loan',
    'personal loan',
    'property loan',
    'vehicle loan',
    'loan facilitation',
    'EzyLoan',
    'India loans',
  ],
  authors: [{ name: 'EzyLoan' }],
  creator: 'EzyLoan',
  publisher: 'EzyLoan',
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
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ezyloan.co.in',
    siteName: 'EzyLoan',
    title: 'EzyLoan – Fast Car & Personal Loans in India',
    description:
      'EzyLoan is a trusted loan facilitation platform offering car loans, personal loans, property loans and more across India.',
    images: [
      {
        url: 'https://ezyloan.co.in/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EzyLoan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EzyLoan – Fast Car & Personal Loans in India',
    description:
      'EzyLoan is a trusted loan facilitation platform offering car loans, personal loans, property loans and more across India.',
    images: ['https://ezyloan.co.in/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://ezyloan.co.in',
  },
  verification: {
    google: 'your-google-site-verification',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EzyLoan',
  url: 'https://ezyloan.co.in',
  logo: 'https://ezyloan.co.in/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-XXXXXXXXXX',
    contactType: 'customer service',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://www.facebook.com/ezyloan',
    'https://www.instagram.com/ezyloan',
  ],
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'EzyLoan',
  url: 'https://ezyloan.co.in',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://ezyloan.co.in/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18024243962"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18024243962');
          `}
        </Script>
        <Header />
        <main>{children}</main>
        <Footer />
        <VoiceAssistant />
        <FixedFooter />
      </body>
    </html>
  )
}
