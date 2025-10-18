// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


/**
 * @title ProductRegistry
 * @dev Manages product registration and supply chain trcking
 * @author UNORTHOD0xd
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

contract productRegistry {
    
    // Enums for product status and roles
    enum Status { Manufactured, InTransit, InWarehouse, Customs, Delivered, Verified }
    enum Role { None, Manufacturer, Logistics, Retailer, Consumer }

    // Product structure 
    struct Product {
        uint256 id;
        string name;
        string batchnumber;
        address manufacturer;
        uint256 manufacturerDate;
        Status currentState;
        address currentHolder;
        bool exists;
    }

    // Checkpoint structure for tracking journey
    struct Checkpoint {
        address handler;
        string location;
        uint256 timestamp;
        Status status;
        string notes;
        int256 temperature; // in celsius * 10 (e.g., 25 = 2.5c)
        bool temperatureInRange;
    }

    // Storage
    mapping(uint256 => Product) public products;
    mapping(uint256 => Checkpoint[]) public productCheckpoints;
    mapping(address => Role) public userRoles;
    mapping(address => bool) public authorizedUsers;

    uint256 public productCounter;
    address public owner;

    // Temperature thresholds (in Celsius * 10)
    int256 public minTemp = 20;
    int256 public maxTemp = 80;

    // Events
    event ProductRegistered(uint256 indexed productId, string name, address manufacturer);
    event CheckpointAdded(uint256 indexed productId, address handler, string location, Status status);
    event OwnershipTransferred(uint256 indexed productId, address from, address to);
    event StatusUpdated(uint256 indexed productId, Status newStatus);
    event RoleAssigned(address indexed user, Role role);
    event TemperatureAlert(uint256 indexed productId, int256 temperature);
}           