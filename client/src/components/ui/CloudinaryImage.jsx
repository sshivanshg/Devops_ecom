/**
 * CloudinaryImage Component
 * Optimized image component that automatically serves WebP/AVIF based on browser support
 * Uses Cloudinary's transformation API for on-the-fly optimization
 */

import { useState } from 'react';
import { AdvancedImage, lazyload, responsive, placeholder } from '@cloudinary/react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill, scale } from '@cloudinary/url-gen/actions/resize';
import { autoGravity, focusOn } from '@cloudinary/url-gen/qualifiers/gravity';
import { FocusOn } from '@cloudinary/url-gen/qualifiers/focusOn';
import { auto } from '@cloudinary/url-gen/qualifiers/format';
import { auto as autoQuality } from '@cloudinary/url-gen/qualifiers/quality';
import { cn } from '../../lib/utils';
import { isCloudinaryUrl, extractPublicId } from '../../lib/cloudinary';

// Initialize Cloudinary
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const cld = new Cloudinary({
  cloud: { cloudName }
});

/**
 * Optimized image component with automatic format selection and lazy loading
 * @param {string} src - Image URL or Cloudinary public_id
 * @param {string} alt - Alt text for the image
 * @param {number} width - Desired width
 * @param {number} height - Desired height
 * @param {string} crop - Crop mode: 'fill', 'scale', 'fit'
 * @param {string} gravity - Focus point: 'auto', 'face', 'center'
 * @param {boolean} lazy - Enable lazy loading
 * @param {string} className - Additional CSS classes
 */
export function CloudinaryImage({ 
  src, 
  alt,
  width = 800,
  height = 1000,
  crop = 'fill',
  gravity = 'auto',
  lazy = true,
  className,
  ...props 
}) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // If not a Cloudinary URL, render a standard img tag
  if (!src || (!isCloudinaryUrl(src) && !extractPublicId(src))) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        loading={lazy ? 'lazy' : undefined}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        {...props}
      />
    );
  }

  // Extract public_id from URL if needed
  const publicId = extractPublicId(src) || src;

  // Build the optimized image
  const image = cld.image(publicId);
  
  // Apply transformations
  const resizeAction = crop === 'scale' 
    ? scale().width(width).height(height)
    : fill().width(width).height(height).gravity(
        gravity === 'face' 
          ? focusOn(FocusOn.face()) 
          : autoGravity()
      );
  
  image
    .resize(resizeAction)
    .format(auto()) // Automatically serve WebP/AVIF based on browser
    .quality(autoQuality()); // Automatic quality optimization

  // Plugins for lazy loading and responsive behavior
  const plugins = [];
  if (lazy) {
    plugins.push(lazyload());
    plugins.push(placeholder({ mode: 'blur' }));
  }
  plugins.push(responsive({ steps: [400, 600, 800, 1200] }));

  if (error) {
    // Fallback to original URL if Cloudinary fails
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={lazy ? 'lazy' : undefined}
        {...props}
      />
    );
  }

  return (
    <AdvancedImage
      cldImg={image}
      alt={alt}
      plugins={plugins}
      className={cn(
        'transition-opacity duration-300',
        className
      )}
      onError={() => setError(true)}
      {...props}
    />
  );
}

/**
 * ProductImage - Optimized for product cards (3:4 aspect ratio)
 */
export function ProductImage({ src, alt, className, ...props }) {
  return (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={600}
      height={800}
      crop="fill"
      gravity="auto"
      className={className}
      {...props}
    />
  );
}

/**
 * ThumbnailImage - Smaller version for grids
 */
export function ThumbnailImage({ src, alt, className, ...props }) {
  return (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={400}
      height={500}
      crop="fill"
      className={className}
      {...props}
    />
  );
}

/**
 * HeroImage - Large banner images
 */
export function HeroImage({ src, alt, className, ...props }) {
  return (
    <CloudinaryImage
      src={src}
      alt={alt}
      width={1920}
      height={1080}
      crop="fill"
      gravity="auto"
      className={className}
      {...props}
    />
  );
}

export default CloudinaryImage;
