// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/ProductRegistry.sol";
import "../src/PaymentEscrow.sol";

contract DeployProductRegistry is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        ProductRegistry registry = new ProductRegistry();

        console.log("ProductRegistry deployed to:", address(registry));

        vm.stopBroadcast();
    }
}

contract DeployPaymentEscrow is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address productRegistryAddress = vm.envAddress("PRODUCT_REGISTRY_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        PaymentEscrow escrow = new PaymentEscrow(productRegistryAddress);

        console.log("PaymentEscrow deployed to:", address(escrow));

        vm.stopBroadcast();
    }
}

contract DeployAll is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ProductRegistry
        ProductRegistry registry = new ProductRegistry();
        console.log("ProductRegistry deployed to:", address(registry));

        // Deploy PaymentEscrow
        PaymentEscrow escrow = new PaymentEscrow(address(registry));
        console.log("PaymentEscrow deployed to:", address(escrow));

        vm.stopBroadcast();

        // Print summary
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Sepolia (Chain ID: 11155111)");
        console.log("ProductRegistry:", address(registry));
        console.log("PaymentEscrow:", address(escrow));
        console.log("\nAdd these addresses to your .env files:");
        console.log("PRODUCT_REGISTRY_ADDRESS=%s", address(registry));
        console.log("PAYMENT_ESCROW_ADDRESS=%s", address(escrow));
    }
}
