/**
 * Product API Routes
 * Handles all product-related endpoints
 * 
 * Note: All IDs are MongoDB ObjectIds (24-char hex strings)
 */

const express = require('express');
const prisma = require('../lib/prisma');
const { isValidObjectId } = require('../lib/validators');

const router = express.Router();

/**
 * GET /api/products
 * Fetch all products with optional filters
 * Query params: featured, category, status
 */
router.get('/', async (req, res) => {
  try {
    const { featured, category, status } = req.query;

    // Build filter conditions
    const where = {};
    
    if (featured === 'true') {
      where.isFeatured = true;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (status) {
      where.status = status;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON fields for each product
    const parsedProducts = products.map(product => ({
      ...product,
      images: JSON.parse(product.images),
      colors: JSON.parse(product.colors),
      details: JSON.parse(product.details),
      sizes: product.sizes.split(','),
      hoverImage: JSON.parse(product.images)[1] || JSON.parse(product.images)[0]
    }));

    res.json(parsedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/products/:idOrSlug
 * Fetch a single product by ID (ObjectId) or slug
 * 
 * Note: This route accepts both MongoDB ObjectIds and slugs
 * - If 24-char hex string, tries to find by ID first
 * - Otherwise, looks up by slug
 */
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product = null;

    // Check if it looks like an ObjectId (24-char hex)
    if (isValidObjectId(idOrSlug)) {
      // Try to find by ID first
      product = await prisma.product.findUnique({
        where: { id: idOrSlug }
      });
    }

    // If not found by ID (or wasn't an ObjectId), try by slug
    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug: idOrSlug }
      });
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Parse JSON fields
    const parsedProduct = {
      ...product,
      images: JSON.parse(product.images),
      colors: JSON.parse(product.colors),
      details: JSON.parse(product.details),
      sizes: product.sizes.split(','),
      hoverImage: JSON.parse(product.images)[1] || JSON.parse(product.images)[0]
    };

    res.json(parsedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
