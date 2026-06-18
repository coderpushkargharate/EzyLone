// In-memory per-page banner cache (TTL 5 min). Lives on the Node global so it
// survives dev hot-reload and is shared across route handlers. Kept out of the
// route files because Next.js route modules may only export HTTP handlers.

interface BannerCacheEntry {
  data: unknown[];
  expiresAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var _bannerCache: Map<string, BannerCacheEntry> | undefined;
}

export const bannerCache = global._bannerCache || new Map<string, BannerCacheEntry>();
global._bannerCache = bannerCache;

export const BANNER_TTL_MS = 5 * 60 * 1000;

export function invalidateBannerCache(): void {
  bannerCache.clear();
}
