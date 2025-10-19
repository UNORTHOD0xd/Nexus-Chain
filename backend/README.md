# NexusChain Backend API

Production-ready Express.js backend for the NexusChain supply chain tracking platform.

## Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: Full CRUD operations with QR code generation
- **Checkpoint Tracking**: GPS, temperature, and status tracking
- **Real-Time Updates**: WebSocket support for live notifications
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain Integration**: Eth ers.js v6 support for Web3 interactions

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + bcryptjs
- **Real-Time**: Socket.IO
- **Blockchain**: Ethers.js v6

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio
npm run prisma:studio
```

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/nexuschain?schema=public"

# Blockchain
POLYGON_RPC_URL="https://rpc-mumbai.maticvigil.com"
PRIVATE_KEY="your_private_key_here"
PRODUCT_REGISTRY_ADDRESS="0x..."
PAYMENT_ESCROW_ADDRESS="0x..."

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:3001"

# JWT Secret
JWT_SECRET="your_super_secret_jwt_key"
```

## Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "role": "MANUFACTURER",
  "company": "Acme Corp",
  "phone": "+1234567890",
  "walletAddress": "0x..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "company": "New Company",
  "walletAddress": "0x..."
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### Product Endpoints

#### Register Product
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "PFZ-CV19-001",
  "name": "Pfizer COVID-19 Vaccine",
  "description": "mRNA vaccine",
  "category": "PHARMACEUTICALS",
  "manufacturingDate": "2025-01-15",
  "expiryDate": "2025-12-31",
  "originLocation": "New York, USA",
  "minTemperature": -70,
  "maxTemperature": -60,
  "batchNumber": "BATCH001"
}
```

#### Get All Products
```http
GET /api/products?status=IN_TRANSIT&category=PHARMACEUTICALS&search=vaccine&page=1&limit=20
Authorization: Bearer <token>
```

#### Get Product by ID
```http
GET /api/products/:id
Authorization: Bearer <token>
```

#### Verify Product (Public)
```http
GET /api/products/verify/:productId
```

#### Update Product
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentStatus": "IN_TRANSIT",
  "currentLocation": "Distribution Center, Boston"
}
```

#### Update Blockchain Hash
```http
PUT /api/products/:id/blockchain
Authorization: Bearer <token>
Content-Type: application/json

{
  "blockchainHash": "0xabc123...",
  "blockchainId": 12345
}
```

#### Delete Product
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

### Checkpoint Endpoints

#### Add Checkpoint
```http
POST /api/checkpoints
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid",
  "location": "Distribution Center, Boston MA",
  "latitude": 42.3601,
  "longitude": -71.0589,
  "status": "IN_TRANSIT",
  "temperature": -65,
  "humidity": 45,
  "notes": "Package received and inspected",
  "blockchainHash": "0xdef456..."
}
```

#### Get Product Checkpoints
```http
GET /api/checkpoints/product/:productId
Authorization: Bearer <token>
```

#### Get Temperature Alerts
```http
GET /api/checkpoints/product/:productId/alerts
Authorization: Bearer <token>
```

#### Get Checkpoint by ID
```http
GET /api/checkpoints/:id
Authorization: Bearer <token>
```

#### Update Checkpoint
```http
PUT /api/checkpoints/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "temperature": -66,
  "notes": "Updated temperature reading"
}
```

#### Delete Checkpoint
```http
DELETE /api/checkpoints/:id
Authorization: Bearer <token>
```

## WebSocket Events

### Client Connection
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Track Product
```javascript
// Start tracking a product
socket.emit('track:product', productId);

// Stop tracking a product
socket.emit('untrack:product', productId);
```

### Event Listeners
```javascript
// Product created
socket.on('product:created', (data) => {
  console.log('New product:', data.product);
});

// Product updated
socket.on('product:updated', (data) => {
  console.log('Product updated:', data.product);
});

// Status changed
socket.on('product:status:changed', (data) => {
  console.log(`Status: ${data.oldStatus} → ${data.newStatus}`);
});

// Checkpoint added
socket.on('checkpoint:added', (data) => {
  console.log('New checkpoint:', data.checkpoint);
});

// Location updated
socket.on('product:location:updated', (data) => {
  console.log(`Location: ${data.oldLocation} → ${data.newLocation}`);
});

// Temperature alert
socket.on('temperature:alert', (data) => {
  console.log('Temperature violation:', data);
});

// Blockchain confirmed
socket.on('blockchain:confirmed', (data) => {
  console.log('Blockchain TX:', data.transactionHash);
});
```

## Database Schema

### User Model
- Email/password authentication
- Roles: MANUFACTURER, LOGISTICS, RETAILER, CONSUMER, ADMIN
- Wallet address support
- Company and contact information

### Product Model
- Product ID (user-facing identifier)
- Manufacturing and expiry dates
- Category (PHARMACEUTICALS, ELECTRONICS, etc.)
- Temperature tracking (min/max thresholds)
- Current status and location
- Blockchain integration (hash, ID)
- QR code storage

### Checkpoint Model
- Location and GPS coordinates
- Status tracking
- Temperature and humidity monitoring
- Handler information
- Blockchain hash for verification
- Timestamped records

## Role-Based Access Control

### MANUFACTURER
- Register new products
- Update own products
- View all checkpoints for own products

### LOGISTICS
- Add checkpoints to products
- Update checkpoint information
- View products in transit

### RETAILER
- View products
- Verify product authenticity
- Add delivery checkpoints

### CONSUMER
- Verify product authenticity
- View product journey (public products)

### ADMIN
- Full access to all endpoints
- Can modify any product/checkpoint
- User management

## Error Handling

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### HTTP Status Codes
- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Development

### Project Structure
```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── database.js        # Prisma client
│   │   └── websocket.js       # Socket.IO setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   └── checkpointController.js
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   └── checkpointRoutes.js
│   ├── utils/
│   │   └── socketEvents.js    # WebSocket emitters
│   └── server.js              # Entry point
├── .env.example
├── package.json
└── README.md
```

### Adding New Endpoints

1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Import and use route in `src/server.js`
4. Add WebSocket events if needed in `src/utils/socketEvents.js`

### Database Migrations

```bash
# Create migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View database in Prisma Studio
npm run prisma:studio
```

## Testing

```bash
# Run tests (when implemented)
npm test

# Test API with curl
curl http://localhost:3000/health
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure PostgreSQL for production
4. Set up HTTPS/SSL
5. Enable rate limiting
6. Configure CORS properly
7. Set up monitoring (PM2, Winston logs)
8. Deploy contracts and update addresses

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

MIT License

## Support

For issues and questions, create an issue in the repository.
