import { ethers } from 'ethers';
import { FluxToken, FluxGameAsset, FluxMarketplace, FluxAccessHub } from './contracts';
import { Network, FluxSDKConfig, NetworkConfig, Address, ContractAddresses } from './types';
export declare class FluxSDK {
    private provider;
    private signer?;
    private network;
    private config;
    token: FluxToken;
    gameAsset: FluxGameAsset;
    marketplace: FluxMarketplace;
    accessHub: FluxAccessHub;
    constructor(config: FluxSDKConfig);
    static create(config: FluxSDKConfig): Promise<FluxSDK>;
    static createWithProvider(_provider: ethers.Provider, network: Network, contracts?: Partial<ContractAddresses>): FluxSDK;
    static createWithSigner(signer: ethers.Signer, network: Network, contracts?: Partial<ContractAddresses>): FluxSDK;
    validateNetwork(): Promise<void>;
    getNetwork(): Network;
    getNetworkConfig(): NetworkConfig;
    getProvider(): ethers.Provider;
    getSigner(): ethers.Signer | undefined;
    getChainId(): Promise<bigint>;
    getAddress(): Promise<Address | null>;
    getBalance(address?: Address): Promise<bigint>;
    getContractAddresses(): ContractAddresses;
    getTokenAddress(): Address;
    getGameAssetAddress(): Address;
    getMarketplaceAddress(): Address;
    getAccessHubAddress(): Address;
    waitForTransaction(txHash: string, confirmations?: number): Promise<ethers.TransactionReceipt | null>;
    getTransaction(txHash: string): Promise<ethers.TransactionResponse | null>;
    getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null>;
    getBlockNumber(): Promise<number>;
    getBlock(blockHashOrNumber: string | number): Promise<ethers.Block | null>;
    getGasPrice(): Promise<bigint>;
    updateContractAddresses(contracts: Partial<ContractAddresses>): void;
}
//# sourceMappingURL=FluxSDK.d.ts.map