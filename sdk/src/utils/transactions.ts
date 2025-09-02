import { ethers } from 'ethers';
import { TransactionOptions } from '../types';
import { FluxSDKError, FluxErrorCode, handleError } from './errors';

export class TransactionHelper {
  static async estimateGas(
    contract: ethers.Contract,
    method: string,
    args: any[],
    options?: TransactionOptions
  ): Promise<bigint> {
    try {
      const estimatedGas = await contract[method].estimateGas(...args, options || {});
      // Add 20% buffer for safety
      return (estimatedGas * BigInt(120)) / BigInt(100);
    } catch (error) {
      handleError(error);
    }
  }

  static async sendTransaction(
    contract: ethers.Contract,
    method: string,
    args: any[],
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      // Estimate gas if not provided
      if (!options?.gasLimit) {
        const estimatedGas = await this.estimateGas(contract, method, args, options);
        options = { ...options, gasLimit: estimatedGas };
      }

      const tx = await contract[method](...args, options);
      return tx;
    } catch (error) {
      handleError(error);
    }
  }

  static async waitForTransaction(
    tx: ethers.ContractTransactionResponse,
    confirmations: number = 1
  ): Promise<ethers.ContractTransactionReceipt> {
    try {
      const receipt = await tx.wait(confirmations);
      if (!receipt) {
        throw new FluxSDKError(
          FluxErrorCode.TRANSACTION_FAILED,
          'Transaction failed: no receipt'
        );
      }
      return receipt;
    } catch (error) {
      handleError(error);
    }
  }

  static async callWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain errors
        if (
          error.code === 'INVALID_ARGUMENT' ||
          error.code === 'CALL_EXCEPTION' ||
          error.code === 'INSUFFICIENT_FUNDS'
        ) {
          throw error;
        }
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }

  static formatUnits(value: bigint, decimals: number = 18): string {
    return ethers.formatUnits(value, decimals);
  }

  static parseUnits(value: string, decimals: number = 18): bigint {
    return ethers.parseUnits(value, decimals);
  }

  static async getGasPrice(provider: ethers.Provider): Promise<bigint> {
    try {
      const feeData = await provider.getFeeData();
      return feeData.gasPrice || BigInt(0);
    } catch (error) {
      handleError(error);
    }
  }

  static async getBalance(
    provider: ethers.Provider,
    address: string
  ): Promise<bigint> {
    try {
      return await provider.getBalance(address);
    } catch (error) {
      handleError(error);
    }
  }
}