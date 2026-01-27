/**
 * ProductImageUpload Component
 * Native file upload with Cloudinary CDN storage
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Upload, X, ImageIcon, Loader2, GripVertical, 
  AlertCircle, CheckCircle, Cloud
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { getThumbnailUrl, isCloudinaryUrl } from '../../lib/cloudinary';
import { useAuth } from '../../contexts/AuthContext';

export function ProductImageUpload({ 
  value = [], 
  onChange, 
  maxImages = 10,
  folder = 'atelier/products'
}) {
  const [images, setImages] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const cloudNameEnv = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const { getAuthHeaders } = useAuth();

  // Sync internal state with prop
  useEffect(() => {
    setImages(value);
  }, [value]);

  /**
   * Native file upload to Cloudinary using a signed upload (no upload_preset required).
   * We first ask our backend for a secure signature, then upload directly to Cloudinary.
   */
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setError('');

    let uploaded = 0;
    for (const file of filesToUpload) {
      try {
        setUploadProgress(`Uploading ${uploaded + 1}/${filesToUpload.length}...`);

        // 1) Ask backend for a signed upload signature
        const sigRes = await fetch(
          `/api/media/signature?folder=${encodeURIComponent(folder)}`,
          { headers: getAuthHeaders() }
        );

        const sigData = await sigRes.json();

        if (!sigRes.ok) {
          throw new Error(sigData.error || 'Failed to get upload signature');
        }

        const cloudName = sigData.cloudName || cloudNameEnv;

        // 2) Upload file directly to Cloudinary with signature
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sigData.apiKey);
        formData.append('timestamp', sigData.timestamp);
        formData.append('signature', sigData.signature);
        formData.append('folder', sigData.folder || folder);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        const newImage = {
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format
        };

        setImages(prev => {
          const updated = [...prev, newImage];
          onChange?.(updated);
          return updated;
        });
        
        uploaded++;
      } catch (err) {
        console.error('File upload error:', err);
        setError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    setUploading(false);
    setUploadProgress('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

  // Add image from URL
  const [urlInput, setUrlInput] = useState('');
  const addFromUrl = () => {
    if (!urlInput.trim()) return;
    
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImage = {
      url: urlInput.trim(),
      publicId: null,
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
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !uploading && fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all select-none',
          uploading 
            ? 'border-emerald-500/50 bg-emerald-500/5 cursor-wait' 
            : 'border-zinc-700 hover:border-emerald-500/50 hover:bg-zinc-800/50'
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
            <p className="text-sm text-zinc-300">{uploadProgress || 'Uploading...'}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
              <Upload className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-zinc-100">
                Click to select images
              </p>
              <p className="text-sm text-zinc-500">
                JPG, PNG, WebP up to 10MB • {images.length}/{maxImages} images
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Button + URL Input */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="border-zinc-700"
          disabled={uploading || images.length >= maxImages}
        >
          <Upload className="w-4 h-4 mr-2" />
          Choose Files
        </Button>
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
            <button 
              onClick={() => setError('')}
              className="ml-auto text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
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
