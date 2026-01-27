/**
 * Cloudinary Client Configuration
 * Utilities for image optimization and URL generation
 */

import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';

// Initialize Cloudinary instance
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';

export const cld = new Cloudinary({
  cloud: {
    cloudName
  }
});

/**
 * Get an optimized image URL from Cloudinary
 * @param {string} publicIdOrUrl - Cloudinary public_id or full URL
 * @param {object} options - Transformation options
 */
export function getOptimizedImageUrl(publicIdOrUrl, options = {}) {
  const {
    width = 800,
    height = 1000,
    crop = 'fill',
    format = 'auto',
    quality = 'auto'
  } = options;

  // If it's already a full URL (not Cloudinary), return as-is
  if (publicIdOrUrl?.startsWith('http') && !publicIdOrUrl.includes('cloudinary.com')) {
    return publicIdOrUrl;
  }

  // Extract public_id from URL if needed
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl?.includes('cloudinary.com')) {
    const match = publicIdOrUrl.match(/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    if (match) {
      publicId = match[1];
    }
  }

  if (!publicId) return publicIdOrUrl;

  // Generate optimized URL
  const image = cld.image(publicId);
  
  image
    .resize(fill().width(width).height(height).gravity(autoGravity()))
    .format(auto())
    .quality(autoQuality());

  return image.toURL();
}

/**
 * Get thumbnail URL (smaller version for grids)
 */
export function getThumbnailUrl(publicIdOrUrl) {
  return getOptimizedImageUrl(publicIdOrUrl, {
    width: 400,
    height: 500
  });
}

/**
 * Get full-size product image URL
 */
export function getProductImageUrl(publicIdOrUrl) {
  return getOptimizedImageUrl(publicIdOrUrl, {
    width: 1200,
    height: 1500
  });
}

/**
 * Get hero/banner image URL (wider aspect ratio)
 */
export function getHeroImageUrl(publicIdOrUrl) {
  return getOptimizedImageUrl(publicIdOrUrl, {
    width: 1920,
    height: 1080
  });
}

/**
 * Check if a URL is from Cloudinary
 */
export function isCloudinaryUrl(url) {
  return url?.includes('cloudinary.com') || url?.includes('res.cloudinary.com');
}

/**
 * Extract public_id from a Cloudinary URL
 */
export function extractPublicId(url) {
  if (!url || !isCloudinaryUrl(url)) return null;
  
  // Match the public_id from various Cloudinary URL formats
  const match = url.match(/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match ? match[1] : null;
}

export default cld;
