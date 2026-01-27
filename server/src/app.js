/**
 * Express Application Setup
 * ATELIER - Luxury E-commerce Backend
 */

const express = require('express');
const cors = require('cors');

// Import routes
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const configRouter = require('./routes/config');
const mediaRouter = require('./routes/media');

const app = express();

// Middleware
// CORS: allow deployed frontend + localhost for development/testing
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean);
console.log("allowedOrigins",allowedOrigins);
// console.log(process.env.NODE_ENV);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin) and any allowed origin
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ATELIER Backend is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/config', configRouter);
app.use('/api/settings', configRouter); // Alias for site settings
app.use('/api/media', mediaRouter); // Cloudinary image management

// Root Route
app.get('/', (req, res) => {
  res.json({
    name: 'ATELIER API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      cart: '/api/cart',
      users: '/api/users',
      auth: '/api/auth',
      admin: '/api/admin (protected)',
      config: '/api/config',
      media: '/api/media (protected - Cloudinary)'
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
