import { ethers } from 'ethers';
import { 
  FluxToken, 
  FluxGameAsset, 
  FluxMarketplace, 
  FluxAccessHub 
} from './contracts';
import { 
  Network, 
  FluxSDKConfig, 
  NetworkConfig,
  Address,
  ContractAddresses
} from './types';
import { 
  NETWORK_CONFIGS, 
  DEFAULT_NETWORK 
} from './constants';
import { 
  ProviderManager, 
  FluxSDKError, 
  FluxErrorCode 
} from './utils';

export class FluxSDK {
  private provider: ethers.Provider;
  private signer?: ethers.Signer;
  private network: Network;
  private config: NetworkConfig;
  
  public token: FluxToken;
  public gameAsset: FluxGameAsset;
  public marketplace: FluxMarketplace;
  public accessHub: FluxAccessHub;

  constructor(config: FluxSDKConfig) {
    // Initialize network
    this.network = config.network || DEFAULT_NETWORK;
    this.config = NETWORK_CONFIGS[this.network];
    
    if (!this.config) {
      throw new FluxSDKError(
        FluxErrorCode.INVALID_ARGUMENT,
        `Unsupported network: ${this.network}`
      );
    }

    // Override contract addresses if provided
    if (config.contracts) {
      this.config.contracts = {
        ...this.config.contracts,
        ...config.contracts,
      };
    }

    // Initialize provider and signer
    if (config.privateKey) {
      this.signer = ProviderManager.getSigner(
        this.network,
        config.privateKey,
        config.rpcUrl
      );
      this.provider = this.signer.provider!;
    } else {
      this.provider = ProviderManager.getProvider(this.network, config.rpcUrl);
    }

    // Initialize contracts
    const signerOrProvider = this.signer || this.provider;
    
    this.token = new FluxToken(
      this.config.contracts.fluxToken,
      signerOrProvider
    );
    
    this.gameAsset = new FluxGameAsset(
      this.config.contracts.fluxGameAsset,
      signerOrProvider
    );
    
    this.marketplace = new FluxMarketplace(
      this.config.contracts.fluxMarketplace,
      signerOrProvider
    );
    
    this.accessHub = new FluxAccessHub(
      this.config.contracts.fluxAccessHub,
      signerOrProvider
    );
  }

  // Static factory methods
  static async create(config: FluxSDKConfig): Promise<FluxSDK> {
    const sdk = new FluxSDK(config);
    await sdk.validateNetwork();
    return sdk;
  }

  static createWithProvider(
    _provider: ethers.Provider,
    network: Network,
    contracts?: Partial<ContractAddresses>
  ): FluxSDK {
    return new FluxSDK({
      network,
      contracts,
    });
  }

  static createWithSigner(
    signer: ethers.Signer,
    network: Network,
    contracts?: Partial<ContractAddresses>
  ): FluxSDK {
    if (!signer.provider) {
      throw new FluxSDKError(
        FluxErrorCode.INVALID_ARGUMENT,
        'Signer must have a provider'
      );
    }

    // Create a temporary instance to get the config
    const tempConfig = NETWORK_CONFIGS[network];
    if (!tempConfig) {
      throw new FluxSDKError(
        FluxErrorCode.INVALID_ARGUMENT,
        `Unsupported network: ${network}`
      );
    }

    // Update contract addresses if provided
    const contractAddresses = contracts ? 
      { ...tempConfig.contracts, ...contracts } : 
      tempConfig.contracts;

    // Create SDK with contracts directly initialized
    const sdk = Object.create(FluxSDK.prototype);
    sdk.network = network;
    sdk.config = { ...tempConfig, contracts: contractAddresses };
    sdk.provider = signer.provider!;
    sdk.signer = signer;

    // Initialize contracts with signer
    sdk.token = new FluxToken(contractAddresses.fluxToken, signer);
    sdk.gameAsset = new FluxGameAsset(contractAddresses.fluxGameAsset, signer);
    sdk.marketplace = new FluxMarketplace(contractAddresses.fluxMarketplace, signer);
    sdk.accessHub = new FluxAccessHub(contractAddresses.fluxAccessHub, signer);

    return sdk;
  }

  // Network management
  async validateNetwork(): Promise<void> {
    await ProviderManager.validateNetwork(this.provider, this.network);
  }

  getNetwork(): Network {
    return this.network;
  }

  getNetworkConfig(): NetworkConfig {
    return this.config;
  }

  getProvider(): ethers.Provider {
    return this.provider;
  }

  getSigner(): ethers.Signer | undefined {
    return this.signer;
  }

  async getChainId(): Promise<bigint> {
    const network = await this.provider.getNetwork();
    return network.chainId;
  }

  // Account management
  async getAddress(): Promise<Address | null> {
    if (!this.signer) {
      return null;
    }
    return this.signer.getAddress();
  }

  async getBalance(address?: Address): Promise<bigint> {
    const targetAddress = address || await this.getAddress();
    if (!targetAddress) {
      throw new FluxSDKError(
        FluxErrorCode.MISSING_ARGUMENT,
        'No address provided and no signer available'
      );
    }
    return this.provider.getBalance(targetAddress);
  }

  // Contract addresses
  getContractAddresses(): ContractAddresses {
    return this.config.contracts;
  }

  getTokenAddress(): Address {
    return this.config.contracts.fluxToken;
  }

  getGameAssetAddress(): Address {
    return this.config.contracts.fluxGameAsset;
  }

  getMarketplaceAddress(): Address {
    return this.config.contracts.fluxMarketplace;
  }

  getAccessHubAddress(): Address {
    return this.config.contracts.fluxAccessHub;
  }

  // Utility methods
  async waitForTransaction(
    txHash: string,
    confirmations?: number
  ): Promise<ethers.TransactionReceipt | null> {
    return this.provider.waitForTransaction(txHash, confirmations);
  }

  async getTransaction(txHash: string): Promise<ethers.TransactionResponse | null> {
    return this.provider.getTransaction(txHash);
  }

  async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
    return this.provider.getTransactionReceipt(txHash);
  }

  async getBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async getBlock(blockHashOrNumber: string | number): Promise<ethers.Block | null> {
    return this.provider.getBlock(blockHashOrNumber);
  }

  async getGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData();
    return feeData.gasPrice || BigInt(0);
  }

  // Update contract addresses (useful for testing)
  updateContractAddresses(contracts: Partial<ContractAddresses>): void {
    this.config.contracts = {
      ...this.config.contracts,
      ...contracts,
    };

    const signerOrProvider = this.signer || this.provider;

    if (contracts.fluxToken) {
      this.token = new FluxToken(contracts.fluxToken, signerOrProvider);
    }
    if (contracts.fluxGameAsset) {
      this.gameAsset = new FluxGameAsset(contracts.fluxGameAsset, signerOrProvider);
    }
    if (contracts.fluxMarketplace) {
      this.marketplace = new FluxMarketplace(contracts.fluxMarketplace, signerOrProvider);
    }
    if (contracts.fluxAccessHub) {
      this.accessHub = new FluxAccessHub(contracts.fluxAccessHub, signerOrProvider);
    }
  }
}