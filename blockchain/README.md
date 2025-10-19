# Nexus-Chain Blockchain

Smart contracts for the Nexus-Chain decentralized supply chain tracking platform.

## Overview

This directory contains Solidity smart contracts deployed on Sepolia testnet that provide immutable tracking for products in the supply chain.

### Contracts

- **ProductRegistry.sol** (886 lines) - Core contract for product registration, checkpoint tracking, and temperature monitoring
- **PaymentEscrow.sol** - Automated payment escrow for supply chain participants

## Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- MetaMask wallet with Sepolia testnet configured
- Sepolia ETH (from faucet)
- Etherscan API key (optional, for verification)

### Installation

```bash
# Install dependencies
forge install

# Compile contracts
forge build

# Run tests
forge test -vvv
```

### Environment Setup

1. Copy environment template:
```bash
cp .env.example .env
```

2. Fill in your credentials in `.env`:
```bash
SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=0xYourPrivateKeyHere
ETHERSCAN_API_KEY=your_api_key_here
```

**⚠️ IMPORTANT**: Never commit your `.env` file with real credentials!

### Get Sepolia ETH

You need ~0.05 SepoliaETH for deployment. Get it from these faucets:

- **Alchemy**: https://sepoliafaucet.com/ (0.5 ETH/day)
- **Infura**: https://www.infura.io/faucet/sepolia
- **QuickNode**: https://faucet.quicknode.com/ethereum/sepolia
- **PoW Faucet**: https://sepolia-faucet.pk910.de/ (no registration)

Check your balance:
```bash
cast balance <YOUR_WALLET_ADDRESS> --rpc-url https://ethereum-sepolia-rpc.publicnode.com
```

## Deployment

### Option 1: Deploy All Contracts (Recommended)

Using Makefile:
```bash
make deploy-all
```

Or using forge script directly:
```bash
forge script script/Deploy.s.sol:DeployAll \
  --rpc-url $SEPOLIA_RPC \
  --broadcast \
  --verify \
  -vvvv
```

### Option 2: Deploy Individually

Deploy ProductRegistry:
```bash
make deploy-registry
```

Deploy PaymentEscrow (after setting PRODUCT_REGISTRY_ADDRESS in .env):
```bash
make deploy-escrow
```

### Option 3: Manual Deployment

```bash
# Deploy ProductRegistry
forge create \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --verify \
  src/ProductRegistry.sol:ProductRegistry

# Deploy PaymentEscrow (replace <REGISTRY_ADDRESS>)
forge create \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --verify \
  --constructor-args <REGISTRY_ADDRESS> \
  src/PaymentEscrow.sol:PaymentEscrow
```

## Post-Deployment

### Verify Contracts

If auto-verification failed during deployment:
```bash
make verify
```

### Test Deployment

Test that contracts are working:
```bash
make test-deployment
```

This will:
- Read contract owner
- Check product counter
- Optionally register a test product

### Save Deployment Info

Create a deployment record in `deployments/sepolia-deployment.json`:

```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "deployedAt": "2025-10-19T12:00:00Z",
  "deployer": "0xYourAddress",
  "contracts": {
    "ProductRegistry": {
      "address": "0x...",
      "txHash": "0x...",
      "blockNumber": 12345678
    },
    "PaymentEscrow": {
      "address": "0x...",
      "txHash": "0x...",
      "blockNumber": 12345679
    }
  }
}
```

## Integration

### Update Backend

1. Copy contract ABIs:
```bash
cd ../backend
mkdir -p src/config/contracts

jq '.abi' ../blockchain/out/ProductRegistry.sol/ProductRegistry.json > src/config/contracts/ProductRegistry.json
jq '.abi' ../blockchain/out/PaymentEscrow.sol/PaymentEscrow.json > src/config/contracts/PaymentEscrow.json
```

2. Update `backend/.env`:
```bash
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRODUCT_REGISTRY_ADDRESS=0xYourProductRegistryAddress
PAYMENT_ESCROW_ADDRESS=0xYourPaymentEscrowAddress
CHAIN_ID=11155111
```

### Update Frontend

1. Copy contract ABIs:
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
NEXT_PUBLIC_PRODUCT_REGISTRY_ADDRESS=0xYourProductRegistryAddress
NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS=0xYourPaymentEscrowAddress
```

## Testing

### Run Full Test Suite

```bash
forge test -vvv
```

### Run Specific Test

```bash
forge test --match-test testRegisterProduct -vvv
```

### Gas Report

```bash
make gas-report
```

### Coverage

```bash
make coverage
```

## Contract Interaction

### Read from Contract

```bash
# Get contract owner
cast call <CONTRACT_ADDRESS> "owner()(address)" --rpc-url $SEPOLIA_RPC

# Get product count
cast call <CONTRACT_ADDRESS> "productCounter()(uint256)" --rpc-url $SEPOLIA_RPC
```

### Write to Contract

```bash
# Register a product
cast send <CONTRACT_ADDRESS> \
  "registerProduct(string,string)" \
  "Test Product" \
  "BATCH-001" \
  --rpc-url $SEPOLIA_RPC \
  --private-key $PRIVATE_KEY
```

## Makefile Commands

```bash
make help              # Show all available commands
make install           # Install Foundry dependencies
make build             # Compile contracts
make test              # Run test suite
make clean             # Clean build artifacts
make deploy-all        # Deploy all contracts
make deploy-registry   # Deploy ProductRegistry only
make deploy-escrow     # Deploy PaymentEscrow only
make verify            # Verify contracts on Etherscan
make test-deployment   # Test deployed contracts
make gas-report        # Show gas usage report
make coverage          # Generate coverage report
```

## Network Configuration

**Sepolia Testnet**:
- Chain ID: `11155111`
- RPC URL: `https://ethereum-sepolia-rpc.publicnode.com`
- Block Explorer: `https://sepolia.etherscan.io`
- Currency: SepoliaETH (testnet)

**Alternative RPCs**:
- `https://rpc.sepolia.org`
- `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`

## Troubleshooting

### "Insufficient funds for gas"
Get more Sepolia ETH from faucets (need at least 0.05 ETH).

### "Nonce too high/low"
Reset your MetaMask account: Settings → Advanced → Reset Account

### "Contract verification failed"
1. Check Etherscan API key is valid
2. Wait 1-2 minutes after deployment
3. Run `make verify` to retry

### "RPC endpoint not responding"
Try alternative RPC from network configuration above.

## Security

- ✅ Role-based access control
- ✅ Input validation on all functions
- ✅ Pause mechanism for emergencies
- ✅ Two-step ownership transfer
- ✅ Temperature compliance monitoring
- ✅ Event emission for all state changes

## Gas Costs (Sepolia)

- ProductRegistry deployment: ~0.01-0.02 ETH
- PaymentEscrow deployment: ~0.008-0.015 ETH
- Register product: ~0.0001-0.0003 ETH
- Add checkpoint: ~0.0001-0.0002 ETH

## Documentation

- [Deployment Plan](./DEPLOYMENT_PLAN.md) - Complete step-by-step deployment guide
- [Foundry Book](https://book.getfoundry.sh/) - Foundry documentation
- [Sepolia Info](https://sepolia.dev/) - Sepolia testnet information

## Support

- Check [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) for detailed instructions
- Review Foundry documentation
- Ask in team Slack/Discord
- Check Ethereum Discord for network issues

## License

MIT License - see [LICENSE](../LICENSE) for details
