/**
 * Product API Routes
 * Handles all product-related endpoints using native MongoDB
 */

const express = require('express');
const { getDB, isValidObjectId, toObjectId } = require('../lib/mongodb');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/products
 * Fetch all ACTIVE products with optional filters
 * Query params: featured, category, status, style
 * Note: Only shows isActive:true products (admin sees all via /api/admin/products)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const db = getDB();
    const { featured, category, status, style, recommended } = req.query;

    // Build filter - ALWAYS filter for active products on public route
    // Also filter out scheduled products that haven't reached their publish date
    const filter = { 
      isActive: { $ne: false },
      $or: [
        { publishAt: null },
        { publishAt: { $exists: false } },
        { publishAt: { $lte: new Date() } }
      ]
    };
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }

    let products = await db.collection('products')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Add hover image
    products = products.map(p => ({
      ...p,
      id: p._id.toString(),
      hoverImage: p.images?.[1] || p.images?.[0]
    }));

    // Filter by style preference (for personalization)
    if (style) {
      products = products.filter(p => 
        p.styles && p.styles.includes(style)
      );
    }

    // Personalized "Recommended for You" based on user preferences
    if (recommended === 'true' && req.user?.preferences) {
      const prefs = req.user.preferences;
      const favoriteStyle = prefs.favoriteStyle;
      
      if (favoriteStyle) {
        products = products.sort((a, b) => {
          const aMatch = a.styles?.includes(favoriteStyle) ? 1 : 0;
          const bMatch = b.styles?.includes(favoriteStyle) ? 1 : 0;
          return bMatch - aMatch;
        });
      }
    }

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/products/recommended
 * Get personalized product recommendations using aggregation pipeline
 */
router.get('/recommended', optionalAuth, async (req, res) => {
  try {
    const { getRecommendedProducts } = require('../lib/recommendations');
    
    const userId = req.user?._id || null;
    const result = await getRecommendedProducts(userId);

    res.json(result);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

/**
 * GET /api/products/:idOrSlug
 * Fetch a single product by ID or slug
 * 
 * PREVIEW MODE: If product is inactive or scheduled:
 * - Admin users can preview the product
 * - Regular users get a 404
 */
router.get('/:idOrSlug', optionalAuth, async (req, res) => {
  try {
    const db = getDB();
    const { idOrSlug } = req.params;
    let product = null;

    // Check if it looks like an ObjectId
    if (isValidObjectId(idOrSlug)) {
      product = await db.collection('products').findOne({ 
        _id: toObjectId(idOrSlug) 
      });
    }

    // If not found by ID, try by slug
    if (!product) {
      product = await db.collection('products').findOne({ 
        slug: idOrSlug 
      });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is viewable
    const isAdmin = req.user?.role === 'ADMIN';
    const isActive = product.isActive !== false;
    const isScheduled = product.publishAt && new Date(product.publishAt) > new Date();
    const isHidden = !isActive || isScheduled;

    // PREVIEW MODE: Only admins can see hidden products
    if (isHidden && !isAdmin) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Format response
    const formattedProduct = {
      ...product,
      id: product._id.toString(),
      hoverImage: product.images?.[1] || product.images?.[0],
      // Add preview metadata for admin
      ...(isAdmin && isHidden && {
        _preview: true,
        _previewReason: !isActive 
          ? 'Product is inactive' 
          : `Scheduled for ${new Date(product.publishAt).toLocaleString()}`
      })
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
