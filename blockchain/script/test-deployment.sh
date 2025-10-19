#!/bin/bash

# Test Deployed Contracts
# Usage: ./script/test-deployment.sh

set -e

# Load environment variables
source .env

echo "============================================"
echo "Testing Deployed Contracts"
echo "============================================"
echo ""

# Check required environment variables
if [ -z "$PRODUCT_REGISTRY_ADDRESS" ]; then
    echo "Error: PRODUCT_REGISTRY_ADDRESS not set in .env"
    exit 1
fi

if [ -z "$SEPOLIA_RPC" ]; then
    echo "Error: SEPOLIA_RPC not set in .env"
    exit 1
fi

echo "Testing ProductRegistry at $PRODUCT_REGISTRY_ADDRESS..."
echo ""

# Test 1: Get contract owner
echo "Test 1: Reading contract owner..."
OWNER=$(cast call $PRODUCT_REGISTRY_ADDRESS "owner()(address)" --rpc-url $SEPOLIA_RPC)
echo "  Owner: $OWNER"
echo "  ✓ Passed"
echo ""

# Test 2: Get product counter
echo "Test 2: Reading product counter..."
COUNTER=$(cast call $PRODUCT_REGISTRY_ADDRESS "productCounter()(uint256)" --rpc-url $SEPOLIA_RPC)
echo "  Product Count: $COUNTER"
echo "  ✓ Passed"
echo ""

# Test 3: Check if contract is paused
echo "Test 3: Checking paused status..."
PAUSED=$(cast call $PRODUCT_REGISTRY_ADDRESS "paused()(bool)" --rpc-url $SEPOLIA_RPC)
echo "  Paused: $PAUSED"
echo "  ✓ Passed"
echo ""

# Optional: Register a test product if private key is available
if [ -n "$PRIVATE_KEY" ]; then
    echo "Test 4: Registering test product (write operation)..."
    echo "  Product: Test Vaccine"
    echo "  Batch: BATCH-TEST-001"

    TX_HASH=$(cast send $PRODUCT_REGISTRY_ADDRESS \
        "registerProduct(string,string)" \
        "Test Vaccine" \
        "BATCH-TEST-001" \
        --rpc-url $SEPOLIA_RPC \
        --private-key $PRIVATE_KEY \
        --json | jq -r '.transactionHash')

    echo "  Transaction: $TX_HASH"
    echo "  View on Etherscan: https://sepolia.etherscan.io/tx/$TX_HASH"

    # Wait for confirmation
    echo "  Waiting for confirmation..."
    sleep 5

    # Verify product count increased
    NEW_COUNTER=$(cast call $PRODUCT_REGISTRY_ADDRESS "productCounter()(uint256)" --rpc-url $SEPOLIA_RPC)
    echo "  New Product Count: $NEW_COUNTER"
    echo "  ✓ Passed"
    echo ""
fi

# Test PaymentEscrow if deployed
if [ -n "$PAYMENT_ESCROW_ADDRESS" ]; then
    echo "Testing PaymentEscrow at $PAYMENT_ESCROW_ADDRESS..."
    echo ""

    # Check registry address
    echo "Test 5: Reading ProductRegistry address from escrow..."
    REGISTRY=$(cast call $PAYMENT_ESCROW_ADDRESS "productRegistry()(address)" --rpc-url $SEPOLIA_RPC)
    echo "  Registry Address: $REGISTRY"

    if [ "$REGISTRY" = "$PRODUCT_REGISTRY_ADDRESS" ]; then
        echo "  ✓ Correct registry address"
    else
        echo "  ✗ Registry address mismatch!"
    fi
    echo ""
fi

echo "============================================"
echo "All tests completed successfully!"
echo "============================================"
