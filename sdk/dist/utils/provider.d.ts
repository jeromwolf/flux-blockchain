import { ethers } from 'ethers';
import { Network } from '../types';
export declare class ProviderManager {
    private static instances;
    static getProvider(network: Network, customRpcUrl?: string): ethers.Provider;
    static getSigner(network: Network, privateKey: string, customRpcUrl?: string): ethers.Wallet;
    static validateNetwork(provider: ethers.Provider, expectedNetwork: Network): Promise<void>;
    static clearCache(): void;
}
//# sourceMappingURL=provider.d.ts.map