/**
 * ProductImageUpload Component
 * Cloudinary-powered image upload with drag-and-drop support
 * Uses Cloudinary Upload Widget for direct browser-to-CDN uploads
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Upload, X, ImageIcon, Loader2, GripVertical, 
  AlertCircle, CheckCircle, Cloud
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { getThumbnailUrl, extractPublicId, isCloudinaryUrl } from '../../lib/cloudinary';

// Load Cloudinary Upload Widget script
const loadCloudinaryWidget = () => {
  return new Promise((resolve, reject) => {
    if (window.cloudinary) {
      resolve(window.cloudinary);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    script.onload = () => resolve(window.cloudinary);
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

export function ProductImageUpload({ 
  value = [], 
  onChange, 
  maxImages = 10,
  folder = 'atelier/products'
}) {
  const [images, setImages] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [cloudinaryLoaded, setCloudinaryLoaded] = useState(false);
  const widgetRef = useRef(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'atelier_unsigned';

  // Sync internal state with prop
  useEffect(() => {
    setImages(value);
  }, [value]);

  // Load Cloudinary widget on mount
  useEffect(() => {
    loadCloudinaryWidget()
      .then(() => setCloudinaryLoaded(true))
      .catch((err) => {
        console.error('Failed to load Cloudinary widget:', err);
        setError('Failed to load image uploader');
      });
  }, []);

  // Initialize the upload widget
  const openWidget = useCallback(() => {
    if (!cloudinaryLoaded || !window.cloudinary) {
      setError('Upload widget not ready. Please try again.');
      return;
    }

    if (!cloudName) {
      setError('Cloudinary not configured. Please set VITE_CLOUDINARY_CLOUD_NAME.');
      return;
    }

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        folder,
        sources: ['local', 'url', 'camera'],
        multiple: true,
        maxFiles: remainingSlots,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        maxImageFileSize: 10000000, // 10MB
        cropping: false,
        showAdvancedOptions: false,
        showUploadMoreButton: true,
        singleUploadAutoClose: false,
        styles: {
          palette: {
            window: '#18181B',
            windowBorder: '#3F3F46',
            tabIcon: '#10B981',
            menuIcons: '#A1A1AA',
            textDark: '#FAFAFA',
            textLight: '#A1A1AA',
            link: '#10B981',
            action: '#10B981',
            inactiveTabIcon: '#71717A',
            error: '#EF4444',
            inProgress: '#10B981',
            complete: '#10B981',
            sourceBg: '#27272A'
          },
          fonts: {
            default: null,
            "'Inter', sans-serif": {
              url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
              active: true
            }
          }
        }
      },
      (error, result) => {
        if (error) {
          console.error('Upload error:', error);
          setError('Upload failed. Please try again.');
          setUploading(false);
          return;
        }

        if (result.event === 'queues-start') {
          setUploading(true);
          setError('');
        }

        if (result.event === 'success') {
          const newImage = {
            url: result.info.secure_url,
            publicId: result.info.public_id,
            width: result.info.width,
            height: result.info.height,
            format: result.info.format
          };

          setImages(prev => {
            const updated = [...prev, newImage];
            onChange?.(updated);
            return updated;
          });
        }

        if (result.event === 'queues-end') {
          setUploading(false);
        }

        if (result.event === 'close') {
          setUploading(false);
        }
      }
    );

    widgetRef.current.open();
  }, [cloudinaryLoaded, cloudName, uploadPreset, folder, images.length, maxImages, onChange]);

  // Remove an image
  const removeImage = useCallback((index) => {
    setImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

  // Reorder images (drag and drop)
  const handleReorder = useCallback((newOrder) => {
    setImages(newOrder);
    onChange?.(newOrder);
  }, [onChange]);

  // Add image from URL (fallback method)
  const [urlInput, setUrlInput] = useState('');
  const addFromUrl = () => {
    if (!urlInput.trim()) return;
    
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImage = {
      url: urlInput.trim(),
      publicId: null, // External URL, no public_id
      width: null,
      height: null
    };

    const updated = [...images, newImage];
    setImages(updated);
    onChange?.(updated);
    setUrlInput('');
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={openWidget}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          uploading 
            ? 'border-emerald-500/50 bg-emerald-500/5' 
            : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50',
          !cloudinaryLoaded && 'opacity-50 cursor-not-allowed'
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
            <p className="text-sm text-zinc-300">Uploading to Cloudinary CDN...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
              <Cloud className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-zinc-100">
                Click to upload images
              </p>
              <p className="text-sm text-zinc-500">
                JPG, PNG, WebP up to 10MB • {images.length}/{maxImages} images
              </p>
            </div>
          </div>
        )}
      </div>

      {/* URL Input Fallback */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste image URL..."
          className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500"
        />
        <Button 
          type="button" 
          onClick={addFromUrl} 
          variant="outline" 
          className="border-zinc-700"
          disabled={!urlInput.trim() || images.length >= maxImages}
        >
          Add URL
        </Button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-rose-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Grid with Reordering */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              Drag to reorder • First image is the thumbnail
            </p>
            {images.some(img => img.publicId || isCloudinaryUrl(img.url)) && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle className="w-3 h-3" />
                CDN optimized
              </span>
            )}
          </div>
          
          <Reorder.Group 
            axis="x" 
            values={images} 
            onReorder={handleReorder}
            className="flex gap-3 flex-wrap"
          >
            {images.map((image, index) => (
              <Reorder.Item
                key={image.publicId || image.url}
                value={image}
                className="relative group"
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={cn(
                    'relative w-24 h-24 rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing',
                    index === 0 ? 'border-emerald-500' : 'border-zinc-700'
                  )}
                >
                  <img
                    src={image.publicId ? getThumbnailUrl(image.publicId) : image.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* First image badge */}
                  {index === 0 && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-emerald-500 text-xs font-medium text-zinc-900 rounded">
                      Main
                    </div>
                  )}

                  {/* Cloudinary indicator */}
                  {(image.publicId || isCloudinaryUrl(image.url)) && (
                    <div className="absolute bottom-1 left-1">
                      <Cloud className="w-3 h-3 text-emerald-400" />
                    </div>
                  )}
                  
                  {/* Drag handle */}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-4 text-zinc-500 text-sm">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          No images yet. Upload high-quality photos for best results.
        </div>
      )}
    </div>
  );
}

export default ProductImageUpload;
