// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IFluxAccessHub
 * @dev Central access control hub interface for Flux ecosystem
 */
interface IFluxAccessHub {
    // Enums
    enum EmergencyLevel {
        NORMAL,
        RESTRICTED,
        PAUSED,
        FROZEN
    }
    
    enum ContractType {
        TOKEN,
        NFT,
        MARKETPLACE,
        STAKING,
        GOVERNANCE,
        OTHER
    }
    
    // Structs
    struct ContractInfo {
        address contractAddress;
        ContractType contractType;
        bool isActive;
        uint256 version;
        uint256 registeredAt;
    }
    
    struct TimeLock {
        bytes32 operationId;
        address target;
        bytes data;
        uint256 executeAfter;
        bool executed;
        bool cancelled;
    }
    
    struct Delegation {
        address delegator;
        address delegatee;
        bytes32 role;
        uint256 expiresAt;
        bytes32[] allowedFunctions;
        bool isActive;
    }
    
    struct MultiSigConfig {
        uint256 requiredSignatures;
        uint256 executionDelay;
        address[] signers;
    }
    
    // Events
    // Role events are inherited from IAccessControl
    
    event ContractRegistered(address indexed contractAddress, ContractType contractType, uint256 version);
    event ContractDeactivated(address indexed contractAddress);
    event ContractUpdated(address indexed oldContract, address indexed newContract, uint256 version);
    
    event OperationScheduled(bytes32 indexed operationId, address indexed target, uint256 executeAfter);
    event OperationExecuted(bytes32 indexed operationId, address indexed executor);
    event OperationCancelled(bytes32 indexed operationId, address indexed canceller);
    
    event DelegationCreated(address indexed delegator, address indexed delegatee, bytes32 role, uint256 expiresAt);
    event DelegationRevoked(address indexed delegator, address indexed delegatee, bytes32 role);
    
    event EmergencyLevelChanged(EmergencyLevel oldLevel, EmergencyLevel newLevel, address indexed executor);
    event EmergencyActionExecuted(address indexed executor, string action, bytes data);
    
    // Role Management Functions
    function hasRole(bytes32 role, address account) external view returns (bool);
    function hasRoleInContract(address account, bytes32 role, address contractAddress) external view returns (bool);
    // getRoleAdmin is inherited from IAccessControl
    function grantRole(bytes32 role, address account) external;
    function revokeRole(bytes32 role, address account) external;
    function renounceRole(bytes32 role) external;
    
    // Multi-Role Functions
    function grantRoles(bytes32[] calldata roles, address account) external;
    function revokeRoles(bytes32[] calldata roles, address account) external;
    function hasAllRoles(address account, bytes32[] calldata roles) external view returns (bool);
    function hasAnyRole(address account, bytes32[] calldata roles) external view returns (bool);
    
    // Contract Registry Functions
    function registerContract(address contractAddress, ContractType contractType) external;
    function deactivateContract(address contractAddress) external;
    function updateContract(address oldContract, address newContract) external;
    function getContractInfo(address contractAddress) external view returns (ContractInfo memory);
    function isContractActive(address contractAddress) external view returns (bool);
    function getContractsByType(ContractType contractType) external view returns (address[] memory);
    
    // Time Lock Functions
    function scheduleOperation(
        address target,
        bytes calldata data,
        uint256 delay
    ) external returns (bytes32 operationId);
    
    function executeOperation(bytes32 operationId) external;
    function cancelOperation(bytes32 operationId) external;
    function getOperationState(bytes32 operationId) external view returns (TimeLock memory);
    function isOperationPending(bytes32 operationId) external view returns (bool);
    function isOperationReady(bytes32 operationId) external view returns (bool);
    
    // Delegation Functions
    function delegateRole(
        address delegatee,
        bytes32 role,
        uint256 duration,
        bytes32[] calldata allowedFunctions
    ) external returns (uint256 delegationId);
    
    function revokeDelegation(uint256 delegationId) external;
    function isDelegationActive(uint256 delegationId) external view returns (bool);
    function getDelegation(uint256 delegationId) external view returns (Delegation memory);
    function getActiveDelegations(address account) external view returns (uint256[] memory);
    
    // Emergency Functions
    function setEmergencyLevel(EmergencyLevel level) external;
    function getEmergencyLevel() external view returns (EmergencyLevel);
    function executeEmergencyAction(string calldata action, bytes calldata data) external;
    function pauseContract(address contractAddress) external;
    function unpauseContract(address contractAddress) external;
    function pauseAllContracts() external;
    function unpauseAllContracts() external;
    
    // Multi-Signature Functions
    function setMultiSigConfig(uint256 requiredSignatures, address[] calldata signers) external;
    function getMultiSigConfig() external view returns (MultiSigConfig memory);
    function proposeMultiSigOperation(address target, bytes calldata data) external returns (bytes32 proposalId);
    function approveMultiSigOperation(bytes32 proposalId) external;
    function executeMultiSigOperation(bytes32 proposalId) external;
    
    // Query Functions
    function getRoleMemberCount(bytes32 role) external view returns (uint256);
    function getRoleMember(bytes32 role, uint256 index) external view returns (address);
    function getAllRoleMembers(bytes32 role) external view returns (address[] memory);
    function getAccountRoles(address account) external view returns (bytes32[] memory);
    
    // Role Constants (to be implemented in the contract)
    function SUPER_ADMIN_ROLE() external pure returns (bytes32);
    function ADMIN_ROLE() external pure returns (bytes32);
    function OPERATOR_ROLE() external pure returns (bytes32);
    function EMERGENCY_ROLE() external pure returns (bytes32);
    function GOVERNANCE_ROLE() external pure returns (bytes32);
}