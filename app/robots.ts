import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.ezyloan.co.in';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // NOTE: the admin panel + login live on obscured paths and are
        // deliberately NOT listed here — listing them in robots.txt would
        // publicly reveal the secret URLs. They carry `noindex` metadata instead.
        disallow: ['/ThankYouPage', '/api/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
