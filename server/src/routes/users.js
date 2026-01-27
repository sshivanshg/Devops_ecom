/**
 * User API Routes (Legacy - use /api/auth for auth)
 * Kept for backwards compatibility
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB, isValidObjectId, toObjectId } = require('../lib/mongodb');

const router = express.Router();

/**
 * GET /api/users/:id
 * Get user by ID (public profile)
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await db.collection('users').findOne(
      { _id: toObjectId(id) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * POST /api/users (Legacy register endpoint)
 * Use /api/auth/register instead
 */
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: 'email, password, and name are required' 
      });
    }

    const existingUser = await db.collection('users').findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

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

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.insertedId.toString(),
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

module.exports = router;
