# Testing Guide - NexusChain

This guide explains how to run and maintain tests for the NexusChain supply chain platform.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Backend Tests](#backend-tests)
3. [Frontend Tests](#frontend-tests)
4. [Integration Tests](#integration-tests)
5. [E2E Tests](#e2e-tests)
6. [Coverage Reports](#coverage-reports)
7. [Writing Tests](#writing-tests)
8. [CI/CD Integration](#cicd-integration)

---

## Quick Start

### Run All Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# With coverage
cd backend && npm run test:coverage
cd frontend && npm run test:coverage
```

### Watch Mode (Development)
```bash
# Backend
cd backend && npm run test:watch

# Frontend
cd frontend && npm run test:watch
```

---

## Backend Tests

### Test Structure
```
backend/
├── tests/
│   ├── setup.js                    # Jest setup
│   ├── helpers/
│   │   └── testHelpers.js         # Test utilities
│   ├── unit/                      # Unit tests
│   │   ├── auth/
│   │   │   ├── register.test.js
│   │   │   └── login.test.js
│   │   ├── products/
│   │   └── checkpoints/
│   └── integration/               # Integration tests
│       ├── product-lifecycle.test.js
│       ├── websocket.test.js
│       └── blockchain-sync.test.js
```

### Running Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Watch mode
npm run test:watch
```

### Test Environment

Backend tests use a separate test database configured in `.env.test`:

```env
NODE_ENV=test
DATABASE_URL="postgresql://user:pass@localhost:5432/nexuschain_test"
JWT_SECRET="test-jwt-secret-key-for-testing-only"
```

### Example Backend Test

```javascript
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server.js';

describe('POST /api/auth/register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test1234!',
        name: 'Test User',
        role: 'CONSUMER'
      });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
  });
});
```

---

## Frontend Tests

### Test Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── __tests__/
│   │   │   │   ├── Button.test.jsx
│   │   │   │   ├── Input.test.jsx
│   │   │   │   └── StatusBadge.test.jsx
│   │   │   ├── Button.jsx
│   │   │   └── Input.jsx
│   │   ├── auth/
│   │   │   ├── __tests__/
│   │   │   │   ├── LoginForm.test.jsx
│   │   │   │   └── RegisterForm.test.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   └── RegisterForm.jsx
│   │   └── products/
│   ├── contexts/
│   │   ├── __tests__/
│   │   │   ├── AuthContext.test.jsx
│   │   │   └── Web3Context.test.jsx
│   │   └── AuthContext.jsx
│   └── services/
│       ├── __tests__/
│       │   ├── api.test.js
│       │   └── blockchain.test.js
│       └── api.js
```

### Running Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# CI mode
npm run test:ci
```

### Example Frontend Component Test

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button Component', () => {
  it('should render and handle clicks', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);

    const button = screen.getByText('Click Me');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});
```

---

## Integration Tests

Integration tests verify that multiple components work together correctly.

### Product Lifecycle Integration Test

Tests the complete journey from product registration to consumer verification:

```bash
cd backend
npm run test:integration
```

This test covers:
1. ✅ Manufacturer registers product
2. ✅ Logistics adds checkpoints during transit
3. ✅ Retailer receives product
4. ✅ Consumer verifies authenticity
5. ✅ Temperature compliance verification
6. ✅ Role-based access control enforcement

### WebSocket Integration Test

Tests real-time updates across multiple clients:

```bash
cd backend
npm test tests/integration/websocket.test.js
```

---

## E2E Tests

End-to-end tests use Playwright to test the entire application in a real browser.

### Installation

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific browser
npm run test:e2e -- --project=chromium
```

### Example E2E Test

```javascript
import { test, expect } from '@playwright/test';

test('user registration and login flow', async ({ page }) => {
  // Navigate to signup
  await page.goto('http://localhost:3001/signup');

  // Fill registration form
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'Test1234!');
  await page.fill('input[name="name"]', 'Test User');
  await page.click('button[type="submit"]');

  // Verify redirect to dashboard
  await expect(page).toHaveURL(/.*dashboard/);
});
```

---

## Coverage Reports

### Viewing Coverage

After running tests with coverage, open the HTML report:

```bash
# Backend
cd backend
npm run test:coverage
open coverage/index.html  # macOS
start coverage/index.html  # Windows

# Frontend
cd frontend
npm run test:coverage
open coverage/index.html  # macOS
start coverage/index.html  # Windows
```

### Coverage Thresholds

**Backend**: 85% minimum
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

**Frontend**: 75% minimum
- Branches: 75%
- Functions: 75%
- Lines: 75%
- Statements: 75%

---

## Writing Tests

### Best Practices

#### ✅ DO
- Write descriptive test names: `it('should reject invalid email format')`
- Test one thing per test case
- Use `beforeEach` for common setup
- Mock external dependencies (database, APIs)
- Test error cases and edge cases
- Use data-testid for stable selectors
- Clean up after tests (`afterEach`, `afterAll`)

#### ❌ DON'T
- Don't test implementation details
- Don't make tests dependent on each other
- Don't use arbitrary waits (`setTimeout`)
- Don't test external libraries
- Don't commit failing tests

### Test Naming Convention

```javascript
describe('ComponentName or FunctionName', () => {
  describe('specific behavior or method', () => {
    it('should do something specific', () => {
      // Test implementation
    });

    it('should handle error case', () => {
      // Test implementation
    });
  });
});
```

### Mocking

#### Backend - Mock Prisma

```javascript
jest.unstable_mockModule('../../src/config/database.js', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

const { default: prisma } = await import('../../src/config/database.js');

// In your test
prisma.user.findUnique.mockResolvedValue(mockUser);
```

#### Frontend - Mock API Calls

```javascript
import { render, screen } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/products', (req, res, ctx) => {
    return res(ctx.json({ products: [] }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on every push and pull request:

```yaml
# .github/workflows/tests.yml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: cd backend && npm install
      - name: Run tests
        run: cd backend && npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm run test:ci
```

### Pre-commit Hooks

Run tests before committing:

```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm test"
```

---

## Test Categories

### Unit Tests
- ✅ Individual functions and components
- ✅ Isolated from external dependencies
- ✅ Fast execution
- ✅ High code coverage

### Integration Tests
- ✅ Multiple components working together
- ✅ Database interactions
- ✅ API endpoint flows
- ✅ Real-time events

### E2E Tests
- ✅ Complete user workflows
- ✅ Browser automation
- ✅ Cross-browser testing
- ✅ Critical paths only

---

## Troubleshooting

### Common Issues

#### Jest Cannot Find Module
```bash
# Ensure you're using ES modules correctly
export default {
  testEnvironment: 'node',
  transform: {},
};
```

#### Tests Timing Out
```bash
# Increase timeout in jest.config.js
testTimeout: 10000  // 10 seconds
```

#### Mock Not Working
```bash
# Make sure to use unstable_mockModule before importing
jest.unstable_mockModule('./module.js', () => ({ ... }));
const module = await import('./module.js');
```

#### Database Connection Errors
```bash
# Use separate test database
DATABASE_URL="postgresql://localhost:5432/nexuschain_test"
```

---

## Test Data

### Test Users

```javascript
// In tests/helpers/testHelpers.js
export const testUsers = {
  manufacturer: {
    email: 'manufacturer@test.com',
    password: 'Test1234!',
    role: 'MANUFACTURER'
  },
  consumer: {
    email: 'consumer@test.com',
    password: 'Test1234!',
    role: 'CONSUMER'
  }
};
```

### Cleanup

```javascript
afterEach(async () => {
  // Clean up test data
  await prisma.checkpoint.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
});
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Supertest Documentation](https://github.com/ladjs/supertest)

---

## Summary

- **Backend**: Jest + Supertest for API testing
- **Frontend**: Jest + React Testing Library for component testing
- **E2E**: Playwright for full application testing
- **Coverage**: 80%+ backend, 75%+ frontend
- **CI/CD**: Automated testing on every commit
- **Mock**: External dependencies (database, blockchain, APIs)

**Run tests frequently** to catch bugs early and maintain code quality!
