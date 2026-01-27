/**
 * Cart API Routes
 * Handles shopping cart operations
 * 
 * Note: All IDs are MongoDB ObjectIds (24-char hex strings)
 */

const express = require('express');
const prisma = require('../lib/prisma');
const { isValidObjectId } = require('../lib/validators');

const router = express.Router();

/**
 * GET /api/cart
 * Fetch all cart items for a user
 * Query param: userId (required, ObjectId string)
 */
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Parse product JSON fields and format response
    const formattedItems = cartItems.map(item => ({
      id: item.id,  // String (ObjectId)
      quantity: item.quantity,
      size: item.size,
      color: JSON.parse(item.color),
      product: {
        ...item.product,
        images: JSON.parse(item.product.images),
        colors: JSON.parse(item.product.colors),
        details: JSON.parse(item.product.details),
        sizes: item.product.sizes.split(',')
      }
    }));

    // Calculate totals
    const subtotal = formattedItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity, 
      0
    );
    const itemCount = formattedItems.reduce(
      (sum, item) => sum + item.quantity, 
      0
    );

    res.json({
      items: formattedItems,
      subtotal,
      itemCount
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

/**
 * POST /api/cart
 * Add item to cart (upsert - increases quantity if item exists)
 * Body: { userId, productId, quantity, size, color }
 * 
 * Note: userId and productId must be valid ObjectId strings
 */
router.post('/', async (req, res) => {
  try {
    const { userId, productId, quantity = 1, size, color } = req.body;

    // Validate required fields
    if (!userId || !productId || !size || !color) {
      return res.status(400).json({ 
        error: 'userId, productId, size, and color are required' 
      });
    }

    // Validate ObjectId formats
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }
    if (!isValidObjectId(productId)) {
      return res.status(400).json({ error: 'Invalid productId format' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Serialize color for comparison
    const colorString = typeof color === 'string' ? color : JSON.stringify(color);

    // Upsert cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId_size_color: {
          userId,
          productId,
          size,
          color: colorString
        }
      },
      update: {
        quantity: { increment: quantity }
      },
      create: {
        userId,
        productId,
        quantity,
        size,
        color: colorString
      },
      include: {
        product: true
      }
    });

    res.status(201).json({
      message: 'Item added to cart',
      item: {
        ...cartItem,
        color: JSON.parse(cartItem.color),
        product: {
          ...cartItem.product,
          images: JSON.parse(cartItem.product.images)
        }
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
 * Body: { quantity }
 * 
 * Note: itemId must be a valid ObjectId string
 */
router.patch('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!isValidObjectId(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId format' });
    }

    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }

    const cartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true }
    });

    res.json({
      message: 'Cart updated',
      item: {
        ...cartItem,
        color: JSON.parse(cartItem.color)
      }
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    console.error('Error updating cart:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

/**
 * DELETE /api/cart/:itemId
 * Remove item from cart
 * 
 * Note: itemId must be a valid ObjectId string
 */
router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;

    if (!isValidObjectId(itemId)) {
      return res.status(400).json({ error: 'Invalid itemId format' });
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

/**
 * DELETE /api/cart
 * Clear entire cart for a user
 * Query param: userId (required, ObjectId string)
 */
router.delete('/', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    await prisma.cartItem.deleteMany({
      where: { userId }
    });

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
