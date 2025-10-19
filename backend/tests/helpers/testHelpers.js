/**
 * Test Helper Functions
 * Reusable utilities for backend tests
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * Generate a test JWT token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
export const generateTestToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h',
  });
};

/**
 * Create a test user object
 * @param {Object} overrides - Override default values
 * @returns {Object} User object
 */
export const createTestUser = async (overrides = {}) => {
  const hashedPassword = await bcrypt.hash('Test1234!', 10);

  return {
    id: 'test-user-id',
    email: 'test@example.com',
    password: hashedPassword,
    name: 'Test User',
    role: 'CONSUMER',
    walletAddress: null,
    company: null,
    phone: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

/**
 * Create a test product object
 * @param {Object} overrides - Override default values
 * @returns {Object} Product object
 */
export const createTestProduct = (overrides = {}) => {
  return {
    id: 'test-product-id',
    productId: 'NEXUS-TEST-001',
    name: 'Test Product',
    description: 'Test product description',
    category: 'PHARMACEUTICALS',
    manufacturerId: 'test-manufacturer-id',
    manufacturingDate: new Date('2024-01-01'),
    expiryDate: new Date('2025-01-01'),
    batchNumber: 'BATCH-001',
    originLocation: 'Test Origin',
    currentLocation: 'Test Location',
    currentStatus: 'REGISTERED',
    minTemperature: 2.0,
    maxTemperature: 8.0,
    blockchainHash: null,
    blockchainId: null,
    qrCode: 'data:image/png;base64,test',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

/**
 * Create a test checkpoint object
 * @param {Object} overrides - Override default values
 * @returns {Object} Checkpoint object
 */
export const createTestCheckpoint = (overrides = {}) => {
  return {
    id: 'test-checkpoint-id',
    productId: 'test-product-id',
    location: 'Test Location',
    latitude: 40.7128,
    longitude: -74.0060,
    status: 'IN_TRANSIT',
    temperature: 5.0,
    humidity: 60.0,
    notes: 'Test checkpoint',
    handledBy: 'test-user-id',
    blockchainHash: null,
    timestamp: new Date(),
    createdAt: new Date(),
    ...overrides,
  };
};

/**
 * Mock Prisma client
 * @returns {Object} Mocked Prisma client
 */
export const mockPrismaClient = () => {
  return {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    checkpoint: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
};

/**
 * Wait for async operations
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise}
 */
export const wait = (ms = 100) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Clean test data
 * @param {Object} prisma - Prisma client
 */
export const cleanupTestData = async (prisma) => {
  await prisma.checkpoint.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
};
