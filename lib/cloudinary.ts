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

/** Delete an image asset given its secure URL. Returns a promise (fire-and-forget ok). */
export function destroyImageByUrl(url: string) {
  return cloudinary.uploader.destroy(extractPublicIdFromUrl(url));
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

/** Best-effort extraction of a Cloudinary public_id from a secure URL (for deletes). */
export function extractPublicIdFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    const publicId = filename.split('.')[0];
    const folderPath = pathParts.slice(0, -1).join('/').replace('/image/upload', '');
    return folderPath ? `${folderPath}/${publicId}` : publicId;
  } catch {
    const match = url.match(/\/v\d+\/(.+)\.[a-zA-Z]+$/);
    return match ? match[1] : url;
  }
}
