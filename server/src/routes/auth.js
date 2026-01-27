/**
 * Authentication Routes
 * Handles login, register, and session management using native MongoDB
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB, isValidObjectId, toObjectId } = require('../lib/mongodb');
const { generateToken, authenticate, isNewUser } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { email, password, name }
 */
router.post('/register', async (req, res) => {
  try {
    const db = getDB();
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'email, password, and name are required' 
      });
    }

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      email,
      password: hashedPassword,
      name,
      role: 'USER',
      preferences: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);

    const user = {
      _id: result.insertedId,
      id: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt
    };

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        ...user,
        isNewUser: true,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Login and get JWT token
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const db = getDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'email and password are required' 
      });
    }

    // Find user
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        preferences: user.preferences,
        isNewUser: isNewUser(user),
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current user session
 * Requires: Bearer token
 */
router.get('/me', authenticate, async (req, res) => {
  res.json({
    user: {
      id: req.user._id.toString(),
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      preferences: req.user.preferences,
      isNewUser: isNewUser(req.user),
      createdAt: req.user.createdAt,
    },
  });
});

/**
 * PATCH /api/auth/preferences
 * Update user preferences (style quiz, sizes, etc.)
 * Requires: Bearer token
 * Body: { preferences: {...} }
 */
router.patch('/preferences', authenticate, async (req, res) => {
  try {
    const db = getDB();
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ error: 'preferences object is required' });
    }

    // Merge with existing preferences
    const currentPrefs = req.user.preferences || {};
    const mergedPrefs = { ...currentPrefs, ...preferences };

    await db.collection('users').updateOne(
      { _id: toObjectId(req.user._id) },
      { 
        $set: { 
          preferences: mergedPrefs,
          updatedAt: new Date()
        }
      }
    );

    const updatedUser = await db.collection('users').findOne({ 
      _id: toObjectId(req.user._id) 
    });

    res.json({
      message: 'Preferences updated',
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        preferences: updatedUser.preferences,
        isNewUser: isNewUser(updatedUser),
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

/**
 * POST /api/auth/upgrade-vip
 * Upgrade user to VIP (demo)
 */
router.post('/upgrade-vip', authenticate, async (req, res) => {
  try {
    const db = getDB();

    await db.collection('users').updateOne(
      { _id: toObjectId(req.user._id) },
      { 
        $set: { 
          role: 'VIP',
          updatedAt: new Date()
        }
      }
    );

    const updatedUser = await db.collection('users').findOne({ 
      _id: toObjectId(req.user._id) 
    });

    const token = generateToken(updatedUser);

    res.json({
      message: 'Upgraded to VIP successfully!',
      user: {
        id: updatedUser._id.toString(),
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        preferences: updatedUser.preferences,
        createdAt: updatedUser.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('VIP upgrade error:', error);
    res.status(500).json({ error: 'Failed to upgrade' });
  }
});

module.exports = router;
