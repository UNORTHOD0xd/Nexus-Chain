// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ProductRegistry
 * @dev Manages product registration and supply chain tracking with immutable blockchain records
 * @author UNORTHOD0xd
 * @notice This contract provides a decentralized solution for tracking products through the supply chain,
 *         ensuring authenticity, transparency, and cold chain compliance
 * @custom:security-contact security@nexuschain.com
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

contract ProductRegistry {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @dev Thrown when caller is not authorized to perform the action
    error ProductRegistry__Unauthorized();

    /// @dev Thrown when attempting to interact with a non-existent product
    error ProductRegistry__ProductDoesNotExist();

    /// @dev Thrown when attempting to register a product that already exists
    error ProductRegistry__ProductAlreadyExists();

    /// @dev Thrown when an invalid address is provided (zero address)
    error ProductRegistry__InvalidAddress();

    /// @dev Thrown when invalid product data is provided (empty strings, etc.)
    error ProductRegistry__InvalidProductData();

    /// @dev Thrown when caller doesn't have the required role
    error ProductRegistry__InvalidRole();

    /// @dev Thrown when attempting an invalid status transition
    error ProductRegistry__InvalidStatusTransition();

    /// @dev Thrown when temperature is outside acceptable range
    error ProductRegistry__TemperatureOutOfRange(int256 temperature, int256 minTemp, int256 maxTemp);

    /// @dev Thrown when trying to transfer ownership to current holder
    error ProductRegistry__AlreadyCurrentHolder();

    /// @dev Thrown when checkpoint data is invalid
    error ProductRegistry__InvalidCheckpointData();

    /*//////////////////////////////////////////////////////////////
                           TYPE DECLARATIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Enum representing the current status of a product in the supply chain
     * @param Manufactured Product has been created at the manufacturing facility
     * @param InTransit Product is being transported between locations
     * @param InWarehouse Product is stored in a warehouse facility
     * @param Customs Product is being processed through customs
     * @param Delivered Product has been delivered to its destination
     * @param Verified Product has been verified by the end recipient
     */
    enum Status {
        Manufactured,
        InTransit,
        InWarehouse,
        Customs,
        Delivered,
        Verified
    }

    /**
     * @dev Enum representing user roles in the supply chain ecosystem
     * @param None Default role with no special permissions
     * @param Manufacturer Can register products and initiate supply chain
     * @param Logistics Can add checkpoints and update product location
     * @param Retailer Can receive and verify products
     * @param Consumer Can verify product authenticity
     */
    enum Role {
        None,
        Manufacturer,
        Logistics,
        Retailer,
        Consumer
    }

    /**
     * @dev Struct containing all product information
     * @param id Unique identifier for the product
     * @param name Human-readable product name
     * @param batchNumber Manufacturing batch number for tracking
     * @param manufacturer Address of the entity that manufactured the product
     * @param manufactureDate Unix timestamp when product was manufactured
     * @param currentStatus Current status in the supply chain
     * @param currentHolder Address of the current custody holder
     * @param exists Flag to check if product has been registered
     */
    struct Product {
        uint256 id;
        string name;
        string batchNumber;
        address manufacturer;
        uint256 manufactureDate;
        Status currentStatus;
        address currentHolder;
        bool exists;
    }

    /**
     * @dev Struct representing a checkpoint in the product's journey
     * @param handler Address that recorded this checkpoint
     * @param location Physical location description (e.g., "Miami Warehouse")
     * @param timestamp Unix timestamp when checkpoint was recorded
     * @param status Product status at this checkpoint
     * @param notes Additional information about this checkpoint
     * @param temperature Temperature reading in Celsius * 10 (e.g., 250 = 25.0°C)
     * @param temperatureInRange Whether temperature was within acceptable range
     */
    struct Checkpoint {
        address handler;
        string location;
        uint256 timestamp;
        Status status;
        string notes;
        int256 temperature;
        bool temperatureInRange;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @dev Mapping from product ID to Product struct
    mapping(uint256 => Product) private s_products;

    /// @dev Mapping from product ID to array of checkpoints
    mapping(uint256 => Checkpoint[]) private s_productCheckpoints;

    /// @dev Mapping from user address to their assigned role
    mapping(address => Role) private s_userRoles;

    /// @dev Mapping to track authorized users who can interact with the system
    mapping(address => bool) private s_authorizedUsers;

    /// @dev Counter for generating unique product IDs
    uint256 private s_productCounter;

    /// @dev Address of the contract owner (has admin privileges)
    address private s_owner;

    /// @dev Minimum acceptable temperature in Celsius * 10 (default: 2.0°C)
    int256 private s_minTemp = 20;

    /// @dev Maximum acceptable temperature in Celsius * 10 (default: 8.0°C)
    int256 private s_maxTemp = 80;

    /// @dev Flag to pause contract operations in case of emergency
    bool private s_paused;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Emitted when a new product is registered on the blockchain
     * @param productId Unique identifier assigned to the product
     * @param name Product name
     * @param manufacturer Address of the manufacturer
     * @param batchNumber Manufacturing batch number
     */
    event ProductRegistered(
        uint256 indexed productId,
        string name,
        address indexed manufacturer,
        string batchNumber
    );

    /**
     * @dev Emitted when a new checkpoint is added to a product's journey
     * @param productId Product identifier
     * @param handler Address that added the checkpoint
     * @param location Physical location
     * @param status New status
     * @param temperature Temperature reading
     */
    event CheckpointAdded(
        uint256 indexed productId,
        address indexed handler,
        string location,
        Status status,
        int256 temperature
    );

    /**
     * @dev Emitted when product ownership is transferred
     * @param productId Product identifier
     * @param from Previous holder
     * @param to New holder
     */
    event OwnershipTransferred(
        uint256 indexed productId,
        address indexed from,
        address indexed to
    );

    /**
     * @dev Emitted when a product's status is updated
     * @param productId Product identifier
     * @param oldStatus Previous status
     * @param newStatus New status
     */
    event StatusUpdated(
        uint256 indexed productId,
        Status oldStatus,
        Status newStatus
    );

    /**
     * @dev Emitted when a role is assigned to a user
     * @param user Address of the user
     * @param role Role assigned
     */
    event RoleAssigned(address indexed user, Role role);

    /**
     * @dev Emitted when temperature is outside acceptable range
     * @param productId Product identifier
     * @param temperature Recorded temperature
     * @param location Location where temperature was recorded
     */
    event TemperatureAlert(
        uint256 indexed productId,
        int256 temperature,
        string location
    );

    /**
     * @dev Emitted when temperature thresholds are updated
     * @param minTemp New minimum temperature
     * @param maxTemp New maximum temperature
     */
    event TemperatureThresholdsUpdated(int256 minTemp, int256 maxTemp);

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

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Restricts function access to contract owner only
     */
    modifier onlyOwner() {
        if (msg.sender != s_owner) revert ProductRegistry__Unauthorized();
        _;
    }

    /**
     * @dev Restricts function access to users with specific role
     * @param _role Required role to execute the function
     */
    modifier onlyRole(Role _role) {
        if (s_userRoles[msg.sender] != _role) revert ProductRegistry__InvalidRole();
        _;
    }

    /**
     * @dev Ensures product exists before executing function
     * @param _productId Product identifier to check
     */
    modifier productExists(uint256 _productId) {
        if (!s_products[_productId].exists) revert ProductRegistry__ProductDoesNotExist();
        _;
    }

    /**
     * @dev Prevents function execution when contract is paused
     */
    modifier whenNotPaused() {
        if (s_paused) revert ProductRegistry__Unauthorized();
        _;
    }

    /**
     * @dev Ensures address is not zero address
     * @param _address Address to validate
     */
    modifier validAddress(address _address) {
        if (_address == address(0)) revert ProductRegistry__InvalidAddress();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Initializes the contract, setting the deployer as the owner
     */
    constructor() {
        s_owner = msg.sender;
        s_productCounter = 0;
        s_paused = false;
    }

    /*//////////////////////////////////////////////////////////////
                           EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Registers a new product on the blockchain
     * @dev Creates a new product with Manufactured status and assigns it to the caller
     * @param _name Product name (must not be empty)
     * @param _batchNumber Manufacturing batch number (must not be empty)
     * @return productId Unique identifier assigned to the product
     */
    function registerProduct(
        string memory _name,
        string memory _batchNumber
    )
        external
        whenNotPaused
        onlyRole(Role.Manufacturer)
        returns (uint256 productId)
    {
        if (bytes(_name).length == 0 || bytes(_batchNumber).length == 0) {
            revert ProductRegistry__InvalidProductData();
        }

        productId = s_productCounter++;

        s_products[productId] = Product({
            id: productId,
            name: _name,
            batchNumber: _batchNumber,
            manufacturer: msg.sender,
            manufactureDate: block.timestamp,
            currentStatus: Status.Manufactured,
            currentHolder: msg.sender,
            exists: true
        });

        // Add initial checkpoint
        s_productCheckpoints[productId].push(
            Checkpoint({
                handler: msg.sender,
                location: "Manufacturing Facility",
                timestamp: block.timestamp,
                status: Status.Manufactured,
                notes: "Product registered on blockchain",
                temperature: 0,
                temperatureInRange: true
            })
        );

        emit ProductRegistered(productId, _name, msg.sender, _batchNumber);
        emit CheckpointAdded(productId, msg.sender, "Manufacturing Facility", Status.Manufactured, 0);
    }

    /**
     * @notice Adds a checkpoint to a product's supply chain journey
     * @dev Records location, status, and temperature data for the product
     * @param _productId Product identifier
     * @param _location Physical location description
     * @param _status New status of the product
     * @param _notes Additional notes about this checkpoint
     * @param _temperature Temperature reading in Celsius * 10
     */
    function addCheckpoint(
        uint256 _productId,
        string memory _location,
        Status _status,
        string memory _notes,
        int256 _temperature
    )
        external
        whenNotPaused
        productExists(_productId)
    {
        if (bytes(_location).length == 0) {
            revert ProductRegistry__InvalidCheckpointData();
        }

        Product storage product = s_products[_productId];

        // Validate status transition
        if (!_isValidStatusTransition(product.currentStatus, _status)) {
            revert ProductRegistry__InvalidStatusTransition();
        }

        // Check temperature range
        bool tempInRange = _temperature >= s_minTemp && _temperature <= s_maxTemp;

        if (!tempInRange) {
            emit TemperatureAlert(_productId, _temperature, _location);
        }

        s_productCheckpoints[_productId].push(
            Checkpoint({
                handler: msg.sender,
                location: _location,
                timestamp: block.timestamp,
                status: _status,
                notes: _notes,
                temperature: _temperature,
                temperatureInRange: tempInRange
            })
        );

        Status oldStatus = product.currentStatus;
        product.currentStatus = _status;

        emit CheckpointAdded(_productId, msg.sender, _location, _status, _temperature);
        emit StatusUpdated(_productId, oldStatus, _status);
    }

    /**
     * @notice Transfers ownership of a product to a new holder
     * @dev Updates the current holder and creates a checkpoint for the transfer
     * @param _productId Product identifier
     * @param _newHolder Address of the new holder
     */
    function transferOwnership(
        uint256 _productId,
        address _newHolder
    )
        external
        whenNotPaused
        productExists(_productId)
        validAddress(_newHolder)
    {
        Product storage product = s_products[_productId];

        if (product.currentHolder == _newHolder) {
            revert ProductRegistry__AlreadyCurrentHolder();
        }

        address previousHolder = product.currentHolder;
        product.currentHolder = _newHolder;

        emit OwnershipTransferred(_productId, previousHolder, _newHolder);
    }

    /**
     * @notice Assigns a role to a user in the supply chain system
     * @dev Only the contract owner can assign roles
     * @param _user Address of the user to assign the role to
     * @param _role Role to assign
     */
    function assignRole(
        address _user,
        Role _role
    )
        external
        onlyOwner
        validAddress(_user)
    {
        s_userRoles[_user] = _role;
        s_authorizedUsers[_user] = true;

        emit RoleAssigned(_user, _role);
    }

    /**
     * @notice Updates the temperature thresholds for cold chain monitoring
     * @dev Only owner can update temperature limits
     * @param _minTemp New minimum temperature (Celsius * 10)
     * @param _maxTemp New maximum temperature (Celsius * 10)
     */
    function setTemperatureThresholds(
        int256 _minTemp,
        int256 _maxTemp
    )
        external
        onlyOwner
    {
        if (_minTemp >= _maxTemp) {
            revert ProductRegistry__InvalidProductData();
        }

        s_minTemp = _minTemp;
        s_maxTemp = _maxTemp;

        emit TemperatureThresholdsUpdated(_minTemp, _maxTemp);
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
     * @notice Transfers contract ownership to a new owner
     * @dev Only current owner can transfer ownership
     * @param _newOwner Address of the new owner
     */
    function transferContractOwnership(
        address _newOwner
    )
        external
        onlyOwner
        validAddress(_newOwner)
    {
        address previousOwner = s_owner;
        s_owner = _newOwner;

        emit OwnerTransferred(previousOwner, _newOwner);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW & PURE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Retrieves complete product information
     * @param _productId Product identifier
     * @return Product struct containing all product data
     */
    function getProduct(uint256 _productId)
        external
        view
        productExists(_productId)
        returns (Product memory)
    {
        return s_products[_productId];
    }

    /**
     * @notice Retrieves all checkpoints for a product
     * @param _productId Product identifier
     * @return Array of Checkpoint structs
     */
    function getProductCheckpoints(uint256 _productId)
        external
        view
        productExists(_productId)
        returns (Checkpoint[] memory)
    {
        return s_productCheckpoints[_productId];
    }

    /**
     * @notice Verifies if a product exists and returns its authenticity status
     * @param _productId Product identifier
     * @return exists Whether the product is registered
     * @return manufacturer Address of the manufacturer
     * @return currentStatus Current status of the product
     */
    function verifyProduct(uint256 _productId)
        external
        view
        returns (
            bool exists,
            address manufacturer,
            Status currentStatus
        )
    {
        Product memory product = s_products[_productId];
        return (product.exists, product.manufacturer, product.currentStatus);
    }

    /**
     * @notice Gets the role assigned to a user
     * @param _user Address of the user
     * @return Role assigned to the user
     */
    function getUserRole(address _user) external view returns (Role) {
        return s_userRoles[_user];
    }

    /**
     * @notice Checks if a user is authorized in the system
     * @param _user Address of the user
     * @return Whether the user is authorized
     */
    function isAuthorized(address _user) external view returns (bool) {
        return s_authorizedUsers[_user];
    }

    /**
     * @notice Gets the current temperature thresholds
     * @return minTemp Minimum acceptable temperature
     * @return maxTemp Maximum acceptable temperature
     */
    function getTemperatureThresholds() external view returns (int256 minTemp, int256 maxTemp) {
        return (s_minTemp, s_maxTemp);
    }

    /**
     * @notice Gets the total number of products registered
     * @return Total product count
     */
    function getProductCount() external view returns (uint256) {
        return s_productCounter;
    }

    /**
     * @notice Gets the contract owner address
     * @return Owner address
     */
    function getOwner() external view returns (address) {
        return s_owner;
    }

    /**
     * @notice Checks if the contract is currently paused
     * @return Paused state
     */
    function isPaused() external view returns (bool) {
        return s_paused;
    }

    /**
     * @notice Gets the current holder of a product
     * @param _productId Product identifier
     * @return Address of current holder
     */
    function getCurrentHolder(uint256 _productId)
        external
        view
        productExists(_productId)
        returns (address)
    {
        return s_products[_productId].currentHolder;
    }

    /**
     * @notice Checks if temperature compliance was maintained throughout journey
     * @param _productId Product identifier
     * @return compliant Whether all checkpoints had acceptable temperatures
     */
    function checkTemperatureCompliance(uint256 _productId)
        external
        view
        productExists(_productId)
        returns (bool compliant)
    {
        Checkpoint[] memory checkpoints = s_productCheckpoints[_productId];
        compliant = true;

        for (uint256 i = 0; i < checkpoints.length; i++) {
            if (!checkpoints[i].temperatureInRange) {
                compliant = false;
                break;
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Validates if a status transition is allowed
     * @param _currentStatus Current product status
     * @param _newStatus Proposed new status
     * @return valid Whether the transition is valid
     */
    function _isValidStatusTransition(
        Status _currentStatus,
        Status _newStatus
    )
        internal
        pure
        returns (bool valid)
    {
        // Allow same status (re-scan at same location)
        if (_currentStatus == _newStatus) {
            return true;
        }

        // Define valid transitions
        if (_currentStatus == Status.Manufactured) {
            return _newStatus == Status.InTransit;
        } else if (_currentStatus == Status.InTransit) {
            return _newStatus == Status.InWarehouse ||
                   _newStatus == Status.Customs ||
                   _newStatus == Status.Delivered;
        } else if (_currentStatus == Status.InWarehouse) {
            return _newStatus == Status.InTransit ||
                   _newStatus == Status.Delivered;
        } else if (_currentStatus == Status.Customs) {
            return _newStatus == Status.InWarehouse ||
                   _newStatus == Status.InTransit ||
                   _newStatus == Status.Delivered;
        } else if (_currentStatus == Status.Delivered) {
            return _newStatus == Status.Verified;
        }

        return false;
    }
}
