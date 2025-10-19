/**
 * Unit Tests for Auth Registration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../../src/routes/authRoutes.js';
import { generateTestToken, createTestUser } from '../../helpers/testHelpers.js';

// Mock dependencies
jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

// Import mocked modules
const { default: prisma } = await import('../../../src/config/database.js');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const newUser = await createTestUser({
      email: 'newuser@example.com',
      role: 'MANUFACTURER',
    });

    // Mock database responses
    prisma.user.findUnique.mockResolvedValue(null); // No existing user
    prisma.user.create.mockResolvedValue(newUser);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'Test1234!',
        name: 'New User',
        role: 'MANUFACTURER',
        company: 'Test Company',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should reject duplicate email', async () => {
    const existingUser = await createTestUser();

    prisma.user.findUnique.mockResolvedValue(existingUser);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test1234!',
        name: 'Test User',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('already exists');
  });

  it('should reject invalid email format', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'Test1234!',
        name: 'Test User',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('email');
  });

  it('should reject missing required fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        // Missing password and name
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should reject weak passwords', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: '123', // Too short
        name: 'Test User',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('password');
  });

  it('should validate role enum values', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test1234!',
        name: 'Test User',
        role: 'INVALID_ROLE',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should create user with default role CONSUMER', async () => {
    const newUser = await createTestUser({
      role: 'CONSUMER',
    });

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(newUser);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'consumer@example.com',
        password: 'Test1234!',
        name: 'Consumer User',
        // No role specified - should default to CONSUMER
      });

    expect(response.status).toBe(201);
    expect(response.body.user.role).toBe('CONSUMER');
  });

  it('should return valid JWT token', async () => {
    const newUser = await createTestUser();

    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(newUser);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test1234!',
        name: 'Test User',
      });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
    expect(typeof response.body.token).toBe('string');
    expect(response.body.token.split('.')).toHaveLength(3); // JWT has 3 parts
  });
});
