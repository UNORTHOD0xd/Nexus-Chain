# Nexus-Chain Blockchain Deployment Makefile

.PHONY: help install build test clean deploy-all deploy-registry deploy-escrow verify test-deployment

# Default target
help:
	@echo "Nexus-Chain Blockchain Deployment Commands"
	@echo "=========================================="
	@echo ""
	@echo "Setup:"
	@echo "  make install          - Install Foundry dependencies"
	@echo "  make build            - Compile smart contracts"
	@echo "  make test             - Run test suite"
	@echo "  make clean            - Clean build artifacts"
	@echo ""
	@echo "Deployment (Sepolia):"
	@echo "  make deploy-all       - Deploy all contracts (ProductRegistry + PaymentEscrow)"
	@echo "  make deploy-registry  - Deploy ProductRegistry only"
	@echo "  make deploy-escrow    - Deploy PaymentEscrow (requires PRODUCT_REGISTRY_ADDRESS)"
	@echo ""
	@echo "Post-Deployment:"
	@echo "  make verify           - Verify contracts on Etherscan"
	@echo "  make test-deployment  - Test deployed contracts"
	@echo ""
	@echo "Environment:"
	@echo "  Ensure .env file exists with PRIVATE_KEY and SEPOLIA_RPC"
	@echo ""

# Install dependencies
install:
	forge install

# Compile contracts
build:
	forge build

# Run tests
test:
	forge test -vvv

# Clean build artifacts
clean:
	forge clean

# Deploy all contracts
deploy-all:
	@echo "Deploying all contracts to Sepolia..."
	@forge script script/Deploy.s.sol:DeployAll \
		--rpc-url $(SEPOLIA_RPC) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		-vvvv

# Deploy ProductRegistry only
deploy-registry:
	@echo "Deploying ProductRegistry to Sepolia..."
	@forge script script/Deploy.s.sol:DeployProductRegistry \
		--rpc-url $(SEPOLIA_RPC) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		-vvvv

# Deploy PaymentEscrow
deploy-escrow:
	@echo "Deploying PaymentEscrow to Sepolia..."
	@if [ -z "$(PRODUCT_REGISTRY_ADDRESS)" ]; then \
		echo "Error: PRODUCT_REGISTRY_ADDRESS not set"; \
		exit 1; \
	fi
	@forge script script/Deploy.s.sol:DeployPaymentEscrow \
		--rpc-url $(SEPOLIA_RPC) \
		--broadcast \
		--verify \
		--etherscan-api-key $(ETHERSCAN_API_KEY) \
		-vvvv

# Verify contracts on Etherscan
verify:
	@./script/verify-contracts.sh

# Test deployed contracts
test-deployment:
	@./script/test-deployment.sh

# Quick deploy (without verification)
deploy-quick:
	@echo "Quick deployment (no verification)..."
	@forge script script/Deploy.s.sol:DeployAll \
		--rpc-url $(SEPOLIA_RPC) \
		--broadcast \
		-vvv

# Check balance
check-balance:
	@echo "Checking deployer balance..."
	@if [ -z "$(DEPLOYER_ADDRESS)" ]; then \
		echo "Error: DEPLOYER_ADDRESS not set"; \
		exit 1; \
	fi
	@cast balance $(DEPLOYER_ADDRESS) --rpc-url $(SEPOLIA_RPC)

# Gas report
gas-report:
	@forge test --gas-report

# Coverage report
coverage:
	@forge coverage
