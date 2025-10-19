# Testing Quick Start Guide

## ⚡ Run Tests Now

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

---

## 📁 Test Files Created

### Backend Tests (3 files)
1. `backend/tests/unit/auth/register.test.js` - User registration (8 tests)
2. `backend/tests/unit/auth/login.test.js` - User login (7 tests)
3. `backend/tests/integration/product-lifecycle.test.js` - Full product journey (2 tests)

### Frontend Tests (2 files)
1. `frontend/src/components/common/__tests__/Button.test.jsx` - Button component (9 tests)
2. `frontend/src/components/common/__tests__/Input.test.jsx` - Input component (10 tests)

**Total: 36 test cases implemented**

---

## 🔧 Configuration Files

### Backend
- ✅ `backend/jest.config.js` - Jest configuration
- ✅ `backend/tests/setup.js` - Test setup
- ✅ `backend/.env.test` - Test environment
- ✅ `backend/tests/helpers/testHelpers.js` - Test utilities

### Frontend
- ✅ `frontend/jest.config.js` - Next.js Jest config
- ✅ `frontend/jest.setup.js` - React Testing Library setup

---

## 📊 Coverage

### Run with Coverage
```bash
# Backend
cd backend && npm run test:coverage

# Frontend
cd frontend && npm run test:coverage
```

### View Coverage Report
```bash
# Backend
cd backend/coverage && start index.html  # Windows
cd backend/coverage && open index.html   # macOS

# Frontend
cd frontend/coverage && start index.html  # Windows
cd frontend/coverage && open index.html   # macOS
```

---

## 📖 Documentation

1. **TEST_PLAN.md** - Comprehensive plan (500+ test cases defined)
2. **TESTING.md** - Complete testing guide
3. **TEST_IMPLEMENTATION_SUMMARY.md** - What's done and what's next
4. **TEST_QUICK_START.md** - This file

---

## 🎯 Next Steps

### 1. Verify Setup Works
```bash
# Test backend
cd backend && npm test

# Test frontend
cd frontend && npm test
```

### 2. Review Sample Tests
- Look at `backend/tests/unit/auth/*.test.js` for patterns
- Look at `frontend/src/components/common/__tests__/*.test.jsx` for React tests

### 3. Continue Implementation
Follow `TEST_PLAN.md` to implement remaining ~470 tests:
- Backend: Product routes, checkpoint routes, middleware
- Frontend: Auth components, product components, contexts
- Integration: WebSocket, blockchain sync
- E2E: User workflows

---

## 🛠️ Common Commands

```bash
# Watch mode (auto-rerun on file changes)
npm run test:watch

# Run specific test file
npm test -- register.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should register"

# Update snapshots
npm test -- -u

# Verbose output
npm test -- --verbose
```

---

## ✅ What's Working

- ✅ Jest configured for ES modules (backend)
- ✅ Jest configured for Next.js (frontend)
- ✅ Supertest for API testing
- ✅ React Testing Library for components
- ✅ Mocking utilities (Prisma, API, MetaMask)
- ✅ Test helpers and fixtures
- ✅ Coverage reporting
- ✅ NPM scripts for all test types

---

## 💡 Writing Your First Test

### Backend Example
```javascript
// tests/unit/products/create-product.test.js
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { generateTestToken } from '../../helpers/testHelpers.js';

describe('POST /api/products', () => {
  it('should create a product', async () => {
    const token = generateTestToken({
      userId: 'test-id',
      role: 'MANUFACTURER'
    });

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Product',
        category: 'PHARMACEUTICALS',
        manufacturingDate: '2024-01-01'
      });

    expect(response.status).toBe(201);
    expect(response.body.product).toBeDefined();
  });
});
```

### Frontend Example
```javascript
// src/components/auth/__tests__/LoginForm.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  it('should submit login form', () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'Test1234!' }
    });

    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Test1234!'
    });
  });
});
```

---

## 🐛 Troubleshooting

### "Cannot find module"
- Make sure you're using ES modules syntax
- Check jest.config.js has `transform: {}`

### "Tests timing out"
- Increase timeout: `jest.setTimeout(10000)`
- Check for unresolved promises

### "Module not mocked"
- Use `jest.unstable_mockModule` before importing
- Import mocked module with `await import()`

### "Component not rendering"
- Check jest-environment-jsdom is installed
- Verify jest.setup.js is loaded

---

## 📞 Get Help

- Check TESTING.md for detailed guide
- Review TEST_PLAN.md for test specifications
- Look at existing tests for patterns
- Check Jest/RTL documentation

---

**Ready to test!** 🚀

Run `npm test` in backend or frontend to see your tests in action!
