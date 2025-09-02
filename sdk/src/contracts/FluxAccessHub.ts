import { ethers } from 'ethers';
import { BaseContract } from './BaseContract';
import { 
  Address, 
  TransactionOptions, 
  RoleInfo,
  TimeLock,
  Delegation
} from '../types';
import { DEFAULT_ADMIN_ROLE } from '../constants';
import { handleError } from '../utils';
import FluxAccessHubABI from '../abis/FluxAccessHub.json';

export class FluxAccessHub extends BaseContract {
  constructor(
    address: Address,
    signerOrProvider: ethers.Signer | ethers.Provider
  ) {
    super(address, FluxAccessHubABI.abi, signerOrProvider);
  }

  // Read methods
  async hasRole(role: string, account: Address): Promise<boolean> {
    try {
      return await this.call<boolean>('hasRole', role, account);
    } catch (error) {
      return handleError(error);
    }
  }

  async getRoleAdmin(role: string): Promise<string> {
    try {
      return await this.call<string>('getRoleAdmin', role);
    } catch (error) {
      return handleError(error);
    }
  }

  async getRoleMemberCount(role: string): Promise<bigint> {
    try {
      return await this.call<bigint>('getRoleMemberCount', role);
    } catch (error) {
      return handleError(error);
    }
  }

  async getRoleMember(role: string, index: bigint): Promise<Address> {
    try {
      return await this.call<Address>('getRoleMember', role, index);
    } catch (error) {
      return handleError(error);
    }
  }

  async getAllRoleMembers(role: string): Promise<Address[]> {
    try {
      const count = await this.getRoleMemberCount(role);
      const members: Address[] = [];
      
      for (let i = BigInt(0); i < count; i++) {
        const member = await this.getRoleMember(role, i);
        members.push(member);
      }
      
      return members;
    } catch (error) {
      return handleError(error);
    }
  }

  async getRoleInfo(role: string): Promise<RoleInfo> {
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
    } catch (error) {
      return handleError(error);
    }
  }

  async timeLockDelay(): Promise<bigint> {
    try {
      return await this.call<bigint>('timeLockDelay');
    } catch (error) {
      return handleError(error);
    }
  }

  async maxDelegationDuration(): Promise<bigint> {
    try {
      return await this.call<bigint>('maxDelegationDuration');
    } catch (error) {
      return handleError(error);
    }
  }

  async emergencyMode(): Promise<boolean> {
    try {
      return await this.call<boolean>('emergencyMode');
    } catch (error) {
      return handleError(error);
    }
  }

  async getTimeLock(id: string): Promise<TimeLock | null> {
    try {
      const lock = await this.call<any>('timeLocks', id);
      
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
    } catch (error) {
      return handleError(error);
    }
  }

  async getDelegation(delegator: Address, role: string): Promise<Delegation | null> {
    try {
      const delegation = await this.call<any>('delegations', delegator, role);
      
      if (delegation.delegatee === ethers.ZeroAddress) {
        return null;
      }

      return {
        delegator,
        delegatee: delegation.delegatee,
        role,
        expiresAt: delegation.expiresAt,
        revoked: delegation.revoked,
      };
    } catch (error) {
      return handleError(error);
    }
  }

  async isDelegationActive(delegator: Address, role: string): Promise<boolean> {
    try {
      const delegation = await this.getDelegation(delegator, role);
      
      if (!delegation || delegation.revoked) {
        return false;
      }
      
      return delegation.expiresAt > BigInt(Math.floor(Date.now() / 1000));
    } catch (error) {
      return handleError(error);
    }
  }

  // Write methods
  async grantRole(
    role: string,
    account: Address,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('grantRole', [role, account], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async revokeRole(
    role: string,
    account: Address,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('revokeRole', [role, account], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async renounceRole(
    role: string,
    callerConfirmation: Address,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('renounceRole', [role, callerConfirmation], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async createRoleHierarchy(
    parentRole: string,
    childRole: string,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('createRoleHierarchy', [parentRole, childRole], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async scheduleTimeLock(
    target: Address,
    data: string,
    executionTime: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction(
        'scheduleTimeLock',
        [target, data, executionTime],
        options
      );
    } catch (error) {
      return handleError(error);
    }
  }

  async executeTimeLock(
    id: string,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('executeTimeLock', [id], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async cancelTimeLock(
    id: string,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('cancelTimeLock', [id], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async delegateRole(
    role: string,
    delegatee: Address,
    duration: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('delegateRole', [role, delegatee, duration], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async revokeDelegation(
    role: string,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('revokeDelegation', [role], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async setTimeLockDelay(
    newDelay: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('setTimeLockDelay', [newDelay], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async setMaxDelegationDuration(
    newDuration: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('setMaxDelegationDuration', [newDuration], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async setEmergencyMode(
    enabled: boolean,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('setEmergencyMode', [enabled], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async emergencyRevokeRole(
    role: string,
    account: Address,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('emergencyRevokeRole', [role, account], options);
    } catch (error) {
      return handleError(error);
    }
  }

  // Helper methods
  async isAdmin(account: Address): Promise<boolean> {
    return this.hasRole(DEFAULT_ADMIN_ROLE, account);
  }

  async canGrantRole(granter: Address, role: string): Promise<boolean> {
    const adminRole = await this.getRoleAdmin(role);
    return this.hasRole(adminRole, granter);
  }

  generateTimeLockId(target: Address, data: string, executionTime: bigint): string {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['address', 'bytes', 'uint256'],
        [target, data, executionTime]
      )
    );
  }

  calculateExecutionTime(delayInSeconds: number): bigint {
    return BigInt(Math.floor(Date.now() / 1000) + delayInSeconds);
  }
}