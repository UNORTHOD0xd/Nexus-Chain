// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ProductRegistry} from "./ProductRegistry.sol";

/**
 * @title PaymentEscrow
 * @dev Automated payment escrow based on delivery confirmation with dispute resolution
 * @author UNORTHOD0xd
 * @notice This contract holds payments in escrow and releases them upon verified delivery
 *         or handles refunds in case of disputes
 */

// Layout of Contract:
// version
// imports
// interfaces, libraries, contracts
// errors
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// view & pure functions

contract PaymentEscrow {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @dev Thrown when caller is not authorized to perform the action
    error PaymentEscrow__Unauthorized();

    /// @dev Thrown when an invalid address is provided (zero address)
    error PaymentEscrow__InvalidAddress();

    /// @dev Thrown when escrow does not exist
    error PaymentEscrow__EscrowDoesNotExist();

    /// @dev Thrown when escrow already exists for a product
    error PaymentEscrow__EscrowAlreadyExists();

    /// @dev Thrown when payment amount is invalid (zero or insufficient)
    error PaymentEscrow__InvalidAmount();

    /// @dev Thrown when escrow is not in correct state for operation
    error PaymentEscrow__InvalidEscrowState();

    /// @dev Thrown when product does not exist in registry
    error PaymentEscrow__ProductDoesNotExist();

    /// @dev Thrown when trying to release funds but delivery not confirmed
    error PaymentEscrow__DeliveryNotConfirmed();

    /// @dev Thrown when dispute period has expired
    error PaymentEscrow__DisputePeriodExpired();

    /// @dev Thrown when dispute period has not expired yet
    error PaymentEscrow__DisputePeriodNotExpired();

    /// @dev Thrown when funds transfer fails
    error PaymentEscrow__TransferFailed();

    /*//////////////////////////////////////////////////////////////
                           TYPE DECLARATIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Enum representing the state of an escrow
     * @param Active Escrow is active and awaiting delivery
     * @param Completed Escrow completed, funds released to payee
     * @param Refunded Escrow refunded to payer
     * @param Disputed Escrow is under dispute
     * @param Cancelled Escrow cancelled before completion
     */
    enum EscrowState {
        Active,
        Completed,
        Refunded,
        Disputed,
        Cancelled
    }

    /**
     * @dev Struct containing escrow information
     * @param escrowId Unique identifier for the escrow
     * @param productId Associated product ID from ProductRegistry
     * @param payer Address that deposited the funds
     * @param payee Address that will receive funds on delivery
     * @param amount Amount held in escrow (in wei)
     * @param state Current state of the escrow
     * @param createdAt Unix timestamp when escrow was created
     * @param completedAt Unix timestamp when escrow was completed (0 if not completed)
     * @param disputeReason Reason for dispute if in Disputed state
     * @param exists Flag to check if escrow exists
     */
    struct Escrow {
        uint256 escrowId;
        uint256 productId;
        address payer;
        address payee;
        uint256 amount;
        EscrowState state;
        uint256 createdAt;
        uint256 completedAt;
        string disputeReason;
        bool exists;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @dev Reference to ProductRegistry contract
    ProductRegistry private immutable i_productRegistry;

    /// @dev Mapping from escrow ID to Escrow struct
    mapping(uint256 => Escrow) private s_escrows;

    /// @dev Mapping from product ID to escrow ID (one escrow per product)
    mapping(uint256 => uint256) private s_productToEscrow;

    /// @dev Counter for generating unique escrow IDs
    uint256 private s_escrowCounter;

    /// @dev Address of the contract owner (arbiter for disputes)
    address private s_owner;

    /// @dev Pending owner for two-step ownership transfer
    address private s_pendingOwner;

    /// @dev Dispute period in seconds (default: 7 days)
    uint256 private s_disputePeriod = 7 days;

    /// @dev Platform fee percentage (in basis points, e.g., 250 = 2.5%)
    uint256 private s_platformFee = 250;

    /// @dev Platform fee recipient address
    address private s_feeRecipient;

    /// @dev Flag to pause contract operations in case of emergency
    bool private s_paused;

    /// @dev Accumulated platform fees ready for withdrawal
    uint256 private s_accumulatedFees;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Emitted when a new escrow is created
     * @param escrowId Unique escrow identifier
     * @param productId Associated product ID
     * @param payer Address depositing funds
     * @param payee Address receiving funds
     * @param amount Amount in escrow
     */
    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed productId,
        address indexed payer,
        address payee,
        uint256 amount
    );

    /**
     * @dev Emitted when escrow funds are released
     * @param escrowId Escrow identifier
     * @param payee Address receiving funds
     * @param amount Amount released
     * @param platformFee Fee deducted
     */
    event EscrowReleased(
        uint256 indexed escrowId,
        address indexed payee,
        uint256 amount,
        uint256 platformFee
    );

    /**
     * @dev Emitted when escrow is refunded
     * @param escrowId Escrow identifier
     * @param payer Address receiving refund
     * @param amount Amount refunded
     */
    event EscrowRefunded(uint256 indexed escrowId, address indexed payer, uint256 amount);

    /**
     * @dev Emitted when a dispute is raised
     * @param escrowId Escrow identifier
     * @param raiser Address that raised the dispute
     * @param reason Reason for dispute
     */
    event DisputeRaised(uint256 indexed escrowId, address indexed raiser, string reason);

    /**
     * @dev Emitted when a dispute is resolved
     * @param escrowId Escrow identifier
     * @param winner Address receiving the funds
     * @param refunded Whether funds were refunded to payer
     */
    event DisputeResolved(uint256 indexed escrowId, address indexed winner, bool refunded);

    /**
     * @dev Emitted when escrow is cancelled
     * @param escrowId Escrow identifier
     */
    event EscrowCancelled(uint256 indexed escrowId);

    /**
     * @dev Emitted when platform fee is updated
     * @param oldFee Previous fee in basis points
     * @param newFee New fee in basis points
     */
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    /**
     * @dev Emitted when dispute period is updated
     * @param oldPeriod Previous period in seconds
     * @param newPeriod New period in seconds
     */
    event DisputePeriodUpdated(uint256 oldPeriod, uint256 newPeriod);

    /**
     * @dev Emitted when contract is paused or unpaused
     * @param isPaused New paused state
     */
    event ContractPausedStatusChanged(bool isPaused);

    /**
     * @dev Emitted when contract ownership is transferred
     * @param previousOwner Previous owner address
     * @param newOwner New owner address
     */
    event OwnerTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Emitted when a new pending owner is nominated
     * @param pendingOwner Address of the pending owner
     */
    event OwnershipTransferInitiated(address indexed pendingOwner);

    /**
     * @dev Emitted when platform fees are withdrawn
     * @param recipient Fee recipient
     * @param amount Amount withdrawn
     */
    event FeesWithdrawn(address indexed recipient, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Restricts function access to contract owner only
     */
    modifier onlyOwner() {
        if (msg.sender != s_owner) revert PaymentEscrow__Unauthorized();
        _;
    }

    /**
     * @dev Ensures escrow exists before executing function
     * @param _escrowId Escrow identifier to check
     */
    modifier escrowExists(uint256 _escrowId) {
        if (!s_escrows[_escrowId].exists) revert PaymentEscrow__EscrowDoesNotExist();
        _;
    }

    /**
     * @dev Prevents function execution when contract is paused
     */
    modifier whenNotPaused() {
        if (s_paused) revert PaymentEscrow__Unauthorized();
        _;
    }

    /**
     * @dev Ensures address is not zero address
     * @param _address Address to validate
     */
    modifier validAddress(address _address) {
        if (_address == address(0)) revert PaymentEscrow__InvalidAddress();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Initializes the contract with ProductRegistry reference
     * @param _productRegistry Address of the ProductRegistry contract
     */
    constructor(address _productRegistry) validAddress(_productRegistry) {
        i_productRegistry = ProductRegistry(_productRegistry);
        s_owner = msg.sender;
        s_feeRecipient = msg.sender;
        s_escrowCounter = 0;
        s_paused = false;
    }

    /*//////////////////////////////////////////////////////////////
                          RECEIVE FUNCTION
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Allows contract to receive ETH
     */
    receive() external payable {}

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Creates a new escrow for a product
     * @dev Requires payment amount to be sent with transaction
     * @param _productId Product ID from ProductRegistry
     * @param _payee Address that will receive funds on delivery
     * @return escrowId Unique identifier for the created escrow
     */
    function createEscrow(
        uint256 _productId,
        address _payee
    )
        external
        payable
        whenNotPaused
        validAddress(_payee)
        returns (uint256 escrowId)
    {
        if (msg.value == 0) revert PaymentEscrow__InvalidAmount();
        if (s_productToEscrow[_productId] != 0) revert PaymentEscrow__EscrowAlreadyExists();

        // Verify product exists in registry
        (bool exists,,) = i_productRegistry.verifyProduct(_productId);
        if (!exists) revert PaymentEscrow__ProductDoesNotExist();

        escrowId = s_escrowCounter++;

        s_escrows[escrowId] = Escrow({
            escrowId: escrowId,
            productId: _productId,
            payer: msg.sender,
            payee: _payee,
            amount: msg.value,
            state: EscrowState.Active,
            createdAt: block.timestamp,
            completedAt: 0,
            disputeReason: "",
            exists: true
        });

        s_productToEscrow[_productId] = escrowId;

        emit EscrowCreated(escrowId, _productId, msg.sender, _payee, msg.value);
    }

    /**
     * @notice Releases escrow funds to payee upon delivery confirmation
     * @dev Checks product status is Delivered or Verified, deducts platform fee
     * @param _escrowId Escrow identifier
     */
    function releaseEscrow(uint256 _escrowId) external whenNotPaused escrowExists(_escrowId) {
        Escrow storage escrow = s_escrows[_escrowId];

        if (escrow.state != EscrowState.Active) {
            revert PaymentEscrow__InvalidEscrowState();
        }

        // Only payer or owner can release funds
        if (msg.sender != escrow.payer && msg.sender != s_owner) {
            revert PaymentEscrow__Unauthorized();
        }

        // Verify product is delivered
        ProductRegistry.Product memory product = i_productRegistry.getProduct(escrow.productId);
        if (
            product.currentStatus != ProductRegistry.Status.Delivered &&
            product.currentStatus != ProductRegistry.Status.Verified
        ) {
            revert PaymentEscrow__DeliveryNotConfirmed();
        }

        // Calculate platform fee
        uint256 fee = (escrow.amount * s_platformFee) / 10000;
        uint256 payeeAmount = escrow.amount - fee;

        // Update state before transfers (CEI pattern)
        escrow.state = EscrowState.Completed;
        escrow.completedAt = block.timestamp;
        s_accumulatedFees += fee;

        // Transfer funds
        (bool success,) = escrow.payee.call{value: payeeAmount}("");
        if (!success) revert PaymentEscrow__TransferFailed();

        emit EscrowReleased(_escrowId, escrow.payee, payeeAmount, fee);
    }

    /**
     * @notice Raises a dispute on an active escrow
     * @dev Can only be called during dispute period by payer or payee
     * @param _escrowId Escrow identifier
     * @param _reason Reason for the dispute
     */
    function raiseDispute(
        uint256 _escrowId,
        string memory _reason
    )
        external
        whenNotPaused
        escrowExists(_escrowId)
    {
        Escrow storage escrow = s_escrows[_escrowId];

        if (escrow.state != EscrowState.Active) {
            revert PaymentEscrow__InvalidEscrowState();
        }

        if (msg.sender != escrow.payer && msg.sender != escrow.payee) {
            revert PaymentEscrow__Unauthorized();
        }

        if (block.timestamp > escrow.createdAt + s_disputePeriod) {
            revert PaymentEscrow__DisputePeriodExpired();
        }

        escrow.state = EscrowState.Disputed;
        escrow.disputeReason = _reason;

        emit DisputeRaised(_escrowId, msg.sender, _reason);
    }

    /**
     * @notice Resolves a dispute (owner only)
     * @dev Owner acts as arbiter, can refund to payer or release to payee
     * @param _escrowId Escrow identifier
     * @param _refundToPayer True to refund payer, false to pay payee
     */
    function resolveDispute(
        uint256 _escrowId,
        bool _refundToPayer
    )
        external
        onlyOwner
        escrowExists(_escrowId)
    {
        Escrow storage escrow = s_escrows[_escrowId];

        if (escrow.state != EscrowState.Disputed) {
            revert PaymentEscrow__InvalidEscrowState();
        }

        address winner;
        uint256 amount = escrow.amount;

        if (_refundToPayer) {
            escrow.state = EscrowState.Refunded;
            winner = escrow.payer;

            // Transfer refund
            (bool success,) = escrow.payer.call{value: amount}("");
            if (!success) revert PaymentEscrow__TransferFailed();
        } else {
            escrow.state = EscrowState.Completed;
            winner = escrow.payee;

            // Calculate platform fee
            uint256 fee = (amount * s_platformFee) / 10000;
            uint256 payeeAmount = amount - fee;
            s_accumulatedFees += fee;

            // Transfer to payee
            (bool success,) = escrow.payee.call{value: payeeAmount}("");
            if (!success) revert PaymentEscrow__TransferFailed();
        }

        escrow.completedAt = block.timestamp;

        emit DisputeResolved(_escrowId, winner, _refundToPayer);
    }

    /**
     * @notice Cancels an active escrow and refunds the payer
     * @dev Can only be called by payer if product hasn't started shipping
     * @param _escrowId Escrow identifier
     */
    function cancelEscrow(uint256 _escrowId) external whenNotPaused escrowExists(_escrowId) {
        Escrow storage escrow = s_escrows[_escrowId];

        if (escrow.state != EscrowState.Active) {
            revert PaymentEscrow__InvalidEscrowState();
        }

        if (msg.sender != escrow.payer && msg.sender != s_owner) {
            revert PaymentEscrow__Unauthorized();
        }

        // Check product hasn't been shipped yet
        ProductRegistry.Product memory product = i_productRegistry.getProduct(escrow.productId);
        if (product.currentStatus != ProductRegistry.Status.Manufactured) {
            revert PaymentEscrow__InvalidEscrowState();
        }

        escrow.state = EscrowState.Cancelled;
        escrow.completedAt = block.timestamp;

        // Refund payer
        (bool success,) = escrow.payer.call{value: escrow.amount}("");
        if (!success) revert PaymentEscrow__TransferFailed();

        emit EscrowCancelled(_escrowId);
        emit EscrowRefunded(_escrowId, escrow.payer, escrow.amount);
    }

    /**
     * @notice Updates the platform fee percentage
     * @dev Only owner can update, max 10% (1000 basis points)
     * @param _newFee New fee in basis points
     */
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        if (_newFee > 1000) revert PaymentEscrow__InvalidAmount(); // Max 10%

        uint256 oldFee = s_platformFee;
        s_platformFee = _newFee;

        emit PlatformFeeUpdated(oldFee, _newFee);
    }

    /**
     * @notice Updates the dispute period
     * @dev Only owner can update
     * @param _newPeriod New period in seconds
     */
    function setDisputePeriod(uint256 _newPeriod) external onlyOwner {
        if (_newPeriod == 0) revert PaymentEscrow__InvalidAmount();

        uint256 oldPeriod = s_disputePeriod;
        s_disputePeriod = _newPeriod;

        emit DisputePeriodUpdated(oldPeriod, _newPeriod);
    }

    /**
     * @notice Updates the fee recipient address
     * @dev Only owner can update
     * @param _newRecipient New fee recipient address
     */
    function setFeeRecipient(address _newRecipient) external onlyOwner validAddress(_newRecipient) {
        s_feeRecipient = _newRecipient;
    }

    /**
     * @notice Withdraws accumulated platform fees
     * @dev Only owner can withdraw fees
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = s_accumulatedFees;
        if (amount == 0) revert PaymentEscrow__InvalidAmount();

        s_accumulatedFees = 0;

        (bool success,) = s_feeRecipient.call{value: amount}("");
        if (!success) revert PaymentEscrow__TransferFailed();

        emit FeesWithdrawn(s_feeRecipient, amount);
    }

    /**
     * @notice Pauses or unpauses the contract
     * @dev Emergency function to halt operations if needed
     * @param _paused New paused state
     */
    function setPaused(bool _paused) external onlyOwner {
        s_paused = _paused;
        emit ContractPausedStatusChanged(_paused);
    }

    /**
     * @notice Initiates ownership transfer to a new owner (step 1 of 2)
     * @dev Two-step process to prevent accidental transfers to wrong address
     * @param _newOwner Address of the new owner
     */
    function transferContractOwnership(
        address _newOwner
    )
        external
        onlyOwner
        validAddress(_newOwner)
    {
        s_pendingOwner = _newOwner;
        emit OwnershipTransferInitiated(_newOwner);
    }

    /**
     * @notice Accepts ownership transfer (step 2 of 2)
     * @dev Only the pending owner can accept the ownership transfer
     */
    function acceptOwnership() external {
        if (msg.sender != s_pendingOwner) {
            revert PaymentEscrow__Unauthorized();
        }

        address previousOwner = s_owner;
        s_owner = s_pendingOwner;
        s_pendingOwner = address(0);

        emit OwnerTransferred(previousOwner, s_owner);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW & PURE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Retrieves complete escrow information
     * @param _escrowId Escrow identifier
     * @return Escrow struct containing all escrow data
     */
    function getEscrow(uint256 _escrowId)
        external
        view
        escrowExists(_escrowId)
        returns (Escrow memory)
    {
        return s_escrows[_escrowId];
    }

    /**
     * @notice Gets escrow ID for a product
     * @param _productId Product identifier
     * @return Escrow ID (0 if no escrow exists)
     */
    function getEscrowByProduct(uint256 _productId) external view returns (uint256) {
        return s_productToEscrow[_productId];
    }

    /**
     * @notice Gets the total number of escrows created
     * @return Total escrow count
     */
    function getEscrowCount() external view returns (uint256) {
        return s_escrowCounter;
    }

    /**
     * @notice Gets the contract owner address
     * @return Owner address
     */
    function getOwner() external view returns (address) {
        return s_owner;
    }

    /**
     * @notice Gets pending owner address
     * @return Address of pending owner (address(0) if none)
     */
    function getPendingOwner() external view returns (address) {
        return s_pendingOwner;
    }

    /**
     * @notice Checks if the contract is currently paused
     * @return Paused state
     */
    function isPaused() external view returns (bool) {
        return s_paused;
    }

    /**
     * @notice Gets the current platform fee percentage
     * @return Fee in basis points
     */
    function getPlatformFee() external view returns (uint256) {
        return s_platformFee;
    }

    /**
     * @notice Gets the current dispute period
     * @return Period in seconds
     */
    function getDisputePeriod() external view returns (uint256) {
        return s_disputePeriod;
    }

    /**
     * @notice Gets the fee recipient address
     * @return Fee recipient address
     */
    function getFeeRecipient() external view returns (address) {
        return s_feeRecipient;
    }

    /**
     * @notice Gets accumulated platform fees
     * @return Accumulated fees in wei
     */
    function getAccumulatedFees() external view returns (uint256) {
        return s_accumulatedFees;
    }

    /**
     * @notice Gets the ProductRegistry contract address
     * @return ProductRegistry address
     */
    function getProductRegistry() external view returns (address) {
        return address(i_productRegistry);
    }

    /**
     * @notice Checks if dispute period is still active for an escrow
     * @param _escrowId Escrow identifier
     * @return Whether dispute period is active
     */
    function isDisputePeriodActive(uint256 _escrowId)
        external
        view
        escrowExists(_escrowId)
        returns (bool)
    {
        Escrow memory escrow = s_escrows[_escrowId];
        return block.timestamp <= escrow.createdAt + s_disputePeriod;
    }
}
