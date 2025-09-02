"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderManager = void 0;
const ethers_1 = require("ethers");
const constants_1 = require("../constants");
const errors_1 = require("./errors");
class ProviderManager {
    static getProvider(network, customRpcUrl) {
        const config = constants_1.NETWORK_CONFIGS[network];
        if (!config) {
            throw new errors_1.FluxSDKError(errors_1.FluxErrorCode.INVALID_ARGUMENT, `Unsupported network: ${network}`);
        }
        const rpcUrl = customRpcUrl || config.rpcUrl;
        const key = `${network}-${rpcUrl}`;
        if (!this.instances.has(key)) {
            const provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl, config.chainId);
            this.instances.set(key, provider);
        }
        return this.instances.get(key);
    }
    static getSigner(network, privateKey, customRpcUrl) {
        const provider = this.getProvider(network, customRpcUrl);
        return new ethers_1.ethers.Wallet(privateKey, provider);
    }
    static async validateNetwork(provider, expectedNetwork) {
        const network = await provider.getNetwork();
        const expectedChainId = BigInt(constants_1.NETWORK_CONFIGS[expectedNetwork].chainId);
        if (network.chainId !== expectedChainId) {
            throw new errors_1.FluxSDKError(errors_1.FluxErrorCode.NETWORK_ERROR, `Connected to wrong network. Expected ${expectedNetwork} (${expectedChainId}), got ${network.chainId}`);
        }
    }
    static clearCache() {
        this.instances.clear();
    }
}
exports.ProviderManager = ProviderManager;
ProviderManager.instances = new Map();
//# sourceMappingURL=provider.js.map