/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cache optimized images for 1 year (fixes "Use efficient cache lifetimes")
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
  // Consolidate the apex domain onto the canonical www host so Google doesn't
  // index ezyloan.co.in and www.ezyloan.co.in as duplicates. Every canonical tag
  // in the app already points at www.ezyloan.co.in. (If your DNS/host already
  // forces www at the platform level, this rule simply never fires — harmless.)
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'ezyloan.co.in' }],
        destination: 'https://www.ezyloan.co.in/:path*',
        permanent: true,
      },
      // Legacy/short legal URLs. The real pages are /terms-and-conditions and
      // /privacy-policy; all in-app links already point there directly, so these
      // 301s only catch external/bookmarked/email references to the short paths.
      { source: '/terms', destination: '/terms-and-conditions', permanent: true },
      { source: '/privacy', destination: '/privacy-policy', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Content-hashed build assets (JS/CSS/fonts) never change for a given
        // URL — cache them for a year, immutable. Fixes "Use efficient cache
        // lifetimes" for any first-party /_next/static request.
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
