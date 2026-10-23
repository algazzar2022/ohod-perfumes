import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
