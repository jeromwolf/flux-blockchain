import { ethers } from 'ethers';
import { Address, TransactionOptions } from '../types';
export declare abstract class BaseContract {
    protected contract: ethers.Contract;
    protected provider: ethers.Provider;
    protected signer?: ethers.Signer;
    constructor(address: Address, abi: any[], signerOrProvider: ethers.Signer | ethers.Provider);
    get address(): Address;
    protected sendTransaction(method: string, args: any[], options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    protected call<T>(method: string, ...args: any[]): Promise<T>;
    protected estimateGas(method: string, args: any[], options?: TransactionOptions): Promise<bigint>;
    waitForTransaction(tx: ethers.ContractTransactionResponse, confirmations?: number): Promise<ethers.ContractTransactionReceipt>;
    onEvent(eventName: string, callback: (...args: any[]) => void): (...args: any[]) => void;
    removeListener(eventName: string, listener: (...args: any[]) => void): void;
    queryFilter(event: string, fromBlock?: number, toBlock?: number): Promise<ethers.EventLog[]>;
}
//# sourceMappingURL=BaseContract.d.ts.map