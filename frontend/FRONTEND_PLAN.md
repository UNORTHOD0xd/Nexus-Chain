# NexusChain Frontend Development Plan

> **Project**: Decentralized Real-Time Supply Chain Tracker
> **Framework**: Next.js 14 + React 18 + Tailwind CSS
> **Created**: 2025-10-18
> **Status**: Planning Phase

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Overview](#architecture-overview)
4. [User Roles & Personas](#user-roles--personas)
5. [Core Features & User Flows](#core-features--user-flows)
6. [Component Architecture](#component-architecture)
7. [State Management Strategy](#state-management-strategy)
8. [API Integration](#api-integration)
9. [Real-Time WebSocket Strategy](#real-time-websocket-strategy)
10. [Blockchain Integration](#blockchain-integration)
11. [Map Integration (Leaflet)](#map-integration-leaflet)
12. [QR Code Implementation](#qr-code-implementation)
13. [Implementation Phases](#implementation-phases)
14. [Page Structure](#page-structure)
15. [Responsive Design Strategy](#responsive-design-strategy)
16. [Security Considerations](#security-considerations)
17. [Performance Optimization](#performance-optimization)
18. [Testing Strategy](#testing-strategy)
19. [Deployment Strategy](#deployment-strategy)

---

## Project Overview

### What is NexusChain?

NexusChain is a blockchain-based supply chain tracking platform that provides real-time, immutable tracking of products from manufacturing to consumer delivery. Built for the Intellibus AI Hackathon 2025 (24-hour MVP).

### The Problem
- 250,000+ deaths annually from counterfeit pharmaceuticals
- $4.2 trillion in counterfeit goods circulate globally
- 35% of vaccines compromised by cold chain breaks
- Zero transparency for consumers to verify authenticity

### The Solution
A multi-stakeholder platform that combines:
- **Blockchain immutability** (Polygon Mumbai)
- **Real-time tracking** (GPS + temperature monitoring)
- **Consumer empowerment** (QR code verification)
- **Automated payments** (smart contract escrow)

---

## Technology Stack

### Core Framework
```json
{
  "framework": "Next.js 14.0.3",
  "runtime": "React 18.2.0",
  "language": "JavaScript/JSX",
  "styling": "Tailwind CSS 3.3.6",
  "nodeVersion": "18+"
}
```

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 14.0.3 | React framework with SSR/SSG |
| `react` | 18.2.0 | UI library |
| `ethers` | 6.8.0 | Blockchain interaction (Web3) |
| `socket.io-client` | 4.6.2 | Real-time WebSocket client |
| `leaflet` | 1.9.4 | Interactive maps |
| `react-leaflet` | 4.2.1 | React wrapper for Leaflet |
| `lucide-react` | 0.294.0 | Icon library |
| `qrcode` | 1.5.3 | QR code generation |
| `axios` | 1.6.2 | HTTP client |
| `tailwindcss` | 3.3.6 | Utility-first CSS |

### Development Tools
- ESLint (code quality)
- PostCSS (CSS processing)
- Next.js dev server with hot reload

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer (Next.js)                  │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Pages     │  │  Components  │  │     Services     │   │
│  │  (Routes)   │  │   (Reusable) │  │   (API/Web3)     │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │    Hooks    │  │     Utils    │  │      Assets      │   │
│  │  (Custom)   │  │  (Helpers)   │  │   (Images/CSS)   │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└───────┬───────────────────┬──────────────────┬──────────────┘
        │                   │                  │
        ↓                   ↓                  ↓
┌───────────────┐   ┌──────────────┐   ┌─────────────────┐
│  Backend API  │   │  WebSockets  │   │ Polygon Mumbai  │
│  (REST/JSON)  │   │ (Socket.io)  │   │   (Blockchain)  │
└───────────────┘   └──────────────┘   └─────────────────┘
```

### Data Flow
1. **User Action** → Component → Service Layer
2. **Service Layer** → API Call (REST) OR Blockchain Transaction (Web3)
3. **Response** → Component State Update → UI Re-render
4. **Real-time Updates** → WebSocket Event → Global State → UI Update

---

## User Roles & Personas

### 1. Manufacturer
**Goals**: Register products, monitor supply chain, receive payments

**Key Workflows**:
- Register new products with batch numbers
- Generate QR codes for physical attachment
- Monitor product journey in real-time
- View temperature compliance
- Automatic payment release on delivery

**Dashboard Needs**:
- Product registration form
- Real-time product list
- Analytics (temperature compliance, delivery times)
- Alert system for violations

---

### 2. Logistics Provider
**Goals**: Record checkpoints, update locations, ensure compliance

**Key Workflows**:
- Scan QR or enter product ID
- Add checkpoint with location + temperature
- Update status (InTransit, InWarehouse, Customs)
- Transfer custody to next stakeholder

**Mobile Needs**:
- Mobile-optimized checkpoint form
- GPS auto-detection
- Quick status updates
- Camera for QR scanning

---

### 3. Retailer
**Goals**: Verify authenticity, manage inventory, protect customers

**Key Workflows**:
- Verify product before stocking
- View supply chain history
- Monitor temperature compliance
- Report suspicious products

**Dashboard Needs**:
- Product verification interface
- Inventory management
- Supply chain transparency
- Consumer-facing verification

---

### 4. Consumer
**Goals**: Verify product authenticity, ensure safety

**Key Workflows**:
- Scan QR code on product
- View complete product journey
- Check temperature compliance
- Report suspicious products

**Public Interface Needs**:
- Simple QR scanner (no login required)
- Clear product verification status
- Interactive journey map
- Manufacturer information

---

## Core Features & User Flows

### Feature 1: User Authentication

**Flow**:
```
1. User lands on homepage
2. Click "Sign Up" or "Login"
3. Registration:
   - Enter email, password, name
   - Select role (Manufacturer, Logistics, Retailer, Consumer)
   - (Optional) Connect MetaMask wallet
   - Submit → JWT token stored
4. Login:
   - Enter email, password
   - Submit → JWT token stored
   - Redirect to role-based dashboard
```

**Components Needed**:
- `LoginForm.jsx`
- `RegisterForm.jsx`
- `MetaMaskConnect.jsx`
- `RoleSelector.jsx`

**API Endpoints**:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (verify token)

---

### Feature 2: Product Registration (Manufacturer)

**Flow**:
```
1. Navigate to /register
2. Fill form:
   - Product name
   - Batch number
   - Manufacturing date (auto-filled to today)
3. Submit form
4. Backend creates blockchain transaction
5. Display pending state
6. On confirmation:
   - Show success message
   - Display QR code (format: NEXUS-{blockchainId})
   - Option to print/download QR
7. Product appears in dashboard
```

**Components Needed**:
- `ProductRegistrationForm.jsx`
- `QRCodeDisplay.jsx`
- `TransactionPending.jsx`
- `TransactionSuccess.jsx`

**Blockchain Interaction**:
```javascript
const tx = await productRegistry.registerProduct(
  name,
  batchNumber,
  manufacturerAddress
);
await tx.wait();  // Wait for confirmation
```

**API Endpoints**:
- `POST /api/products` (creates DB record + blockchain tx)

---

### Feature 3: Checkpoint Addition (Logistics)

**Flow**:
```
1. Navigate to checkpoint page or scan QR
2. Product details displayed
3. Fill checkpoint form:
   - Location (text input or GPS)
   - Temperature (number input with validation)
   - Status (dropdown: InTransit, InWarehouse, Customs, Delivered)
   - Notes (optional text area)
4. Submit form
5. Blockchain transaction initiated
6. On confirmation:
   - Success message
   - Checkpoint appears in product history
   - WebSocket broadcasts update
```

**Components Needed**:
- `CheckpointForm.jsx`
- `LocationInput.jsx` (with GPS auto-detect)
- `TemperatureInput.jsx` (with range validation)
- `StatusSelector.jsx`

**Temperature Validation**:
```javascript
const MIN_TEMP = 2.0;  // Celsius
const MAX_TEMP = 8.0;  // Celsius
const isInRange = temp >= MIN_TEMP && temp <= MAX_TEMP;
```

**Blockchain Interaction**:
```javascript
// Temperature stored as Celsius × 10
const tempInt = Math.round(temperature * 10);
const tx = await productRegistry.addCheckpoint(
  productId,
  location,
  status,
  notes,
  tempInt
);
```

---

### Feature 4: Dashboard (All Roles)

**Flow**:
```
1. User logs in → redirected to /dashboard
2. Display products based on role:
   - Manufacturer: Products they created
   - Logistics: Products they're handling
   - Retailer: Products in their inventory
   - Consumer: Products they've verified
3. Real-time updates via WebSocket
4. Filter by status, search by name/batch
5. Click product → navigate to detail page
```

**Components Needed**:
- `Dashboard.jsx` (main container)
- `ProductList.jsx`
- `ProductCard.jsx`
- `FilterBar.jsx`
- `SearchInput.jsx`
- `StatusBadge.jsx`

**WebSocket Integration**:
```javascript
useEffect(() => {
  socket.on('product_registered', (data) => {
    setProducts(prev => [data, ...prev]);
  });
  socket.on('checkpoint_added', (data) => {
    updateProductStatus(data.productId, data.status);
  });
}, []);
```

---

### Feature 5: Product Detail Page

**Flow**:
```
1. Navigate to /products/[id]
2. Fetch product details + checkpoints
3. Display:
   - Product information (name, batch, manufacturer)
   - Current status and location
   - Timeline of checkpoints
   - Interactive map with route
   - Temperature compliance chart
4. Real-time updates for new checkpoints
```

**Components Needed**:
- `ProductDetail.jsx`
- `ProductInfo.jsx`
- `CheckpointTimeline.jsx`
- `ProductMap.jsx` (Leaflet)
- `TemperatureChart.jsx`

**Data Structure**:
```javascript
{
  id: "uuid",
  blockchainId: 123,
  name: "Vaccine Batch A",
  batchNumber: "VAC-2024-001",
  qrCode: "NEXUS-123",
  currentStatus: "InTransit",
  currentLocation: "Distribution Center, Mumbai",
  manufacturer: { name: "PharmaCorp", address: "0x..." },
  checkpoints: [
    {
      id: "uuid",
      location: "Factory, Delhi",
      latitude: 28.7041,
      longitude: 77.1025,
      status: "Manufactured",
      temperature: 4.5,
      temperatureInRange: true,
      timestamp: "2025-10-15T08:00:00Z",
      handler: "0x..."
    },
    // ... more checkpoints
  ]
}
```

---

### Feature 6: QR Verification (Public)

**Flow**:
```
1. Navigate to /verify (no login required)
2. Options:
   - Scan QR code using camera
   - OR manually enter QR code
3. Submit QR code (format: NEXUS-{blockchainId})
4. Fetch product details from blockchain
5. Display verification result:
   - ✓ Authentic (green) or ✗ Not Found (red)
   - Product journey on map
   - All checkpoints
   - Temperature compliance status
   - Manufacturer information
```

**Components Needed**:
- `QRScanner.jsx` (camera-based)
- `QRManualInput.jsx`
- `VerificationResult.jsx`
- `AuthenticityBadge.jsx`
- `ProductJourneyMap.jsx`

**QR Code Parsing**:
```javascript
const parseQRCode = (qrCode) => {
  const match = qrCode.match(/^NEXUS-(\d+)$/);
  if (!match) return null;
  return parseInt(match[1]);  // blockchainId
};
```

**API Endpoint**:
- `GET /api/verify/:qrCode`

---

## Component Architecture

### Directory Structure
```
src/
├── app/
│   ├── page.jsx                    (Homepage)
│   ├── layout.jsx                  (Root layout)
│   ├── dashboard/
│   │   └── page.jsx                (Dashboard)
│   ├── register/
│   │   └── page.jsx                (Product registration)
│   ├── products/
│   │   └── [id]/
│   │       └── page.jsx            (Product detail)
│   ├── verify/
│   │   └── page.jsx                (QR verification)
│   ├── login/
│   │   └── page.jsx                (Login)
│   └── signup/
│       └── page.jsx                (Sign up)
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── MetaMaskConnect.jsx
│   │   └── RoleSelector.jsx
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductList.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── ProductInfo.jsx
│   │   ├── ProductRegistrationForm.jsx
│   │   └── FilterBar.jsx
│   ├── checkpoints/
│   │   ├── CheckpointForm.jsx
│   │   ├── CheckpointTimeline.jsx
│   │   ├── LocationInput.jsx
│   │   ├── TemperatureInput.jsx
│   │   └── StatusSelector.jsx
│   ├── qr/
│   │   ├── QRCodeDisplay.jsx
│   │   ├── QRScanner.jsx
│   │   ├── QRManualInput.jsx
│   │   └── VerificationResult.jsx
│   ├── maps/
│   │   ├── ProductMap.jsx
│   │   ├── CheckpointMarker.jsx
│   │   └── RoutePolyline.jsx
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorMessage.jsx
│   └── layout/
│       ├── Navbar.jsx
│       ├── Sidebar.jsx
│       └── Footer.jsx
│
├── hooks/
│   ├── useAuth.js                  (Authentication state)
│   ├── useWebSocket.js             (Real-time updates)
│   ├── useWeb3.js                  (Blockchain interaction)
│   ├── useProducts.js              (Product data fetching)
│   └── useGeolocation.js           (GPS location)
│
├── services/
│   ├── api.js                      (Axios instance + endpoints)
│   ├── blockchain.js               (Ethers.js Web3 provider)
│   ├── websocket.js                (Socket.io client)
│   └── qr.js                       (QR code utilities)
│
└── utils/
    ├── formatters.js               (Date, temperature, address)
    ├── validators.js               (Form validation)
    └── constants.js                (Enums, config)
```

### Component Design Principles

1. **Composition over Inheritance**: Build complex UIs from simple components
2. **Single Responsibility**: Each component does one thing well
3. **Props-driven**: Use props for configuration, avoid tight coupling
4. **Reusability**: Design for reuse across multiple pages
5. **Accessibility**: ARIA labels, keyboard navigation, semantic HTML

---

## State Management Strategy

### Global State (Context API)

**AuthContext** (`src/contexts/AuthContext.jsx`):
```javascript
{
  user: {
    id: string,
    email: string,
    name: string,
    role: 'MANUFACTURER' | 'LOGISTICS' | 'RETAILER' | 'CONSUMER',
    walletAddress: string | null
  },
  token: string | null,
  login: (email, password) => Promise,
  logout: () => void,
  register: (userData) => Promise,
  isAuthenticated: boolean
}
```

**Web3Context** (`src/contexts/Web3Context.jsx`):
```javascript
{
  provider: ethers.BrowserProvider | null,
  signer: ethers.Signer | null,
  account: string | null,
  chainId: number | null,
  productRegistry: Contract | null,
  paymentEscrow: Contract | null,
  connectWallet: () => Promise,
  disconnectWallet: () => void,
  isConnected: boolean
}
```

**WebSocketContext** (`src/contexts/WebSocketContext.jsx`):
```javascript
{
  socket: Socket | null,
  isConnected: boolean,
  subscribe: (event, callback) => void,
  unsubscribe: (event, callback) => void,
  emit: (event, data) => void
}
```

### Local State (useState, useReducer)
- Form inputs (controlled components)
- UI toggles (modals, dropdowns)
- Pagination state
- Search/filter state

### Server State (Custom Hooks)
- Product data fetching
- Checkpoint data
- User data
- Cache management

---

## API Integration

### API Service (`src/services/api.js`)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor (add JWT token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (handle errors)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Endpoints

**Authentication**:
```javascript
export const authAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }),
  register: (userData) =>
    api.post('/api/auth/register', userData),
  me: () =>
    api.get('/api/auth/me')
};
```

**Products**:
```javascript
export const productsAPI = {
  create: (productData) =>
    api.post('/api/products', productData),
  getAll: (filters) =>
    api.get('/api/products', { params: filters }),
  getById: (id) =>
    api.get(`/api/products/${id}`),
  verify: (qrCode) =>
    api.get(`/api/verify/${qrCode}`)
};
```

**Checkpoints**:
```javascript
export const checkpointsAPI = {
  create: (checkpointData) =>
    api.post('/api/checkpoints', checkpointData),
  getByProduct: (productId) =>
    api.get(`/api/products/${productId}/checkpoints`)
};
```

---

## Real-Time WebSocket Strategy

### WebSocket Service (`src/services/websocket.js`)

```javascript
import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  subscribeToProduct(productId) {
    this.socket.emit('subscribe_product', productId);
  }

  on(event, callback) {
    this.socket.on(event, callback);
  }

  off(event, callback) {
    this.socket.off(event, callback);
  }
}

export default new WebSocketService();
```

### WebSocket Events

**Client → Server**:
- `subscribe_product` - Subscribe to product updates

**Server → Client**:
- `product_registered` - New product created
- `checkpoint_added` - New checkpoint added
- `checkpoint_update` - Checkpoint modified
- `status_updated` - Product status changed
- `temperature_alert` - Temperature violation detected

### Usage Example

```javascript
import { useEffect } from 'react';
import websocketService from '@/services/websocket';

function ProductDetail({ productId }) {
  useEffect(() => {
    websocketService.subscribeToProduct(productId);

    websocketService.on('checkpoint_added', (data) => {
      if (data.productId === productId) {
        // Update UI with new checkpoint
        setCheckpoints(prev => [...prev, data.checkpoint]);
      }
    });

    return () => {
      websocketService.off('checkpoint_added');
    };
  }, [productId]);
}
```

---

## Blockchain Integration

### Web3 Provider Setup (`src/services/blockchain.js`)

```javascript
import { ethers } from 'ethers';
import ProductRegistryABI from '@/abis/ProductRegistry.json';
import PaymentEscrowABI from '@/abis/PaymentEscrow.json';

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.productRegistry = null;
    this.paymentEscrow = null;
  }

  async connectWallet() {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create provider
    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();

    // Initialize contracts
    this.productRegistry = new ethers.Contract(
      process.env.NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS,
      ProductRegistryABI,
      this.signer
    );

    this.paymentEscrow = new ethers.Contract(
      process.env.NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS,
      PaymentEscrowABI,
      this.signer
    );

    return {
      account: await this.signer.getAddress(),
      chainId: (await this.provider.getNetwork()).chainId
    };
  }

  async registerProduct(name, batchNumber) {
    const tx = await this.productRegistry.registerProduct(
      name,
      batchNumber
    );
    const receipt = await tx.wait();

    // Parse event to get product ID
    const event = receipt.logs.find(
      log => log.topics[0] === ethers.id('ProductRegistered(uint256,string,string,address,uint256)')
    );
    const productId = ethers.decodeEventLog(
      'ProductRegistered(uint256,string,string,address,uint256)',
      event.data,
      event.topics
    )[0];

    return productId;
  }

  async addCheckpoint(productId, location, status, notes, temperature) {
    // Temperature in Celsius × 10
    const tempInt = Math.round(temperature * 10);

    const tx = await this.productRegistry.addCheckpoint(
      productId,
      location,
      status,
      notes,
      tempInt
    );
    await tx.wait();
  }

  async getProduct(productId) {
    const product = await this.productRegistry.getProduct(productId);
    return {
      id: product.id.toString(),
      name: product.name,
      batchNumber: product.batchnumber,
      manufacturer: product.manufacturer,
      manufacturerDate: new Date(Number(product.manufacturerDate) * 1000),
      currentState: product.currentState,
      currentHolder: product.currentHolder,
      exists: product.exists
    };
  }

  async getCheckpoints(productId) {
    const checkpoints = await this.productRegistry.getCheckpoints(productId);
    return checkpoints.map(cp => ({
      handler: cp.handler,
      location: cp.location,
      timestamp: new Date(Number(cp.timestamp) * 1000),
      status: cp.status,
      notes: cp.notes,
      temperature: Number(cp.temperature) / 10,  // Convert back to Celsius
      temperatureInRange: cp.temperatureInRange
    }));
  }

  listenToEvents(eventName, callback) {
    this.productRegistry.on(eventName, callback);
  }

  removeEventListener(eventName, callback) {
    this.productRegistry.off(eventName, callback);
  }
}

export default new BlockchainService();
```

### Contract ABIs

The contract ABIs need to be generated after deployment and placed in `src/abis/`:
- `ProductRegistry.json`
- `PaymentEscrow.json`

These are generated by running `forge build` in the blockchain directory.

---

## Map Integration (Leaflet)

### Leaflet Setup with Next.js

**Important**: Leaflet requires client-side rendering. Use dynamic imports with `ssr: false`.

### ProductMap Component (`src/components/maps/ProductMap.jsx`)

```javascript
'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

export default function ProductMap({ checkpoints }) {
  // Filter checkpoints with valid coordinates
  const validCheckpoints = checkpoints.filter(
    cp => cp.latitude && cp.longitude
  );

  if (validCheckpoints.length === 0) {
    return <div>No location data available</div>;
  }

  // Center map on first checkpoint
  const center = [
    validCheckpoints[0].latitude,
    validCheckpoints[0].longitude
  ];

  // Create polyline coordinates
  const polylinePositions = validCheckpoints.map(cp => [
    cp.latitude,
    cp.longitude
  ]);

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Route polyline */}
      <Polyline positions={polylinePositions} color="blue" />

      {/* Checkpoint markers */}
      {validCheckpoints.map((cp, index) => (
        <Marker
          key={cp.id}
          position={[cp.latitude, cp.longitude]}
        >
          <Popup>
            <div>
              <strong>{cp.location}</strong>
              <p>Status: {cp.status}</p>
              <p>Temperature: {cp.temperature}°C</p>
              <p>{new Date(cp.timestamp).toLocaleString()}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### Dynamic Import in Page

```javascript
import dynamic from 'next/dynamic';

const ProductMap = dynamic(
  () => import('@/components/maps/ProductMap'),
  {
    ssr: false,
    loading: () => <p>Loading map...</p>
  }
);

export default function ProductDetailPage() {
  return (
    <div>
      <ProductMap checkpoints={checkpoints} />
    </div>
  );
}
```

---

## QR Code Implementation

### QR Code Generation (`src/services/qr.js`)

```javascript
import QRCode from 'qrcode';

export const generateQRCode = async (blockchainId) => {
  const qrData = `NEXUS-${blockchainId}`;

  try {
    // Generate as data URL (base64 image)
    const dataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw error;
  }
};

export const parseQRCode = (qrCode) => {
  const match = qrCode.match(/^NEXUS-(\d+)$/);
  if (!match) {
    throw new Error('Invalid QR code format');
  }
  return parseInt(match[1]);
};
```

### QR Code Display Component

```javascript
import { useState, useEffect } from 'react';
import { generateQRCode } from '@/services/qr';

export default function QRCodeDisplay({ blockchainId }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    generateQRCode(blockchainId).then(setQrDataUrl);
  }, [blockchainId]);

  if (!qrDataUrl) return <div>Generating QR code...</div>;

  return (
    <div className="flex flex-col items-center gap-4">
      <img src={qrDataUrl} alt="Product QR Code" />
      <p className="font-mono text-sm">NEXUS-{blockchainId}</p>
      <button
        onClick={() => {
          const link = document.createElement('a');
          link.download = `NEXUS-${blockchainId}.png`;
          link.href = qrDataUrl;
          link.click();
        }}
        className="btn-primary"
      >
        Download QR Code
      </button>
    </div>
  );
}
```

### QR Code Scanner

For web-based QR scanning, use the device camera API:

```javascript
import { useState, useRef } from 'react';

export default function QRScanner({ onScan }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      videoRef.current.srcObject = stream;
    } catch (err) {
      setError('Camera access denied');
    }
  };

  // Use a QR scanning library like jsQR or html5-qrcode
  // for actual QR detection from video stream

  return (
    <div>
      <video ref={videoRef} autoPlay />
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

**Alternative**: Use manual input fallback if camera access fails.

---

## Implementation Phases

### Phase 1: MVP Essentials (Week 1)

**Goal**: Core functionality for product registration and verification

**Tasks**:
1. ✓ Set up project structure
2. ✓ Configure Tailwind CSS
3. ✓ Create authentication pages (login/register)
4. ✓ Implement AuthContext
5. ✓ Build product registration form
6. ✓ Integrate QR code generation
7. ✓ Create basic dashboard with product list
8. ✓ Build QR verification page
9. ✓ Connect to backend API

**Deliverables**:
- Users can register and login
- Manufacturers can register products
- QR codes generated for products
- Consumers can verify products via QR

---

### Phase 2: Real-Time Tracking (Week 2)

**Goal**: Checkpoint addition and live updates

**Tasks**:
1. ✓ Build checkpoint form
2. ✓ Implement WebSocket integration
3. ✓ Create product detail page
4. ✓ Add checkpoint timeline component
5. ✓ Implement real-time updates on dashboard
6. ✓ Add status badges and filters

**Deliverables**:
- Logistics can add checkpoints
- Real-time updates across all users
- Product journey timeline visible
- Status filtering on dashboard

---

### Phase 3: Maps & Visualization (Week 3)

**Goal**: Interactive maps and temperature tracking

**Tasks**:
1. ✓ Integrate Leaflet maps
2. ✓ Create ProductMap component
3. ✓ Add checkpoint markers
4. ✓ Draw route polylines
5. ✓ Build temperature chart component
6. ✓ Add temperature alerts

**Deliverables**:
- Interactive map showing product journey
- Temperature compliance visualization
- Temperature alerts for violations

---

### Phase 4: Blockchain Integration (Week 4)

**Goal**: Full Web3 functionality

**Tasks**:
1. ✓ Connect MetaMask wallet
2. ✓ Initialize Web3 context
3. ✓ Interact with ProductRegistry contract
4. ✓ Handle blockchain transactions
5. ✓ Display transaction confirmations
6. ✓ Listen to blockchain events

**Deliverables**:
- MetaMask wallet connection
- Blockchain transactions for products/checkpoints
- Real-time blockchain event updates

---

### Phase 5: Polish & Optimization (Week 5)

**Goal**: Production-ready quality

**Tasks**:
1. ✓ Mobile responsive design
2. ✓ Loading states and error handling
3. ✓ Performance optimization
4. ✓ Accessibility improvements
5. ✓ SEO optimization
6. ✓ Testing (unit + integration)

**Deliverables**:
- Mobile-optimized interface
- Smooth loading states
- Comprehensive error handling
- Accessible UI (WCAG AA)

---

## Page Structure

### 1. Homepage (`/`)
- Hero section explaining NexusChain
- Key features
- Call-to-action (Sign Up, Verify Product)
- Social proof (stats, testimonials)

### 2. Login Page (`/login`)
- Email + password form
- Link to register
- MetaMask connection option

### 3. Register Page (`/signup`)
- Email, password, name, role
- MetaMask connection option
- Terms acceptance

### 4. Dashboard (`/dashboard`)
- Role-based layout
- Product list with filters
- Quick actions (register product, add checkpoint)
- Real-time updates indicator

### 5. Product Registration (`/register`)
- Form (name, batch number)
- Submit button
- Transaction pending state
- QR code display on success

### 6. Product Detail (`/products/[id]`)
- Product information
- Current status and location
- Checkpoint timeline
- Interactive map
- Temperature chart
- Add checkpoint button (if authorized)

### 7. QR Verification (`/verify`)
- QR scanner (camera)
- Manual input option
- Verification result
- Product journey display

---

## Responsive Design Strategy

### Breakpoints (Tailwind)
```css
sm: 640px   /* Small devices (landscape phones) */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (laptops) */
xl: 1280px  /* Extra large devices (desktops) */
2xl: 1536px /* 2X large devices (large desktops) */
```

### Mobile-First Approach
- Design for mobile first
- Progressive enhancement for larger screens
- Touch-friendly targets (min 44x44px)
- Hamburger menu for mobile navigation

### Critical Components
- **Dashboard**: Stack cards vertically on mobile, grid on desktop
- **Maps**: Full-width on mobile, sidebar on desktop
- **Forms**: Single column on mobile, multi-column on desktop
- **Timeline**: Vertical on all devices, compact on mobile

---

## Security Considerations

### Authentication
- JWT tokens stored in localStorage (consider httpOnly cookies)
- Token expiration handling
- Secure password requirements (min 8 chars, uppercase, lowercase, number)

### Input Validation
- Client-side validation for UX
- Server-side validation for security
- Sanitize all user inputs
- Temperature range validation (2-8°C)

### Blockchain Security
- MetaMask transaction confirmation
- Display gas estimates before transactions
- Verify contract addresses
- Handle transaction failures gracefully

### API Security
- CORS configuration
- Rate limiting awareness
- Error messages don't leak sensitive data
- HTTPS in production

---

## Performance Optimization

### Code Splitting
- Next.js automatic code splitting
- Dynamic imports for heavy components (maps, charts)
- Lazy load images

### Caching Strategy
- API responses cached where appropriate
- Static assets cached aggressively
- WebSocket reconnection logic

### Bundle Size
- Tree-shaking unused code
- Minimize dependencies
- Use production builds

### Image Optimization
- Next.js Image component for automatic optimization
- WebP format for modern browsers
- Lazy loading below fold

---

## Testing Strategy

### Unit Testing
- Component rendering tests
- Utility function tests
- Hook logic tests
- Tools: Jest + React Testing Library

### Integration Testing
- User flow tests (registration, product creation)
- API integration tests
- WebSocket connection tests

### E2E Testing
- Critical user journeys
- Cross-browser testing
- Mobile device testing
- Tools: Playwright or Cypress

### Manual Testing
- Accessibility testing (screen readers)
- Performance testing (Lighthouse)
- Security testing (OWASP)

---

## Deployment Strategy

### Environment Setup
- **Development**: localhost:3001
- **Staging**: Vercel preview deployment
- **Production**: Vercel production

### Environment Variables
```
NEXT_PUBLIC_API_URL=https://api.nexuschain.com
NEXT_PUBLIC_SOCKET_URL=wss://api.nexuschain.com
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS=0x...
```

### Build Process
```bash
npm run build     # Production build
npm run start     # Production server
```

### CI/CD Pipeline
1. Git push to `main`
2. Vercel automatically builds
3. Run tests
4. Deploy to production
5. Invalidate CDN cache

### Monitoring
- Error tracking (Sentry)
- Analytics (Google Analytics or Plausible)
- Performance monitoring (Vercel Analytics)

---

## Key Technical Notes

### Temperature Conversion
```javascript
// Blockchain stores: Celsius × 10
const blockchainTemp = 45;  // Represents 4.5°C
const displayTemp = blockchainTemp / 10;  // 4.5

// When sending to blockchain
const inputTemp = 4.5;  // User input
const blockchainTemp = Math.round(inputTemp * 10);  // 45
```

### Status Enum Mapping
```javascript
const STATUS_ENUM = {
  0: 'Manufactured',
  1: 'InTransit',
  2: 'InWarehouse',
  3: 'Customs',
  4: 'Delivered',
  5: 'Verified'
};
```

### Role Enum Mapping
```javascript
const ROLE_ENUM = {
  0: 'None',
  1: 'Manufacturer',
  2: 'Logistics',
  3: 'Retailer',
  4: 'Consumer'
};
```

### QR Code Format
```
NEXUS-{blockchainId}
Example: NEXUS-123
```

### Leaflet Map Notes
- **MUST** use dynamic import with `ssr: false`
- Marker icons need manual configuration
- Requires `public/images/marker-*.png` files

---

## Next Steps

1. **Complete Smart Contracts**: ProductRegistry.sol needs full implementation
2. **Build Backend API**: Implement routes and controllers
3. **Database Migration**: Run Prisma migrations
4. **Deploy Contracts**: Deploy to Polygon Mumbai and update addresses
5. **Start Frontend Development**: Follow Phase 1 tasks

---

## Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Ethers.js Docs](https://docs.ethers.org/v6/)
- [Leaflet Docs](https://leafletjs.com/reference.html)
- [Socket.io Docs](https://socket.io/docs/v4/)

### Design References
- Figma designs (if available)
- Brand guidelines (if available)

### Development
- GitHub repository
- Project board for task tracking
- Slack/Discord for team communication

---

**Last Updated**: 2025-10-18
**Version**: 1.0
**Status**: Ready for Implementation
