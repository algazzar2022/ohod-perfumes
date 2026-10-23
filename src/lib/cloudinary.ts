import { v2 as cloudinary } from 'cloudinary';

// Parse CLOUDINARY_URL if provided (cloudinary://key:secret@cloud_name)
let cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'kuypfdzb';
let apiKey = process.env.CLOUDINARY_API_KEY || '411814277896525';
let apiSecret = process.env.CLOUDINARY_API_SECRET || '2DobSjzYxqPf_w660PW4_OVsBpg';

if (process.env.CLOUDINARY_URL) {
  const match = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@([^/?]+)/);
  if (match) {
    apiKey = match[1];
    apiSecret = match[2];
    cloudName = match[3];
  }
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;

/**
 * Upload an image buffer or base64 to Cloudinary with automatic optimization:
 * - Auto-format (WebP / AVIF based on browser support)
 * - Auto-quality compression (drastically reduces file size without losing sharpness)
 * - Max width limit 1200px
 */
export async function uploadImageToCloudinary(
  fileBufferOrBase64: Buffer | string,
  folder = 'ohod-perfumes'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // Cloudinary automatic optimizations
        transformation: [
          { width: 1200, crop: 'limit' }, // Scales down if larger than 1200px
          { quality: 'auto:good' },       // Intelligent compression
          { fetch_format: 'auto' },       // Automatically serves WebP / AVIF
        ],
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload to Cloudinary failed'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    if (Buffer.isBuffer(fileBufferOrBase64)) {
      uploadStream.end(fileBufferOrBase64);
    } else {
      // Base64 or remote URL string
      cloudinary.uploader
        .upload(fileBufferOrBase64, {
          folder,
          transformation: [
            { width: 1200, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        })
        .then((res) => resolve({ url: res.secure_url, publicId: res.public_id }))
        .catch(reject);
    }
  });
}
