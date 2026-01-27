/**
 * Authentication Middleware
 * JWT-based auth with role checking using native MongoDB
 */

const jwt = require('jsonwebtoken');
const { getDB, toObjectId } = require('../lib/mongodb');

const JWT_SECRET = process.env.JWT_SECRET || 'atelier-secret-key';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate JWT token for a user
 * @param {Object} user - User object with _id, email, role
 * @returns {string} JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token or null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch fresh user data (in case role changed)
    const db = getDB();
    const user = await db.collection('users').findOne(
      { _id: toObjectId(decoded.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      preferences: user.preferences,
      createdAt: user.createdAt,
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Optional authentication middleware
 * Attaches user if token present, but doesn't require it
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);

      if (decoded) {
        const db = getDB();
        const user = await db.collection('users').findOne(
          { _id: toObjectId(decoded.userId) },
          { projection: { password: 0 } }
        );

        if (user) {
          req.user = {
            _id: user._id.toString(),
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            preferences: user.preferences,
            createdAt: user.createdAt,
          };
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
}

/**
 * Role-based authorization middleware
 * Requires user to have one of the specified roles
 * @param {...string} allowedRoles - Roles allowed to access the route
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `This action requires one of these roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

/**
 * Admin-only middleware
 */
const requireAdmin = requireRole('ADMIN');

/**
 * VIP or Admin middleware
 */
const requireVIP = requireRole('VIP', 'ADMIN');

/**
 * Check if user is new (created within last 24 hours)
 * @param {Object} user - User object with createdAt
 * @returns {boolean}
 */
function isNewUser(user) {
  if (!user || !user.createdAt) return false;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return new Date(user.createdAt) > oneDayAgo;
}

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireVIP,
  isNewUser,
  JWT_SECRET,
};
