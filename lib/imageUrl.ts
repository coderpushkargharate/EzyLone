// Resized image URLs for CMS images (pure; safe on server and client).
//
// Blog images are uploaded to Cloudinary at full size and were served as the
// original JPEG even in 400px cards. Cloudinary resizes and picks the best
// format (AVIF/WebP) at its edge when the URL carries a transformation, so the
// browser downloads a small file without any change to the stored image.

const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;
// First path segment after /upload/ that is already a transformation (e.g. c_fill,w_400).
const TRANSFORM_SEGMENT = /^[a-z]{1,3}_[^/]*\//;

/**
 * URL of `src` resized to `width` (and cropped to `height` when given).
 * Cloudinary URLs get `f_auto,q_auto,c_fill/c_limit,w_…`; Unsplash URLs get
 * their `w` param replaced. Anything else (local files, other hosts, Cloudinary
 * URLs that already carry a transformation) is returned unchanged.
 */
export function resizedImage(src: string | undefined | null, width: number, height?: number): string {
  if (!src) return '';
  const w = Math.max(1, Math.round(width));
  const m = src.match(CLOUDINARY_UPLOAD);
  if (m) {
    if (TRANSFORM_SEGMENT.test(m[2])) return src;
    const t = height
      ? `f_auto,q_auto,c_fill,g_auto,w_${w},h_${Math.max(1, Math.round(height))}`
      : `f_auto,q_auto,c_limit,w_${w}`;
    return `${m[1]}${t}/${m[2]}`;
  }
  try {
    const u = new URL(src);
    if (u.hostname === 'images.unsplash.com') {
      u.searchParams.set('w', String(w));
      if (height) { u.searchParams.set('h', String(Math.round(height))); u.searchParams.set('fit', 'crop'); }
      if (!u.searchParams.has('auto')) u.searchParams.set('auto', 'format');
      return u.toString();
    }
  } catch {
    /* relative or invalid URL: leave as is */
  }
  return src;
}

/** srcSet for the given widths (aspect ratio kept when `ratio` = height/width is given). */
export function resizedSrcSet(src: string | undefined | null, widths: number[], ratio?: number): string | undefined {
  if (!src) return undefined;
  const urls = widths.map((w) => [resizedImage(src, w, ratio ? w * ratio : undefined), w] as const);
  // Not a resizable host: a srcSet of identical URLs is pointless.
  if (urls.every(([u]) => u === src)) return undefined;
  return urls.map(([u, w]) => `${u} ${w}w`).join(', ');
}
