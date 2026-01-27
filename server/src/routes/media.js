/**
 * Media Routes - Cloudinary Integration
 * Handles image upload signatures and deletion
 */

const express = require('express');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { 
  generateUploadSignature, 
  deleteImage, 
  deleteImages,
  uploadFromUrl 
} = require('../lib/cloudinary');

const router = express.Router();

// All media routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/media/signature
 * Generate a signed upload signature for client-side Cloudinary uploads
 * This allows secure direct uploads from the browser
 */
router.get('/signature', (req, res) => {
  try {
    const { folder = 'atelier/products' } = req.query;
    
    const signatureData = generateUploadSignature({ folder });
    
    res.json({
      signature: signatureData.signature,
      timestamp: signatureData.timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: signatureData.folder
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({ error: 'Failed to generate upload signature' });
  }
});

/**
 * DELETE /api/media/:publicId
 * Delete a single image from Cloudinary
 */
router.delete('/:publicId(*)', async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ error: 'publicId is required' });
    }
    
    const result = await deleteImage(publicId);
    
    res.json({ 
      message: 'Image deleted',
      result 
    });
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

/**
 * POST /api/media/delete-bulk
 * Delete multiple images from Cloudinary
 */
router.post('/delete-bulk', async (req, res) => {
  try {
    const { publicIds } = req.body;
    
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({ error: 'publicIds array is required' });
    }
    
    const result = await deleteImages(publicIds);
    
    res.json({ 
      message: `${publicIds.length} images deleted`,
      result 
    });
  } catch (error) {
    console.error('Bulk deletion error:', error);
    res.status(500).json({ error: 'Failed to delete images' });
  }
});

/**
 * POST /api/media/upload-url
 * Upload an image from a URL (useful for migration or external images)
 */
router.post('/upload-url', async (req, res) => {
  try {
    const { imageUrl, folder = 'atelier/products' } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }
    
    const result = await uploadFromUrl(imageUrl, folder);
    
    res.json({
      message: 'Image uploaded',
      ...result
    });
  } catch (error) {
    console.error('URL upload error:', error);
    res.status(500).json({ error: 'Failed to upload image from URL' });
  }
});

/**
 * GET /api/media/config
 * Get Cloudinary configuration for client-side (public info only)
 */
router.get('/config', (req, res) => {
  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'atelier_unsigned'
  });
});

module.exports = router;
