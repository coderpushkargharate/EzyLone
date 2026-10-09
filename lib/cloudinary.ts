import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import dns from 'dns';

// On VPS hosts the IPv6 route to Cloudinary/Mongo is often broken or very slow,
// which makes Node hang on the AAAA address until it times out (499 TimeoutError).
// Preferring IPv4 avoids that dead path. Safe: it still falls back to IPv6.
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  /* older Node without this API — ignore */
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  // Give slow VPS↔Cloudinary links more room before giving up (ms).
  timeout: 120000,
});

export { cloudinary };

/**
 * Delete an asset given its secure URL. Returns a promise (fire-and-forget ok).
 * Only URLs on this account's Cloudinary cloud are accepted, and the resource
 * type (image vs raw, e.g. PDFs) is read from the URL so raw files are removed too.
 */
export function destroyImageByUrl(url: string) {
  const parsed = parseCloudinaryUrl(url);
  if (!parsed) return Promise.resolve({ result: 'skipped' });
  return cloudinary.uploader.destroy(parsed.publicId, { resource_type: parsed.resourceType });
}

/** Delete a raw asset (e.g. resume PDF) by its public_id. */
export function destroyRaw(publicId: string) {
  return cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
}

/** Upload a Buffer to Cloudinary via an upload stream. */
export function uploadBuffer(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ timeout: 120000, ...options }, (error, result) => {
      if (error || !result) reject(error || new Error('Upload failed'));
      else resolve(result);
    });
    stream.end(buffer);
  });
}

/**
 * Parse a delivery URL of this account's cloud:
 *   https://res.cloudinary.com/<cloud>/<image|raw|video>/upload/[transforms/][v123/]<public_id>[.ext]
 * Image/video public_ids exclude the extension; raw public_ids include it.
 * Returns null for anything that isn't an asset of the configured cloud.
 */
export function parseCloudinaryUrl(
  url: string
): { publicId: string; resourceType: 'image' | 'raw' | 'video' } | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (u.hostname !== 'res.cloudinary.com') return null;
  const parts = u.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const [cloudName, resourceType, deliveryType, ...rest] = parts;
  if (cloud && cloudName !== cloud) return null;
  if (resourceType !== 'image' && resourceType !== 'raw' && resourceType !== 'video') return null;
  if (deliveryType !== 'upload' || rest.length === 0) return null;

  // Drop transformation segments and the version segment preceding the public_id.
  const vIdx = rest.findIndex((p) => /^v\d+$/.test(p));
  const idParts = vIdx >= 0 ? rest.slice(vIdx + 1) : rest.filter((p) => !p.includes(','));
  if (idParts.length === 0) return null;
  let publicId = idParts.join('/');
  if (resourceType !== 'raw') publicId = publicId.replace(/\.[a-z0-9]+$/i, '');
  return { publicId, resourceType };
}

/** Back-compat wrapper: the public_id of a Cloudinary URL ('' if not one). */
export function extractPublicIdFromUrl(url: string): string {
  return parseCloudinaryUrl(url)?.publicId || '';
}
