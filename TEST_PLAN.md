# Comprehensive Test Plan - NexusChain Supply Chain Platform

> **Objective**: Test every aspect of the NexusChain platform except the deployed smart contracts (ProductRegistry.sol and PaymentEscrow.sol on Sepolia). We will test frontend-blockchain integration but not the contracts themselves.

---

## Table of Contents
1. [Test Coverage Overview](#test-coverage-overview)
2. [Testing Stack](#testing-stack)
3. [Backend API Tests](#backend-api-tests)
4. [Frontend Component Tests](#frontend-component-tests)
5. [Integration Tests](#integration-tests)
6. [End-to-End (E2E) Tests](#end-to-end-e2e-tests)
7. [Performance Tests](#performance-tests)
8. [Security Tests](#security-tests)
9. [Test Data & Fixtures](#test-data--fixtures)
10. [CI/CD Integration](#cicd-integration)

---

## Test Coverage Overview

### What We're Testing ✅
- **Backend API**: All REST endpoints, middleware, controllers
- **Frontend Components**: UI components, forms, pages
- **WebSocket Real-time**: Socket.io events and subscriptions
- **Blockchain Integration**: Frontend interaction with deployed contracts
- **Database Operations**: Prisma ORM queries, CRUD operations
- **Authentication & Authorization**: JWT, role-based access control
- **QR Code Generation/Scanning**: QR service functionality
- **File Uploads**: Image handling and storage
- **Error Handling**: Edge cases and error scenarios
- **State Management**: Context providers and hooks

### What We're NOT Testing ❌
- **Deployed Smart Contracts**: ProductRegistry.sol and PaymentEscrow.sol on Sepolia (already tested with Foundry)
- **Solidity Contract Logic**: Internal smart contract functions

### Test Metrics Target
- **Code Coverage**: 80%+ overall
- **Backend Coverage**: 85%+
- **Frontend Coverage**: 75%+
- **Critical Path Coverage**: 95%+

---

## Testing Stack

### Backend Testing
```json
{
  "jest": "^29.7.0",               // Test runner
  "supertest": "^6.3.3",           // HTTP assertions
  "@jest/globals": "^29.7.0",      // Jest utilities
  "jest-mock-extended": "^3.0.5",  // Mocking helpers
  "prisma-mock": "^0.10.0"         // Prisma client mocking
}
```

### Frontend Testing
```json
{
  "@testing-library/react": "^14.1.2",        // React component testing
  "@testing-library/jest-dom": "^6.1.5",      // DOM matchers
  "@testing-library/user-event": "^14.5.1",   // User interaction simulation
  "jest-environment-jsdom": "^29.7.0",        // Browser environment
  "msw": "^2.0.11"                            // API mocking
}
```

### E2E Testing
```json
{
  "@playwright/test": "^1.40.1",   // Modern E2E framework
  "playwright": "^1.40.1"
}
```

### Additional Tools
```json
{
  "socket.io-client": "^4.6.2",    // WebSocket testing (already installed)
  "ethers": "^6.8.0"               // Blockchain testing (already installed)
}
```

---

## Backend API Tests

### 1. Authentication Routes (`/api/auth`)

#### `POST /api/auth/register`
```javascript
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    // Valid registration with all fields
  });

  it('should hash password before storing', async () => {
    // Verify password is hashed
  });

  it('should reject duplicate email', async () => {
    // Email uniqueness validation
  });

  it('should reject invalid email format', async () => {
    // Email validation
  });

  it('should reject weak passwords', async () => {
    // Password strength validation
  });

  it('should validate role enum values', async () => {
    // Only allow MANUFACTURER, LOGISTICS, RETAILER, CONSUMER, ADMIN
  });

  it('should create user with default role CONSUMER', async () => {
    // Default role assignment
  });

  it('should return JWT token on success', async () => {
    // Token generation
  });
});
```

#### `POST /api/auth/login`
```javascript
describe('POST /api/auth/login', () => {
  it('should login existing user with correct credentials', async () => {});
  it('should reject invalid email', async () => {});
  it('should reject incorrect password', async () => {});
  it('should reject inactive user accounts', async () => {});
  it('should return user data without password', async () => {});
  it('should return valid JWT token', async () => {});
  it('should handle case-insensitive email', async () => {});
});
```

#### `GET /api/auth/me` (Protected)
```javascript
describe('GET /api/auth/me', () => {
  it('should return current user profile with valid token', async () => {});
  it('should reject request without token', async () => {});
  it('should reject request with invalid token', async () => {});
  it('should reject request with expired token', async () => {});
  it('should not return password in response', async () => {});
});
```

#### `PUT /api/auth/me` (Protected)
```javascript
describe('PUT /api/auth/me', () => {
  it('should update user profile successfully', async () => {});
  it('should not allow email update', async () => {});
  it('should not allow password update via this route', async () => {});
  it('should validate updated fields', async () => {});
});
```

#### `PUT /api/auth/change-password` (Protected)
```javascript
describe('PUT /api/auth/change-password', () => {
  it('should change password with valid old password', async () => {});
  it('should reject if old password is incorrect', async () => {});
  it('should hash new password before storing', async () => {});
  it('should reject weak new passwords', async () => {});
});
```

---

### 2. Product Routes (`/api/products`)

#### `POST /api/products` (Protected - MANUFACTURER/ADMIN only)
```javascript
describe('POST /api/products', () => {
  it('should create product as MANUFACTURER', async () => {});
  it('should create product as ADMIN', async () => {});
  it('should reject if user is CONSUMER', async () => {});
  it('should reject if user is LOGISTICS', async () => {});
  it('should validate required fields (name, category, manufacturingDate)', async () => {});
  it('should generate unique productId', async () => {});
  it('should set default status to REGISTERED', async () => {});
  it('should generate QR code for product', async () => {});
  it('should handle optional fields (description, batchNumber, expiryDate)', async () => {});
  it('should validate category enum', async () => {});
  it('should validate temperature ranges', async () => {});
});
```

#### `GET /api/products` (Protected)
```javascript
describe('GET /api/products', () => {
  it('should return all products for authenticated user', async () => {});
  it('should filter products by status', async () => {});
  it('should filter products by category', async () => {});
  it('should search products by name', async () => {});
  it('should paginate results', async () => {});
  it('should return products sorted by createdAt desc', async () => {});
  it('should include manufacturer info in response', async () => {});
});
```

#### `GET /api/products/:id` (Protected)
```javascript
describe('GET /api/products/:id', () => {
  it('should return product details by ID', async () => {});
  it('should include checkpoints in response', async () => {});
  it('should return 404 for non-existent product', async () => {});
  it('should include manufacturer details', async () => {});
});
```

#### `GET /api/products/verify/:productId` (Public)
```javascript
describe('GET /api/products/verify/:productId', () => {
  it('should verify product by productId', async () => {});
  it('should return complete product journey', async () => {});
  it('should return all checkpoints', async () => {});
  it('should work without authentication', async () => {});
  it('should return 404 for invalid productId', async () => {});
  it('should include blockchain verification status', async () => {});
});
```

#### `PUT /api/products/:id` (Protected)
```javascript
describe('PUT /api/products/:id', () => {
  it('should update product by owner', async () => {});
  it('should reject update by non-owner', async () => {});
  it('should allow ADMIN to update any product', async () => {});
  it('should validate updated fields', async () => {});
  it('should not allow changing manufacturerId', async () => {});
});
```

#### `PUT /api/products/:id/blockchain` (Protected)
```javascript
describe('PUT /api/products/:id/blockchain', () => {
  it('should update blockchain hash after on-chain registration', async () => {});
  it('should update blockchainId', async () => {});
  it('should validate hash format', async () => {});
});
```

#### `DELETE /api/products/:id` (Protected)
```javascript
describe('DELETE /api/products/:id', () => {
  it('should soft delete product (set isActive=false)', async () => {});
  it('should allow owner to delete product', async () => {});
  it('should allow ADMIN to delete any product', async () => {});
  it('should reject delete by non-owner', async () => {});
});
```

---

### 3. Checkpoint Routes (`/api/checkpoints`)

#### `POST /api/checkpoints` (Protected)
```javascript
describe('POST /api/checkpoints', () => {
  it('should create checkpoint for product', async () => {});
  it('should validate required fields (productId, location, status)', async () => {});
  it('should accept optional fields (latitude, longitude, temperature, humidity, notes)', async () => {});
  it('should link checkpoint to authenticated user', async () => {});
  it('should validate status enum', async () => {});
  it('should update product currentStatus', async () => {});
  it('should update product currentLocation', async () => {});
  it('should emit WebSocket event on checkpoint creation', async () => {});
  it('should validate temperature range if provided', async () => {});
});
```

#### `GET /api/products/:productId/checkpoints` (Protected)
```javascript
describe('GET /api/products/:productId/checkpoints', () => {
  it('should return all checkpoints for product', async () => {});
  it('should return checkpoints sorted by timestamp', async () => {});
  it('should include handler information', async () => {});
  it('should return empty array for product with no checkpoints', async () => {});
});
```

#### `PATCH /api/checkpoints/:id` (Protected)
```javascript
describe('PATCH /api/checkpoints/:id', () => {
  it('should update checkpoint by handler', async () => {});
  it('should allow ADMIN to update any checkpoint', async () => {});
  it('should reject update by non-handler', async () => {});
  it('should validate updated fields', async () => {});
});
```

---

### 4. Middleware Tests

#### Authentication Middleware (`authenticateToken`)
```javascript
describe('authenticateToken middleware', () => {
  it('should pass with valid JWT token', async () => {});
  it('should reject without token', async () => {});
  it('should reject with invalid token', async () => {});
  it('should reject with expired token', async () => {});
  it('should attach user to request object', async () => {});
});
```

#### Authorization Middleware (`authorizeRoles`)
```javascript
describe('authorizeRoles middleware', () => {
  it('should allow user with correct role', async () => {});
  it('should reject user without required role', async () => {});
  it('should allow multiple roles', async () => {});
  it('should allow ADMIN for all routes', async () => {});
});
```

#### Logging Middleware
```javascript
describe('logging middleware', () => {
  it('should log all incoming requests', async () => {});
  it('should log request method, path, and IP', async () => {});
  it('should log response time', async () => {});
  it('should log errors', async () => {});
});
```

---

### 5. Controller Tests

#### Auth Controller
```javascript
describe('authController', () => {
  describe('register', () => {
    it('should create user with hashed password', async () => {});
    it('should generate JWT token', async () => {});
    it('should handle database errors gracefully', async () => {});
  });

  describe('login', () => {
    it('should compare passwords correctly', async () => {});
    it('should return user without password', async () => {});
  });
});
```

#### Product Controller
```javascript
describe('productController', () => {
  describe('registerProduct', () => {
    it('should generate unique productId', async () => {});
    it('should generate QR code', async () => {});
    it('should create product in database', async () => {});
  });

  describe('verifyProduct', () => {
    it('should verify product authenticity', async () => {});
    it('should check blockchain hash if available', async () => {});
  });
});
```

#### Checkpoint Controller
```javascript
describe('checkpointController', () => {
  describe('createCheckpoint', () => {
    it('should create checkpoint and update product status', async () => {});
    it('should emit WebSocket event', async () => {});
  });
});
```

---

### 6. Database/Prisma Tests

```javascript
describe('Prisma Database Operations', () => {
  describe('User Model', () => {
    it('should enforce unique email constraint', async () => {});
    it('should enforce unique walletAddress constraint', async () => {});
    it('should cascade delete user relationships', async () => {});
  });

  describe('Product Model', () => {
    it('should enforce unique productId constraint', async () => {});
    it('should cascade delete checkpoints on product delete', async () => {});
    it('should validate enum values', async () => {});
  });

  describe('Checkpoint Model', () => {
    it('should cascade delete on product delete', async () => {});
    it('should allow null handler (for automated checkpoints)', async () => {});
  });
});
```

---

### 7. WebSocket Tests

```javascript
describe('WebSocket (Socket.io)', () => {
  describe('Connection', () => {
    it('should allow connection without authentication', async () => {});
    it('should authenticate user with valid JWT token', async () => {});
    it('should attach user info to socket on auth', async () => {});
  });

  describe('Room Management', () => {
    it('should join user-specific room on connection', async () => {});
    it('should join product room on track:product event', async () => {});
    it('should leave product room on untrack:product event', async () => {});
  });

  describe('Event Emission', () => {
    it('should emit checkpoint:created to product room', async () => {});
    it('should emit product:updated to product room', async () => {});
    it('should emit alert to specific user', async () => {});
    it('should broadcast to role-specific users', async () => {});
  });

  describe('Disconnect', () => {
    it('should cleanup on client disconnect', async () => {});
  });
});
```

---

### 8. Utility Tests

#### QR Code Service
```javascript
describe('QR Code Service', () => {
  it('should generate valid QR code data URL', async () => {});
  it('should include product information', async () => {});
  it('should handle error cases', async () => {});
});
```

#### Logger
```javascript
describe('Winston Logger', () => {
  it('should log to file and console', async () => {});
  it('should respect log levels', async () => {});
  it('should rotate log files', async () => {});
});
```

---

## Frontend Component Tests

### 1. Authentication Components

#### LoginForm Component
```javascript
describe('LoginForm', () => {
  it('should render email and password inputs', () => {});
  it('should validate email format', () => {});
  it('should validate required fields', () => {});
  it('should call login API on submit', () => {});
  it('should display error message on failed login', () => {});
  it('should redirect to dashboard on successful login', () => {});
  it('should toggle password visibility', () => {});
  it('should disable submit button during loading', () => {});
});
```

#### RegisterForm Component
```javascript
describe('RegisterForm', () => {
  it('should render all registration fields', () => {});
  it('should validate password confirmation match', () => {});
  it('should validate role selection', () => {});
  it('should call register API on submit', () => {});
  it('should display success message on registration', () => {});
  it('should handle API errors gracefully', () => {});
});
```

#### MetaMaskConnect Component
```javascript
describe('MetaMaskConnect', () => {
  it('should detect if MetaMask is installed', () => {});
  it('should display install prompt if not installed', () => {});
  it('should connect to MetaMask on button click', () => {});
  it('should display connected wallet address', () => {});
  it('should detect wrong network', () => {});
  it('should prompt to switch to Sepolia', () => {});
  it('should handle user rejection', () => {});
});
```

---

### 2. Product Components

#### ProductRegistrationForm Component
```javascript
describe('ProductRegistrationForm', () => {
  it('should render all product fields', () => {});
  it('should validate required fields', () => {});
  it('should validate date fields (manufacturingDate < expiryDate)', () => {});
  it('should validate temperature ranges', () => {});
  it('should call create product API', () => {});
  it('should optionally register on blockchain', () => {});
  it('should display QR code after registration', () => {});
  it('should handle API errors', () => {});
});
```

#### ProductCard Component
```javascript
describe('ProductCard', () => {
  it('should display product name and ID', () => {});
  it('should display product status badge', () => {});
  it('should display category', () => {});
  it('should display current location', () => {});
  it('should display QR code button', () => {});
  it('should navigate to product details on click', () => {});
});
```

#### ProductDetails Component
```javascript
describe('ProductDetails', () => {
  it('should fetch and display product details', () => {});
  it('should display all checkpoints on map', () => {});
  it('should display checkpoint timeline', () => {});
  it('should display temperature chart', () => {});
  it('should show blockchain verification status', () => {});
  it('should allow adding new checkpoint if authorized', () => {});
});
```

---

### 3. Common/UI Components

#### Button Component
```javascript
describe('Button', () => {
  it('should render with correct text', () => {});
  it('should apply variant styles', () => {});
  it('should handle click events', () => {});
  it('should show loading spinner when loading', () => {});
  it('should be disabled when disabled prop is true', () => {});
});
```

#### Input Component
```javascript
describe('Input', () => {
  it('should render input with label', () => {});
  it('should display error message', () => {});
  it('should handle onChange events', () => {});
  it('should support different input types', () => {});
});
```

#### StatusBadge Component
```javascript
describe('StatusBadge', () => {
  it('should display correct color for REGISTERED', () => {});
  it('should display correct color for IN_TRANSIT', () => {});
  it('should display correct color for DELIVERED', () => {});
  it('should display correct color for VERIFIED', () => {});
  it('should display correct color for RECALLED', () => {});
});
```

---

### 4. Page Components

#### Dashboard Page
```javascript
describe('Dashboard Page', () => {
  it('should display user statistics', () => {});
  it('should display recent products', () => {});
  it('should display role-specific widgets', () => {});
  it('should redirect to login if not authenticated', () => {});
});
```

#### Products List Page
```javascript
describe('Products List Page', () => {
  it('should fetch and display products', () => {});
  it('should filter products by status', () => {});
  it('should search products by name', () => {});
  it('should paginate results', () => {});
  it('should show loading state', () => {});
  it('should handle empty state', () => {});
});
```

#### Product Registration Page
```javascript
describe('Product Registration Page', () => {
  it('should only be accessible to MANUFACTURER/ADMIN', () => {});
  it('should redirect non-authorized users', () => {});
  it('should render registration form', () => {});
});
```

---

### 5. Context/Provider Tests

#### AuthContext
```javascript
describe('AuthContext', () => {
  it('should provide user and token', () => {});
  it('should handle login', () => {});
  it('should handle logout', () => {});
  it('should persist auth state to localStorage', () => {});
  it('should restore auth state on mount', () => {});
  it('should clear state on logout', () => {});
});
```

#### Web3Context
```javascript
describe('Web3Context', () => {
  it('should provide blockchain service', () => {});
  it('should track wallet connection state', () => {});
  it('should handle wallet connection', () => {});
  it('should handle wallet disconnection', () => {});
  it('should detect network changes', () => {});
  it('should detect account changes', () => {});
});
```

#### WebSocketContext
```javascript
describe('WebSocketContext', () => {
  it('should connect to Socket.io server', () => {});
  it('should authenticate with JWT token', () => {});
  it('should provide socket instance', () => {});
  it('should track connection status', () => {});
  it('should handle reconnection', () => {});
  it('should cleanup on unmount', () => {});
});
```

---

### 6. Service Tests

#### API Service
```javascript
describe('API Service', () => {
  it('should add JWT token to requests', () => {});
  it('should handle 401 responses', () => {});
  it('should redirect to login on 401', () => {});
  it('should handle network errors', () => {});
  it('should return data directly from response', () => {});
});
```

#### Blockchain Service
```javascript
describe('Blockchain Service', () => {
  it('should detect MetaMask installation', () => {});
  it('should connect to MetaMask', () => {});
  it('should initialize contracts', () => {});
  it('should register product on blockchain', () => {});
  it('should add checkpoint on blockchain', () => {});
  it('should get product from blockchain', () => {});
  it('should get checkpoints from blockchain', () => {});
  it('should switch to Sepolia network', () => {});
  it('should listen to contract events', () => {});
});
```

---

## Integration Tests

### 1. Complete Product Lifecycle
```javascript
describe('Product Lifecycle Integration', () => {
  it('should complete full product journey', async () => {
    // 1. Manufacturer registers
    // 2. Manufacturer creates product
    // 3. Manufacturer registers on blockchain
    // 4. Logistics adds checkpoint
    // 5. Retailer adds final checkpoint
    // 6. Consumer verifies product
  });
});
```

### 2. Real-time Updates
```javascript
describe('Real-time WebSocket Integration', () => {
  it('should broadcast checkpoint creation to watchers', async () => {
    // 1. Client A connects and tracks product
    // 2. Client B creates checkpoint
    // 3. Client A receives real-time update
  });

  it('should send alerts to specific users', async () => {});
});
```

### 3. Blockchain Integration
```javascript
describe('Frontend-Blockchain Integration', () => {
  it('should register product and sync with backend', async () => {
    // 1. Frontend calls blockchain service
    // 2. Wait for transaction confirmation
    // 3. Update backend with blockchain hash
    // 4. Verify data consistency
  });

  it('should add checkpoint on blockchain and backend', async () => {});

  it('should verify product from blockchain', async () => {});
});
```

### 4. Authentication Flow
```javascript
describe('Authentication Flow Integration', () => {
  it('should complete registration and login flow', async () => {
    // 1. Register new user
    // 2. Receive JWT token
    // 3. Use token to access protected routes
    // 4. Refresh token
    // 5. Logout
  });
});
```

---

## End-to-End (E2E) Tests

Using Playwright for realistic browser testing.

### 1. User Registration & Login
```javascript
test.describe('User Authentication E2E', () => {
  test('should register new user and login', async ({ page }) => {
    // Navigate to signup
    // Fill registration form
    // Submit and verify redirect
    // Login with credentials
    // Verify dashboard access
  });
});
```

### 2. Product Registration & Verification
```javascript
test.describe('Product Registration E2E', () => {
  test('should create product and verify via QR', async ({ page }) => {
    // Login as manufacturer
    // Navigate to product registration
    // Fill product form
    // Submit and generate QR
    // Navigate to verification page
    // Scan/enter QR code
    // Verify product details displayed
  });
});
```

### 3. Checkpoint Creation & Real-time Updates
```javascript
test.describe('Checkpoint E2E', () => {
  test('should create checkpoint and see real-time update', async ({ page, context }) => {
    // Open two browser tabs
    // Tab 1: Track product
    // Tab 2: Add checkpoint
    // Verify Tab 1 receives real-time update
  });
});
```

### 4. Blockchain Integration E2E
```javascript
test.describe('Blockchain Integration E2E', () => {
  test('should register product on blockchain', async ({ page }) => {
    // Login as manufacturer
    // Connect MetaMask (requires test wallet)
    // Create product
    // Register on blockchain
    // Confirm transaction in MetaMask
    // Verify blockchain hash stored
  });
});
```

### 5. Role-Based Access Control
```javascript
test.describe('RBAC E2E', () => {
  test('should restrict product creation to manufacturers', async ({ page }) => {
    // Login as consumer
    // Attempt to access product registration
    // Verify redirect or error message
  });
});
```

---

## Performance Tests

### 1. API Load Testing
```javascript
describe('API Performance', () => {
  it('should handle 100 concurrent requests to /api/products', async () => {});
  it('should respond within 200ms for product verification', async () => {});
  it('should handle 50 checkpoint creations per second', async () => {});
});
```

### 2. Database Query Performance
```javascript
describe('Database Performance', () => {
  it('should fetch 1000 products within 500ms', async () => {});
  it('should handle complex joins efficiently', async () => {});
  it('should use indexes for common queries', async () => {});
});
```

### 3. WebSocket Scalability
```javascript
describe('WebSocket Performance', () => {
  it('should handle 500 concurrent WebSocket connections', async () => {});
  it('should broadcast to 100 clients within 100ms', async () => {});
});
```

---

## Security Tests

### 1. Authentication Security
```javascript
describe('Authentication Security', () => {
  it('should reject SQL injection attempts', async () => {});
  it('should reject XSS in user inputs', async () => {});
  it('should enforce password complexity', async () => {});
  it('should hash passwords with bcrypt', async () => {});
  it('should use secure JWT signing', async () => {});
  it('should reject tampered JWT tokens', async () => {});
});
```

### 2. Authorization Security
```javascript
describe('Authorization Security', () => {
  it('should prevent horizontal privilege escalation', async () => {});
  it('should prevent vertical privilege escalation', async () => {});
  it('should enforce role-based access control', async () => {});
});
```

### 3. Input Validation
```javascript
describe('Input Validation', () => {
  it('should sanitize user inputs', async () => {});
  it('should validate email format', async () => {});
  it('should validate date ranges', async () => {});
  it('should validate enum values', async () => {});
  it('should reject oversized payloads', async () => {});
});
```

---

## Test Data & Fixtures

### Backend Test Fixtures
```javascript
// fixtures/users.js
export const testUsers = {
  manufacturer: {
    email: 'test-mfg@example.com',
    password: 'Test1234!',
    name: 'Test Manufacturer',
    role: 'MANUFACTURER',
    company: 'Test Corp'
  },
  logistics: { /* ... */ },
  consumer: { /* ... */ },
  admin: { /* ... */ }
};

// fixtures/products.js
export const testProducts = {
  vaccine: {
    name: 'COVID-19 Vaccine',
    category: 'PHARMACEUTICALS',
    batchNumber: 'PFZ-001',
    manufacturingDate: new Date('2024-01-01'),
    expiryDate: new Date('2025-01-01'),
    minTemperature: -70,
    maxTemperature: -60
  },
  /* ... */
};
```

### Frontend Test Fixtures
```javascript
// Use MSW (Mock Service Worker) for API mocking
import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(ctx.json({ token: 'mock-jwt-token', user: mockUser }));
  }),
  rest.get('/api/products', (req, res, ctx) => {
    return res(ctx.json({ products: mockProducts }));
  }),
  /* ... */
];

export const server = setupServer(...handlers);
```

---

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/tests.yml
name: Comprehensive Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: cd backend && npm install
      - name: Run unit tests
        run: cd backend && npm test
      - name: Run integration tests
        run: cd backend && npm run test:integration
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run component tests
        run: cd frontend && npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npm run test:e2e
```

---

## Test Execution Plan

### Phase 1: Setup (1-2 hours)
1. Install testing dependencies
2. Configure Jest for backend and frontend
3. Setup MSW for API mocking
4. Install Playwright for E2E
5. Create test fixtures and helpers

### Phase 2: Backend Tests (4-6 hours)
1. Authentication routes (1 hour)
2. Product routes (2 hours)
3. Checkpoint routes (1 hour)
4. Middleware tests (1 hour)
5. WebSocket tests (1 hour)

### Phase 3: Frontend Tests (4-6 hours)
1. Component tests (2 hours)
2. Page tests (1 hour)
3. Context tests (1 hour)
4. Service tests (2 hours)

### Phase 4: Integration Tests (2-3 hours)
1. Product lifecycle
2. Real-time updates
3. Blockchain integration
4. Authentication flow

### Phase 5: E2E Tests (3-4 hours)
1. User flows
2. Product flows
3. Checkpoint flows
4. Blockchain flows

### Phase 6: Performance & Security (2-3 hours)
1. Load tests
2. Security tests
3. Optimization

---

## Test Coverage Reports

### Backend Coverage
```bash
cd backend
npm test -- --coverage
```

### Frontend Coverage
```bash
cd frontend
npm test -- --coverage
```

### Combined Report
```bash
npm run test:coverage:combined
```

---

## Success Criteria

### Backend
- ✅ All API endpoints tested
- ✅ 85%+ code coverage
- ✅ All middleware tested
- ✅ WebSocket events tested
- ✅ Database operations tested

### Frontend
- ✅ All components tested
- ✅ 75%+ code coverage
- ✅ All contexts tested
- ✅ Services tested
- ✅ User interactions tested

### Integration
- ✅ Complete product lifecycle works
- ✅ Real-time updates verified
- ✅ Blockchain integration functional
- ✅ Authentication flow secure

### E2E
- ✅ Critical user paths verified
- ✅ Cross-browser compatibility
- ✅ Mobile responsiveness

---

## Notes

- **Smart Contracts**: We are NOT testing the deployed ProductRegistry.sol and PaymentEscrow.sol contracts on Sepolia, as they have their own Foundry test suite.
- **Blockchain Integration**: We ARE testing how the frontend interacts with these deployed contracts (connection, transaction submission, event listening).
- **Mock vs Real**: Use mocks for unit/component tests, real services for integration/E2E tests.
- **Test Isolation**: Each test should be independent and not rely on previous test state.
- **Seed Data**: Use Prisma seed for consistent test data in development.

---

**Total Estimated Time**: 16-24 hours for complete implementation
**Priority**: High - Critical for production readiness
**Next Steps**: Begin Phase 1 setup and implement tests incrementally
