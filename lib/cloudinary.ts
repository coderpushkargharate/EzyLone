import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/** Upload a Buffer to Cloudinary via an upload stream. */
export function uploadBuffer(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
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
