"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionHelper = void 0;
const ethers_1 = require("ethers");
const errors_1 = require("./errors");
class TransactionHelper {
    static async estimateGas(contract, method, args, options) {
        try {
            const estimatedGas = await contract[method].estimateGas(...args, options || {});
            // Add 20% buffer for safety
            return (estimatedGas * BigInt(120)) / BigInt(100);
        }
        catch (error) {
            (0, errors_1.handleError)(error);
        }
    }
    static async sendTransaction(contract, method, args, options) {
        try {
            // Estimate gas if not provided
            if (!options?.gasLimit) {
                const estimatedGas = await this.estimateGas(contract, method, args, options);
                options = { ...options, gasLimit: estimatedGas };
            }
            const tx = await contract[method](...args, options);
            return tx;
        }
        catch (error) {
            (0, errors_1.handleError)(error);
        }
    }
    static async waitForTransaction(tx, confirmations = 1) {
        try {
            const receipt = await tx.wait(confirmations);
            if (!receipt) {
                throw new errors_1.FluxSDKError(errors_1.FluxErrorCode.TRANSACTION_FAILED, 'Transaction failed: no receipt');
            }
            return receipt;
        }
        catch (error) {
            (0, errors_1.handleError)(error);
        }
    }
    static async callWithRetry(fn, maxRetries = 3, delay = 1000) {
        let lastError;
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                // Don't retry on certain errors
                if (error.code === 'INVALID_ARGUMENT' ||
                    error.code === 'CALL_EXCEPTION' ||
                    error.code === 'INSUFFICIENT_FUNDS') {
                    throw error;
                }
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                }
            }
        }
        throw lastError;
    }
    static formatUnits(value, decimals = 18) {
        return ethers_1.ethers.formatUnits(value, decimals);
    }
    static parseUnits(value, decimals = 18) {
        return ethers_1.ethers.parseUnits(value, decimals);
    }
    static async getGasPrice(provider) {
        try {
            const feeData = await provider.getFeeData();
            return feeData.gasPrice || BigInt(0);
        }
        catch (error) {
            (0, errors_1.handleError)(error);
        }
    }
    static async getBalance(provider, address) {
        try {
            return await provider.getBalance(address);
        }
        catch (error) {
            (0, errors_1.handleError)(error);
        }
    }
}
exports.TransactionHelper = TransactionHelper;
//# sourceMappingURL=transactions.js.map