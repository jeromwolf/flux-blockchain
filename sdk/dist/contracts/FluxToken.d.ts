import { ethers } from 'ethers';
import { BaseContract } from './BaseContract';
import { Address, TransactionOptions, TokenInfo, VestingSchedule } from '../types';
export declare class FluxToken extends BaseContract {
    constructor(address: Address, signerOrProvider: ethers.Signer | ethers.Provider);
    getTokenInfo(): Promise<TokenInfo>;
    balanceOf(address: Address): Promise<bigint>;
    allowance(owner: Address, spender: Address): Promise<bigint>;
    paused(): Promise<boolean>;
    hasRole(role: string, account: Address): Promise<boolean>;
    getVestingSchedule(beneficiary: Address): Promise<VestingSchedule | null>;
    getReleasableAmount(beneficiary: Address): Promise<bigint>;
    transfer(to: Address, amount: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    approve(spender: Address, amount: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    transferFrom(from: Address, to: Address, amount: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    mint(to: Address, amount: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    burn(amount: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    burnFrom(account: Address, amount: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    pause(options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    unpause(options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    createVestingSchedule(beneficiary: Address, totalAmount: bigint, startTime: bigint, cliff: bigint, duration: bigint, revocable: boolean, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    release(beneficiary: Address, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    revokeVesting(beneficiary: Address, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    formatTokenAmount(amount: bigint): string;
    parseTokenAmount(amount: string): bigint;
    canMint(account: Address): Promise<boolean>;
    canPause(account: Address): Promise<boolean>;
    canBurn(account: Address): Promise<boolean>;
}
//# sourceMappingURL=FluxToken.d.ts.map