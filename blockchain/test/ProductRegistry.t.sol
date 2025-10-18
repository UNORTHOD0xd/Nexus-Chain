// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/ProductRegistry.sol";

contract ProductRegistryTest is Test {
    ProductRegistry public registry;
    address public owner;
    address public manufacturer;
    address public logistics;

    function setUp() public {
        owner = address(this);
        manufacturer = address(0x1);
        logistics = address(0x2);

        registry = new ProductRegistry();

        // Register users
        registry.registerUser(manufacturer, ProductRegistry.Role.Manufacturer);
        registry.registerUser(logistics, ProductRegistry.Role.Logistics);
    }

    function testRegisterProduct() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Test Product", "BATCH-001");

        assertEq(productId, 1);

        ProductRegistry.Product memory product = registry.getProduct(productId);
        assertEq(product.name, "Test Product");
        assertEq(product.batchNumber, "BATCH-001");
        assertEq(product.manufacturer, manufacturer);
        assertTrue(product.exists);
    }

    function testAddCheckpoint() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Test Product", "BATCH-001");

        vm.prank(logistics);
        registry.addCheckpoint(
            productId,
            "Warehouse A",
            ProductRegistry.Status.InWarehouse,
            "Arrived at warehouse",
            25 // 2.5°C
        );

        ProductRegistry.Checkpoint[] memory checkpoints = registry.getCheckpoints(productId);
        assertEq(checkpoints.length, 2); // Initial + new checkpoint
        assertEq(checkpoints[1].location, "Warehouse A");
    }

    function testTemperatureViolation() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Test Product", "BATCH-001");

        vm.prank(logistics);
        registry.addCheckpoint(
            productId,
            "Warehouse A",
            ProductRegistry.Status.InWarehouse,
            "Temperature violation",
            100 // 10.0°C - above threshold
        );

        (bool allInRange, uint256 violations) = registry.checkTemperatureCompliance(productId);
        assertFalse(allInRange);
        assertEq(violations, 1);
    }

    function testFailUnauthorizedRegistration() public {
        vm.prank(logistics); // Logistics cannot register products
        registry.registerProduct("Test Product", "BATCH-001");
    }

    function testTransferOwnership() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Test Product", "BATCH-001");

        vm.prank(manufacturer);
        registry.transferOwnership(productId, logistics);

        ProductRegistry.Product memory product = registry.getProduct(productId);
        assertEq(product.currentHolder, logistics);
    }

    function testVerifyProduct() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Test Product", "BATCH-001");

        (bool isAuthentic, uint256 checkpointCount) = registry.verifyProduct(productId);
        assertTrue(isAuthentic);
        assertEq(checkpointCount, 1);
    }
}
