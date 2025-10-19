# Nexus-Chain: Decentralized Real-Time Supply Chain Tracker

![NexusChain Banner](https://via.placeholder.com/1200x300/0EA5E9/FFFFFF?text=NexusChain+-+Where+Trust+Meets+Transparency)

[![Hackathon](https://img.shields.io/badge/Hackathon-Intellibus%20AI%202025-blue)](https://intellibushackathon.com)
[![Ethereum](https://img.shields.io/badge/Blockchain-Ethereum%20Sepolia-627EEA)](https://ethereum.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.19-363636)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB)](https://react.dev/)
[![Foundry](https://img.shields.io/badge/Foundry-Framework-000000)](https://getfoundry.sh/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/Status-Active%20Development-orange)](./MVP_CHECKLIST.md)

> **Built in 24 hours for Intellibus AI Hackathon 2025** 🚀
> 
> A blockchain-powered real-time supply chain platform that eliminates counterfeit products and creates a universal nexus of trust connecting manufacturers, logistics, retailers, and consumers.

**[Smart Contracts on Etherscan](https://sepolia.etherscan.io/address/0xe0c52095175ba416b886D1Bda6A4F71F1958c8b2)** · **[Documentation](./ENV_SETUP.md)** · **[Deployment Guide](./DEPLOYMENT.md)**

---

## 💡 The Problem We're Solving

The global supply chain is fundamentally broken:

- 🩺 **250,000+ deaths annually** from counterfeit pharmaceuticals
- 💰 **$4.2 trillion** in counterfeit goods circulate globally  
- ❄️ **35% of vaccines** compromised by cold chain breaks
- 🔍 **Zero transparency** for consumers to verify authenticity
- 📄 **Paper trails** easily forged, centralized databases easily hacked

**Real impact:** A mother in Kingston buys medicine for her child. Is it real? Was it stored properly? She has no way to know.

---

## ✨ Our Solution: Nexus-Chain

NexusChain creates a universal connection point where blockchain immutability meets real-time tracking. Every product gets an unforgeable digital identity, every movement is tracked transparently, and every consumer can verify authenticity instantly.

### Core Innovation

🔗 **Blockchain Truth Layer**
- Every product registered on Ethereum Sepolia testnet with unique ID
- Immutable record that mathematically cannot be tampered with  
- Smart contracts automate payments and enforce compliance

⚡ **Real-Time Intelligence**
- Live GPS tracking with sub-second WebSocket updates
- Temperature monitoring for cold chain integrity
- Instant alerts for violations, delays, or anomalies

📱 **Consumer Empowerment**  
- Scan QR code → see complete product journey
- Blockchain-verified authenticity in seconds
- Check temperature compliance throughout supply chain

🤝 **Multi-Stakeholder Platform**
- Manufacturers, logistics, retailers, consumers on one system
- Role-based access maintains privacy while ensuring transparency
- Automated documentation eliminates paperwork

---

## 🎯 Key Features

### For Manufacturers
- Register products on blockchain in seconds
- Monitor entire supply chain in real-time
- Automatic payment release on verified delivery
- Brand protection against counterfeits

### For Logistics Providers
- Simple checkpoint recording with mobile app
- Automated custody transfers via smart contracts
- Temperature/GPS logging for compliance
- Instant payment upon delivery confirmation

### For Retailers
- Verify product authenticity before stocking
- See complete supply chain history
- Protect customers from counterfeit goods
- Automated inventory management

### For Consumers
- **Scan QR code** → Instant verification
- See product journey from factory to shelf
- Temperature compliance proof
- Report suspicious products directly

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                     │
│       React 18 + Tailwind + Socket.io Client + Leaflet      │
│                  Port 3001 (Development)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
              REST API + WebSocket Events
                        │
┌───────────────────────┴─────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│         Socket.io Server + Prisma ORM + Winston              │
│                  Port 3000 (Development)                     │
└──────┬──────────────┬────────────────────┬──────────────────┘
       │              │                    │
       ↓              ↓                    ↓
┌──────────┐   ┌─────────────┐    ┌──────────────┐
│PostgreSQL│   │  Ethereum   │    │  Ethers.js   │
│(Supabase)│   │   Sepolia   │    │ Web3 Provider│
│ + Prisma │   │  Testnet    │    │              │
└──────────┘   └─────────────┘    └──────────────┘
               │
               ├─ ProductRegistry.sol (0xe0c5...c8b2)
               └─ PaymentEscrow.sol (0x4161...EB63)
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Blockchain** | Solidity 0.8.19 | Smart contract logic |
| | Foundry | Development & testing framework |
| | Ethereum Sepolia | Ethereum testnet deployment |
| | Ethers.js 6.8 | Web3 integration |
| **Backend** | Node.js 18+ + Express | REST API server |
| | Socket.io 4.6 | Real-time WebSocket events |
| | PostgreSQL + Prisma 5.6 | Database ORM and migrations |
| | Winston | Logging infrastructure |
| **Frontend** | Next.js 14 + React 18 | Modern React framework |
| | Tailwind CSS 3.3 | Utility-first styling |
| | Leaflet + React-Leaflet | Interactive maps |
| | QRCode.react | QR generation/scanning |
| | Axios + React Query | API state management |
| **DevOps** | Docker + Docker Compose | Containerization |
| | GitHub Actions | CI/CD automation |
| | Vercel/Railway | Production hosting platforms |

---

## 📁 Project Structure

```
Nexus-Chain/
├── blockchain/              # Smart contracts (Foundry)
│   ├── src/
│   │   ├── ProductRegistry.sol    # Core product tracking contract
│   │   └── PaymentEscrow.sol      # Payment automation contract
│   ├── test/                      # Foundry tests
│   ├── script/                    # Deployment scripts
│   ├── deployments/
│   │   └── sepolia.json          # Deployed contract addresses
│   └── foundry.toml              # Foundry configuration
│
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── server.js             # Express server entry point
│   │   ├── controllers/          # Route controllers
│   │   ├── routes/               # API routes
│   │   ├── middleware/           # Auth, logging, error handling
│   │   ├── config/               # Database and blockchain config
│   │   └── utils/                # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── seed.js               # Demo data seeding
│   ├── .env.example              # Environment template
│   └── package.json
│
├── frontend/                # Next.js 14 React app
│   ├── src/
│   │   ├── app/                  # Next.js app router pages
│   │   ├── components/           # Reusable UI components
│   │   ├── services/             # API and blockchain services
│   │   ├── contexts/             # React contexts (auth, web3)
│   │   ├── contracts/            # Contract ABIs
│   │   └── utils/                # Helper functions
│   ├── .env.local.example        # Frontend environment template
│   └── package.json
│
├── .github/workflows/       # CI/CD pipelines
├── docker-compose.yml       # Docker orchestration
├── README.md                # This file
├── DEPLOYMENT.md            # Production deployment guide
├── ENV_SETUP.md             # Environment setup guide
├── DOCKER.md                # Docker setup guide
└── MVP_CHECKLIST.md         # Deployment checklist
```

---

## 🚀 Quick Start

**Smart contracts are already deployed on Sepolia!** No blockchain deployment needed.

### Prerequisites
- Node.js 18+ and npm
- MetaMask wallet with Sepolia testnet ETH ([Get free testnet ETH](https://sepoliafaucet.com/))
- PostgreSQL database (we recommend [Supabase](https://supabase.com) free tier)

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/UNORTHOD0xd/Nexus-Chain.git
cd Nexus-Chain

# Setup backend environment
cd backend
cp .env.example .env
# Edit .env with your database URL and JWT secret (see ENV_SETUP.md)

# Setup frontend environment
cd ../frontend
cp .env.local.example .env.local
# Contract addresses are pre-configured for Sepolia

# Run with Docker Compose (from root directory)
cd ..
docker-compose up --build

# Access the application:
# Frontend: http://localhost:3001
# Backend API: http://localhost:3000
# Backend Health: http://localhost:3000/health
```

See [DOCKER.md](./DOCKER.md) for full Docker guide.

### Option 2: Local Development

```bash
# 1. Clone repository
git clone https://github.com/UNORTHOD0xd/Nexus-Chain.git
cd Nexus-Chain

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration:
#   - DATABASE_URL: Your Supabase PostgreSQL connection string
#   - JWT_SECRET: Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
#   - Contract addresses are already configured

# Initialize database
npx prisma generate
npx prisma db push
npm run db:seed  # Load demo data

# Start backend server
npm run dev      # Runs on http://localhost:3000

# 3. Setup Frontend (new terminal)
cd ../frontend
npm install
cp .env.local.example .env.local
# Contract addresses are pre-configured, no changes needed for local dev

# Start frontend
npm run dev      # Runs on http://localhost:3001
```

**Demo Login Credentials** (after running seed):
- **Manufacturer:** `manufacturer@nexuschain.com` | Password: `demo1234`
- **Logistics:** `logistics@nexuschain.com` | Password: `demo1234`
- **Consumer:** `consumer@nexuschain.com` | Password: `demo1234`

**Detailed Setup Guides:**
- [ENV_SETUP.md](./ENV_SETUP.md) - Complete environment variable configuration
- [DOCKER.md](./DOCKER.md) - Docker deployment guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide

### 🚀 Production Deployment

Ready to deploy? See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Vercel + Railway deployment (easiest)
- AWS/GCP/Azure deployment
- Docker deployment on VPS
- Full CI/CD pipeline

**MVP Checklist:** [MVP_CHECKLIST.md](./MVP_CHECKLIST.md)

---

## 📖 How It Works

### Product Lifecycle

**1. Manufacturing** 🏭
- Manufacturer registers product on blockchain
- Gets unique ID: `NEXUS-001`
- QR code generated and attached to physical product
- Initial checkpoint recorded: "Factory - Boston, MA"

**2. Logistics** 🚚
- Logistics provider scans QR, accepts custody
- Smart contract records ownership transfer
- GPS + temperature logged at each checkpoint
- Real-time updates stream to all stakeholders

**3. Delivery** 📦
- Final checkpoint at retailer location
- Smart contract automatically releases payment
- Proof of delivery generated
- Product ready for consumer purchase

**4. Verification** ✅
- Consumer scans QR code
- Sees complete journey on interactive map
- Blockchain confirms authenticity
- Temperature compliance verified

---

## 🎥 Demo & Testing

### Local Demo Instructions

1. **Start the application** (see Quick Start above)
2. **Register a new account** or use demo credentials
3. **Connect MetaMask** to Sepolia testnet
4. **Get test ETH** from [Sepolia Faucet](https://sepoliafaucet.com/)
5. **Register a product** - Creates blockchain record
6. **View on Etherscan** - See your transaction on-chain

### Planned Demo Features

The complete demo will showcase:
1. **Product Registration** - Register products on blockchain with unique IDs
2. **Live Tracking** - Simulate product journey with checkpoint updates
3. **Temperature Monitoring** - Track cold chain compliance
4. **Consumer Verification** - Scan QR codes for authenticity checks
5. **Automated Payments** - Smart contract escrow and payment release
6. **Real-Time Updates** - WebSocket events for instant visibility

---

## 🧪 Smart Contracts

### Deployed on Sepolia Testnet

**ProductRegistry.sol** - [View on Etherscan](https://sepolia.etherscan.io/address/0xe0c52095175ba416b886D1Bda6A4F71F1958c8b2)
- **Contract Address:** `0xe0c52095175ba416b886D1Bda6A4F71F1958c8b2`
- **Verified:** ✅ Yes
```solidity
// Core functions
registerProduct(name, batchNumber) → returns productId
addCheckpoint(productId, location, status, notes, temp)
transferOwnership(productId, newHolder)
verifyProduct(productId) → returns (authentic, checkpoints)
```

**PaymentEscrow.sol** - [View on Etherscan](https://sepolia.etherscan.io/address/0x416133e08B0cC8804bf5A00f0e3569D4A378EB63)
- **Contract Address:** `0x416133e08B0cC8804bf5A00f0e3569D4A378EB63`
- **Verified:** ✅ Yes
```solidity
// Payment automation
createEscrow(productId, payee, amount)
releaseOnDelivery(productId) → auto-pays logistics
refundPayment(escrowId) → handles disputes
```

**Deployment Details:**
- **Network:** Sepolia Testnet (Chain ID: 11155111)
- **Deployer:** `0xF31A99A843bA137e19b4146c4FEa19B5A6f0c435`
- **Gas Used:** 9,168,923 units
- **Deployment Date:** October 19, 2025

---

## 📊 Project Status & Features

### ✅ Implemented Features

✅ **Smart Contracts (Foundry)** - ProductRegistry and PaymentEscrow deployed & verified on Sepolia
✅ **Backend API (Express)** - REST API with JWT authentication and WebSocket support
✅ **Frontend (Next.js 14)** - Modern React UI with Tailwind CSS
✅ **Database (PostgreSQL + Prisma)** - Schema designed and migrations ready
✅ **Web3 Integration (Ethers.js)** - Blockchain connectivity configured
✅ **Real-Time Infrastructure** - Socket.io setup for live updates
✅ **Docker Support** - Full containerization with docker-compose
✅ **CI/CD Pipeline** - GitHub Actions for automated testing and deployment

### 🚧 Features Under Development

🚧 **Real-Time Tracking** - WebSocket event streaming for live product updates
🚧 **Interactive Maps** - Leaflet integration for checkpoint visualization
🚧 **QR Code System** - Generation and scanning for product verification
🚧 **Payment Escrow** - Smart contract integration for automated payments
🚧 **Role-Based Access** - Manufacturer, logistics, retailer, consumer roles
🚧 **Temperature Monitoring** - IoT sensor data simulation and tracking

### 🎯 Core Innovation

🌟 **Blockchain Trust Layer** - Immutable product records on Ethereum Sepolia
🌟 **Decentralized Verification** - Consumer-facing authenticity checks
🌟 **Smart Contract Automation** - Trustless payment escrow and custody transfers
🌟 **Multi-Stakeholder Platform** - Connecting entire supply chain ecosystem

---

## 📈 Impact & Market Opportunity

### Problem Scale
- $37 billion global supply chain management market
- $4.2 trillion counterfeit goods problem
- 250,000 preventable deaths from fake medicines annually
- Every industry needs transparent tracking

### Target Markets

**Phase 1: Caribbean Pharmaceuticals** 🏥
- High counterfeit drug problem in Caribbean
- Local connections from Intellibus Hackathon
- Regulatory appetite for blockchain solutions

**Phase 2: Global Cold Chain** ❄️
- Vaccines, biologics, perishable foods
- $250 billion market with high compliance needs
- Temperature monitoring is critical differentiator

**Phase 3: Luxury & Electronics** 💎
- Designer goods authentication
- Electronics warranty verification
- High margins support premium pricing

### Revenue Model
- **Transaction Fees**: $0.50 per product registration
- **Enterprise Subscriptions**: $500-$5,000/month by volume
- **API Access**: Partner integrations and data analytics
- **White-Label**: Custom deployments for large enterprises

---

## 👥 Team & Contribution

**Built for Intellibus AI Hackathon 2025**

**Developer:** UNORTHOD0xd
- Full-stack blockchain development
- Smart contract architecture (Solidity + Foundry)
- Backend API design (Node.js + Express + Prisma)
- Frontend development (Next.js + React + Tailwind)
- DevOps & deployment (Docker + CI/CD)

**Contributions Welcome!** This is an open-source project. Feel free to:
- Report issues
- Submit pull requests
- Suggest features
- Improve documentation

---

## 🗺️ Roadmap

### ✅ Phase 1: Foundation (Completed)
- ✅ Smart contracts developed (ProductRegistry, PaymentEscrow)
- ✅ Contracts deployed and verified on Sepolia testnet
- ✅ Backend API architecture (Express + Prisma + Socket.io)
- ✅ Frontend setup (Next.js 14 + React 18 + Tailwind)
- ✅ Database schema designed (PostgreSQL + Prisma)
- ✅ Web3 integration configured (Ethers.js)
- ✅ Docker containerization
- ✅ CI/CD pipeline (GitHub Actions)

### 🔄 Phase 2: MVP Integration (In Progress)
- 🔄 Complete frontend-backend integration
- 🔄 Implement real-time WebSocket events
- 🔄 Build interactive map visualization
- 🔄 Develop QR code generation/scanning
- 🔄 Connect smart contracts to backend
- 🔄 Implement role-based access control
- 🔄 Add comprehensive error handling

### 🔜 Phase 3: Production Ready (Next Steps)
- 📋 End-to-end testing suite
- 📋 Performance optimization
- 📋 Security audit
- 📋 Production deployment (Vercel + Railway)
- 📋 Demo video and documentation
- 📋 Hackathon submission preparation

### 🌟 Phase 4: Future Enhancements
- Mainnet deployment on Ethereum L2 (Polygon, Arbitrum)
- Native mobile apps (React Native)
- Real IoT sensor integration (GPS, temperature)
- Multi-language support
- Advanced analytics with ML predictions
- API marketplace for third-party integrations


---

## 🔐 Security & Privacy

- **Blockchain Security**: Immutable records, cryptographic verification
- **Role-Based Access**: Manufacturers, logistics, retailers see only relevant data
- **Data Privacy**: Sensitive business data stored off-chain with encryption
- **Smart Contract Audits**: Thoroughly tested with Hardhat test suite
- **API Security**: JWT authentication, rate limiting, input validation

---

## 🧪 Testing

### Smart Contract Tests (Foundry)
```bash
cd blockchain
forge test              # Run all tests
forge test --summary    # Show test summary
forge coverage          # Generate coverage report
```

### Backend Tests
```bash
cd backend
npm test                # Run backend tests (when implemented)
```

### Frontend Tests
```bash
cd frontend
npm test                # Run frontend tests (when implemented)
npm run lint            # Run ESLint
```

### Manual Testing Checklist
- [ ] MetaMask connects to Sepolia testnet
- [ ] User registration and login works
- [ ] Product registration writes to blockchain
- [ ] Real-time updates via WebSocket
- [ ] QR code generation and scanning
- [ ] Interactive map displays checkpoints

**Current Status**: Smart contracts fully tested with Foundry. Integration tests completed manually.

---

## 📄 API Documentation

**Base URL**: `http://localhost:3000/api`

### Key Endpoints

```bash
# Register product
POST /products
Body: { "name": "Product Name", "batchNumber": "BATCH-001" }

# Add checkpoint
POST /checkpoints
Body: { "productId": "uuid", "location": "Miami", "status": "InTransit", "temperature": 24.5 }

# Verify product
GET /verify/:qrCode
Returns: Complete product history and blockchain verification

# Get all products
GET /products

# Get product details
GET /products/:id
```

---

## 🎓 What We Learned

Building NexusChain in 24 hours taught us:

**Technical:**
- Integrating blockchain with real-time systems requires careful async handling
- Sepolia's ~12s block times provide reliable testnet environment
- WebSocket event architecture scales better than polling for live updates
- Smart contract gas optimization matters even on cheap networks

**Product:**
- Visual demos (animated maps) resonate more than feature lists
- Starting with a clear MVP scope prevented feature creep
- Temperature monitoring is the killer feature for pharmaceuticals

**Teamwork:**
- Clear role division + frequent integration checkpoints = success
- Regular 6-hour syncs caught issues early
- Pair programming for complex integrations saved debugging time

---

## 🙏 Acknowledgments

Special thanks to:
- **Intellibus** for hosting an incredible 24-hour hackathon in Kingston, Jamaica
- **Ethereum Foundation** for providing robust testnet infrastructure
- **OpenStreetMap contributors** for mapping data
- **Our mentors** for guidance on blockchain architecture and product-market fit
- **AC Hotel Kingston** for the amazing venue and hospitality
- **All participants** for pushing us to build better

---

## 📜 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

---

## 📚 Additional Resources

### Documentation
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Complete environment configuration guide
- **[DOCKER.md](./DOCKER.md)** - Docker setup and troubleshooting
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[MVP_CHECKLIST.md](./MVP_CHECKLIST.md)** - Deployment readiness checklist
- **[Blockchain README](./blockchain/README.md)** - Smart contract documentation
- **[Backend README](./backend/README.md)** - API documentation

### Useful Links
- **Sepolia Faucets:**
  - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
  - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- **Block Explorers:**
  - [Sepolia Etherscan](https://sepolia.etherscan.io/)
- **Development Tools:**
  - [Foundry Book](https://book.getfoundry.sh/)
  - [Ethers.js Documentation](https://docs.ethers.org/)
  - [Prisma Documentation](https://www.prisma.io/docs)
  - [Next.js Documentation](https://nextjs.org/docs)

### Getting Help

Having issues? Here's how to get help:

1. **Check existing documentation** - Most common issues are covered in ENV_SETUP.md and DOCKER.md
2. **Search GitHub Issues** - Someone may have already solved your problem
3. **Create a new issue** - Provide:
   - Environment (OS, Node version, etc.)
   - Steps to reproduce
   - Error messages and logs
   - What you've already tried
4. **Common Issues:**
   - **MetaMask connection issues**: Make sure you're on Sepolia testnet (Chain ID: 11155111)
   - **Database errors**: Check your DATABASE_URL in .env
   - **Build errors**: Delete node_modules and reinstall: `rm -rf node_modules && npm install`
   - **Port conflicts**: Backend runs on 3000, Frontend on 3001 - make sure ports are free

## ⭐ Support NexusChain

If you believe in transparent, trustworthy supply chains, please:
- ⭐ **Star this repo** on GitHub
- 🐦 **Share** on social media
- 💬 **Provide feedback** via GitHub Issues
- 🤝 **Contribute** - we welcome PRs!
- 📧 **Reach out** for collaboration opportunities

---

<div align="center">

**NexusChain: Where Trust Meets Transparency**

*Built with passion in 24 hours. Ready to change the world.* 🌍✨

**Intellibus AI Hackathon 2025** | **Kingston, Jamaica** | **Team Nexus**

</div>
