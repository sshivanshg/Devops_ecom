/**
 * Cloudinary Configuration
 * Server-side utilities for image upload and management
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Generate a signed upload signature for client-side uploads
 * This allows secure uploads directly from the browser to Cloudinary
 */
function generateUploadSignature(paramsToSign) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = {
    timestamp,
    folder: 'atelier/products',
    ...paramsToSign
  };
  
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  );
  
  return { signature, timestamp, ...params };
}

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} publicId - The public_id of the image to delete
 */
async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} publicIds - Array of public_ids to delete
 */
async function deleteImages(publicIds) {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Cloudinary bulk delete error:', error);
    throw error;
  }
}

/**
 * Generate optimized URL for an image
 * @param {string} publicId - The public_id of the image
 * @param {object} options - Transformation options
 */
function getOptimizedUrl(publicId, options = {}) {
  const defaultOptions = {
    fetch_format: 'auto',
    quality: 'auto',
    crop: 'fill',
    gravity: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
}

/**
 * Upload an image from a URL (useful for migration)
 * @param {string} imageUrl - The URL of the image to upload
 * @param {string} folder - The folder to upload to
 */
async function uploadFromUrl(imageUrl, folder = 'atelier/products') {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      resource_type: 'image',
      fetch_format: 'auto',
      quality: 'auto'
    });
    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

module.exports = {
  cloudinary,
  generateUploadSignature,
  deleteImage,
  deleteImages,
  getOptimizedUrl,
  uploadFromUrl
};
