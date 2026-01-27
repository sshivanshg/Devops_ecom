/**
 * MongoDB Native Driver Connection
 * Singleton connection to MongoDB Atlas
 */

const { MongoClient, ObjectId } = require('mongodb');

let client = null;
let db = null;

/**
 * Connect to MongoDB
 * @returns {Promise<Db>} MongoDB database instance
 */
async function connectDB() {
  if (db) return db;

  const uri = process.env.DATABASE_URL;
  
  if (!uri) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    client = new MongoClient(uri);
    await client.connect();
    
    // Extract database name from URI or use default
    const dbName = uri.split('/').pop()?.split('?')[0] || 'atelier';
    db = client.db(dbName);
    
    console.log(`Connected to MongoDB: ${dbName}`);
    return db;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

/**
 * Get database instance (must call connectDB first)
 * @returns {Db} MongoDB database instance
 */
function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}

/**
 * Close database connection
 */
async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

/**
 * Check if string is valid ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean}
 */
function isValidObjectId(id) {
  if (!id || typeof id !== 'string') return false;
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

/**
 * Convert string to ObjectId safely
 * @param {string} id - ID string
 * @returns {ObjectId|null}
 */
function toObjectId(id) {
  if (!isValidObjectId(id)) return null;
  return new ObjectId(id);
}

module.exports = {
  connectDB,
  getDB,
  closeDB,
  isValidObjectId,
  toObjectId,
  ObjectId,
};
