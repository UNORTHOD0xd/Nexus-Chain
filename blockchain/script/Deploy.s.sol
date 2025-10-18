// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/ProductRegistry.sol";
import "../src/PaymentEscrow.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ProductRegistry
        ProductRegistry productRegistry = new ProductRegistry();
        console.log("ProductRegistry deployed at:", address(productRegistry));

        // Deploy PaymentEscrow
        PaymentEscrow paymentEscrow = new PaymentEscrow(address(productRegistry));
        console.log("PaymentEscrow deployed at:", address(paymentEscrow));

        vm.stopBroadcast();
    }
}
