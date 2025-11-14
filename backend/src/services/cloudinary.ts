import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn(
      '⚠️  Cloudinary not configured - photo uploads will be disabled'
    );
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  console.log('✅ Cloudinary configured');
  return true;
};

const isConfigured = configureCloudinary();

/**
 * Upload a base64 encoded image to Cloudinary
 */
export const uploadPhotoFromBase64 = async (
  base64Image: string,
  folder: string = 'settlement-app/receipts'
): Promise<{ url: string; publicId: string }> => {
  if (!isConfigured) {
    throw new Error('Cloudinary is not configured');
  }

  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Max dimensions
        { quality: 'auto', fetch_format: 'auto' }, // Optimize quality and format
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload photo');
  }
};

/**
 * Upload an image buffer to Cloudinary
 */
export const uploadPhotoFromBuffer = async (
  buffer: Buffer,
  folder: string = 'settlement-app/receipts'
): Promise<{ url: string; publicId: string }> => {
  if (!isConfigured) {
    throw new Error('Cloudinary is not configured');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary upload error:', error);
          reject(new Error('Failed to upload photo'));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Delete a photo from Cloudinary
 */
export const deletePhoto = async (publicId: string): Promise<boolean> => {
  if (!isConfigured) {
    console.warn('Cloudinary not configured - cannot delete photo');
    return false;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

/**
 * Check if Cloudinary is configured and ready
 */
export const isCloudinaryConfigured = (): boolean => {
  return isConfigured;
};

export default {
  uploadPhotoFromBase64,
  uploadPhotoFromBuffer,
  deletePhoto,
  isCloudinaryConfigured,
};
