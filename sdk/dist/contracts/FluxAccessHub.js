"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxAccessHub = void 0;
const ethers_1 = require("ethers");
const BaseContract_1 = require("./BaseContract");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const FluxAccessHub_json_1 = __importDefault(require("../abis/FluxAccessHub.json"));
class FluxAccessHub extends BaseContract_1.BaseContract {
    constructor(address, signerOrProvider) {
        super(address, FluxAccessHub_json_1.default.abi, signerOrProvider);
    }
    // Read methods
    async hasRole(role, account) {
        try {
            return await this.call('hasRole', role, account);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getRoleAdmin(role) {
        try {
            return await this.call('getRoleAdmin', role);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getRoleMemberCount(role) {
        try {
            return await this.call('getRoleMemberCount', role);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getRoleMember(role, index) {
        try {
            return await this.call('getRoleMember', role, index);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getAllRoleMembers(role) {
        try {
            const count = await this.getRoleMemberCount(role);
            const members = [];
            for (let i = BigInt(0); i < count; i++) {
                const member = await this.getRoleMember(role, i);
                members.push(member);
            }
            return members;
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getRoleInfo(role) {
        try {
            const [adminRole, members] = await Promise.all([
                this.getRoleAdmin(role),
                this.getAllRoleMembers(role),
            ]);
            return {
                role,
                adminRole,
                members,
            };
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async timeLockDelay() {
        try {
            return await this.call('timeLockDelay');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async maxDelegationDuration() {
        try {
            return await this.call('maxDelegationDuration');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async emergencyMode() {
        try {
            return await this.call('emergencyMode');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getTimeLock(id) {
        try {
            const lock = await this.call('timeLocks', id);
            if (lock.executionTime === BigInt(0)) {
                return null;
            }
            return {
                target: lock.target,
                data: lock.data,
                executionTime: lock.executionTime,
                executed: lock.executed,
                cancelled: lock.cancelled,
            };
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getDelegation(delegator, role) {
        try {
            const delegation = await this.call('delegations', delegator, role);
            if (delegation.delegatee === ethers_1.ethers.ZeroAddress) {
                return null;
            }
            return {
                delegator,
                delegatee: delegation.delegatee,
                role,
                expiresAt: delegation.expiresAt,
                revoked: delegation.revoked,
            };
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async isDelegationActive(delegator, role) {
        try {
            const delegation = await this.getDelegation(delegator, role);
            if (!delegation || delegation.revoked) {
                return false;
            }
            return delegation.expiresAt > BigInt(Math.floor(Date.now() / 1000));
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    // Write methods
    async grantRole(role, account, options) {
        try {
            return await this.sendTransaction('grantRole', [role, account], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async revokeRole(role, account, options) {
        try {
            return await this.sendTransaction('revokeRole', [role, account], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async renounceRole(role, callerConfirmation, options) {
        try {
            return await this.sendTransaction('renounceRole', [role, callerConfirmation], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async createRoleHierarchy(parentRole, childRole, options) {
        try {
            return await this.sendTransaction('createRoleHierarchy', [parentRole, childRole], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async scheduleTimeLock(target, data, executionTime, options) {
        try {
            return await this.sendTransaction('scheduleTimeLock', [target, data, executionTime], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async executeTimeLock(id, options) {
        try {
            return await this.sendTransaction('executeTimeLock', [id], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async cancelTimeLock(id, options) {
        try {
            return await this.sendTransaction('cancelTimeLock', [id], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async delegateRole(role, delegatee, duration, options) {
        try {
            return await this.sendTransaction('delegateRole', [role, delegatee, duration], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async revokeDelegation(role, options) {
        try {
            return await this.sendTransaction('revokeDelegation', [role], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async setTimeLockDelay(newDelay, options) {
        try {
            return await this.sendTransaction('setTimeLockDelay', [newDelay], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async setMaxDelegationDuration(newDuration, options) {
        try {
            return await this.sendTransaction('setMaxDelegationDuration', [newDuration], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async setEmergencyMode(enabled, options) {
        try {
            return await this.sendTransaction('setEmergencyMode', [enabled], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async emergencyRevokeRole(role, account, options) {
        try {
            return await this.sendTransaction('emergencyRevokeRole', [role, account], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    // Helper methods
    async isAdmin(account) {
        return this.hasRole(constants_1.DEFAULT_ADMIN_ROLE, account);
    }
    async canGrantRole(granter, role) {
        const adminRole = await this.getRoleAdmin(role);
        return this.hasRole(adminRole, granter);
    }
    generateTimeLockId(target, data, executionTime) {
        return ethers_1.ethers.keccak256(ethers_1.ethers.AbiCoder.defaultAbiCoder().encode(['address', 'bytes', 'uint256'], [target, data, executionTime]));
    }
    calculateExecutionTime(delayInSeconds) {
        return BigInt(Math.floor(Date.now() / 1000) + delayInSeconds);
    }
}
exports.FluxAccessHub = FluxAccessHub;
//# sourceMappingURL=FluxAccessHub.js.map