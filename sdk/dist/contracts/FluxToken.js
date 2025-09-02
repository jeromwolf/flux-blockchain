"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxToken = void 0;
const BaseContract_1 = require("./BaseContract");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const FluxToken_json_1 = __importDefault(require("../abis/FluxToken.json"));
class FluxToken extends BaseContract_1.BaseContract {
    constructor(address, signerOrProvider) {
        super(address, FluxToken_json_1.default.abi, signerOrProvider);
    }
    // Read methods
    async getTokenInfo() {
        try {
            const [name, symbol, decimals, totalSupply, cap] = await Promise.all([
                this.call('name'),
                this.call('symbol'),
                this.call('decimals'),
                this.call('totalSupply'),
                this.call('cap'),
            ]);
            return {
                name,
                symbol,
                decimals,
                totalSupply,
                cap,
            };
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async balanceOf(address) {
        try {
            return await this.call('balanceOf', address);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async allowance(owner, spender) {
        try {
            return await this.call('allowance', owner, spender);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async paused() {
        try {
            return await this.call('paused');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async hasRole(role, account) {
        try {
            return await this.call('hasRole', role, account);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getVestingSchedule(beneficiary) {
        try {
            const schedule = await this.call('vestingSchedules', beneficiary);
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
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getReleasableAmount(beneficiary) {
        try {
            return await this.call('releasableAmount', beneficiary);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    // Write methods
    async transfer(to, amount, options) {
        try {
            return await this.sendTransaction('transfer', [to, amount], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async approve(spender, amount, options) {
        try {
            return await this.sendTransaction('approve', [spender, amount], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async transferFrom(from, to, amount, options) {
        try {
            return await this.sendTransaction('transferFrom', [from, to, amount], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async mint(to, amount, options) {
        try {
            return await this.sendTransaction('mint', [to, amount], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async burn(amount, options) {
        try {
            return await this.sendTransaction('burn', [amount], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async burnFrom(account, amount, options) {
        try {
            return await this.sendTransaction('burnFrom', [account, amount], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async pause(options) {
        try {
            return await this.sendTransaction('pause', [], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async unpause(options) {
        try {
            return await this.sendTransaction('unpause', [], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async createVestingSchedule(beneficiary, totalAmount, startTime, cliff, duration, revocable, options) {
        try {
            return await this.sendTransaction('createVestingSchedule', [beneficiary, totalAmount, startTime, cliff, duration, revocable], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async release(beneficiary, options) {
        try {
            return await this.sendTransaction('release', [beneficiary], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async revokeVesting(beneficiary, options) {
        try {
            return await this.sendTransaction('revokeVesting', [beneficiary], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    // Helper methods
    formatTokenAmount(amount) {
        return utils_1.TransactionHelper.formatUnits(amount, constants_1.FLUX_TOKEN_DECIMALS);
    }
    parseTokenAmount(amount) {
        return utils_1.TransactionHelper.parseUnits(amount, constants_1.FLUX_TOKEN_DECIMALS);
    }
    async canMint(account) {
        return this.hasRole(constants_1.MINTER_ROLE, account);
    }
    async canPause(account) {
        return this.hasRole(constants_1.PAUSER_ROLE, account);
    }
    async canBurn(account) {
        return this.hasRole(constants_1.BURNER_ROLE, account);
    }
}
exports.FluxToken = FluxToken;
//# sourceMappingURL=FluxToken.js.map