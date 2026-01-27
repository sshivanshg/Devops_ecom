/**
 * Admin Routes
 * Protected routes for admin users only using native MongoDB
 * All routes require ADMIN role authentication
 */

const express = require('express');
const { getDB, isValidObjectId, toObjectId, ObjectId } = require('../lib/mongodb');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * Helper: Check if user is admin
 * Used by all admin routes
 */
function checkAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }
  next();
}

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(checkAdmin);

// ============================================
// DASHBOARD STATS
// ============================================

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const db = getDB();

    const [userCount, productCount, orderCount, vipCount, activeProductCount] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('products').countDocuments(),
      db.collection('orders').countDocuments(),
      db.collection('users').countDocuments({ role: 'VIP' }),
      db.collection('products').countDocuments({ isActive: true }),
    ]);

    // Calculate revenue
    const revenueResult = await db.collection('orders').aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]).toArray();
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get recent orders
    const recentOrders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // Get user details for orders
    const userIds = [...new Set(recentOrders.map(o => o.userId))];
    const users = await db.collection('users')
      .find({ _id: { $in: userIds } })
      .toArray();

    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = { name: u.name, email: u.email };
    });

    const ordersWithUsers = recentOrders.map(o => ({
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt,
      user: userMap[o.userId?.toString()] || null
    }));

    res.json({
      stats: {
        users: userCount,
        products: productCount,
        activeProducts: activeProductCount,
        orders: orderCount,
        vipMembers: vipCount,
        revenue: totalRevenue,
      },
      recentOrders: ordersWithUsers,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============================================
// USER MANAGEMENT
// ============================================

/**
 * GET /api/admin/users
 * List all users
 */
router.get('/users', async (req, res) => {
  try {
    const db = getDB();

    const users = await db.collection('users')
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedUsers = users.map(u => ({
      id: u._id.toString(),
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * PATCH /api/admin/users/:userId/role
 * Update user role
 */
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const db = getDB();
    const { userId } = req.params;
    const { role } = req.body;

    if (!['USER', 'VIP', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    await db.collection('users').updateOne(
      { _id: toObjectId(userId) },
      { $set: { role, updatedAt: new Date() } }
    );

    const updatedUser = await db.collection('users').findOne({ 
      _id: toObjectId(userId) 
    });

    res.json({
      message: 'User role updated',
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// ============================================
// PRODUCT MANAGEMENT
// ============================================

/**
 * GET /api/admin/products
 * List all products (including inactive)
 */
router.get('/products', async (req, res) => {
  try {
    const db = getDB();

    const products = await db.collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedProducts = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      price: p.price,
      originalPrice: p.originalPrice,
      stock: p.stock,
      status: p.status,
      isFeatured: p.isFeatured,
      isActive: p.isActive !== false, // default to true
      category: p.category,
      images: p.images,
      createdAt: p.createdAt,
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * POST /api/admin/products
 * Create a new product with variants
 */
router.post('/products', async (req, res) => {
  try {
    const db = getDB();
    const { 
      name, slug, description, price, originalPrice,
      category, sizes, colors, images, details, styles,
      variants, metadata,
      status, isFeatured, isActive
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ 
        error: 'name, price, and category are required' 
      });
    }

    // Generate slug if not provided
    const productSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // Check if slug exists
    const existing = await db.collection('products').findOne({ slug: productSlug });
    if (existing) {
      return res.status(409).json({ error: 'Product with this slug already exists' });
    }

    // Generate variants if not provided but sizes/colors are
    let productVariants = variants || [];
    const productSizes = sizes || ['S', 'M', 'L', 'XL'];
    const productColors = colors || [{ name: 'Black', value: '#1A1A1A' }];
    
    if (productVariants.length === 0 && productSizes.length > 0 && productColors.length > 0) {
      // Auto-generate variants from sizes and colors
      for (const size of productSizes) {
        for (const color of productColors) {
          const colorName = typeof color === 'string' ? color : color.name;
          const colorValue = typeof color === 'string' ? '#1A1A1A' : color.value;
          const sku = `${productSlug.toUpperCase().substring(0, 3)}-${size}-${colorName.toUpperCase().replace(/\s/g, '').substring(0, 3)}`;
          
          productVariants.push({
            sku,
            size,
            color: colorName,
            colorValue,
            stock: 10, // Default stock
            price: null // Use base price
          });
        }
      }
    }

    // Calculate total stock from variants
    const totalStock = productVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

    const newProduct = {
      name,
      slug: productSlug,
      description: description || '',
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      category,
      sizes: productSizes,
      colors: productColors,
      images: images || [],
      details: details || [],
      styles: styles || [],
      variants: productVariants,
      inventory: productVariants, // backwards compatibility
      metadata: metadata || {
        fabric: '',
        fitType: 'Regular',
        careInstructions: '',
        madeIn: ''
      },
      status: status || 'draft', // draft or published
      isFeatured: isFeatured || false,
      isActive: isActive !== false,
      stock: totalStock,
      publishAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('products').insertOne(newProduct);

    res.status(201).json({
      message: 'Product created',
      product: {
        id: result.insertedId.toString(),
        ...newProduct
      }
    });
  } catch (error) {
    console.error('Admin create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

/**
 * PATCH /api/admin/products/:productId
 * Update a product (including isActive toggle)
 */
router.patch('/products/:productId', async (req, res) => {
  try {
    const db = getDB();
    const { productId } = req.params;
    const updates = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ error: 'Invalid productId' });
    }

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.id;
    delete updates.createdAt;

    // Add updatedAt
    updates.updatedAt = new Date();

    await db.collection('products').updateOne(
      { _id: toObjectId(productId) },
      { $set: updates }
    );

    const updatedProduct = await db.collection('products').findOne({ 
      _id: toObjectId(productId) 
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product updated',
      product: {
        id: updatedProduct._id.toString(),
        ...updatedProduct
      }
    });
  } catch (error) {
    console.error('Admin update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * DELETE /api/admin/products/:productId
 * Delete a product
 */
router.delete('/products/:productId', async (req, res) => {
  try {
    const db = getDB();
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ error: 'Invalid productId' });
    }

    const result = await db.collection('products').deleteOne({ 
      _id: toObjectId(productId) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ============================================
// ORDER MANAGEMENT
// ============================================

/**
 * GET /api/admin/orders
 * List all orders
 */
router.get('/orders', async (req, res) => {
  try {
    const db = getDB();
    const { status } = req.query;

    const filter = status ? { status } : {};

    const orders = await db.collection('orders')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Get user details
    const userIds = [...new Set(orders.map(o => o.userId))];
    const users = await db.collection('users')
      .find({ _id: { $in: userIds } })
      .toArray();

    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = { name: u.name, email: u.email };
    });

    const formattedOrders = orders.map(o => ({
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      totalAmount: o.totalAmount,
      status: o.status,
      items: o.items,
      shippingAddress: o.shippingAddress,
      user: userMap[o.userId?.toString()] || null,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Admin orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * PATCH /api/admin/orders/:orderId/status
 * Update order status
 */
router.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const db = getDB();
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        validStatuses 
      });
    }

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({ error: 'Invalid orderId' });
    }

    await db.collection('orders').updateOne(
      { _id: toObjectId(orderId) },
      { $set: { status, updatedAt: new Date() } }
    );

    const updatedOrder = await db.collection('orders').findOne({ 
      _id: toObjectId(orderId) 
    });

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Order status updated',
      order: {
        id: updatedOrder._id.toString(),
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
      }
    });
  } catch (error) {
    console.error('Admin update order error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ============================================
// ANALYTICS
// ============================================

/**
 * GET /api/admin/analytics
 * Get sales analytics data for dashboard charts
 */
router.get('/analytics', async (req, res) => {
  try {
    const db = getDB();
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Revenue over time (daily aggregation)
    const revenueByDay = await db.collection('orders').aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Fill in missing days with 0
    const revenueData = [];
    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const existing = revenueByDay.find(r => r._id === dateStr);
      revenueData.push({
        date: dateStr,
        revenue: existing?.revenue || 0,
        orders: existing?.orders || 0
      });
    }

    // Top selling products
    const topProducts = await db.collection('orders').aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.name' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]).toArray();

    // Add current stock to top products
    for (const product of topProducts) {
      const productDoc = await db.collection('products').findOne(
        { _id: toObjectId(product._id.toString()) },
        { projection: { stock: 1, images: 1 } }
      );
      product.currentStock = productDoc?.stock || 0;
      product.image = productDoc?.images?.[0] || null;
    }

    // KPI calculations
    const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = revenueData.reduce((sum, d) => sum + d.orders, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Active customers (unique users with orders in period)
    const activeCustomers = await db.collection('orders').aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$userId' } },
      { $count: 'count' }
    ]).toArray();

    // Previous period comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - parseInt(days));
    
    const prevRevenueResult = await db.collection('orders').aggregate([
      {
        $match: {
          createdAt: { $gte: prevStartDate, $lt: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]).toArray();

    const prevRevenue = prevRevenueResult[0]?.total || 0;
    const prevOrders = prevRevenueResult[0]?.count || 0;

    // Calculate growth percentages
    const revenueGrowth = prevRevenue > 0 
      ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
      : 100;
    const orderGrowth = prevOrders > 0
      ? ((totalOrders - prevOrders) / prevOrders * 100).toFixed(1)
      : 100;

    res.json({
      revenueData,
      topProducts: topProducts.map(p => ({
        id: p._id?.toString(),
        name: p.productName,
        unitsSold: p.unitsSold,
        revenue: p.revenue,
        currentStock: p.currentStock,
        image: p.image
      })),
      kpis: {
        totalRevenue,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        activeCustomers: activeCustomers[0]?.count || 0,
        revenueGrowth: parseFloat(revenueGrowth),
        orderGrowth: parseFloat(orderGrowth)
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/admin/inventory
 * Get flattened inventory view (Stock Command Center)
 * Each row = one SKU with product name, size, color, stock
 */
router.get('/inventory', async (req, res) => {
  try {
    const db = getDB();
    
    const products = await db.collection('products')
      .find({}, { projection: { name: 1, slug: 1, variants: 1, inventory: 1, images: 1, category: 1, price: 1 } })
      .sort({ name: 1 })
      .toArray();

    // Flatten: each variant becomes a row
    const inventory = [];
    for (const product of products) {
      const variants = product.variants || product.inventory || [];
      for (const variant of variants) {
        inventory.push({
          productId: product._id.toString(),
          productName: product.name,
          productSlug: product.slug,
          category: product.category,
          price: variant.price || product.price,
          image: product.images?.[0] || null,
          sku: variant.sku || `${variant.size}-${variant.color}`,
          size: variant.size,
          color: variant.color,
          colorValue: variant.colorValue,
          stock: variant.stock || 0,
        });
      }
    }

    res.json(inventory);
  } catch (error) {
    console.error('Admin flattened inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * PATCH /api/admin/inventory/:sku
 * Update stock for a specific SKU (inline editing)
 * Uses MongoDB positional operator for efficient updates
 */
router.patch('/inventory/:sku', async (req, res) => {
  try {
    const db = getDB();
    const { sku } = req.params;
    const { stock } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }

    // Try to update in variants array first, then inventory array
    let result = await db.collection('products').updateOne(
      { 'variants.sku': sku },
      { 
        $set: { 
          'variants.$.stock': stock,
          updatedAt: new Date()
        }
      }
    );

    // Fallback to inventory array if variants not found
    if (result.matchedCount === 0) {
      result = await db.collection('products').updateOne(
        { 'inventory.sku': sku },
        { 
          $set: { 
            'inventory.$.stock': stock,
            updatedAt: new Date()
          }
        }
      );
    }

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: `SKU ${sku} not found` });
    }

    // Recalculate total stock for the product
    const product = await db.collection('products').findOne(
      { $or: [{ 'variants.sku': sku }, { 'inventory.sku': sku }] }
    );
    
    if (product) {
      const variants = product.variants || product.inventory || [];
      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      
      await db.collection('products').updateOne(
        { _id: product._id },
        { $set: { stock: totalStock } }
      );
    }

    res.json({
      message: 'Stock updated',
      sku,
      stock
    });
  } catch (error) {
    console.error('Admin update SKU stock error:', error);
    res.status(500).json({ error: 'Failed to update stock' });
  }
});

/**
 * GET /api/admin/products/:id/inventory
 * Get inventory matrix for a product
 */
router.get('/products/:id/inventory', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await db.collection('products').findOne(
      { _id: toObjectId(id) },
      { projection: { name: 1, variants: 1, inventory: 1, stock: 1, sizes: 1, colors: 1, metadata: 1 } }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const variants = product.variants || product.inventory || [];

    res.json({
      id: product._id.toString(),
      name: product.name,
      totalStock: product.stock,
      variants,
      inventory: variants, // backwards compatibility
      sizes: product.sizes || [],
      colors: product.colors || [],
      metadata: product.metadata || {}
    });
  } catch (error) {
    console.error('Admin inventory error:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

/**
 * PATCH /api/admin/products/:id/inventory
 * Update inventory for a specific variant (by size+color or SKU)
 */
router.patch('/products/:id/inventory', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { sku, size, color, stock } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }

    let result;
    
    // If SKU provided, use it for targeting
    if (sku) {
      result = await db.collection('products').updateOne(
        { _id: toObjectId(id), 'variants.sku': sku },
        { 
          $set: { 
            'variants.$.stock': stock,
            updatedAt: new Date()
          }
        }
      );
      
      // Fallback to inventory array
      if (result.matchedCount === 0) {
        result = await db.collection('products').updateOne(
          { _id: toObjectId(id), 'inventory.sku': sku },
          { 
            $set: { 
              'inventory.$.stock': stock,
              updatedAt: new Date()
            }
          }
        );
      }
    } else {
      // Use size + color for targeting (legacy)
      result = await db.collection('products').updateOne(
        { _id: toObjectId(id), 'variants.size': size, 'variants.color': color },
        { 
          $set: { 
            'variants.$.stock': stock,
            updatedAt: new Date()
          }
        }
      );
      
      // Fallback to inventory array
      if (result.matchedCount === 0) {
        result = await db.collection('products').updateOne(
          { _id: toObjectId(id), 'inventory.size': size, 'inventory.color': color },
          { 
            $set: { 
              'inventory.$.stock': stock,
              updatedAt: new Date()
            }
          }
        );
      }
    }

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Variant not found' });
    }

    // Recalculate total stock
    const product = await db.collection('products').findOne({ _id: toObjectId(id) });
    const variants = product.variants || product.inventory || [];
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    
    await db.collection('products').updateOne(
      { _id: toObjectId(id) },
      { $set: { stock: totalStock } }
    );

    res.json({
      message: 'Inventory updated',
      variant: { sku, size, color, stock },
      totalStock
    });
  } catch (error) {
    console.error('Admin update inventory error:', error);
    res.status(500).json({ error: 'Failed to update inventory' });
  }
});

/**
 * PATCH /api/admin/products/:id/schedule
 * Schedule a product for future publishing
 */
router.patch('/products/:id/schedule', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { publishAt } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const scheduleDate = publishAt ? new Date(publishAt) : null;

    await db.collection('products').updateOne(
      { _id: toObjectId(id) },
      { 
        $set: { 
          publishAt: scheduleDate,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      message: scheduleDate 
        ? `Product scheduled for ${scheduleDate.toISOString()}` 
        : 'Schedule cleared - product is now live',
      publishAt: scheduleDate
    });
  } catch (error) {
    console.error('Admin schedule product error:', error);
    res.status(500).json({ error: 'Failed to schedule product' });
  }
});

// ============================================
// SITE SETTINGS
// ============================================

/**
 * GET /api/admin/settings
 * Get all site settings
 */
router.get('/settings', async (req, res) => {
  try {
    const db = getDB();

    const settings = await db.collection('site_config')
      .find({})
      .toArray();

    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = { ...s, id: s._id.toString() };
      delete settingsObj[s.key]._id;
      delete settingsObj[s.key].key;
    });

    res.json(settingsObj);
  } catch (error) {
    console.error('Admin settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PATCH /api/admin/settings/:key
 * Update a specific setting
 */
router.patch('/settings/:key', async (req, res) => {
  try {
    const db = getDB();
    const { key } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.id;
    delete updates.key;

    // Add updatedAt
    updates.updatedAt = new Date();

    // Upsert the setting
    await db.collection('site_config').updateOne(
      { key },
      { $set: { key, ...updates } },
      { upsert: true }
    );

    const updatedSetting = await db.collection('site_config').findOne({ key });

    res.json({
      message: 'Setting updated',
      setting: {
        id: updatedSetting._id.toString(),
        key,
        ...updates
      }
    });
  } catch (error) {
    console.error('Admin update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

module.exports = router;
