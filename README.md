# NexusChain - Blockchain-Powered Supply Chain Tracking

> **Built for Intellibus AI Hackathon 2025**

NexusChain is a decentralized platform that eliminates counterfeit products and creates a universal nexus of trust connecting manufacturers, logistics providers, retailers, and consumers through blockchain technology.

## The Problem

- 250,000+ deaths annually from counterfeit pharmaceuticals
- $4.2 trillion in counterfeit goods circulate globally
- 35% of vaccines compromised by cold chain breaks
- Zero transparency for consumers to verify authenticity

## Our Solution

A decentralized platform combining:
1. **Blockchain immutability** - Tamper-proof product records on Polygon
2. **Real-time tracking** - Live GPS and temperature monitoring via WebSockets
3. **Consumer verification** - Instant QR code scanning for authenticity
4. **Smart contract automation** - Automated payments and compliance

## Tech Stack

- **Blockchain**: Solidity 0.8.19, Foundry, Polygon Mumbai
- **Backend**: Node.js, Express.js, Socket.io, PostgreSQL, Prisma
- **Frontend**: Next.js 14, Tailwind CSS, Leaflet, Ethers.js

## Project Structure

```
nexuschain/
├── blockchain/          # Foundry smart contracts
├── backend/             # Node.js API server
├── frontend/            # Next.js application
└── claude.md            # Comprehensive project documentation
```

## Quick Start

### 1. Blockchain Setup

```bash
cd blockchain

# Install Foundry dependencies
forge install

# Compile contracts
forge build

# Run tests
forge test -vv

# Copy and configure environment
cp .env.example .env
# Edit .env with your private key and RPC URL

# Deploy to Mumbai testnet
source .env
forge script script/Deploy.s.sol \
  --rpc-url $POLYGON_MUMBAI_RPC \
  --broadcast \
  --verify
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your database URL and contract addresses

# Setup database
npx prisma migrate dev --name init
npx prisma generate

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.local.example .env.local
# Edit .env.local with API URL and contract addresses

# Start development server
npm run dev
```

## Environment Variables

See the `.env.example` files in each directory for required configuration.

### Get Mumbai Test MATIC
1. Go to https://faucet.polygon.technology/
2. Select "Mumbai" network
3. Enter your wallet address
4. Receive free test MATIC

## Key Features

### For Manufacturers
- Register products on blockchain
- Generate QR codes for physical products
- Monitor product journey in real-time
- Track temperature compliance

### For Logistics Providers
- Add checkpoints at each stage
- Record GPS coordinates and temperature
- Transfer custody on blockchain
- Automated payment release on delivery

### For Consumers
- Scan QR codes to verify authenticity
- View complete supply chain history
- Check temperature compliance
- Report suspicious products

## Smart Contracts

### ProductRegistry.sol
- Product registration and tracking
- Checkpoint management
- Temperature monitoring
- Role-based access control
- Ownership transfer tracking

### PaymentEscrow.sol
- Automated payment escrow
- Delivery-based payment release
- Dispute resolution
- Refund capabilities

## Development

### Run Tests
```bash
# Smart contract tests
cd blockchain
forge test -vv

# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Database Management
```bash
# Open Prisma Studio (DB GUI)
cd backend
npx prisma studio
```

## Documentation

For detailed documentation, architecture diagrams, API endpoints, and implementation guides, see [claude.md](./claude.md).

## Security

- Never commit private keys
- Use environment variables for sensitive data
- Review smart contracts for vulnerabilities
- Implement rate limiting on API endpoints
- Validate all user inputs

## License

MIT

## Authors

- UNORTHOD0xd

## Acknowledgments

Built for Intellibus AI Hackathon 2025
