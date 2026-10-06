import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// robots.txt is a crawl hint, NOT access control — private areas are protected
// server-side (see lib/auth.ts). Notes:
//  - /api/ is not content, so it isn't crawled.
//  - Admin/login and the post-submit thank-you page are NOT disallowed: they
//    send `noindex`, and a crawler must be able to fetch a page to see that
//    (a disallowed URL can still be indexed from external links).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
