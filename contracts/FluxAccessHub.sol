// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IFluxAccessHub.sol";

/**
 * @title FluxAccessHub
 * @dev Central access control hub for the Flux ecosystem
 */
contract FluxAccessHub is 
    IFluxAccessHub,
    AccessControl,
    Pausable,
    ReentrancyGuard 
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.UintSet;
    
    // Role definitions
    bytes32 public constant override SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant override ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant override OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant override EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    bytes32 public constant override GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    // State variables
    EmergencyLevel public currentEmergencyLevel;
    uint256 private _delegationIdCounter;
    uint256 private _operationNonce;
    
    // Contract registry
    mapping(address => ContractInfo) private _contracts;
    mapping(ContractType => EnumerableSet.AddressSet) private _contractsByType;
    EnumerableSet.AddressSet private _allContracts;
    
    // Time lock storage
    mapping(bytes32 => TimeLock) private _timeLocks;
    
    // Delegation storage
    mapping(uint256 => Delegation) private _delegations;
    mapping(address => EnumerableSet.UintSet) private _userDelegations;
    
    // Multi-sig storage
    MultiSigConfig private _multiSigConfig;
    mapping(bytes32 => mapping(address => bool)) private _multiSigApprovals;
    mapping(bytes32 => uint256) private _multiSigApprovalCount;
    
    // Role member tracking
    mapping(bytes32 => EnumerableSet.AddressSet) private _roleMembers;
    mapping(address => EnumerableSet.Bytes32Set) private _accountRoles;
    
    // Constants
    uint256 public constant MIN_TIMELOCK_DELAY = 1 hours;
    uint256 public constant MAX_DELEGATION_DURATION = 30 days;
    
    constructor() {
        // Set up role hierarchy
        _setRoleAdmin(SUPER_ADMIN_ROLE, SUPER_ADMIN_ROLE);
        _setRoleAdmin(ADMIN_ROLE, SUPER_ADMIN_ROLE);
        _setRoleAdmin(OPERATOR_ROLE, ADMIN_ROLE);
        _setRoleAdmin(EMERGENCY_ROLE, SUPER_ADMIN_ROLE);
        _setRoleAdmin(GOVERNANCE_ROLE, SUPER_ADMIN_ROLE);
        
        // Grant initial roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SUPER_ADMIN_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
        
        // Initialize emergency level
        currentEmergencyLevel = EmergencyLevel.NORMAL;
    }
    
    // Override AccessControl functions to track members
    function grantRole(bytes32 role, address account) public override(AccessControl, IFluxAccessHub) {
        super.grantRole(role, account);
        _roleMembers[role].add(account);
        _accountRoles[account].add(role);
        // Event emitted by parent
    }
    
    function revokeRole(bytes32 role, address account) public override(AccessControl, IFluxAccessHub) {
        super.revokeRole(role, account);
        _roleMembers[role].remove(account);
        _accountRoles[account].remove(role);
        // Event emitted by parent
    }
    
    function renounceRole(bytes32 role) external override {
        renounceRole(role, msg.sender);
        _roleMembers[role].remove(msg.sender);
        _accountRoles[msg.sender].remove(role);
    }
    
    // Multi-role functions
    function grantRoles(bytes32[] calldata roles, address account) external override {
        for (uint256 i = 0; i < roles.length; i++) {
            grantRole(roles[i], account);
        }
    }
    
    function revokeRoles(bytes32[] calldata roles, address account) external override {
        for (uint256 i = 0; i < roles.length; i++) {
            revokeRole(roles[i], account);
        }
    }
    
    function hasAllRoles(address account, bytes32[] calldata roles) external view override returns (bool) {
        for (uint256 i = 0; i < roles.length; i++) {
            if (!hasRole(roles[i], account)) {
                return false;
            }
        }
        return true;
    }
    
    function hasAnyRole(address account, bytes32[] calldata roles) external view override returns (bool) {
        for (uint256 i = 0; i < roles.length; i++) {
            if (hasRole(roles[i], account)) {
                return true;
            }
        }
        return false;
    }
    
    // Contract registry functions
    function registerContract(
        address contractAddress,
        ContractType contractType
    ) external override onlyRole(ADMIN_ROLE) {
        require(contractAddress != address(0), "Invalid contract address");
        require(!_allContracts.contains(contractAddress), "Contract already registered");
        
        _contracts[contractAddress] = ContractInfo({
            contractAddress: contractAddress,
            contractType: contractType,
            isActive: true,
            version: 1,
            registeredAt: block.timestamp
        });
        
        _allContracts.add(contractAddress);
        _contractsByType[contractType].add(contractAddress);
        
        emit ContractRegistered(contractAddress, contractType, 1);
    }
    
    function deactivateContract(address contractAddress) external override onlyRole(ADMIN_ROLE) {
        require(_allContracts.contains(contractAddress), "Contract not registered");
        
        _contracts[contractAddress].isActive = false;
        emit ContractDeactivated(contractAddress);
    }
    
    function updateContract(
        address oldContract,
        address newContract
    ) external override onlyRole(ADMIN_ROLE) {
        require(_allContracts.contains(oldContract), "Old contract not registered");
        require(!_allContracts.contains(newContract), "New contract already registered");
        
        ContractInfo memory oldInfo = _contracts[oldContract];
        
        // Deactivate old contract
        _contracts[oldContract].isActive = false;
        
        // Register new contract
        _contracts[newContract] = ContractInfo({
            contractAddress: newContract,
            contractType: oldInfo.contractType,
            isActive: true,
            version: oldInfo.version + 1,
            registeredAt: block.timestamp
        });
        
        _allContracts.add(newContract);
        _contractsByType[oldInfo.contractType].add(newContract);
        
        emit ContractUpdated(oldContract, newContract, oldInfo.version + 1);
    }
    
    // Time lock functions
    function scheduleOperation(
        address target,
        bytes calldata data,
        uint256 delay
    ) external override onlyRole(ADMIN_ROLE) returns (bytes32 operationId) {
        require(delay >= MIN_TIMELOCK_DELAY, "Delay too short");
        
        operationId = keccak256(abi.encode(target, data, _operationNonce++));
        
        _timeLocks[operationId] = TimeLock({
            operationId: operationId,
            target: target,
            data: data,
            executeAfter: block.timestamp + delay,
            executed: false,
            cancelled: false
        });
        
        emit OperationScheduled(operationId, target, block.timestamp + delay);
    }
    
    function executeOperation(bytes32 operationId) external override nonReentrant {
        TimeLock storage operation = _timeLocks[operationId];
        
        require(operation.target != address(0), "Operation not found");
        require(!operation.executed, "Already executed");
        require(!operation.cancelled, "Operation cancelled");
        require(block.timestamp >= operation.executeAfter, "Too early");
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(SUPER_ADMIN_ROLE, msg.sender), "Unauthorized");
        
        operation.executed = true;
        
        (bool success, ) = operation.target.call(operation.data);
        require(success, "Operation failed");
        
        emit OperationExecuted(operationId, msg.sender);
    }
    
    function cancelOperation(bytes32 operationId) external override onlyRole(SUPER_ADMIN_ROLE) {
        TimeLock storage operation = _timeLocks[operationId];
        
        require(operation.target != address(0), "Operation not found");
        require(!operation.executed, "Already executed");
        require(!operation.cancelled, "Already cancelled");
        
        operation.cancelled = true;
        
        emit OperationCancelled(operationId, msg.sender);
    }
    
    // Delegation functions
    function delegateRole(
        address delegatee,
        bytes32 role,
        uint256 duration,
        bytes32[] calldata allowedFunctions
    ) external override returns (uint256 delegationId) {
        require(hasRole(role, msg.sender), "Cannot delegate role you don't have");
        require(delegatee != address(0), "Invalid delegatee");
        require(duration <= MAX_DELEGATION_DURATION, "Duration too long");
        require(role != SUPER_ADMIN_ROLE && role != DEFAULT_ADMIN_ROLE, "Cannot delegate admin roles");
        
        delegationId = _delegationIdCounter++;
        
        _delegations[delegationId] = Delegation({
            delegator: msg.sender,
            delegatee: delegatee,
            role: role,
            expiresAt: block.timestamp + duration,
            allowedFunctions: allowedFunctions,
            isActive: true
        });
        
        _userDelegations[delegatee].add(delegationId);
        
        emit DelegationCreated(msg.sender, delegatee, role, block.timestamp + duration);
    }
    
    function revokeDelegation(uint256 delegationId) external override {
        Delegation storage delegation = _delegations[delegationId];
        
        require(delegation.delegator == msg.sender || hasRole(ADMIN_ROLE, msg.sender), "Unauthorized");
        require(delegation.isActive, "Delegation not active");
        
        delegation.isActive = false;
        _userDelegations[delegation.delegatee].remove(delegationId);
        
        emit DelegationRevoked(delegation.delegator, delegation.delegatee, delegation.role);
    }
    
    // Emergency functions
    function setEmergencyLevel(EmergencyLevel level) external override onlyRole(EMERGENCY_ROLE) {
        EmergencyLevel oldLevel = currentEmergencyLevel;
        currentEmergencyLevel = level;
        
        emit EmergencyLevelChanged(oldLevel, level, msg.sender);
        
        // Auto-pause all contracts if FROZEN
        if (level == EmergencyLevel.FROZEN) {
            pauseAllContracts();
        }
    }
    
    function executeEmergencyAction(
        string calldata action,
        bytes calldata data
    ) external override onlyRole(EMERGENCY_ROLE) {
        require(
            currentEmergencyLevel == EmergencyLevel.PAUSED || 
            currentEmergencyLevel == EmergencyLevel.FROZEN,
            "Not in emergency state"
        );
        
        emit EmergencyActionExecuted(msg.sender, action, data);
        
        // Execute specific emergency actions based on the action string
        // This is a placeholder for specific emergency logic
    }
    
    function pauseContract(address contractAddress) external override onlyRole(OPERATOR_ROLE) {
        require(_allContracts.contains(contractAddress), "Contract not registered");
        
        // Call pause on the target contract
        (bool success, ) = contractAddress.call(abi.encodeWithSignature("pause()"));
        require(success, "Pause failed");
    }
    
    function unpauseContract(address contractAddress) external override onlyRole(OPERATOR_ROLE) {
        require(_allContracts.contains(contractAddress), "Contract not registered");
        
        // Call unpause on the target contract
        (bool success, ) = contractAddress.call(abi.encodeWithSignature("unpause()"));
        require(success, "Unpause failed");
    }
    
    function pauseAllContracts() public override onlyRole(EMERGENCY_ROLE) {
        address[] memory contracts = _allContracts.values();
        for (uint256 i = 0; i < contracts.length; i++) {
            if (_contracts[contracts[i]].isActive) {
                (bool success, ) = contracts[i].call(abi.encodeWithSignature("pause()"));
                // Continue even if some fail
            }
        }
    }
    
    function unpauseAllContracts() external override onlyRole(EMERGENCY_ROLE) {
        require(currentEmergencyLevel == EmergencyLevel.NORMAL, "Still in emergency");
        
        address[] memory contracts = _allContracts.values();
        for (uint256 i = 0; i < contracts.length; i++) {
            if (_contracts[contracts[i]].isActive) {
                (bool success, ) = contracts[i].call(abi.encodeWithSignature("unpause()"));
                // Continue even if some fail
            }
        }
    }
    
    // Multi-signature functions
    function setMultiSigConfig(
        uint256 requiredSignatures,
        address[] calldata signers
    ) external override onlyRole(SUPER_ADMIN_ROLE) {
        require(requiredSignatures > 0 && requiredSignatures <= signers.length, "Invalid config");
        
        _multiSigConfig = MultiSigConfig({
            requiredSignatures: requiredSignatures,
            executionDelay: 24 hours,
            signers: signers
        });
    }
    
    function proposeMultiSigOperation(
        address target,
        bytes calldata data
    ) external override returns (bytes32 proposalId) {
        require(_isMultiSigSigner(msg.sender), "Not a signer");
        
        proposalId = keccak256(abi.encode(target, data, block.timestamp));
        _multiSigApprovals[proposalId][msg.sender] = true;
        _multiSigApprovalCount[proposalId] = 1;
        
        return proposalId;
    }
    
    function approveMultiSigOperation(bytes32 proposalId) external override {
        require(_isMultiSigSigner(msg.sender), "Not a signer");
        require(!_multiSigApprovals[proposalId][msg.sender], "Already approved");
        
        _multiSigApprovals[proposalId][msg.sender] = true;
        _multiSigApprovalCount[proposalId]++;
    }
    
    function executeMultiSigOperation(bytes32 proposalId) external override {
        require(
            _multiSigApprovalCount[proposalId] >= _multiSigConfig.requiredSignatures,
            "Insufficient approvals"
        );
        
        // Implementation would execute the operation
        // This is simplified for the example
    }
    
    // View functions
    function hasRole(bytes32 role, address account) public view override(AccessControl, IFluxAccessHub) returns (bool) {
        // Check direct role
        if (super.hasRole(role, account)) {
            return true;
        }
        
        // Check active delegations
        uint256[] memory delegationIds = _userDelegations[account].values();
        for (uint256 i = 0; i < delegationIds.length; i++) {
            Delegation memory delegation = _delegations[delegationIds[i]];
            if (
                delegation.isActive &&
                delegation.role == role &&
                block.timestamp < delegation.expiresAt
            ) {
                return true;
            }
        }
        
        return false;
    }
    
    function hasRoleInContract(
        address account,
        bytes32 role,
        address contractAddress
    ) external view override returns (bool) {
        if (!_contracts[contractAddress].isActive) {
            return false;
        }
        return hasRole(role, account);
    }
    
    function getContractInfo(address contractAddress) external view override returns (ContractInfo memory) {
        return _contracts[contractAddress];
    }
    
    function isContractActive(address contractAddress) external view override returns (bool) {
        return _contracts[contractAddress].isActive;
    }
    
    function getContractsByType(ContractType contractType) external view override returns (address[] memory) {
        return _contractsByType[contractType].values();
    }
    
    function getOperationState(bytes32 operationId) external view override returns (TimeLock memory) {
        return _timeLocks[operationId];
    }
    
    function isOperationPending(bytes32 operationId) external view override returns (bool) {
        TimeLock memory operation = _timeLocks[operationId];
        return operation.target != address(0) && !operation.executed && !operation.cancelled;
    }
    
    function isOperationReady(bytes32 operationId) external view override returns (bool) {
        TimeLock memory operation = _timeLocks[operationId];
        return operation.target != address(0) && 
               !operation.executed && 
               !operation.cancelled &&
               block.timestamp >= operation.executeAfter;
    }
    
    function isDelegationActive(uint256 delegationId) external view override returns (bool) {
        Delegation memory delegation = _delegations[delegationId];
        return delegation.isActive && block.timestamp < delegation.expiresAt;
    }
    
    function getDelegation(uint256 delegationId) external view override returns (Delegation memory) {
        return _delegations[delegationId];
    }
    
    function getActiveDelegations(address account) external view override returns (uint256[] memory) {
        return _userDelegations[account].values();
    }
    
    function getEmergencyLevel() external view override returns (EmergencyLevel) {
        return currentEmergencyLevel;
    }
    
    function getMultiSigConfig() external view override returns (MultiSigConfig memory) {
        return _multiSigConfig;
    }
    
    function getRoleMemberCount(bytes32 role) external view override returns (uint256) {
        return _roleMembers[role].length();
    }
    
    function getRoleMember(bytes32 role, uint256 index) external view override returns (address) {
        return _roleMembers[role].at(index);
    }
    
    function getAllRoleMembers(bytes32 role) external view override returns (address[] memory) {
        return _roleMembers[role].values();
    }
    
    function getAccountRoles(address account) external view override returns (bytes32[] memory) {
        return _accountRoles[account].values();
    }
    
    // Internal functions
    function _isMultiSigSigner(address account) private view returns (bool) {
        for (uint256 i = 0; i < _multiSigConfig.signers.length; i++) {
            if (_multiSigConfig.signers[i] == account) {
                return true;
            }
        }
        return false;
    }
}