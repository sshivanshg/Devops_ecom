/**
 * Cart API Routes
 * Handles shopping cart operations using native MongoDB
 */

const express = require('express');
const { getDB, isValidObjectId, toObjectId } = require('../lib/mongodb');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/cart
 * Get user's cart items with product details
 * Requires: Bearer token
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user._id;

    // Get cart items
    const cartItems = await db.collection('cartItems')
      .find({ userId: toObjectId(userId) })
      .toArray();

    // Get product details for each cart item
    const productIds = cartItems.map(item => item.productId);
    const products = await db.collection('products')
      .find({ _id: { $in: productIds } })
      .toArray();

    // Create a map for quick lookup
    const productMap = {};
    products.forEach(p => {
      productMap[p._id.toString()] = p;
    });

    // Combine cart items with product data
    const itemsWithProducts = cartItems.map(item => {
      const product = productMap[item.productId.toString()];
      return {
        id: item._id.toString(),
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        product: product ? {
          id: product._id.toString(),
          name: product.name,
          price: product.price,
          images: product.images,
          slug: product.slug,
        } : null
      };
    }).filter(item => item.product !== null);

    res.json(itemsWithProducts);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

/**
 * POST /api/cart
 * Add item to cart or update quantity if exists
 * Requires: Bearer token
 * Body: { productId, quantity, size, color }
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user._id;
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId || !size || !color) {
      return res.status(400).json({ 
        error: 'productId, size, and color are required' 
      });
    }

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ error: 'Invalid productId' });
    }

    // Check if product exists
    const product = await db.collection('products').findOne({ 
      _id: toObjectId(productId) 
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already in cart
    const existingItem = await db.collection('cartItems').findOne({
      userId: toObjectId(userId),
      productId: toObjectId(productId),
      size,
      'color.name': typeof color === 'object' ? color.name : color
    });

    if (existingItem) {
      // Update quantity
      await db.collection('cartItems').updateOne(
        { _id: existingItem._id },
        { 
          $inc: { quantity },
          $set: { updatedAt: new Date() }
        }
      );

      const updatedItem = await db.collection('cartItems').findOne({ 
        _id: existingItem._id 
      });

      return res.json({
        message: 'Cart item updated',
        item: {
          id: updatedItem._id.toString(),
          ...updatedItem
        }
      });
    }

    // Create new cart item
    const newItem = {
      userId: toObjectId(userId),
      productId: toObjectId(productId),
      quantity,
      size,
      color: typeof color === 'object' ? color : { name: color, value: color },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('cartItems').insertOne(newItem);

    res.status(201).json({
      message: 'Item added to cart',
      item: {
        id: result.insertedId.toString(),
        ...newItem
      }
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

/**
 * PATCH /api/cart/:itemId
 * Update cart item quantity
 * Requires: Bearer token
 * Body: { quantity }
 */
router.patch('/:itemId', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!isValidObjectId(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId' });
    }

    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'quantity must be a positive number' });
    }

    // Find and update the cart item
    const result = await db.collection('cartItems').findOneAndUpdate(
      { 
        _id: toObjectId(itemId),
        userId: toObjectId(userId)
      },
      { 
        $set: { quantity, updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({
      message: 'Cart item updated',
      item: {
        id: result._id.toString(),
        ...result
      }
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

/**
 * DELETE /api/cart/:itemId
 * Remove item from cart
 * Requires: Bearer token
 */
router.delete('/:itemId', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user._id;
    const { itemId } = req.params;

    if (!isValidObjectId(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId' });
    }

    const result = await db.collection('cartItems').deleteOne({
      _id: toObjectId(itemId),
      userId: toObjectId(userId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

/**
 * DELETE /api/cart
 * Clear entire cart
 * Requires: Bearer token
 */
router.delete('/', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const userId = req.user._id;

    await db.collection('cartItems').deleteMany({
      userId: toObjectId(userId)
    });

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
