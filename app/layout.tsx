import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import VoiceAssistant from '@/components/VoiceAssistant'
import FixedFooter from '@/components/FixedFooter'

// ✅ NEW (Google Font Optimized)
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300','400','500','600','700']
})

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
    'EzyLoan is a trusted loan facilitation platform offering car loans, personal loans, property loans and more across India.',
  alternates: {
    canonical: 'https://ezyloan.co.in',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EzyLoan',
  url: 'https://ezyloan.co.in',
  logo: 'https://ezyloan.co.in/logo.png',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
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
        {/* 🚀 Preconnect to API + Cloudinary so DNS+TLS happens in parallel with JS bundle */}
        <link rel="preconnect" href="https://api.ezyloan.co.in" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.ezyloan.co.in" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* ✅ DNS PREFETCH */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* ✅ ICON */}
        <link rel="icon" href="/favicon.ico" />

        {/* ✅ STRUCTURED DATA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        {/* ✅ PRELOAD HERO IMAGE (IMPORTANT) */}
        <link
          rel="preload"
          as="image"
          href="/homebanner/image1.webp"
        />
      </head>

      <body>
        {/* ✅ DELAYED GTM (BIG PERFORMANCE BOOST) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18024243962"
          strategy="lazyOnload"
        />

        <Script id="gtag-init" strategy="lazyOnload">
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

        {/* ✅ OPTIONAL: lazy load heavy components */}
        <VoiceAssistant />
        <FixedFooter />
      </body>
    </html>
  )
}