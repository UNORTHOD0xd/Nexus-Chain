/**
 * Jest Setup File for Backend Tests
 * Runs before each test suite
 */

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';

// Note: jest is available globally in test files, but not in setup files when using ES modules
// Individual test files can set timeouts if needed
