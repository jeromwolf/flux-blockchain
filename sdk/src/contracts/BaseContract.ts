import { ethers } from 'ethers';
import { Address, TransactionOptions } from '../types';
import { TransactionHelper } from '../utils';

export abstract class BaseContract {
  protected contract: ethers.Contract;
  protected provider: ethers.Provider;
  protected signer?: ethers.Signer;

  constructor(
    address: Address,
    abi: any[],
    signerOrProvider: ethers.Signer | ethers.Provider
  ) {
    this.contract = new ethers.Contract(address, abi, signerOrProvider);
    
    // Check if it's a signer by checking for getAddress method
    if ('getAddress' in signerOrProvider) {
      this.signer = signerOrProvider as ethers.Signer;
      this.provider = signerOrProvider.provider!;
    } else {
      this.provider = signerOrProvider as ethers.Provider;
    }
  }

  get address(): Address {
    return this.contract.target as Address;
  }

  protected async sendTransaction(
    method: string,
    args: any[],
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    if (!this.signer) {
      throw new Error('No signer available. Use a signer instead of provider.');
    }
    return TransactionHelper.sendTransaction(this.contract, method, args, options);
  }

  protected async call<T>(method: string, ...args: any[]): Promise<T> {
    return this.contract[method](...args);
  }

  protected async estimateGas(
    method: string,
    args: any[],
    options?: TransactionOptions
  ): Promise<bigint> {
    return TransactionHelper.estimateGas(this.contract, method, args, options);
  }

  async waitForTransaction(
    tx: ethers.ContractTransactionResponse,
    confirmations?: number
  ): Promise<ethers.ContractTransactionReceipt> {
    return TransactionHelper.waitForTransaction(tx, confirmations);
  }

  onEvent(
    eventName: string,
    callback: (...args: any[]) => void
  ): (...args: any[]) => void {
    this.contract.on(eventName, callback);
    return callback;
  }

  removeListener(
    eventName: string,
    listener: (...args: any[]) => void
  ): void {
    this.contract.off(eventName, listener);
  }

  async queryFilter(
    event: string,
    fromBlock?: number,
    toBlock?: number
  ): Promise<ethers.EventLog[]> {
    const filter = this.contract.filters[event]();
    return this.contract.queryFilter(filter, fromBlock, toBlock) as Promise<ethers.EventLog[]>;
  }
}