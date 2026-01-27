/**
 * Prisma Client Singleton
 * Prevents exhausting database connections during development
 * with hot-reloading by reusing the same PrismaClient instance.
 */

const { PrismaClient } = require('@prisma/client');

// Global variable to store the Prisma instance
const globalForPrisma = globalThis;

// Create or reuse the Prisma Client
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// In development, store the instance globally to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
