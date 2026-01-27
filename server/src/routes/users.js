/**
 * User API Routes
 * Handles user authentication and profile
 * 
 * Note: All IDs are MongoDB ObjectIds (24-char hex strings)
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { isValidObjectId } = require('../lib/validators');

const router = express.Router();

/**
 * POST /api/users/register
 * Register a new user
 * Body: { email, password, name }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'email, password, and name are required' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,  // ObjectId string
        email: true,
        name: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * POST /api/users/login
 * Authenticate user
 * Body: { email, password }
 * 
 * Returns user object with id (ObjectId string)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'email and password are required' 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return user data (in a real app, you'd return a JWT token)
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,  // ObjectId string
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * GET /api/users/:userId
 * Get user profile
 * 
 * Note: userId must be a valid ObjectId string
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,  // ObjectId string
        email: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            cartItems: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
