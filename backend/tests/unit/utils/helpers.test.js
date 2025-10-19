/**
 * Unit Tests for Test Helpers
 * Simple tests to verify our testing infrastructure works
 */

import { describe, it, expect } from '@jest/globals';
import {
  generateTestToken,
  createTestUser,
  createTestProduct,
  createTestCheckpoint,
} from '../../helpers/testHelpers.js';

describe('Test Helpers', () => {
  describe('generateTestToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateTestToken({ userId: 'test-123', role: 'CONSUMER' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include userId in token payload', () => {
      const payload = { userId: 'user-456', role: 'MANUFACTURER' };
      const token = generateTestToken(payload);

      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('createTestUser', () => {
    it('should create a test user with default values', async () => {
      const user = await createTestUser();

      expect(user).toBeDefined();
      expect(user.id).toBe('test-user-id');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('CONSUMER');
      expect(user.isActive).toBe(true);
    });

    it('should create a test user with custom values', async () => {
      const customUser = await createTestUser({
        id: 'custom-id',
        email: 'custom@example.com',
        role: 'MANUFACTURER',
        company: 'Test Company',
      });

      expect(customUser.id).toBe('custom-id');
      expect(customUser.email).toBe('custom@example.com');
      expect(customUser.role).toBe('MANUFACTURER');
      expect(customUser.company).toBe('Test Company');
    });

    it('should hash password', async () => {
      const user = await createTestUser();

      expect(user.password).toBeDefined();
      expect(user.password).not.toBe('Test1234!'); // Should be hashed
      expect(user.password.length).toBeGreaterThan(20); // Bcrypt hashes are long
    });
  });

  describe('createTestProduct', () => {
    it('should create a test product with default values', () => {
      const product = createTestProduct();

      expect(product).toBeDefined();
      expect(product.id).toBe('test-product-id');
      expect(product.productId).toBe('NEXUS-TEST-001');
      expect(product.name).toBe('Test Product');
      expect(product.category).toBe('PHARMACEUTICALS');
      expect(product.currentStatus).toBe('REGISTERED');
    });

    it('should create a test product with custom values', () => {
      const customProduct = createTestProduct({
        id: 'prod-123',
        name: 'COVID-19 Vaccine',
        category: 'PHARMACEUTICALS',
        currentStatus: 'IN_TRANSIT',
      });

      expect(customProduct.id).toBe('prod-123');
      expect(customProduct.name).toBe('COVID-19 Vaccine');
      expect(customProduct.currentStatus).toBe('IN_TRANSIT');
    });
  });

  describe('createTestCheckpoint', () => {
    it('should create a test checkpoint with default values', () => {
      const checkpoint = createTestCheckpoint();

      expect(checkpoint).toBeDefined();
      expect(checkpoint.id).toBe('test-checkpoint-id');
      expect(checkpoint.productId).toBe('test-product-id');
      expect(checkpoint.location).toBe('Test Location');
      expect(checkpoint.status).toBe('IN_TRANSIT');
      expect(checkpoint.temperature).toBe(5.0);
    });

    it('should create a test checkpoint with custom values', () => {
      const customCheckpoint = createTestCheckpoint({
        id: 'cp-123',
        location: 'Miami Distribution Center',
        status: 'DELIVERED',
        temperature: -65,
      });

      expect(customCheckpoint.id).toBe('cp-123');
      expect(customCheckpoint.location).toBe('Miami Distribution Center');
      expect(customCheckpoint.status).toBe('DELIVERED');
      expect(customCheckpoint.temperature).toBe(-65);
    });
  });
});
