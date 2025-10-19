// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {ProductRegistry} from "../src/ProductRegistry.sol";
import {PaymentEscrow} from "../src/PaymentEscrow.sol";

/**
 * @title PaymentEscrowTest
 * @dev Critical tests for PaymentEscrow contract MVP
 * @notice Tests cover escrow lifecycle, disputes, and security
 */
contract PaymentEscrowTest is Test {
    ProductRegistry public registry;
    PaymentEscrow public escrow;

    address public owner;
    address public manufacturer;
    address public logistics;
    address public buyer;
    address public attacker;

    uint256 public constant ESCROW_AMOUNT = 1 ether;
    uint256 public constant PLATFORM_FEE_BP = 250; // 2.5%

    // Events to test
    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed productId,
        address indexed payer,
        address payee,
        uint256 amount
    );

    event EscrowReleased(
        uint256 indexed escrowId,
        address indexed payee,
        uint256 amount,
        uint256 platformFee
    );

    event EscrowRefunded(uint256 indexed escrowId, address indexed payer, uint256 amount);

    event DisputeRaised(uint256 indexed escrowId, address indexed raiser, string reason);

    function setUp() public {
        owner = address(this);
        manufacturer = makeAddr("manufacturer");
        logistics = makeAddr("logistics");
        buyer = makeAddr("buyer");
        attacker = makeAddr("attacker");

        // Deploy contracts
        registry = new ProductRegistry();
        escrow = new PaymentEscrow(address(registry));

        // Assign roles
        registry.assignRole(manufacturer, ProductRegistry.Role.Manufacturer);
        registry.assignRole(logistics, ProductRegistry.Role.Logistics);

        // Fund buyer
        vm.deal(buyer, 10 ether);
        vm.deal(attacker, 10 ether);
    }

    /*//////////////////////////////////////////////////////////////
                        TEST 1: ESCROW CREATION
    //////////////////////////////////////////////////////////////*/

    function test_CreateEscrow_Success() public {
        // Register product
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        // Create escrow
        vm.startPrank(buyer);

        vm.expectEmit(true, true, true, true);
        emit EscrowCreated(1, productId, buyer, logistics, ESCROW_AMOUNT);

        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        assertEq(escrowId, 1);
        assertEq(address(escrow).balance, ESCROW_AMOUNT);

        PaymentEscrow.Escrow memory esc = escrow.getEscrow(1);
        assertEq(esc.productId, productId);
        assertEq(esc.payer, buyer);
        assertEq(esc.payee, logistics);
        assertEq(esc.amount, ESCROW_AMOUNT);
        assertEq(uint256(esc.state), uint256(PaymentEscrow.EscrowState.Active));

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                TEST 2: INVALID ESCROW CREATION
    //////////////////////////////////////////////////////////////*/

    function test_CreateEscrow_RevertsOnZeroAmount() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        vm.expectRevert(PaymentEscrow.PaymentEscrow__InvalidAmount.selector);
        escrow.createEscrow{value: 0}(productId, logistics);
    }

    function test_CreateEscrow_RevertsOnInvalidProduct() public {
        vm.prank(buyer);
        vm.expectRevert(PaymentEscrow.PaymentEscrow__ProductDoesNotExist.selector);
        escrow.createEscrow{value: ESCROW_AMOUNT}(999, logistics);
    }

    function test_CreateEscrow_RevertsOnDuplicateEscrow() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        // Try to create another escrow for same product
        vm.prank(buyer);
        vm.expectRevert(PaymentEscrow.PaymentEscrow__EscrowAlreadyExists.selector);
        escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);
    }

    /*//////////////////////////////////////////////////////////////
                    TEST 3: ESCROW RELEASE
    //////////////////////////////////////////////////////////////*/

    function test_ReleaseEscrow_Success() public {
        // Setup: Create product and escrow
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        // Move product to delivered status
        vm.prank(logistics);
        registry.addCheckpoint(
            productId,
            "Warehouse",
            ProductRegistry.Status.InTransit,
            "Shipped",
            50
        );

        vm.prank(logistics);
        registry.addCheckpoint(
            productId,
            "Destination",
            ProductRegistry.Status.Delivered,
            "Delivered",
            50
        );

        // Release escrow
        uint256 payeeBalanceBefore = logistics.balance;
        uint256 expectedFee = (ESCROW_AMOUNT * PLATFORM_FEE_BP) / 10000;
        uint256 expectedPayeeAmount = ESCROW_AMOUNT - expectedFee;

        vm.startPrank(buyer);

        vm.expectEmit(true, true, false, true);
        emit EscrowReleased(escrowId, logistics, expectedPayeeAmount, expectedFee);

        escrow.releaseEscrow(escrowId);

        vm.stopPrank();

        // Verify
        assertEq(logistics.balance, payeeBalanceBefore + expectedPayeeAmount);
        assertEq(escrow.getAccumulatedFees(), expectedFee);

        PaymentEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(uint256(esc.state), uint256(PaymentEscrow.EscrowState.Completed));
    }

    /*//////////////////////////////////////////////////////////////
                TEST 4: RELEASE WITHOUT DELIVERY
    //////////////////////////////////////////////////////////////*/

    function test_ReleaseEscrow_RevertsIfNotDelivered() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        // Try to release without delivery
        vm.prank(buyer);
        vm.expectRevert(PaymentEscrow.PaymentEscrow__DeliveryNotConfirmed.selector);
        escrow.releaseEscrow(escrowId);
    }

    /*//////////////////////////////////////////////////////////////
                TEST 5: UNAUTHORIZED RELEASE
    //////////////////////////////////////////////////////////////*/

    function test_ReleaseEscrow_RevertsIfUnauthorized() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        // Attacker tries to release
        vm.prank(attacker);
        vm.expectRevert(PaymentEscrow.PaymentEscrow__Unauthorized.selector);
        escrow.releaseEscrow(escrowId);
    }

    /*//////////////////////////////////////////////////////////////
                    TEST 6: RAISE DISPUTE
    //////////////////////////////////////////////////////////////*/

    function test_RaiseDispute_Success() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        string memory reason = "Product damaged during shipping";

        vm.startPrank(buyer);

        vm.expectEmit(true, true, false, true);
        emit DisputeRaised(escrowId, buyer, reason);

        escrow.raiseDispute(escrowId, reason);

        vm.stopPrank();

        PaymentEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(uint256(esc.state), uint256(PaymentEscrow.EscrowState.Disputed));
        assertEq(esc.disputeReason, reason);
    }

    /*//////////////////////////////////////////////////////////////
                TEST 7: UNAUTHORIZED DISPUTE
    //////////////////////////////////////////////////////////////*/

    function test_RaiseDispute_RevertsIfUnauthorized() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        vm.prank(attacker);
        vm.expectRevert(PaymentEscrow.PaymentEscrow__Unauthorized.selector);
        escrow.raiseDispute(escrowId, "Fake dispute");
    }

    /*//////////////////////////////////////////////////////////////
                TEST 8: RESOLVE DISPUTE - REFUND
    //////////////////////////////////////////////////////////////*/

    function test_ResolveDispute_RefundToPayer() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        vm.prank(buyer);
        escrow.raiseDispute(escrowId, "Damaged goods");

        // Owner resolves - refund to payer
        uint256 payerBalanceBefore = buyer.balance;

        escrow.resolveDispute(escrowId, true); // true = refund to payer

        assertEq(buyer.balance, payerBalanceBefore + ESCROW_AMOUNT);

        PaymentEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(uint256(esc.state), uint256(PaymentEscrow.EscrowState.Refunded));
    }

    /*//////////////////////////////////////////////////////////////
                TEST 9: RESOLVE DISPUTE - PAY PAYEE
    //////////////////////////////////////////////////////////////*/

    function test_ResolveDispute_PayToPayee() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        vm.prank(buyer);
        escrow.raiseDispute(escrowId, "Dispute");

        // Owner resolves - pay to payee
        uint256 payeeBalanceBefore = logistics.balance;
        uint256 expectedFee = (ESCROW_AMOUNT * PLATFORM_FEE_BP) / 10000;
        uint256 expectedPayeeAmount = ESCROW_AMOUNT - expectedFee;

        escrow.resolveDispute(escrowId, false); // false = pay to payee

        assertEq(logistics.balance, payeeBalanceBefore + expectedPayeeAmount);

        PaymentEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(uint256(esc.state), uint256(PaymentEscrow.EscrowState.Completed));
    }

    /*//////////////////////////////////////////////////////////////
                    TEST 10: CANCEL ESCROW
    //////////////////////////////////////////////////////////////*/

    function test_CancelEscrow_Success() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        // Cancel before shipping
        uint256 payerBalanceBefore = buyer.balance;

        vm.prank(buyer);
        escrow.cancelEscrow(escrowId);

        assertEq(buyer.balance, payerBalanceBefore + ESCROW_AMOUNT);

        PaymentEscrow.Escrow memory esc = escrow.getEscrow(escrowId);
        assertEq(uint256(esc.state), uint256(PaymentEscrow.EscrowState.Cancelled));
    }

    function test_CancelEscrow_RevertsAfterShipping() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        // Move to InTransit
        vm.prank(logistics);
        registry.addCheckpoint(
            productId,
            "Warehouse",
            ProductRegistry.Status.InTransit,
            "Shipped",
            50
        );

        // Try to cancel after shipping
        vm.prank(buyer);
        vm.expectRevert(PaymentEscrow.PaymentEscrow__InvalidEscrowState.selector);
        escrow.cancelEscrow(escrowId);
    }

    /*//////////////////////////////////////////////////////////////
                    TEST 11: PLATFORM FEE MANAGEMENT
    //////////////////////////////////////////////////////////////*/

    function test_SetPlatformFee_Success() public {
        uint256 newFee = 500; // 5%

        escrow.setPlatformFee(newFee);

        assertEq(escrow.getPlatformFee(), newFee);
    }

    function test_SetPlatformFee_RevertsOnTooHigh() public {
        vm.expectRevert(PaymentEscrow.PaymentEscrow__InvalidAmount.selector);
        escrow.setPlatformFee(1001); // > 10%
    }

    function test_WithdrawFees_Success() public {
        // Set a proper fee recipient
        address feeRecipient = makeAddr("feeRecipient");
        escrow.setFeeRecipient(feeRecipient);

        // Create and release escrow to generate fees
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        // Deliver product
        vm.prank(logistics);
        registry.addCheckpoint(
            productId,
            "Warehouse",
            ProductRegistry.Status.InTransit,
            "Shipped",
            50
        );
        vm.prank(logistics);
        registry.addCheckpoint(
            productId,
            "Destination",
            ProductRegistry.Status.Delivered,
            "Delivered",
            50
        );

        vm.prank(buyer);
        escrow.releaseEscrow(escrowId);

        // Withdraw fees
        uint256 expectedFee = (ESCROW_AMOUNT * PLATFORM_FEE_BP) / 10000;
        uint256 recipientBalanceBefore = feeRecipient.balance;

        escrow.withdrawFees();

        assertEq(feeRecipient.balance, recipientBalanceBefore + expectedFee);
        assertEq(escrow.getAccumulatedFees(), 0);
    }

    /*//////////////////////////////////////////////////////////////
                    TEST 12: TWO-STEP OWNERSHIP
    //////////////////////////////////////////////////////////////*/

    function test_TransferOwnership_TwoStep() public {
        address newOwner = makeAddr("newOwner");

        // Step 1: Initiate
        escrow.transferContractOwnership(newOwner);
        assertEq(escrow.getPendingOwner(), newOwner);
        assertEq(escrow.getOwner(), owner);

        // Step 2: Accept
        vm.prank(newOwner);
        escrow.acceptOwnership();

        assertEq(escrow.getOwner(), newOwner);
        assertEq(escrow.getPendingOwner(), address(0));
    }

    /*//////////////////////////////////////////////////////////////
                    BONUS: PAUSE FUNCTIONALITY
    //////////////////////////////////////////////////////////////*/

    function test_Pause_BlocksOperations() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        escrow.setPaused(true);

        vm.prank(buyer);
        vm.expectRevert(PaymentEscrow.PaymentEscrow__Unauthorized.selector);
        escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);
    }

    /*//////////////////////////////////////////////////////////////
                BONUS: DISPUTE PERIOD CHECKS
    //////////////////////////////////////////////////////////////*/

    function test_DisputePeriod_Expiration() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        // Warp past dispute period (7 days)
        vm.warp(block.timestamp + 8 days);

        vm.prank(buyer);
        vm.expectRevert(PaymentEscrow.PaymentEscrow__DisputePeriodExpired.selector);
        escrow.raiseDispute(escrowId, "Too late");
    }

    function test_IsDisputePeriodActive() public {
        vm.prank(manufacturer);
        uint256 productId = registry.registerProduct("Vaccine", "BATCH-001");

        vm.prank(buyer);
        uint256 escrowId = escrow.createEscrow{value: ESCROW_AMOUNT}(productId, logistics);

        // Initially active
        assertTrue(escrow.isDisputePeriodActive(escrowId));

        // After 7 days, not active
        vm.warp(block.timestamp + 8 days);
        assertFalse(escrow.isDisputePeriodActive(escrowId));
    }
}
