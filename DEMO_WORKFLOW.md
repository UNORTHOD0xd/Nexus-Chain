# NexusChain Demo Workflow

## ✅ System Status: FULLY OPERATIONAL

Both frontend and backend servers are running and all API endpoints are functional.

---

## 🚀 Quick Access

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **API Health Check:** http://localhost:3000/health

---

## 🔐 Demo User Accounts

All demo accounts use password: **demo1234**

| Role | Email | Features Available |
|------|-------|-------------------|
| **Manufacturer** | manufacturer@nexuschain.com | Product registration, Dashboard, Analytics |
| **Logistics** | logistics@nexuschain.com | Add checkpoints, Update status, GPS tracking |
| **Retailer** | retailer@nexuschain.com | Verify products, Inventory management |
| **Consumer** | consumer@nexuschain.com | QR scanning, Product verification |
| **Admin** | admin@nexuschain.com | Full system access |

---

## 📦 Demo Products Available

### 1. COVID-19 Vaccine (DELIVERED)
- **Product ID:** PFZ-CV19-001
- **Status:** DELIVERED
- **Manufacturer:** Pfizer
- **Origin:** Boston, MA
- **Current Location:** CVS Pharmacy, Kingston, Jamaica
- **Temperature:** -70°C (ultra-cold storage)
- **Checkpoints:** 5 (complete journey)

### 2. Insulin Vials (IN TRANSIT)
- **Product ID:** PFZ-INS-002
- **Status:** IN_TRANSIT
- **Manufacturer:** Pfizer
- **Origin:** Boston, MA
- **Current Location:** DHL Warehouse, Miami, FL
- **Temperature:** 2-8°C (refrigerated)
- **Checkpoints:** 3 (in progress)

### 3. iPhone 15 Pro Max (REGISTERED)
- **Product ID:** APPL-IPH-003
- **Status:** REGISTERED
- **Manufacturer:** Pfizer (using demo account)
- **Origin:** Foxconn Factory, Shenzhen, China
- **Checkpoints:** 1 (just registered)

---

## 🧪 Testing Workflow

### Workflow 1: User Registration & Login

#### Test New User Registration
```bash
# Create a new consumer account
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "name": "New Test User",
    "role": "CONSUMER"
  }'
```

**Expected Response:**
- ✅ `success: true`
- User object with ID and JWT token
- Token valid for 7 days

#### Test Login
```bash
# Login with manufacturer account
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manufacturer@nexuschain.com",
    "password": "demo1234"
  }'
```

**Expected Response:**
- ✅ User details including wallet address
- ✅ JWT authentication token

---

### Workflow 2: Product Management

#### Get All Products (Authenticated)
```bash
# Replace TOKEN with your JWT token from login
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
- ✅ List of 3 demo products
- ✅ Each product includes manufacturer info, checkpoints count, latest checkpoint
- ✅ Pagination details

#### Get Single Product Details
```bash
# Get details for COVID-19 vaccine
curl -X GET http://localhost:3000/api/products/PFZ-CV19-001 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Workflow 3: Frontend Testing

#### 1. Homepage
- Open http://localhost:3001
- Should see landing page with:
  - NexusChain branding
  - Feature highlights
  - Statistics (250k+ deaths prevented, $4.2T counterfeits blocked)
  - Call-to-action buttons

#### 2. User Registration
1. Click "Register" button
2. Fill out form:
   - Name: Test User
   - Email: test@example.com
   - Password: test1234
   - Role: Select one (Consumer, Manufacturer, etc.)
3. Click "Create Account"
4. Should redirect to dashboard or login

#### 3. Login
1. Go to http://localhost:3001/login
2. Use demo credentials:
   - Email: manufacturer@nexuschain.com
   - Password: demo1234
3. Click "Login"
4. Should redirect to role-specific dashboard

#### 4. View Products Dashboard
1. After logging in as Manufacturer
2. Should see list of products
3. Can view:
   - Product status
   - Current location
   - Number of checkpoints
   - QR code preview

#### 5. Product Verification (Consumer)
1. Login as consumer@nexuschain.com
2. Navigate to "Verify Product"
3. Can either:
   - Scan QR code (if camera available)
   - Enter product ID manually: PFZ-CV19-001
4. Should display:
   - Product authenticity status
   - Complete journey map
   - All checkpoints with timestamps
   - Temperature compliance

---

## 🐛 Troubleshooting

### Issue: Registration not working in browser

**Solution:** The database connection was fixed. Try the following:

1. **Clear browser cache and cookies**
2. **Hard refresh:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
3. **Check browser console for errors:** F12 → Console tab
4. **Verify API is accessible:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"healthy",...}`

### Issue: Cannot connect to backend

**Check backend server status:**
```bash
# Should show server running
curl http://localhost:3000/health
```

If not running:
```bash
cd backend
npm run dev
```

### Issue: Frontend not loading

**Check frontend server:**
```bash
cd frontend
npm run dev
```

Should start on http://localhost:3001

---

## 🔧 Backend API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Products
- `GET /api/products` - Get all products (requires auth)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Register new product (Manufacturer only)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Checkpoints
- `GET /api/products/:id/checkpoints` - Get product checkpoints
- `POST /api/checkpoints` - Add checkpoint (Logistics only)

### Verification
- `GET /api/verify/:qrCode` - Verify product by QR code
- `GET /api/products/:id/verify` - Verify product by ID

---

## 📊 Database Seed Data

The database is pre-populated with:
- **5 Users:** 1 per role (Manufacturer, Logistics, Retailer, Consumer, Admin)
- **3 Products:** Various stages of delivery
- **9 Checkpoints:** Tracking movement across supply chain

### Wallet Addresses (for MetaMask testing)
- **Manufacturer:** 0xF31A99A843bA137e19b4146c4FEa19B5A6f0c435

---

## 🎯 Key Features to Test

### ✅ Working Features
1. ✅ User registration and authentication
2. ✅ JWT token-based authorization
3. ✅ Product listing with pagination
4. ✅ Product details retrieval
5. ✅ Database integration (Supabase PostgreSQL)
6. ✅ WebSocket connection (Socket.io)
7. ✅ CORS configuration for frontend
8. ✅ Logging system (Winston)

### 🚧 Features Under Development
1. 🚧 Blockchain integration (Ethers.js configured but needs implementation)
2. 🚧 QR code scanning in frontend
3. 🚧 Interactive map visualization
4. 🚧 Real-time WebSocket events
5. 🚧 Product registration form
6. 🚧 Checkpoint creation interface

---

## 📝 Notes

- All passwords in demo data are hashed with bcrypt
- JWT tokens expire after 7 days
- QR codes are generated as base64 PNG images
- Blockchain hashes are simulated (0x123abc..., 0x456def...)
- Smart contracts deployed on Sepolia testnet:
  - ProductRegistry: 0xe0c52095175ba416b886D1Bda6A4F71F1958c8b2
  - PaymentEscrow: 0x416133e08B0cC8804bf5A00f0e3569D4A378EB63

---

## 🚀 Next Steps for Full Integration

1. **Blockchain Integration**
   - Connect Ethers.js provider
   - Implement product registration on-chain
   - Add checkpoint recording to blockchain

2. **Frontend Development**
   - Build product registration form
   - Create checkpoint submission interface
   - Implement QR scanner
   - Add interactive map with Leaflet

3. **Real-Time Features**
   - Socket.io event broadcasting
   - Live product status updates
   - Real-time notifications

4. **Testing**
   - End-to-end user workflows
   - MetaMask integration
   - Mobile responsiveness

---

**Last Updated:** October 19, 2025
**Status:** Backend fully functional, Frontend framework ready
