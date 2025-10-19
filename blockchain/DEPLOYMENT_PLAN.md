# Blockchain Deployment Plan - Nexus-Chain MVP

## Overview
This document outlines the complete deployment strategy for Nexus-Chain smart contracts to Sepolia testnet. This is the critical path for MVP deployment.

---

## Prerequisites Checklist

### Required Tools
- [ ] Foundry installed (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- [ ] Git installed and configured
- [ ] MetaMask wallet with Sepolia testnet configured
- [ ] Terminal/shell access

### Required Accounts & Credentials
- [ ] MetaMask wallet address (will be contract owner)
- [ ] MetaMask private key (NEVER commit this!)
- [ ] Sepolia testnet ETH (get from faucet)
- [ ] Etherscan API key (for contract verification - optional but recommended)

### Network Configuration
- **Network**: Sepolia Testnet (Ethereum)
- **Chain ID**: 11155111
- **RPC URL**: https://ethereum-sepolia-rpc.publicnode.com
- **Alternative RPC**: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
- **Alternative RPC**: https://rpc.sepolia.org
- **Block Explorer**: https://sepolia.etherscan.io
- **Currency**: SepoliaETH (testnet ETH)

---

## Step-by-Step Deployment Guide

### Step 1: Get Sepolia ETH (5 minutes)

**Option A: Alchemy Sepolia Faucet** (Recommended)
1. Visit: https://sepoliafaucet.com/
2. Create free Alchemy account (if needed)
3. Paste your wallet address
4. Receive 0.5 SepoliaETH per day

**Option B: Infura Sepolia Faucet**
1. Visit: https://www.infura.io/faucet/sepolia
2. Create free Infura account
3. Paste wallet address
4. Receive 0.5 SepoliaETH

**Option C: QuickNode Faucet**
1. Visit: https://faucet.quicknode.com/ethereum/sepolia
2. Enter wallet address
3. Complete verification
4. Receive 0.05 SepoliaETH

**Option D: PoW Faucet** (No registration required)
1. Visit: https://sepolia-faucet.pk910.de/
2. Complete proof-of-work mining in browser
3. Earn SepoliaETH without account

**Option E: Google Cloud Web3 Faucet**
1. Visit: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
2. Sign in with Google account
3. Receive 0.05 SepoliaETH

**Verification**:
```bash
# Check your balance (should show ~0.5 ETH)
cast balance <YOUR_WALLET_ADDRESS> --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

**Minimum Required**: 0.05 ETH (deployment costs ~0.01-0.02 ETH)

---

### Step 2: Configure Environment (10 minutes)

**A. Copy environment template**
```bash
cd blockchain
cp .env.example .env
```

**B. Edit `.env` file with your credentials**
```bash
# Required - Get from MetaMask
PRIVATE_KEY=0x<your_64_character_private_key>

# Required - Sepolia RPC
SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com

# Optional - For contract verification
ETHERSCAN_API_KEY=<get_from_etherscan.io>

# Network identifiers
SEPOLIA_CHAIN_ID=11155111
MAINNET_CHAIN_ID=1
```

**How to get your Private Key from MetaMask**:
1. Open MetaMask extension
2. Click three dots → Account Details
3. Click "Export Private Key"
4. Enter password
5. Copy the key (starts with 0x)
6. **NEVER share this or commit it to Git!**

**How to get Etherscan API Key** (Optional):
1. Visit https://etherscan.io/register
2. Create account
3. Go to https://etherscan.io/myapikey
4. Create new API key
5. Copy and paste into `.env`

**C. Verify environment loading**
```bash
# Check that .env is being loaded (should NOT show actual values)
source .env && echo "RPC configured: ${SEPOLIA_RPC:0:30}..."
```

**Security Check**:
```bash
# Verify .env is in .gitignore
cat .gitignore | grep -q "\.env$" && echo "✓ .env is gitignored" || echo "⚠ WARNING: Add .env to .gitignore!"
```

---

### Step 3: Compile Smart Contracts (2 minutes)

**Clean and compile**:
```bash
cd blockchain

# Clean previous builds
forge clean

# Compile contracts
forge build

# Expected output:
# [⠊] Compiling...
# [✓] Compiling 2 files with 0.8.19
# [✓] Solc 0.8.19 finished in X.XXs
# Compiler run successful
```

**Verify compilation output**:
```bash
# Check compiled artifacts exist
ls -lh out/ProductRegistry.sol/ProductRegistry.json
ls -lh out/PaymentEscrow.sol/PaymentEscrow.json

# Should show files around 50-150KB each
```

---

### Step 4: Run Pre-Deployment Tests (5 minutes)

**Run full test suite**:
```bash
forge test -vvv

# Expected: All tests should pass
# If any fail, DO NOT proceed with deployment
```

**Run gas estimation**:
```bash
forge test --gas-report

# This shows gas costs for all operations
# Useful for estimating deployment costs
```

**Run coverage check** (optional):
```bash
forge coverage

# Should show >80% coverage on ProductRegistry
```

**If tests fail**:
1. Review error messages
2. Fix contract issues
3. Re-run tests
4. Do NOT deploy broken contracts

---

### Step 5: Deploy Contracts (10 minutes)

**A. Deploy ProductRegistry Contract**

Using Forge script (recommended):
```bash
# Dry run first (simulation)
forge script script/Deploy.s.sol:DeployProductRegistry \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify \
  -vvvv

# This will:
# 1. Simulate deployment
# 2. Show gas estimates
# 3. Deploy to Sepolia
# 4. Verify on Etherscan (if API key provided)
```

Alternative - Using `forge create`:
```bash
forge create \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --verify \
  src/ProductRegistry.sol:ProductRegistry

# Save the "Deployed to:" address - this is your ProductRegistry address!
```

**Expected Output**:
```
Deployer: 0xYourWalletAddress
Deployed to: 0xProductRegistryContractAddress
Transaction hash: 0x...
```

**⚠️ CRITICAL: Save the deployed contract address immediately!**

**B. Deploy PaymentEscrow Contract**

```bash
# Replace <PRODUCT_REGISTRY_ADDRESS> with address from previous step
forge create \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --verify \
  --constructor-args <PRODUCT_REGISTRY_ADDRESS> \
  src/PaymentEscrow.sol:PaymentEscrow

# Save the "Deployed to:" address - this is your PaymentEscrow address!
```

**C. Record Deployment Information**

Create a deployment record:
```bash
# Create deployments directory
mkdir -p deployments

# Save deployment info (replace addresses with your actual addresses)
cat > deployments/sepolia-deployment.json << EOF
{
  "network": "sepolia",
  "chainId": 11155111,
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployer": "<YOUR_WALLET_ADDRESS>",
  "contracts": {
    "ProductRegistry": {
      "address": "<PRODUCT_REGISTRY_ADDRESS>",
      "txHash": "<DEPLOYMENT_TX_HASH>",
      "blockNumber": "<BLOCK_NUMBER>",
      "verified": true
    },
    "PaymentEscrow": {
      "address": "<PAYMENT_ESCROW_ADDRESS>",
      "txHash": "<DEPLOYMENT_TX_HASH>",
      "blockNumber": "<BLOCK_NUMBER>",
      "verified": true
    }
  },
  "rpcUrl": "https://ethereum-sepolia-rpc.publicnode.com",
  "blockExplorer": "https://sepolia.etherscan.io"
}
EOF
```

---

### Step 6: Verify Deployment (5 minutes)

**A. Check contracts on Etherscan**
1. Visit https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>
2. Verify you see:
   - Green checkmark (verified contract)
   - "Contract" tab with source code
   - "Read Contract" and "Write Contract" tabs
   - Your wallet as creator

**B. Test contract interaction**

Read from ProductRegistry:
```bash
# Get contract owner
cast call <PRODUCT_REGISTRY_ADDRESS> "owner()(address)" --rpc-url $SEPOLIA_RPC

# Should return your wallet address
```

Write to ProductRegistry (register a test product):
```bash
cast send <PRODUCT_REGISTRY_ADDRESS> \
  "registerProduct(string,string)" \
  "Test Vaccine" \
  "BATCH-TEST-001" \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY

# Should return transaction hash and success
```

**C. Verify test product registration**
```bash
# Get product count (should be 1 after test registration)
cast call <PRODUCT_REGISTRY_ADDRESS> "productCounter()(uint256)" --rpc-url $SEPOLIA_RPC

# Should return: 1 (or higher if you ran multiple tests)
```

---

### Step 7: Configure Backend Integration (15 minutes)

**A. Update backend environment variables**

Edit `backend/.env`:
```bash
# Add these lines with your deployed contract addresses
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRODUCT_REGISTRY_ADDRESS=0x<your_product_registry_address>
PAYMENT_ESCROW_ADDRESS=0x<your_payment_escrow_address>
CHAIN_ID=11155111
```

**B. Update backend contract ABI**

Create ABI files:
```bash
# Navigate to backend
cd ../backend

# Create contracts config directory
mkdir -p src/config/contracts

# Copy ProductRegistry ABI
jq '.abi' ../blockchain/out/ProductRegistry.sol/ProductRegistry.json > src/config/contracts/ProductRegistry.json

# Copy PaymentEscrow ABI
jq '.abi' ../blockchain/out/PaymentEscrow.sol/PaymentEscrow.json > src/config/contracts/PaymentEscrow.json
```

**C. Test backend blockchain connection**

Create a test script `backend/test-blockchain.js`:
```javascript
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import ProductRegistryABI from './src/config/contracts/ProductRegistry.json' assert { type: 'json' };

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const contract = new ethers.Contract(
  process.env.PRODUCT_REGISTRY_ADDRESS,
  ProductRegistryABI,
  provider
);

async function testConnection() {
  try {
    const owner = await contract.owner();
    const productCount = await contract.productCounter();

    console.log('✓ Blockchain connection successful!');
    console.log('  Contract Owner:', owner);
    console.log('  Product Count:', productCount.toString());
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

Run test:
```bash
node test-blockchain.js

# Expected output:
# ✓ Blockchain connection successful!
#   Contract Owner: 0xYourAddress
#   Product Count: 1
```

---

### Step 8: Configure Frontend Integration (10 minutes)

**A. Update frontend environment variables**

Edit `frontend/.env.local`:
```bash
# Blockchain Configuration
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS=0x<your_product_registry_address>
NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS=0x<your_payment_escrow_address>

# API Configuration (update when backend is deployed)
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=ws://localhost:3000
```

**B. Update contract ABIs in frontend**

```bash
cd ../frontend

# Create contracts directory
mkdir -p src/contracts

# Copy ABIs
jq '.abi' ../blockchain/out/ProductRegistry.sol/ProductRegistry.json > src/contracts/ProductRegistry.json
jq '.abi' ../blockchain/out/PaymentEscrow.sol/PaymentEscrow.json > src/contracts/PaymentEscrow.json
```

**C. Test MetaMask connection**

1. Open frontend: `npm run dev`
2. Switch MetaMask to Sepolia testnet
3. Connect wallet
4. Try registering a test product
5. Verify transaction appears on Etherscan

---

### Step 9: Create Deployment Documentation (5 minutes)

Create `blockchain/deployments/DEPLOYED_CONTRACTS.md`:

```markdown
# Deployed Contracts - Nexus-Chain

## Sepolia Testnet Deployment

**Deployed**: [Date]
**Deployer**: [Your wallet address]
**Network**: Sepolia Testnet (Chain ID: 11155111)

### Contract Addresses

**ProductRegistry**
- Address: `0x...`
- Etherscan: https://sepolia.etherscan.io/address/0x...
- Transaction: https://sepolia.etherscan.io/tx/0x...
- Block: #...

**PaymentEscrow**
- Address: `0x...`
- Etherscan: https://sepolia.etherscan.io/address/0x...
- Transaction: https://sepolia.etherscan.io/tx/0x...
- Block: #...

### Integration Points

**Backend** (`backend/.env`):
```
PRODUCT_REGISTRY_ADDRESS=0x...
PAYMENT_ESCROW_ADDRESS=0x...
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS=0x...
```

### Verification

All contracts verified on Etherscan ✓

### Test Data

Initial test product registered:
- Product ID: 1
- Name: "Test Vaccine"
- Batch: "BATCH-TEST-001"
- Transaction: https://sepolia.etherscan.io/tx/0x...
```

---

## Post-Deployment Checklist

### Immediate Actions
- [ ] Contract addresses saved in secure location
- [ ] Deployment info committed to Git (addresses only, NOT private keys!)
- [ ] Backend `.env` updated with contract addresses
- [ ] Frontend `.env.local` updated with contract addresses
- [ ] Contract ABIs copied to backend and frontend
- [ ] Blockchain connection tested from backend
- [ ] MetaMask connection tested from frontend
- [ ] Test product registration successful end-to-end

### Documentation
- [ ] Update main README.md with deployed contract addresses
- [ ] Create DEPLOYED_CONTRACTS.md with all details
- [ ] Update backend README with blockchain setup instructions
- [ ] Update frontend README with MetaMask setup instructions

### Testing
- [ ] Register product from frontend → verify on Etherscan
- [ ] Add checkpoint from backend → verify on chain
- [ ] Test QR verification flow end-to-end
- [ ] Test WebSocket real-time updates
- [ ] Verify temperature alerts trigger correctly

### Security
- [ ] Verify `.env` is in `.gitignore`
- [ ] Ensure no private keys committed
- [ ] Test role-based access control on contracts
- [ ] Verify only authorized roles can register products

---

## Troubleshooting Guide

### Issue: "Insufficient funds for gas"
**Solution**: Get more Sepolia ETH from faucet (need at least 0.05 ETH)

### Issue: "Nonce too high" or "Nonce too low"
**Solution**: Reset MetaMask account (Settings → Advanced → Reset Account)

### Issue: "Contract verification failed"
**Solution**:
1. Check Etherscan API key is valid
2. Wait 1-2 minutes after deployment
3. Manually verify at https://sepolia.etherscan.io/verifyContract

### Issue: "Transaction underpriced"
**Solution**: Increase gas price in deployment command:
```bash
--gas-price 50000000000  # 50 gwei
```

### Issue: "RPC endpoint not responding"
**Solution**: Try alternative RPC:
```bash
SEPOLIA_RPC=https://rpc.sepolia.org
# or with Infura (requires free API key)
SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

### Issue: "Cannot read contract owner"
**Solution**:
1. Verify contract address is correct
2. Check network is set to Sepolia (11155111)
3. Confirm RPC URL is working

---

## Rollback Plan

If deployment fails or contracts have critical bugs:

**Option 1: Redeploy with fixes**
1. Fix contract code
2. Run tests to verify fix
3. Deploy new version
4. Update addresses in backend/frontend

**Option 2: Pause contracts**
```bash
# Call setPaused(true) on ProductRegistry
cast send <PRODUCT_REGISTRY_ADDRESS> "setPaused(bool)" true \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY
```

**Option 3: Transfer ownership**
```bash
# Transfer to new admin wallet
cast send <PRODUCT_REGISTRY_ADDRESS> "initiateOwnershipTransfer(address)" <NEW_OWNER> \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY
```

---

## Cost Estimation

**Gas Costs (Sepolia Testnet)**:
- ProductRegistry deployment: ~0.01-0.02 ETH
- PaymentEscrow deployment: ~0.008-0.015 ETH
- Contract verification: Free
- Test transactions: ~0.0001-0.0005 ETH each

**Total estimated cost**: ~0.02-0.04 SepoliaETH ($0 on testnet)

**Mainnet Cost Estimate** (future):
- Same deployment on Ethereum Mainnet: 0.02-0.05 ETH (~$50-$125 at current prices)
- Alternative: Deploy to Polygon PoS for much lower fees (~$0.10-$0.50)

---

## Next Steps After Deployment

1. **Merge to main branch**:
   ```bash
   git add .
   git commit -m "feat: deploy smart contracts to Sepolia testnet"
   git push origin blockchain-deployment
   # Create PR and merge to main
   ```

2. **Update project documentation**:
   - Add contract addresses to main README
   - Update architecture diagrams
   - Create user guide for MetaMask setup

3. **Backend deployment**:
   - Deploy backend to Railway/Render
   - Configure environment with contract addresses
   - Test API endpoints with deployed contracts

4. **Frontend deployment**:
   - Deploy frontend to Vercel
   - Configure environment with contract addresses
   - Test wallet connection and product registration

5. **End-to-end testing**:
   - Complete product journey from registration to verification
   - Test all stakeholder roles
   - Verify real-time updates working

6. **Demo preparation**:
   - Create demo products
   - Set up demo accounts
   - Record demo video

---

## Success Criteria

Deployment is considered successful when:

- ✅ Both contracts deployed to Sepolia testnet
- ✅ Contracts verified on Etherscan
- ✅ Contract addresses saved and documented
- ✅ Backend can interact with contracts (read owner, product count)
- ✅ Frontend can connect with MetaMask
- ✅ Test product registration works end-to-end
- ✅ All deployment info committed to Git (without private keys)
- ✅ Team members can interact with deployed contracts

---

## Timeline

**Total estimated time**: 50-70 minutes

| Step | Duration | Critical? |
|------|----------|-----------|
| Get Sepolia ETH | 5 min | Yes |
| Configure environment | 10 min | Yes |
| Compile contracts | 2 min | Yes |
| Run tests | 5 min | Yes |
| Deploy contracts | 10 min | Yes |
| Verify deployment | 5 min | Yes |
| Configure backend | 15 min | Yes |
| Configure frontend | 10 min | Yes |
| Documentation | 5 min | No |

**Fast track**: 30 minutes (skip optional steps)
**Thorough track**: 70 minutes (complete all steps)

---

## Team Roles (for collaborative deployment)

**Deployer (1 person)**:
- Executes deployment commands
- Manages private keys securely
- Records contract addresses

**Backend Integration (1 person)**:
- Updates backend environment
- Copies ABIs
- Tests blockchain connection

**Frontend Integration (1 person)**:
- Updates frontend environment
- Tests MetaMask connection
- Verifies UI integration

**Documentation (1 person)**:
- Records deployment details
- Updates README files
- Creates user guides

---

## Support & Resources

**Sepolia Documentation**:
- Sepolia Faucets: https://sepoliafaucet.com/, https://sepolia-faucet.pk910.de/
- Sepolia Explorer: https://sepolia.etherscan.io
- Sepolia Info: https://sepolia.dev/

**Foundry Documentation**:
- Foundry Book: https://book.getfoundry.sh/
- Deployment Guide: https://book.getfoundry.sh/forge/deploying

**MetaMask Setup**:
- Add Sepolia Network: https://chainlist.org/chain/11155111
- Manual Setup Guide: https://docs.alchemy.com/docs/how-to-add-sepolia-to-metamask

**Need Help?**:
- Check troubleshooting section above
- Review Foundry docs
- Ask in team Slack/Discord
- Check Ethereum Discord for network issues

---

**Document Version**: 1.0
**Last Updated**: 2025-10-19
**Maintained By**: Nexus-Chain Team
