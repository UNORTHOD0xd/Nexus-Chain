# Blockchain Quick Start Guide

This is a condensed guide to deploy Nexus-Chain smart contracts to Sepolia testnet in ~30 minutes.

For detailed instructions, see [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md).

## Prerequisites (5 minutes)

1. **Install Foundry**:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Get Sepolia ETH** (need 0.05 ETH):
   - Visit: https://sepoliafaucet.com/
   - Enter your wallet address
   - Receive 0.5 SepoliaETH

3. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

4. **Fill in `.env`**:
   ```bash
   SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com
   PRIVATE_KEY=0xYourPrivateKeyFromMetaMask
   ETHERSCAN_API_KEY=YourEtherscanKey  # Optional
   ```

## Deploy (10 minutes)

### Option 1: Using Makefile (Easiest)

```bash
make deploy-all
```

### Option 2: Using Forge Script

```bash
forge script script/Deploy.s.sol:DeployAll \
  --rpc-url $SEPOLIA_RPC \
  --broadcast \
  --verify \
  -vvvv
```

### Option 3: Manual Deploy

```bash
# Deploy ProductRegistry
forge create --rpc-url $SEPOLIA_RPC --private-key $PRIVATE_KEY --verify src/ProductRegistry.sol:ProductRegistry

# Save the address, then deploy PaymentEscrow
forge create --rpc-url $SEPOLIA_RPC --private-key $PRIVATE_KEY --verify --constructor-args <REGISTRY_ADDRESS> src/PaymentEscrow.sol:PaymentEscrow
```

## Save Addresses (2 minutes)

**IMPORTANT**: Copy the deployed contract addresses!

Create `deployments/sepolia-deployment.json`:
```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "contracts": {
    "ProductRegistry": {
      "address": "0x..."
    },
    "PaymentEscrow": {
      "address": "0x..."
    }
  }
}
```

## Test Deployment (5 minutes)

```bash
make test-deployment
```

Or manually:
```bash
# Check owner
cast call <PRODUCT_REGISTRY_ADDRESS> "owner()(address)" --rpc-url $SEPOLIA_RPC

# Register test product
cast send <PRODUCT_REGISTRY_ADDRESS> \
  "registerProduct(string,string)" \
  "Test Product" \
  "BATCH-001" \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY
```

## Update Backend & Frontend (15 minutes)

### Backend

1. Copy ABIs:
```bash
cd ../backend
mkdir -p src/config/contracts
jq '.abi' ../blockchain/out/ProductRegistry.sol/ProductRegistry.json > src/config/contracts/ProductRegistry.json
jq '.abi' ../blockchain/out/PaymentEscrow.sol/PaymentEscrow.json > src/config/contracts/PaymentEscrow.json
```

2. Update `backend/.env`:
```bash
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRODUCT_REGISTRY_ADDRESS=0xYourAddress
PAYMENT_ESCROW_ADDRESS=0xYourAddress
CHAIN_ID=11155111
```

### Frontend

1. Copy ABIs:
```bash
cd ../frontend
mkdir -p src/contracts
jq '.abi' ../blockchain/out/ProductRegistry.sol/ProductRegistry.json > src/contracts/ProductRegistry.json
jq '.abi' ../blockchain/out/PaymentEscrow.sol/PaymentEscrow.json > src/contracts/PaymentEscrow.json
```

2. Update `frontend/.env.local`:
```bash
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS=0xYourAddress
NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS=0xYourAddress
```

## Verify & Push (3 minutes)

1. **Test end-to-end**:
   - Start backend and frontend
   - Connect MetaMask (Sepolia network)
   - Register a product
   - Check transaction on Etherscan

2. **Push to remote**:
```bash
git push origin blockchain-deployment
```

3. **Create Pull Request** to merge into `main`

## Done! ✅

Your smart contracts are now:
- ✅ Deployed to Sepolia testnet
- ✅ Verified on Etherscan
- ✅ Integrated with backend/frontend
- ✅ Ready for testing

## Troubleshooting

**"Insufficient funds"**: Get more Sepolia ETH from faucets

**"Verification failed"**: Run `make verify` after deployment

**"RPC error"**: Try alternative RPC: `https://rpc.sepolia.org`

## Next Steps

- Test full product journey (register → checkpoint → verify)
- Create demo products for presentation
- Deploy backend and frontend
- Prepare for mainnet deployment

---

**Need help?** See [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) for detailed instructions.
