/**
 * Unit Tests for Auth Login
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import authRoutes from '../../../src/routes/authRoutes.js';
import { createTestUser } from '../../helpers/testHelpers.js';

// Mock dependencies
jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

const { default: prisma } = await import('../../../src/config/database.js');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login existing user with correct credentials', async () => {
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    const user = await createTestUser({
      email: 'test@example.com',
      password: hashedPassword,
    });

    prisma.user.findUnique.mockResolvedValue(user);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test1234!',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('should reject invalid email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'Test1234!',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Invalid');
  });

  it('should reject incorrect password', async () => {
    const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);
    const user = await createTestUser({
      password: hashedPassword,
    });

    prisma.user.findUnique.mockResolvedValue(user);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'WrongPassword123!',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should reject inactive user accounts', async () => {
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    const inactiveUser = await createTestUser({
      password: hashedPassword,
      isActive: false,
    });

    prisma.user.findUnique.mockResolvedValue(inactiveUser);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test1234!',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('inactive');
  });

  it('should return user data without password', async () => {
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    const user = await createTestUser({
      password: hashedPassword,
    });

    prisma.user.findUnique.mockResolvedValue(user);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test1234!',
      });

    expect(response.status).toBe(200);
    expect(response.body.user.password).toBeUndefined();
  });

  it('should return valid JWT token', async () => {
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    const user = await createTestUser({
      password: hashedPassword,
    });

    prisma.user.findUnique.mockResolvedValue(user);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test1234!',
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(typeof response.body.token).toBe('string');
    expect(response.body.token.split('.')).toHaveLength(3);
  });

  it('should handle case-insensitive email', async () => {
    const hashedPassword = await bcrypt.hash('Test1234!', 10);
    const user = await createTestUser({
      email: 'test@example.com',
      password: hashedPassword,
    });

    prisma.user.findUnique.mockResolvedValue(user);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'TEST@EXAMPLE.COM',
        password: 'Test1234!',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
