import { ethers } from 'ethers';
import { BaseContract } from './BaseContract';
import { Address, TransactionOptions, RoleInfo, TimeLock, Delegation } from '../types';
export declare class FluxAccessHub extends BaseContract {
    constructor(address: Address, signerOrProvider: ethers.Signer | ethers.Provider);
    hasRole(role: string, account: Address): Promise<boolean>;
    getRoleAdmin(role: string): Promise<string>;
    getRoleMemberCount(role: string): Promise<bigint>;
    getRoleMember(role: string, index: bigint): Promise<Address>;
    getAllRoleMembers(role: string): Promise<Address[]>;
    getRoleInfo(role: string): Promise<RoleInfo>;
    timeLockDelay(): Promise<bigint>;
    maxDelegationDuration(): Promise<bigint>;
    emergencyMode(): Promise<boolean>;
    getTimeLock(id: string): Promise<TimeLock | null>;
    getDelegation(delegator: Address, role: string): Promise<Delegation | null>;
    isDelegationActive(delegator: Address, role: string): Promise<boolean>;
    grantRole(role: string, account: Address, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    revokeRole(role: string, account: Address, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    renounceRole(role: string, callerConfirmation: Address, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    createRoleHierarchy(parentRole: string, childRole: string, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    scheduleTimeLock(target: Address, data: string, executionTime: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    executeTimeLock(id: string, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    cancelTimeLock(id: string, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    delegateRole(role: string, delegatee: Address, duration: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    revokeDelegation(role: string, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    setTimeLockDelay(newDelay: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    setMaxDelegationDuration(newDuration: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    setEmergencyMode(enabled: boolean, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    emergencyRevokeRole(role: string, account: Address, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    isAdmin(account: Address): Promise<boolean>;
    canGrantRole(granter: Address, role: string): Promise<boolean>;
    generateTimeLockId(target: Address, data: string, executionTime: bigint): string;
    calculateExecutionTime(delayInSeconds: number): bigint;
}
//# sourceMappingURL=FluxAccessHub.d.ts.map