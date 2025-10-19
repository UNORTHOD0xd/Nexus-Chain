# Environment Variables Setup Guide

This guide will help you configure all environment variables needed to run NexusChain locally.

## 🚀 Quick Start

### 1. Backend Environment Variables

```bash
cd backend
cp .env.example .env
```

Now edit `backend/.env` and configure:

#### **A. Database (Supabase)**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to: Project Settings → Database
3. Copy connection strings:
   - **Transaction pooler** URL → `DATABASE_URL`
   - **Direct connection** URL → `DIRECT_URL`

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@...pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.[ref]:[password]@...compute-1.amazonaws.com:5432/postgres"
```

#### **B. JWT Secret**

Generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output to `JWT_SECRET` in your `.env` file.

#### **C. Blockchain Configuration**

The smart contracts are already deployed. Just verify these values:

```env
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com"
PRODUCT_REGISTRY_ADDRESS="0xe0c52095175ba416b886D1Bda6A4F71F1958c8b2"
PAYMENT_ESCROW_ADDRESS="0x416133e08B0cC8804bf5A00f0e3569D4A378EB63"
CHAIN_ID="11155111"
```

⚠️ **PRIVATE_KEY**: Only needed if you want to register products directly from backend. For now, leave as placeholder.

#### **D. Frontend URL**

```env
FRONTEND_URL="http://localhost:3001"
```

---

### 2. Frontend Environment Variables

```bash
cd frontend
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:

```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000

# WebSocket
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3000

# Blockchain (Sepolia Testnet)
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_CHAIN_ID=11155111

# Smart Contract Addresses (Already deployed)
NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS=0xe0c52095175ba416b886D1Bda6A4F71F1958c8b2
NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS=0x416133e08B0cC8804bf5A00f0e3569D4A378EB63
```

---

## 📋 Complete Environment Variable Reference

### Backend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port | `3000` |
| `NODE_ENV` | No | Environment | `development` |
| `DATABASE_URL` | **Yes** | Supabase pooler URL | See Supabase dashboard |
| `DIRECT_URL` | **Yes** | Supabase direct URL | See Supabase dashboard |
| `JWT_SECRET` | **Yes** | JWT signing secret | Generate with crypto |
| `FRONTEND_URL` | **Yes** | Frontend CORS origin | `http://localhost:3001` |
| `SEPOLIA_RPC_URL` | **Yes** | Sepolia RPC endpoint | `https://ethereum-sepolia-rpc.publicnode.com` |
| `PRODUCT_REGISTRY_ADDRESS` | **Yes** | ProductRegistry contract | `0xe0c52095175ba416b886D1Bda6A4F71F1958c8b2` |
| `PAYMENT_ESCROW_ADDRESS` | **Yes** | PaymentEscrow contract | `0x416133e08B0cC8804bf5A00f0e3569D4A378EB63` |
| `CHAIN_ID` | No | Blockchain chain ID | `11155111` |
| `PRIVATE_KEY` | No | Backend wallet (optional) | Get from MetaMask |
| `LOG_LEVEL` | No | Logging verbosity | `info` |
| `SENTRY_DSN` | No | Error tracking | Sentry project DSN |

### Frontend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | **Yes** | Backend API URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SOCKET_URL` | **Yes** | WebSocket URL | `ws://localhost:3000` |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | **Yes** | Sepolia RPC | `https://ethereum-sepolia-rpc.publicnode.com` |
| `NEXT_PUBLIC_CHAIN_ID` | **Yes** | Chain ID | `11155111` |
| `NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS` | **Yes** | Contract address | `0xe0c52095175ba416b886D1Bda6A4F71F1958c8b2` |
| `NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS` | **Yes** | Contract address | `0x416133e08B0cC8804bf5A00f0e3569D4A378EB63` |

---

## 🧪 Verify Your Setup

### 1. Test Database Connection

```bash
cd backend
npx prisma db push
```

Expected output: `"The database is already in sync with the Prisma schema"`

### 2. Seed Demo Data

```bash
npm run db:seed
```

Expected output: `"✅ Database seeded successfully! 🎉"`

**Demo Login Credentials:**
- Email: `manufacturer@nexuschain.com` | Password: `demo1234`
- Email: `logistics@nexuschain.com` | Password: `demo1234`
- Email: `retailer@nexuschain.com` | Password: `demo1234`
- Email: `consumer@nexuschain.com` | Password: `demo1234`
- Email: `admin@nexuschain.com` | Password: `demo1234`

### 3. Start Backend

```bash
npm run dev
```

Visit: http://localhost:3000/health

Expected: `{"status":"healthy",...}`

### 4. Start Frontend

```bash
cd ../frontend
npm run dev
```

Visit: http://localhost:3001

---

## 🔒 Security Best Practices

### Development

✅ **DO:**
- Use `.env.example` as templates
- Add `.env` to `.gitignore` (already done)
- Generate strong JWT secrets

❌ **DON'T:**
- Commit `.env` files with real credentials
- Share private keys publicly
- Use weak JWT secrets

### Production

1. **Use environment-specific secrets**
   - Different JWT_SECRET for prod
   - Different database credentials
   - Use managed secrets (AWS Secrets Manager, Vercel env vars)

2. **Enable HTTPS**
   - Update `FRONTEND_URL` to `https://`
   - Update `NEXT_PUBLIC_API_URL` to `https://`

3. **Rotate secrets regularly**
   - Change JWT_SECRET monthly
   - Rotate database passwords quarterly

---

## 🚨 Troubleshooting

### "Database connection failed"
- ✅ Check `DATABASE_URL` is correct
- ✅ Verify Supabase project is active
- ✅ Check IP whitelist in Supabase (if enabled)

### "JWT secret not set"
- ✅ Verify `JWT_SECRET` exists in `.env`
- ✅ Restart backend server after changing env vars

### "Wrong network" (MetaMask)
- ✅ Switch MetaMask to Sepolia testnet
- ✅ Get Sepolia ETH from faucet: https://sepoliafaucet.com

### "Contract not found"
- ✅ Verify contract addresses in env files
- ✅ Check contracts are deployed: [ProductRegistry on Etherscan](https://sepolia.etherscan.io/address/0xe0c52095175ba416b886D1Bda6A4F71F1958c8b2)

---

## 📞 Need Help?

1. Check the main [README.md](./README.md)
2. Review [backend/README.md](./backend/README.md)
3. Open an issue on GitHub

---

**Last Updated:** 2025-10-19
**Maintainer:** UNORTHOD0xd
