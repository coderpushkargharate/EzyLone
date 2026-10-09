/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't advertise the framework/version in every response.
  poweredByHeader: false,
  images: {
    // Cache optimized images for 1 year (fixes "Use efficient cache lifetimes")
    minimumCacheTTL: 31536000,
    // Only hosts the site actually uses. Every allowed host is fed to the image
    // optimizer (sharp/libvips), so hosts where anyone can upload files
    // (wikimedia, pexels) were removed, and Cloudinary is limited to this
    // account's own cloud rather than every Cloudinary customer's uploads.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        ...(process.env.CLOUDINARY_CLOUD_NAME ? { pathname: `/${process.env.CLOUDINARY_CLOUD_NAME}/**` } : {}),
      },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'www.google.com' },
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
      // Articles live at /blog/<slug> but the index is /blogs — so a visitor (or
      // crawler) trimming an article URL back to /blog would otherwise hit a 404.
      { source: '/blog', destination: '/blogs', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          // The legacy XSS auditor is removed from modern browsers and could be
          // abused in old ones; '0' is the current recommendation.
          { key: 'X-XSS-Protection', value: '0' },
          // Content-Security-Policy: the directives below are safe for every
          // page (no third-party script/style inventory needed) and close the
          // highest-value gaps — clickjacking, <base> hijacking, plugin content,
          // forms posting off-site, and mixed content. Script/style/connect
          // sources are intentionally not restricted yet: the site loads Google
          // Ads, Meta Pixel and inline JSON-LD/init scripts, and a strict list
          // would need nonces (making every page dynamic) — see SECURITY.md.
          {
            key: 'Content-Security-Policy',
            // upgrade-insecure-requests only in production (it would break http://localhost dev).
            value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" +
              (process.env.NODE_ENV === 'production' ? '; upgrade-insecure-requests' : ''),
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // HSTS: force HTTPS for 2 years incl. subdomains and opt into the
          // browser preload list. Fixes the "HSTS header missing" site-health
          // check. Only honoured by browsers over HTTPS, so it's a no-op in
          // local http dev — safe to ship. (Behind the Hostinger CDN/nginx the
          // site is always HTTPS, so every real visitor gets it.)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Lock down powerful browser features the site never uses. Low-risk
          // hardening — no page here requests camera/mic/geolocation.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
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
