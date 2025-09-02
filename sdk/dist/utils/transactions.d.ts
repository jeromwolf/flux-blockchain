import { ethers } from 'ethers';
import { TransactionOptions } from '../types';
export declare class TransactionHelper {
    static estimateGas(contract: ethers.Contract, method: string, args: any[], options?: TransactionOptions): Promise<bigint>;
    static sendTransaction(contract: ethers.Contract, method: string, args: any[], options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    static waitForTransaction(tx: ethers.ContractTransactionResponse, confirmations?: number): Promise<ethers.ContractTransactionReceipt>;
    static callWithRetry<T>(fn: () => Promise<T>, maxRetries?: number, delay?: number): Promise<T>;
    static formatUnits(value: bigint, decimals?: number): string;
    static parseUnits(value: string, decimals?: number): bigint;
    static getGasPrice(provider: ethers.Provider): Promise<bigint>;
    static getBalance(provider: ethers.Provider, address: string): Promise<bigint>;
}
//# sourceMappingURL=transactions.d.ts.map