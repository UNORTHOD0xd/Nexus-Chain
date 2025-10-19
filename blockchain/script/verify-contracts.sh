#!/bin/bash

# Verify Contracts on Etherscan
# Usage: ./script/verify-contracts.sh

set -e

# Load environment variables
source .env

echo "============================================"
echo "Verifying Nexus-Chain Contracts on Etherscan"
echo "============================================"
echo ""

# Check required environment variables
if [ -z "$PRODUCT_REGISTRY_ADDRESS" ]; then
    echo "Error: PRODUCT_REGISTRY_ADDRESS not set in .env"
    exit 1
fi

if [ -z "$ETHERSCAN_API_KEY" ]; then
    echo "Warning: ETHERSCAN_API_KEY not set. Skipping verification."
    exit 0
fi

echo "Verifying ProductRegistry at $PRODUCT_REGISTRY_ADDRESS..."
forge verify-contract \
    --chain-id 11155111 \
    --num-of-optimizations 200 \
    --watch \
    --constructor-args $(cast abi-encode "constructor()") \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --compiler-version v0.8.19+commit.7dd6d404 \
    $PRODUCT_REGISTRY_ADDRESS \
    src/ProductRegistry.sol:ProductRegistry

echo "✓ ProductRegistry verified!"
echo ""

if [ -n "$PAYMENT_ESCROW_ADDRESS" ]; then
    echo "Verifying PaymentEscrow at $PAYMENT_ESCROW_ADDRESS..."
    forge verify-contract \
        --chain-id 11155111 \
        --num-of-optimizations 200 \
        --watch \
        --constructor-args $(cast abi-encode "constructor(address)" $PRODUCT_REGISTRY_ADDRESS) \
        --etherscan-api-key $ETHERSCAN_API_KEY \
        --compiler-version v0.8.19+commit.7dd6d404 \
        $PAYMENT_ESCROW_ADDRESS \
        src/PaymentEscrow.sol:PaymentEscrow

    echo "✓ PaymentEscrow verified!"
fi

echo ""
echo "============================================"
echo "All contracts verified successfully!"
echo "View on Etherscan:"
echo "  ProductRegistry: https://sepolia.etherscan.io/address/$PRODUCT_REGISTRY_ADDRESS"
if [ -n "$PAYMENT_ESCROW_ADDRESS" ]; then
    echo "  PaymentEscrow: https://sepolia.etherscan.io/address/$PAYMENT_ESCROW_ADDRESS"
fi
echo "============================================"
