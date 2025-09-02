"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxSDK = void 0;
const contracts_1 = require("./contracts");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
class FluxSDK {
    constructor(config) {
        // Initialize network
        this.network = config.network || constants_1.DEFAULT_NETWORK;
        this.config = constants_1.NETWORK_CONFIGS[this.network];
        if (!this.config) {
            throw new utils_1.FluxSDKError(utils_1.FluxErrorCode.INVALID_ARGUMENT, `Unsupported network: ${this.network}`);
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
            this.signer = utils_1.ProviderManager.getSigner(this.network, config.privateKey, config.rpcUrl);
            this.provider = this.signer.provider;
        }
        else {
            this.provider = utils_1.ProviderManager.getProvider(this.network, config.rpcUrl);
        }
        // Initialize contracts
        const signerOrProvider = this.signer || this.provider;
        this.token = new contracts_1.FluxToken(this.config.contracts.fluxToken, signerOrProvider);
        this.gameAsset = new contracts_1.FluxGameAsset(this.config.contracts.fluxGameAsset, signerOrProvider);
        this.marketplace = new contracts_1.FluxMarketplace(this.config.contracts.fluxMarketplace, signerOrProvider);
        this.accessHub = new contracts_1.FluxAccessHub(this.config.contracts.fluxAccessHub, signerOrProvider);
    }
    // Static factory methods
    static async create(config) {
        const sdk = new FluxSDK(config);
        await sdk.validateNetwork();
        return sdk;
    }
    static createWithProvider(_provider, network, contracts) {
        return new FluxSDK({
            network,
            contracts,
        });
    }
    static createWithSigner(signer, network, contracts) {
        if (!signer.provider) {
            throw new utils_1.FluxSDKError(utils_1.FluxErrorCode.INVALID_ARGUMENT, 'Signer must have a provider');
        }
        // Create a temporary instance to get the config
        const tempConfig = constants_1.NETWORK_CONFIGS[network];
        if (!tempConfig) {
            throw new utils_1.FluxSDKError(utils_1.FluxErrorCode.INVALID_ARGUMENT, `Unsupported network: ${network}`);
        }
        // Update contract addresses if provided
        const contractAddresses = contracts ?
            { ...tempConfig.contracts, ...contracts } :
            tempConfig.contracts;
        // Create SDK with contracts directly initialized
        const sdk = Object.create(FluxSDK.prototype);
        sdk.network = network;
        sdk.config = { ...tempConfig, contracts: contractAddresses };
        sdk.provider = signer.provider;
        sdk.signer = signer;
        // Initialize contracts with signer
        sdk.token = new contracts_1.FluxToken(contractAddresses.fluxToken, signer);
        sdk.gameAsset = new contracts_1.FluxGameAsset(contractAddresses.fluxGameAsset, signer);
        sdk.marketplace = new contracts_1.FluxMarketplace(contractAddresses.fluxMarketplace, signer);
        sdk.accessHub = new contracts_1.FluxAccessHub(contractAddresses.fluxAccessHub, signer);
        return sdk;
    }
    // Network management
    async validateNetwork() {
        await utils_1.ProviderManager.validateNetwork(this.provider, this.network);
    }
    getNetwork() {
        return this.network;
    }
    getNetworkConfig() {
        return this.config;
    }
    getProvider() {
        return this.provider;
    }
    getSigner() {
        return this.signer;
    }
    async getChainId() {
        const network = await this.provider.getNetwork();
        return network.chainId;
    }
    // Account management
    async getAddress() {
        if (!this.signer) {
            return null;
        }
        return this.signer.getAddress();
    }
    async getBalance(address) {
        const targetAddress = address || await this.getAddress();
        if (!targetAddress) {
            throw new utils_1.FluxSDKError(utils_1.FluxErrorCode.MISSING_ARGUMENT, 'No address provided and no signer available');
        }
        return this.provider.getBalance(targetAddress);
    }
    // Contract addresses
    getContractAddresses() {
        return this.config.contracts;
    }
    getTokenAddress() {
        return this.config.contracts.fluxToken;
    }
    getGameAssetAddress() {
        return this.config.contracts.fluxGameAsset;
    }
    getMarketplaceAddress() {
        return this.config.contracts.fluxMarketplace;
    }
    getAccessHubAddress() {
        return this.config.contracts.fluxAccessHub;
    }
    // Utility methods
    async waitForTransaction(txHash, confirmations) {
        return this.provider.waitForTransaction(txHash, confirmations);
    }
    async getTransaction(txHash) {
        return this.provider.getTransaction(txHash);
    }
    async getTransactionReceipt(txHash) {
        return this.provider.getTransactionReceipt(txHash);
    }
    async getBlockNumber() {
        return this.provider.getBlockNumber();
    }
    async getBlock(blockHashOrNumber) {
        return this.provider.getBlock(blockHashOrNumber);
    }
    async getGasPrice() {
        const feeData = await this.provider.getFeeData();
        return feeData.gasPrice || BigInt(0);
    }
    // Update contract addresses (useful for testing)
    updateContractAddresses(contracts) {
        this.config.contracts = {
            ...this.config.contracts,
            ...contracts,
        };
        const signerOrProvider = this.signer || this.provider;
        if (contracts.fluxToken) {
            this.token = new contracts_1.FluxToken(contracts.fluxToken, signerOrProvider);
        }
        if (contracts.fluxGameAsset) {
            this.gameAsset = new contracts_1.FluxGameAsset(contracts.fluxGameAsset, signerOrProvider);
        }
        if (contracts.fluxMarketplace) {
            this.marketplace = new contracts_1.FluxMarketplace(contracts.fluxMarketplace, signerOrProvider);
        }
        if (contracts.fluxAccessHub) {
            this.accessHub = new contracts_1.FluxAccessHub(contracts.fluxAccessHub, signerOrProvider);
        }
    }
}
exports.FluxSDK = FluxSDK;
//# sourceMappingURL=FluxSDK.js.map