import { BigNumberish } from 'ethers';
export type Address = string;
export type TransactionHash = string;
export declare enum Network {
    POLYGON = 137,
    MUMBAI = 80001,
    LOCALHOST = 31337,
    HARDHAT = 31337
}
export interface NetworkConfig {
    chainId: number;
    name: string;
    rpcUrl: string;
    explorerUrl?: string;
    contracts: ContractAddresses;
}
export interface ContractAddresses {
    fluxToken: Address;
    fluxGameAsset: Address;
    fluxMarketplace: Address;
    fluxAccessHub: Address;
}
export interface TransactionOptions {
    gasLimit?: BigNumberish;
    gasPrice?: BigNumberish;
    maxFeePerGas?: BigNumberish;
    maxPriorityFeePerGas?: BigNumberish;
    nonce?: number;
    value?: BigNumberish;
}
export interface FluxSDKConfig {
    network: Network;
    rpcUrl?: string;
    privateKey?: string;
    contracts?: Partial<ContractAddresses>;
}
export * from './contracts';
//# sourceMappingURL=index.d.ts.map