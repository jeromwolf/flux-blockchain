"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseContract = void 0;
const ethers_1 = require("ethers");
const utils_1 = require("../utils");
class BaseContract {
    constructor(address, abi, signerOrProvider) {
        this.contract = new ethers_1.ethers.Contract(address, abi, signerOrProvider);
        // Check if it's a signer by checking for getAddress method
        if ('getAddress' in signerOrProvider) {
            this.signer = signerOrProvider;
            this.provider = signerOrProvider.provider;
        }
        else {
            this.provider = signerOrProvider;
        }
    }
    get address() {
        return this.contract.target;
    }
    async sendTransaction(method, args, options) {
        if (!this.signer) {
            throw new Error('No signer available. Use a signer instead of provider.');
        }
        return utils_1.TransactionHelper.sendTransaction(this.contract, method, args, options);
    }
    async call(method, ...args) {
        return this.contract[method](...args);
    }
    async estimateGas(method, args, options) {
        return utils_1.TransactionHelper.estimateGas(this.contract, method, args, options);
    }
    async waitForTransaction(tx, confirmations) {
        return utils_1.TransactionHelper.waitForTransaction(tx, confirmations);
    }
    onEvent(eventName, callback) {
        this.contract.on(eventName, callback);
        return callback;
    }
    removeListener(eventName, listener) {
        this.contract.off(eventName, listener);
    }
    async queryFilter(event, fromBlock, toBlock) {
        const filter = this.contract.filters[event]();
        return this.contract.queryFilter(filter, fromBlock, toBlock);
    }
}
exports.BaseContract = BaseContract;
//# sourceMappingURL=BaseContract.js.map