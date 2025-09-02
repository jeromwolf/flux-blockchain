import { ethers } from 'ethers';
import { Network } from '../types';
import { NETWORK_CONFIGS } from '../constants';
import { FluxSDKError, FluxErrorCode } from './errors';

export class ProviderManager {
  private static instances: Map<string, ethers.Provider> = new Map();

  static getProvider(network: Network, customRpcUrl?: string): ethers.Provider {
    const config = NETWORK_CONFIGS[network];
    if (!config) {
      throw new FluxSDKError(
        FluxErrorCode.INVALID_ARGUMENT,
        `Unsupported network: ${network}`
      );
    }

    const rpcUrl = customRpcUrl || config.rpcUrl;
    const key = `${network}-${rpcUrl}`;

    if (!this.instances.has(key)) {
      const provider = new ethers.JsonRpcProvider(rpcUrl, config.chainId);
      this.instances.set(key, provider);
    }

    return this.instances.get(key)!;
  }

  static getSigner(
    network: Network,
    privateKey: string,
    customRpcUrl?: string
  ): ethers.Wallet {
    const provider = this.getProvider(network, customRpcUrl);
    return new ethers.Wallet(privateKey, provider);
  }

  static async validateNetwork(
    provider: ethers.Provider,
    expectedNetwork: Network
  ): Promise<void> {
    const network = await provider.getNetwork();
    const expectedChainId = BigInt(NETWORK_CONFIGS[expectedNetwork].chainId);
    
    if (network.chainId !== expectedChainId) {
      throw new FluxSDKError(
        FluxErrorCode.NETWORK_ERROR,
        `Connected to wrong network. Expected ${expectedNetwork} (${expectedChainId}), got ${network.chainId}`
      );
    }
  }

  static clearCache(): void {
    this.instances.clear();
  }
}