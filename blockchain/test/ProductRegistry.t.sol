// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/ProductRegistry.sol";

/**
 * @title ProductRegistryTest
 * @dev Critical tests for ProductRegistry contract MVP
 * @notice Tests cover security, access control, and core functionality
 */
contract ProductRegistryTest is Test {
    ProductRegistry public registry;

    address public owner;
    address public manufacturer;
    address public logistics;
    address public retailer;
    address public consumer;
    address public attacker;

    // Events to test
    event ProductRegistered(
        uint256 indexed productId,
        string name,
        address indexed manufacturer,
        string batchNumber
    );
    event CheckpointAdded(
        uint256 indexed productId,
        address indexed handler,
        string location,
        ProductRegistry.Status status,
        int256 temperature
    );
    event OwnershipTransferred(
        uint256 indexed productId,
        address indexed from,
        address indexed to
    );
    event RoleAssigned(address indexed user, ProductRegistry.Role role);
    event TemperatureAlert(
        uint256 indexed productId,
        int256 temperature,
        string location
    );

    function setUp() public {
        owner = address(this);
        manufacturer = makeAddr("manufacturer");
        logistics = makeAddr("logistics");
        retailer = makeAddr("retailer");
        consumer = makeAddr("consumer");
        attacker = makeAddr("attacker");

        registry = new ProductRegistry();

        // Assign roles
        registry.assignRole(manufacturer, ProductRegistry.Role.Manufacturer);
        registry.assignRole(logistics, ProductRegistry.Role.Logistics);
        registry.assignRole(retailer, ProductRegistry.Role.Retailer);
        registry.assignRole(consumer, ProductRegistry.Role.Consumer);
    }

    /*//////////////////////////////////////////////////////////////
                        TEST 1: PRODUCT REGISTRATION
    //////////////////////////////////////////////////////////////*/

    function test_RegisterProduct_Success() public {
        vm.startPrank(manufacturer);

        vm.expectEmit(true, true, false, true);
        emit ProductRegistered(0, "Vaccine Batch A", manufacturer, "BATCH-001");

        uint256 productId = registry.registerProduct("Vaccine Batch A", "BATCH-001");

        assertEq(productId, 0);

        ProductRegistry.Product memory product = registry.getProduct(0);
        assertEq(product.id, 0);
        assertEq(product.name, "Vaccine Batch A");
        assertEq(product.batchNumber, "BATCH-001");
        assertEq(product.manufacturer, manufacturer);
        assertEq(product.currentHolder, manufacturer);
        assertTrue(product.exists);
        assertEq(uint256(product.currentStatus), uint256(ProductRegistry.Status.Manufactured));

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                TEST 2: UNAUTHORIZED REGISTRATION FAILS
    //////////////////////////////////////////////////////////////*/

    function test_RegisterProduct_RevertsIfNotManufacturer() public {
        vm.startPrank(attacker);

        vm.expectRevert(ProductRegistry.ProductRegistry__InvalidRole.selector);
        registry.registerProduct("Fake Product", "FAKE-001");

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                TEST 3: INVALID PRODUCT DATA VALIDATION
    //////////////////////////////////////////////////////////////*/

    function test_RegisterProduct_RevertsOnEmptyName() public {
        vm.startPrank(manufacturer);

        vm.expectRevert(ProductRegistry.ProductRegistry__InvalidProductData.selector);
        registry.registerProduct("", "BATCH-001");

        vm.stopPrank();
    }

    function test_RegisterProduct_RevertsOnTooLongName() public {
        vm.startPrank(manufacturer);

        // Create a string longer than MAX_STRING_LENGTH (256)
        string memory longString = new string(257);
        bytes memory longBytes = bytes(longString);
        for (uint i = 0; i < 257; i++) {
            longBytes[i] = "a";
        }

        vm.expectRevert(ProductRegistry.ProductRegistry__InvalidProductData.selector);
        registry.registerProduct(string(longBytes), "BATCH-001");

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                    TEST 4: CHECKPOINT ADDITION
    //////////////////////////////////////////////////////////////*/

    function test_AddCheckpoint_Success() public {
        // Register product first
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        // Add checkpoint
        vm.startPrank(logistics);

        vm.expectEmit(true, true, false, true);
        emit CheckpointAdded(
            productId,
            logistics,
            "Miami Warehouse",
            ProductRegistry.Status.InTransit,
            250
        );

        registry.addCheckpoint(
            productId,
            "Miami Warehouse",
            ProductRegistry.Status.InTransit,
            "In transit to warehouse",
            250 // 25.0°C
        );

        ProductRegistry.Checkpoint[] memory checkpoints = registry.getProductCheckpoints(productId);
        assertEq(checkpoints.length, 2); // Initial + new checkpoint
        assertEq(checkpoints[1].location, "Miami Warehouse");
        assertEq(checkpoints[1].handler, logistics);
        assertEq(uint256(checkpoints[1].status), uint256(ProductRegistry.Status.InTransit));

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                TEST 5: INVALID STATUS TRANSITION
    //////////////////////////////////////////////////////////////*/

    function test_AddCheckpoint_RevertsOnInvalidStatusTransition() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        // Try to go directly from Manufactured to Delivered (skip InTransit)
        vm.startPrank(logistics);

        vm.expectRevert(ProductRegistry.ProductRegistry__InvalidStatusTransition.selector);
        registry.addCheckpoint(
            productId,
            "Destination",
            ProductRegistry.Status.Delivered,
            "Invalid transition",
            250
        );

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                TEST 6: TEMPERATURE ALERT EMISSION
    //////////////////////////////////////////////////////////////*/

    function test_AddCheckpoint_EmitsTemperatureAlert() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.startPrank(logistics);

        // Temperature out of range (default: 20-80, i.e., 2.0-8.0°C)
        vm.expectEmit(true, false, false, true);
        emit TemperatureAlert(productId, 150, "Cold Storage"); // 15.0°C is too warm

        registry.addCheckpoint(
            productId,
            "Cold Storage",
            ProductRegistry.Status.InTransit,
            "Temperature spike detected",
            150 // 15.0°C - outside range
        );

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                TEST 7: OWNERSHIP TRANSFER ACCESS CONTROL
    //////////////////////////////////////////////////////////////*/

    function test_TransferOwnership_SuccessAsCurrentHolder() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        // Manufacturer (current holder) transfers to logistics
        vm.startPrank(manufacturer);

        vm.expectEmit(true, true, true, false);
        emit OwnershipTransferred(productId, manufacturer, logistics);

        registry.transferOwnership(productId, logistics);

        assertEq(registry.getCurrentHolder(productId), logistics);

        vm.stopPrank();
    }

    function test_TransferOwnership_RevertsIfNotCurrentHolder() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        // Attacker tries to transfer ownership
        vm.startPrank(attacker);

        vm.expectRevert(ProductRegistry.ProductRegistry__NotCurrentHolder.selector);
        registry.transferOwnership(productId, attacker);

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                TEST 8: TWO-STEP OWNERSHIP TRANSFER
    //////////////////////////////////////////////////////////////*/

    function test_ContractOwnership_TwoStepTransfer() public {
        address newOwner = makeAddr("newOwner");

        // Step 1: Initiate transfer
        registry.transferContractOwnership(newOwner);
        assertEq(registry.getPendingOwner(), newOwner);
        assertEq(registry.getOwner(), owner); // Still old owner

        // Step 2: New owner accepts
        vm.prank(newOwner);
        registry.acceptOwnership();

        assertEq(registry.getOwner(), newOwner);
        assertEq(registry.getPendingOwner(), address(0));
    }

    function test_AcceptOwnership_RevertsIfNotPendingOwner() public {
        address newOwner = makeAddr("newOwner");

        registry.transferContractOwnership(newOwner);

        // Attacker tries to accept
        vm.startPrank(attacker);
        vm.expectRevert(ProductRegistry.ProductRegistry__Unauthorized.selector);
        registry.acceptOwnership();
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                    TEST 9: USER REVOCATION
    //////////////////////////////////////////////////////////////*/

    function test_RevokeUser_Success() public {
        // Verify manufacturer has role
        assertEq(uint256(registry.getUserRole(manufacturer)), uint256(ProductRegistry.Role.Manufacturer));
        assertTrue(registry.isAuthorized(manufacturer));

        // Revoke manufacturer
        registry.revokeUser(manufacturer);

        assertEq(uint256(registry.getUserRole(manufacturer)), uint256(ProductRegistry.Role.None));
        assertFalse(registry.isAuthorized(manufacturer));

        // Should not be able to register products anymore
        vm.prank(manufacturer);
        vm.expectRevert(ProductRegistry.ProductRegistry__InvalidRole.selector);
        registry.registerProduct("Test", "TEST-001");
    }

    /*//////////////////////////////////////////////////////////////
                    TEST 10: BATCH ROLE ASSIGNMENT
    //////////////////////////////////////////////////////////////*/

    function test_BatchAssignRoles_Success() public {
        address[] memory users = new address[](3);
        ProductRegistry.Role[] memory roles = new ProductRegistry.Role[](3);

        users[0] = makeAddr("mfg1");
        users[1] = makeAddr("mfg2");
        users[2] = makeAddr("log1");

        roles[0] = ProductRegistry.Role.Manufacturer;
        roles[1] = ProductRegistry.Role.Manufacturer;
        roles[2] = ProductRegistry.Role.Logistics;

        registry.batchAssignRoles(users, roles);

        assertEq(uint256(registry.getUserRole(users[0])), uint256(ProductRegistry.Role.Manufacturer));
        assertEq(uint256(registry.getUserRole(users[1])), uint256(ProductRegistry.Role.Manufacturer));
        assertEq(uint256(registry.getUserRole(users[2])), uint256(ProductRegistry.Role.Logistics));
    }

    function test_BatchAssignRoles_RevertsOnMismatchedArrays() public {
        address[] memory users = new address[](2);
        ProductRegistry.Role[] memory roles = new ProductRegistry.Role[](3);

        vm.expectRevert(ProductRegistry.ProductRegistry__InvalidProductData.selector);
        registry.batchAssignRoles(users, roles);
    }

    /*//////////////////////////////////////////////////////////////
                TEST 11: TEMPERATURE COMPLIANCE CHECK
    //////////////////////////////////////////////////////////////*/

    function test_CheckTemperatureCompliance_Success() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        // Add checkpoint with good temperature
        vm.prank(logistics);
        registry.addCheckpoint(
            productId,
            "Warehouse",
            ProductRegistry.Status.InTransit,
            "Good temp",
            50 // 5.0°C - within range
        );

        assertTrue(registry.checkTemperatureCompliance(productId));
    }

    function test_CheckTemperatureCompliance_FailsWithBadTemp() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        // Add checkpoint with bad temperature
        vm.prank(logistics);
        registry.addCheckpoint(
            productId,
            "Warehouse",
            ProductRegistry.Status.InTransit,
            "Bad temp",
            150 // 15.0°C - outside range
        );

        assertFalse(registry.checkTemperatureCompliance(productId));
    }

    /*//////////////////////////////////////////////////////////////
                TEST 12: PAUSE FUNCTIONALITY
    //////////////////////////////////////////////////////////////*/

    function test_Pause_BlocksOperations() public {
        // Pause contract
        registry.setPaused(true);
        assertTrue(registry.isPaused());

        // Try to register product while paused
        vm.prank(manufacturer);
        vm.expectRevert(ProductRegistry.ProductRegistry__Unauthorized.selector);
        registry.registerProduct("Test", "TEST-001");
    }

    function test_Unpause_RestoresOperations() public {
        registry.setPaused(true);
        registry.setPaused(false);
        assertFalse(registry.isPaused());

        // Should work now
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Test", "TEST-001");
        assertEq(productId, 0);
    }

    /*//////////////////////////////////////////////////////////////
                    BONUS: QUERY FUNCTIONS TEST
    //////////////////////////////////////////////////////////////*/

    function test_GetProductsByManufacturer() public {
        // Register multiple products
        vm.startPrank(manufacturer);
        registry.registerProduct("Product 1", "BATCH-001");
        registry.registerProduct("Product 2", "BATCH-002");
        registry.registerProduct("Product 3", "BATCH-003");
        vm.stopPrank();

        uint256[] memory products = registry.getProductsByManufacturer(manufacturer, 10);
        assertEq(products.length, 3);
        assertEq(products[0], 0);
        assertEq(products[1], 1);
        assertEq(products[2], 2);
    }

    function test_GetProductsByStatus() public {
        vm.prank(manufacturer);
        uint256 productId1 = registry.registerProduct("Product 1", "BATCH-001");

        vm.prank(manufacturer);
        uint256 productId2 = registry.registerProduct("Product 2", "BATCH-002");

        // Move one to InTransit
        vm.prank(logistics);
        registry.addCheckpoint(
            productId1,
            "Warehouse",
            ProductRegistry.Status.InTransit,
            "Moving",
            50
        );

        uint256[] memory manufactured = registry.getProductsByStatus(
            ProductRegistry.Status.Manufactured,
            10
        );
        assertEq(manufactured.length, 1);
        assertEq(manufactured[0], productId2);

        uint256[] memory inTransit = registry.getProductsByStatus(
            ProductRegistry.Status.InTransit,
            10
        );
        assertEq(inTransit.length, 1);
        assertEq(inTransit[0], productId1);
    }
}
