import { ethers } from 'ethers';
import { BaseContract } from './BaseContract';
import { 
  Address, 
  TransactionOptions, 
  TokenInfo, 
  VestingSchedule 
} from '../types';
import { 
  FLUX_TOKEN_DECIMALS, 
  MINTER_ROLE, 
  PAUSER_ROLE,
  BURNER_ROLE 
} from '../constants';
import { TransactionHelper, handleError } from '../utils';
import FluxTokenABI from '../abis/FluxToken.json';

export class FluxToken extends BaseContract {
  constructor(
    address: Address,
    signerOrProvider: ethers.Signer | ethers.Provider
  ) {
    super(address, FluxTokenABI.abi, signerOrProvider);
  }

  // Read methods
  async getTokenInfo(): Promise<TokenInfo> {
    try {
      const [name, symbol, decimals, totalSupply, cap] = await Promise.all([
        this.call<string>('name'),
        this.call<string>('symbol'),
        this.call<number>('decimals'),
        this.call<bigint>('totalSupply'),
        this.call<bigint>('cap'),
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply,
        cap,
      };
    } catch (error) {
      return handleError(error);
    }
  }

  async balanceOf(address: Address): Promise<bigint> {
    try {
      return await this.call<bigint>('balanceOf', address);
    } catch (error) {
      return handleError(error);
    }
  }

  async allowance(owner: Address, spender: Address): Promise<bigint> {
    try {
      return await this.call<bigint>('allowance', owner, spender);
    } catch (error) {
      return handleError(error);
    }
  }

  async paused(): Promise<boolean> {
    try {
      return await this.call<boolean>('paused');
    } catch (error) {
      return handleError(error);
    }
  }

  async hasRole(role: string, account: Address): Promise<boolean> {
    try {
      return await this.call<boolean>('hasRole', role, account);
    } catch (error) {
      return handleError(error);
    }
  }

  async getVestingSchedule(beneficiary: Address): Promise<VestingSchedule | null> {
    try {
      const schedule = await this.call<any>('vestingSchedules', beneficiary);
      
      if (schedule.totalAmount === BigInt(0)) {
        return null;
      }

      return {
        beneficiary,
        totalAmount: schedule.totalAmount,
        releasedAmount: schedule.releasedAmount,
        startTime: schedule.startTime,
        cliff: schedule.cliff,
        duration: schedule.duration,
        revocable: schedule.revocable,
        revoked: schedule.revoked,
      };
    } catch (error) {
      return handleError(error);
    }
  }

  async getReleasableAmount(beneficiary: Address): Promise<bigint> {
    try {
      return await this.call<bigint>('releasableAmount', beneficiary);
    } catch (error) {
      return handleError(error);
    }
  }

  // Write methods
  async transfer(
    to: Address,
    amount: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('transfer', [to, amount], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async approve(
    spender: Address,
    amount: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('approve', [spender, amount], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async transferFrom(
    from: Address,
    to: Address,
    amount: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('transferFrom', [from, to, amount], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async mint(
    to: Address,
    amount: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('mint', [to, amount], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async burn(
    amount: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('burn', [amount], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async burnFrom(
    account: Address,
    amount: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('burnFrom', [account, amount], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async pause(options?: TransactionOptions): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('pause', [], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async unpause(options?: TransactionOptions): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('unpause', [], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async createVestingSchedule(
    beneficiary: Address,
    totalAmount: bigint,
    startTime: bigint,
    cliff: bigint,
    duration: bigint,
    revocable: boolean,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction(
        'createVestingSchedule',
        [beneficiary, totalAmount, startTime, cliff, duration, revocable],
        options
      );
    } catch (error) {
      return handleError(error);
    }
  }

  async release(
    beneficiary: Address,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('release', [beneficiary], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async revokeVesting(
    beneficiary: Address,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('revokeVesting', [beneficiary], options);
    } catch (error) {
      return handleError(error);
    }
  }

  // Helper methods
  formatTokenAmount(amount: bigint): string {
    return TransactionHelper.formatUnits(amount, FLUX_TOKEN_DECIMALS);
  }

  parseTokenAmount(amount: string): bigint {
    return TransactionHelper.parseUnits(amount, FLUX_TOKEN_DECIMALS);
  }

  async canMint(account: Address): Promise<boolean> {
    return this.hasRole(MINTER_ROLE, account);
  }

  async canPause(account: Address): Promise<boolean> {
    return this.hasRole(PAUSER_ROLE, account);
  }

  async canBurn(account: Address): Promise<boolean> {
    return this.hasRole(BURNER_ROLE, account);
  }
}