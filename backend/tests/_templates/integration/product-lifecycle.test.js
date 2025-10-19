/**
 * Integration Test: Complete Product Lifecycle
 * Tests the full journey from product registration to consumer verification
 */

import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import { generateTestToken, createTestUser, createTestProduct } from '../helpers/testHelpers.js';

// Mock Prisma
jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    checkpoint: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

const { default: prisma } = await import('../../src/config/database.js');
const authRoutes = (await import('../../src/routes/authRoutes.js')).default;
const productRoutes = (await import('../../src/routes/productRoutes.js')).default;
const checkpointRoutes = (await import('../../src/routes/checkpointRoutes.js')).default;

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/checkpoints', checkpointRoutes);

describe('Product Lifecycle Integration Test', () => {
  let manufacturerToken;
  let logisticsToken;
  let retailerToken;
  let consumerToken;
  let productId;
  let manufacturer;
  let logistics;
  let retailer;
  let consumer;

  beforeAll(async () => {
    // Create test users
    const hashedPassword = await bcrypt.hash('Test1234!', 10);

    manufacturer = await createTestUser({
      id: 'mfg-id',
      email: 'manufacturer@test.com',
      password: hashedPassword,
      role: 'MANUFACTURER',
      company: 'Test Manufacturing Inc.',
    });

    logistics = await createTestUser({
      id: 'log-id',
      email: 'logistics@test.com',
      password: hashedPassword,
      role: 'LOGISTICS',
      company: 'Test Logistics Corp.',
    });

    retailer = await createTestUser({
      id: 'ret-id',
      email: 'retailer@test.com',
      password: hashedPassword,
      role: 'RETAILER',
      company: 'Test Retail Store',
    });

    consumer = await createTestUser({
      id: 'con-id',
      email: 'consumer@test.com',
      password: hashedPassword,
      role: 'CONSUMER',
    });

    // Generate tokens
    manufacturerToken = generateTestToken({ userId: manufacturer.id, role: 'MANUFACTURER' });
    logisticsToken = generateTestToken({ userId: logistics.id, role: 'LOGISTICS' });
    retailerToken = generateTestToken({ userId: retailer.id, role: 'RETAILER' });
    consumerToken = generateTestToken({ userId: consumer.id, role: 'CONSUMER' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should complete full product journey', async () => {
    // Step 1: Manufacturer registers product
    const newProduct = createTestProduct({
      id: 'product-123',
      productId: 'NEXUS-TEST-123',
      manufacturerId: manufacturer.id,
      name: 'COVID-19 Vaccine',
      category: 'PHARMACEUTICALS',
      currentStatus: 'REGISTERED',
    });

    prisma.user.findUnique.mockResolvedValue(manufacturer);
    prisma.product.create.mockResolvedValue(newProduct);
    prisma.product.findUnique.mockResolvedValue(newProduct);

    const registerResponse = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${manufacturerToken}`)
      .send({
        name: 'COVID-19 Vaccine',
        category: 'PHARMACEUTICALS',
        manufacturingDate: '2024-01-01',
        expiryDate: '2025-01-01',
        batchNumber: 'PFZ-001',
        originLocation: 'Boston, MA',
        minTemperature: -70,
        maxTemperature: -60,
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.success).toBe(true);
    expect(registerResponse.body.product).toBeDefined();
    productId = registerResponse.body.product.id;

    // Step 2: Logistics provider adds first checkpoint (picked up from factory)
    const checkpoint1 = {
      id: 'cp1',
      productId: productId,
      location: 'Boston Factory',
      latitude: 42.3601,
      longitude: -71.0589,
      status: 'IN_TRANSIT',
      temperature: -65,
      handledBy: logistics.id,
      timestamp: new Date(),
    };

    prisma.checkpoint.create.mockResolvedValue(checkpoint1);
    prisma.product.update.mockResolvedValue({
      ...newProduct,
      currentStatus: 'IN_TRANSIT',
      currentLocation: 'Boston Factory',
    });

    const checkpoint1Response = await request(app)
      .post('/api/checkpoints')
      .set('Authorization', `Bearer ${logisticsToken}`)
      .send({
        productId: productId,
        location: 'Boston Factory',
        latitude: 42.3601,
        longitude: -71.0589,
        status: 'IN_TRANSIT',
        temperature: -65,
        notes: 'Picked up from manufacturing facility',
      });

    expect(checkpoint1Response.status).toBe(201);
    expect(checkpoint1Response.body.success).toBe(true);

    // Step 3: Logistics adds checkpoint at distribution center
    const checkpoint2 = {
      id: 'cp2',
      productId: productId,
      location: 'Miami Distribution Center',
      latitude: 25.7617,
      longitude: -80.1918,
      status: 'IN_TRANSIT',
      temperature: -68,
      handledBy: logistics.id,
      timestamp: new Date(),
    };

    prisma.checkpoint.create.mockResolvedValue(checkpoint2);

    const checkpoint2Response = await request(app)
      .post('/api/checkpoints')
      .set('Authorization', `Bearer ${logisticsToken}`)
      .send({
        productId: productId,
        location: 'Miami Distribution Center',
        latitude: 25.7617,
        longitude: -80.1918,
        status: 'IN_TRANSIT',
        temperature: -68,
        notes: 'Arrived at distribution center',
      });

    expect(checkpoint2Response.status).toBe(201);

    // Step 4: Retailer receives product
    const checkpoint3 = {
      id: 'cp3',
      productId: productId,
      location: 'Kingston Pharmacy',
      latitude: 17.9714,
      longitude: -76.7931,
      status: 'DELIVERED',
      temperature: -66,
      handledBy: retailer.id,
      timestamp: new Date(),
    };

    prisma.checkpoint.create.mockResolvedValue(checkpoint3);
    prisma.product.update.mockResolvedValue({
      ...newProduct,
      currentStatus: 'DELIVERED',
      currentLocation: 'Kingston Pharmacy',
    });

    const checkpoint3Response = await request(app)
      .post('/api/checkpoints')
      .set('Authorization', `Bearer ${retailerToken}`)
      .send({
        productId: productId,
        location: 'Kingston Pharmacy',
        latitude: 17.9714,
        longitude: -76.7931,
        status: 'DELIVERED',
        temperature: -66,
        notes: 'Received at retail location',
      });

    expect(checkpoint3Response.status).toBe(201);

    // Step 5: Consumer verifies product (public endpoint)
    prisma.checkpoint.findMany.mockResolvedValue([checkpoint1, checkpoint2, checkpoint3]);
    prisma.product.findUnique.mockResolvedValue({
      ...newProduct,
      currentStatus: 'DELIVERED',
      currentLocation: 'Kingston Pharmacy',
      checkpoints: [checkpoint1, checkpoint2, checkpoint3],
      manufacturer: manufacturer,
    });

    const verifyResponse = await request(app)
      .get(`/api/products/verify/${newProduct.productId}`)
      .send();

    expect(verifyResponse.status).toBe(200);
    expect(verifyResponse.body.success).toBe(true);
    expect(verifyResponse.body.product).toBeDefined();
    expect(verifyResponse.body.product.checkpoints).toHaveLength(3);
    expect(verifyResponse.body.isAuthentic).toBe(true);

    // Verify temperature compliance
    const allTemperaturesInRange = verifyResponse.body.product.checkpoints.every(
      (cp) => cp.temperature >= -70 && cp.temperature <= -60
    );
    expect(allTemperaturesInRange).toBe(true);

    // Verify complete journey
    const locations = verifyResponse.body.product.checkpoints.map((cp) => cp.location);
    expect(locations).toContain('Boston Factory');
    expect(locations).toContain('Miami Distribution Center');
    expect(locations).toContain('Kingston Pharmacy');
  });

  it('should enforce role-based access control', async () => {
    const newProduct = createTestProduct({
      manufacturerId: manufacturer.id,
    });

    prisma.user.findUnique.mockResolvedValue(consumer);

    // Consumer should NOT be able to register products
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${consumerToken}`)
      .send({
        name: 'Test Product',
        category: 'ELECTRONICS',
        manufacturingDate: '2024-01-01',
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
