const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("FluxAccessHub", function () {
  // Constants
  const MIN_TIMELOCK_DELAY = 3600; // 1 hour in seconds
  const MAX_DELEGATION_DURATION = 30 * 24 * 3600; // 30 days in seconds
  
  // EmergencyLevel enum
  const EmergencyLevel = {
    NORMAL: 0,
    RESTRICTED: 1,
    PAUSED: 2,
    FROZEN: 3
  };
  
  // ContractType enum
  const ContractType = {
    TOKEN: 0,
    NFT: 1,
    MARKETPLACE: 2,
    STAKING: 3,
    GOVERNANCE: 4,
    OTHER: 5
  };

  // Fixture
  async function deployAccessHubFixture() {
    const [owner, admin, operator, emergency, user1, user2, user3] = await ethers.getSigners();

    const FluxAccessHub = await ethers.getContractFactory("FluxAccessHub");
    const accessHub = await FluxAccessHub.deploy();
    
    // Get role constants
    const SUPER_ADMIN_ROLE = await accessHub.SUPER_ADMIN_ROLE();
    const ADMIN_ROLE = await accessHub.ADMIN_ROLE();
    const OPERATOR_ROLE = await accessHub.OPERATOR_ROLE();
    const EMERGENCY_ROLE = await accessHub.EMERGENCY_ROLE();
    const GOVERNANCE_ROLE = await accessHub.GOVERNANCE_ROLE();
    
    // Set up additional roles
    // Owner already has SUPER_ADMIN_ROLE which can grant ADMIN_ROLE
    await accessHub.grantRole(ADMIN_ROLE, admin.address);
    // Admin can grant OPERATOR_ROLE
    await accessHub.connect(admin).grantRole(OPERATOR_ROLE, operator.address);
    // Owner grants EMERGENCY_ROLE
    await accessHub.grantRole(EMERGENCY_ROLE, emergency.address);
    
    return { 
      accessHub, 
      owner, 
      admin, 
      operator,
      emergency,
      user1, 
      user2,
      user3,
      SUPER_ADMIN_ROLE,
      ADMIN_ROLE,
      OPERATOR_ROLE,
      EMERGENCY_ROLE,
      GOVERNANCE_ROLE
    };
  }

  describe("Deployment", function () {
    it("Should set up initial roles correctly", async function () {
      const { accessHub, owner, SUPER_ADMIN_ROLE, EMERGENCY_ROLE } = await loadFixture(deployAccessHubFixture);
      
      const DEFAULT_ADMIN_ROLE = await accessHub.DEFAULT_ADMIN_ROLE();
      
      expect(await accessHub.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await accessHub.hasRole(SUPER_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await accessHub.hasRole(EMERGENCY_ROLE, owner.address)).to.be.true;
    });

    it("Should set correct role admins", async function () {
      const { accessHub, SUPER_ADMIN_ROLE, ADMIN_ROLE, OPERATOR_ROLE } = await loadFixture(deployAccessHubFixture);
      
      expect(await accessHub.getRoleAdmin(ADMIN_ROLE)).to.equal(SUPER_ADMIN_ROLE);
      expect(await accessHub.getRoleAdmin(OPERATOR_ROLE)).to.equal(ADMIN_ROLE);
    });

    it("Should start with NORMAL emergency level", async function () {
      const { accessHub } = await loadFixture(deployAccessHubFixture);
      
      expect(await accessHub.currentEmergencyLevel()).to.equal(EmergencyLevel.NORMAL);
    });
  });

  describe("Role Management", function () {
    it("Should grant and revoke roles", async function () {
      const { accessHub, admin, user1, OPERATOR_ROLE } = await loadFixture(deployAccessHubFixture);
      
      await expect(accessHub.connect(admin).grantRole(OPERATOR_ROLE, user1.address))
        .to.emit(accessHub, "RoleGranted")
        .withArgs(OPERATOR_ROLE, user1.address, admin.address);
      
      expect(await accessHub.hasRole(OPERATOR_ROLE, user1.address)).to.be.true;
      
      await expect(accessHub.connect(admin).revokeRole(OPERATOR_ROLE, user1.address))
        .to.emit(accessHub, "RoleRevoked")
        .withArgs(OPERATOR_ROLE, user1.address, admin.address);
      
      expect(await accessHub.hasRole(OPERATOR_ROLE, user1.address)).to.be.false;
    });

    it("Should grant multiple roles", async function () {
      const { accessHub, owner, user1, SUPER_ADMIN_ROLE, ADMIN_ROLE, GOVERNANCE_ROLE } = await loadFixture(deployAccessHubFixture);
      
      // Owner with SUPER_ADMIN can grant these roles
      const roles = [ADMIN_ROLE, GOVERNANCE_ROLE];
      
      await accessHub.connect(owner).grantRoles(roles, user1.address);
      
      expect(await accessHub.hasAllRoles(user1.address, roles)).to.be.true;
    });

    it("Should track role members", async function () {
      const { accessHub, admin, user1, user2, OPERATOR_ROLE } = await loadFixture(deployAccessHubFixture);
      
      await accessHub.connect(admin).grantRole(OPERATOR_ROLE, user1.address);
      await accessHub.connect(admin).grantRole(OPERATOR_ROLE, user2.address);
      
      expect(await accessHub.getRoleMemberCount(OPERATOR_ROLE)).to.equal(3); // operator + user1 + user2
      
      const members = await accessHub.getAllRoleMembers(OPERATOR_ROLE);
      expect(members).to.include(user1.address);
      expect(members).to.include(user2.address);
    });

    it("Should track account roles", async function () {
      const { accessHub, owner, admin, user1, ADMIN_ROLE, OPERATOR_ROLE, GOVERNANCE_ROLE } = await loadFixture(deployAccessHubFixture);
      
      await accessHub.connect(owner).grantRole(ADMIN_ROLE, user1.address);
      await accessHub.connect(owner).grantRole(GOVERNANCE_ROLE, user1.address);
      
      const roles = await accessHub.getAccountRoles(user1.address);
      expect(roles.length).to.equal(2);
    });
  });

  describe("Contract Registry", function () {
    it("Should register contracts", async function () {
      const { accessHub, admin, user1 } = await loadFixture(deployAccessHubFixture);
      
      const contractAddress = user1.address; // Using user1 address as dummy contract
      
      await expect(accessHub.connect(admin).registerContract(contractAddress, ContractType.TOKEN))
        .to.emit(accessHub, "ContractRegistered")
        .withArgs(contractAddress, ContractType.TOKEN, 1);
      
      const info = await accessHub.getContractInfo(contractAddress);
      expect(info.contractAddress).to.equal(contractAddress);
      expect(info.contractType).to.equal(ContractType.TOKEN);
      expect(info.isActive).to.be.true;
      expect(info.version).to.equal(1);
    });

    it("Should deactivate contracts", async function () {
      const { accessHub, admin, user1 } = await loadFixture(deployAccessHubFixture);
      
      const contractAddress = user1.address;
      await accessHub.connect(admin).registerContract(contractAddress, ContractType.TOKEN);
      
      await expect(accessHub.connect(admin).deactivateContract(contractAddress))
        .to.emit(accessHub, "ContractDeactivated")
        .withArgs(contractAddress);
      
      expect(await accessHub.isContractActive(contractAddress)).to.be.false;
    });

    it("Should update contracts", async function () {
      const { accessHub, admin, user1, user2 } = await loadFixture(deployAccessHubFixture);
      
      const oldContract = user1.address;
      const newContract = user2.address;
      
      await accessHub.connect(admin).registerContract(oldContract, ContractType.NFT);
      
      await expect(accessHub.connect(admin).updateContract(oldContract, newContract))
        .to.emit(accessHub, "ContractUpdated")
        .withArgs(oldContract, newContract, 2);
      
      expect(await accessHub.isContractActive(oldContract)).to.be.false;
      expect(await accessHub.isContractActive(newContract)).to.be.true;
      
      const newInfo = await accessHub.getContractInfo(newContract);
      expect(newInfo.version).to.equal(2);
    });

    it("Should get contracts by type", async function () {
      const { accessHub, admin, user1, user2 } = await loadFixture(deployAccessHubFixture);
      
      await accessHub.connect(admin).registerContract(user1.address, ContractType.TOKEN);
      await accessHub.connect(admin).registerContract(user2.address, ContractType.TOKEN);
      
      const tokenContracts = await accessHub.getContractsByType(ContractType.TOKEN);
      expect(tokenContracts).to.have.lengthOf(2);
      expect(tokenContracts).to.include(user1.address);
      expect(tokenContracts).to.include(user2.address);
    });
  });

  describe("Time Lock", function () {
    it("Should schedule operations", async function () {
      const { accessHub, admin, user1 } = await loadFixture(deployAccessHubFixture);
      
      const target = user1.address;
      const data = "0x12345678";
      const delay = MIN_TIMELOCK_DELAY;
      
      const tx = await accessHub.connect(admin).scheduleOperation(target, data, delay);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === 'OperationScheduled');
      const operationId = event.args[0];
      
      expect(await accessHub.isOperationPending(operationId)).to.be.true;
      expect(await accessHub.isOperationReady(operationId)).to.be.false;
    });

    it("Should execute operations after delay", async function () {
      const { accessHub, admin } = await loadFixture(deployAccessHubFixture);
      
      // Use a simple target and data for testing
      const target = admin.address;
      const data = "0x"; // Empty data for simple call
      const delay = MIN_TIMELOCK_DELAY;
      
      // Schedule operation
      const tx = await accessHub.connect(admin).scheduleOperation(target, data, delay);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === 'OperationScheduled');
      const operationId = event.args[0];
      
      // Should fail before delay
      await expect(accessHub.connect(admin).executeOperation(operationId))
        .to.be.revertedWith("Too early");
      
      // Fast forward time
      await time.increase(delay);
      
      // Should succeed after delay
      await expect(accessHub.connect(admin).executeOperation(operationId))
        .to.emit(accessHub, "OperationExecuted")
        .withArgs(operationId, admin.address);
      
      const operation = await accessHub.getOperationState(operationId);
      expect(operation.executed).to.be.true;
    });

    it("Should cancel operations", async function () {
      const { accessHub, owner, admin, user1 } = await loadFixture(deployAccessHubFixture);
      
      const target = user1.address;
      const data = "0x12345678";
      const delay = MIN_TIMELOCK_DELAY;
      
      const tx = await accessHub.connect(admin).scheduleOperation(target, data, delay);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === 'OperationScheduled');
      const operationId = event.args[0];
      
      await expect(accessHub.connect(owner).cancelOperation(operationId))
        .to.emit(accessHub, "OperationCancelled")
        .withArgs(operationId, owner.address);
      
      const operation = await accessHub.getOperationState(operationId);
      expect(operation.cancelled).to.be.true;
    });
  });

  describe("Delegation", function () {
    it("Should delegate roles", async function () {
      const { accessHub, operator, user1, OPERATOR_ROLE } = await loadFixture(deployAccessHubFixture);
      
      const duration = 7 * 24 * 3600; // 7 days
      const allowedFunctions = [ethers.id("pause()"), ethers.id("unpause()")];
      
      const tx = await accessHub.connect(operator).delegateRole(
        user1.address,
        OPERATOR_ROLE,
        duration,
        allowedFunctions
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment?.name === 'DelegationCreated');
      
      expect(await accessHub.hasRole(OPERATOR_ROLE, user1.address)).to.be.true;
      
      const delegationId = 0;
      expect(await accessHub.isDelegationActive(delegationId)).to.be.true;
      
      const delegation = await accessHub.getDelegation(delegationId);
      expect(delegation.delegator).to.equal(operator.address);
      expect(delegation.delegatee).to.equal(user1.address);
      expect(delegation.role).to.equal(OPERATOR_ROLE);
    });

    it("Should revoke delegations", async function () {
      const { accessHub, operator, user1, OPERATOR_ROLE } = await loadFixture(deployAccessHubFixture);
      
      const duration = 7 * 24 * 3600;
      await accessHub.connect(operator).delegateRole(user1.address, OPERATOR_ROLE, duration, []);
      
      const delegationId = 0;
      
      await expect(accessHub.connect(operator).revokeDelegation(delegationId))
        .to.emit(accessHub, "DelegationRevoked")
        .withArgs(operator.address, user1.address, OPERATOR_ROLE);
      
      expect(await accessHub.isDelegationActive(delegationId)).to.be.false;
    });

    it("Should expire delegations", async function () {
      const { accessHub, operator, user1, OPERATOR_ROLE } = await loadFixture(deployAccessHubFixture);
      
      const duration = 1 * 24 * 3600; // 1 day
      await accessHub.connect(operator).delegateRole(user1.address, OPERATOR_ROLE, duration, []);
      
      expect(await accessHub.hasRole(OPERATOR_ROLE, user1.address)).to.be.true;
      
      // Fast forward past expiration
      await time.increase(duration + 1);
      
      expect(await accessHub.hasRole(OPERATOR_ROLE, user1.address)).to.be.false;
    });

    it("Should not delegate admin roles", async function () {
      const { accessHub, owner, user1, SUPER_ADMIN_ROLE } = await loadFixture(deployAccessHubFixture);
      
      await expect(
        accessHub.connect(owner).delegateRole(user1.address, SUPER_ADMIN_ROLE, 3600, [])
      ).to.be.revertedWith("Cannot delegate admin roles");
    });
  });

  describe("Emergency Functions", function () {
    it("Should set emergency level", async function () {
      const { accessHub, emergency } = await loadFixture(deployAccessHubFixture);
      
      await expect(accessHub.connect(emergency).setEmergencyLevel(EmergencyLevel.PAUSED))
        .to.emit(accessHub, "EmergencyLevelChanged")
        .withArgs(EmergencyLevel.NORMAL, EmergencyLevel.PAUSED, emergency.address);
      
      expect(await accessHub.getEmergencyLevel()).to.equal(EmergencyLevel.PAUSED);
    });

    it("Should execute emergency actions when paused", async function () {
      const { accessHub, emergency } = await loadFixture(deployAccessHubFixture);
      
      await accessHub.connect(emergency).setEmergencyLevel(EmergencyLevel.PAUSED);
      
      const action = "pauseAllTransfers";
      const data = "0x";
      
      await expect(accessHub.connect(emergency).executeEmergencyAction(action, data))
        .to.emit(accessHub, "EmergencyActionExecuted")
        .withArgs(emergency.address, action, data);
    });

    it("Should not execute emergency actions in normal state", async function () {
      const { accessHub, emergency } = await loadFixture(deployAccessHubFixture);
      
      await expect(
        accessHub.connect(emergency).executeEmergencyAction("test", "0x")
      ).to.be.revertedWith("Not in emergency state");
    });

    it("Should pause individual contracts", async function () {
      const { accessHub, admin, operator } = await loadFixture(deployAccessHubFixture);
      
      // Deploy and register a pausable contract
      const FluxToken = await ethers.getContractFactory("FluxToken");
      const token = await FluxToken.deploy(
        admin.address,
        admin.address,
        admin.address,
        admin.address,
        admin.address
      );
      
      await accessHub.connect(admin).registerContract(token.target, ContractType.TOKEN);
      
      // Grant pauser role to access hub
      const PAUSER_ROLE = await token.PAUSER_ROLE();
      await token.grantRole(PAUSER_ROLE, accessHub.target);
      
      // Pause via access hub
      await accessHub.connect(operator).pauseContract(token.target);
      
      expect(await token.paused()).to.be.true;
    });
  });

  describe("Multi-Signature", function () {
    it("Should set multi-sig config", async function () {
      const { accessHub, owner, user1, user2, user3 } = await loadFixture(deployAccessHubFixture);
      
      const signers = [user1.address, user2.address, user3.address];
      const requiredSignatures = 2;
      
      await accessHub.connect(owner).setMultiSigConfig(requiredSignatures, signers);
      
      const config = await accessHub.getMultiSigConfig();
      expect(config.requiredSignatures).to.equal(requiredSignatures);
      expect(config.signers).to.deep.equal(signers);
    });

    it("Should propose multi-sig operations", async function () {
      const { accessHub, owner, user1, user2, user3 } = await loadFixture(deployAccessHubFixture);
      
      // Set up multi-sig
      const signers = [user1.address, user2.address, user3.address];
      await accessHub.connect(owner).setMultiSigConfig(2, signers);
      
      // Propose operation
      const target = user3.address;
      const data = "0x12345678";
      
      const proposalId = await accessHub.connect(user1).proposeMultiSigOperation.staticCall(target, data);
      await accessHub.connect(user1).proposeMultiSigOperation(target, data);
      
      // Should have 1 approval (proposer)
      // Note: Full multi-sig implementation would need more functions
    });
  });

  describe("Access Control Integration", function () {
    it("Should check roles with delegations", async function () {
      const { accessHub, operator, user1, OPERATOR_ROLE } = await loadFixture(deployAccessHubFixture);
      
      // User1 doesn't have direct role
      expect(await accessHub.hasRole(OPERATOR_ROLE, user1.address)).to.be.false;
      
      // Delegate role
      await accessHub.connect(operator).delegateRole(user1.address, OPERATOR_ROLE, 3600, []);
      
      // Now user1 has role via delegation
      expect(await accessHub.hasRole(OPERATOR_ROLE, user1.address)).to.be.true;
    });

    it("Should check role in contract", async function () {
      const { accessHub, admin, operator, user1 } = await loadFixture(deployAccessHubFixture);
      
      // Register a contract
      await accessHub.connect(admin).registerContract(user1.address, ContractType.TOKEN);
      
      // Check role for active contract
      expect(await accessHub.hasRoleInContract(operator.address, await accessHub.OPERATOR_ROLE(), user1.address)).to.be.true;
      
      // Deactivate contract
      await accessHub.connect(admin).deactivateContract(user1.address);
      
      // Should return false for inactive contract
      expect(await accessHub.hasRoleInContract(operator.address, await accessHub.OPERATOR_ROLE(), user1.address)).to.be.false;
    });
  });
});