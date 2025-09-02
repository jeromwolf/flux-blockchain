"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.FluxSDKError = exports.FluxErrorCode = void 0;
var FluxErrorCode;
(function (FluxErrorCode) {
    // General errors
    FluxErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    FluxErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    FluxErrorCode["INVALID_ARGUMENT"] = "INVALID_ARGUMENT";
    FluxErrorCode["MISSING_ARGUMENT"] = "MISSING_ARGUMENT";
    FluxErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    // Contract errors
    FluxErrorCode["CONTRACT_NOT_FOUND"] = "CONTRACT_NOT_FOUND";
    FluxErrorCode["TRANSACTION_FAILED"] = "TRANSACTION_FAILED";
    FluxErrorCode["INSUFFICIENT_BALANCE"] = "INSUFFICIENT_BALANCE";
    FluxErrorCode["INSUFFICIENT_ALLOWANCE"] = "INSUFFICIENT_ALLOWANCE";
    // Token errors
    FluxErrorCode["TOKEN_CAP_EXCEEDED"] = "TOKEN_CAP_EXCEEDED";
    FluxErrorCode["TOKEN_PAUSED"] = "TOKEN_PAUSED";
    FluxErrorCode["INVALID_VESTING_SCHEDULE"] = "INVALID_VESTING_SCHEDULE";
    // NFT errors
    FluxErrorCode["TOKEN_NOT_FOUND"] = "TOKEN_NOT_FOUND";
    FluxErrorCode["NOT_TOKEN_OWNER"] = "NOT_TOKEN_OWNER";
    FluxErrorCode["INVALID_SIGNATURE"] = "INVALID_SIGNATURE";
    FluxErrorCode["SIGNATURE_EXPIRED"] = "SIGNATURE_EXPIRED";
    // Marketplace errors
    FluxErrorCode["LISTING_NOT_FOUND"] = "LISTING_NOT_FOUND";
    FluxErrorCode["LISTING_EXPIRED"] = "LISTING_EXPIRED";
    FluxErrorCode["LISTING_NOT_ACTIVE"] = "LISTING_NOT_ACTIVE";
    FluxErrorCode["INVALID_PRICE"] = "INVALID_PRICE";
    FluxErrorCode["OFFER_NOT_FOUND"] = "OFFER_NOT_FOUND";
    // Access control errors
    FluxErrorCode["ROLE_NOT_GRANTED"] = "ROLE_NOT_GRANTED";
    FluxErrorCode["TIMELOCK_NOT_READY"] = "TIMELOCK_NOT_READY";
    FluxErrorCode["DELEGATION_EXPIRED"] = "DELEGATION_EXPIRED";
})(FluxErrorCode || (exports.FluxErrorCode = FluxErrorCode = {}));
class FluxSDKError extends Error {
    constructor(code, message, originalError) {
        super(message);
        this.code = code;
        this.originalError = originalError;
        this.name = 'FluxSDKError';
        Object.setPrototypeOf(this, FluxSDKError.prototype);
    }
    static fromError(error) {
        // Handle ethers errors
        if (error.code === 'CALL_EXCEPTION') {
            const reason = error.reason || error.message;
            // Parse common contract errors
            if (reason.includes('ERC20: transfer amount exceeds balance')) {
                return new FluxSDKError(FluxErrorCode.INSUFFICIENT_BALANCE, 'Insufficient token balance', error);
            }
            if (reason.includes('ERC20: insufficient allowance')) {
                return new FluxSDKError(FluxErrorCode.INSUFFICIENT_ALLOWANCE, 'Insufficient token allowance', error);
            }
            if (reason.includes('Pausable: paused')) {
                return new FluxSDKError(FluxErrorCode.TOKEN_PAUSED, 'Token transfers are paused', error);
            }
            if (reason.includes('AccessControl:')) {
                return new FluxSDKError(FluxErrorCode.ROLE_NOT_GRANTED, 'Access denied: missing required role', error);
            }
        }
        // Handle network errors
        if (error.code === 'NETWORK_ERROR') {
            return new FluxSDKError(FluxErrorCode.NETWORK_ERROR, 'Network connection error', error);
        }
        // Default error
        return new FluxSDKError(FluxErrorCode.UNKNOWN_ERROR, error.message || 'An unknown error occurred', error);
    }
}
exports.FluxSDKError = FluxSDKError;
function handleError(error) {
    throw FluxSDKError.fromError(error);
}
exports.handleError = handleError;
//# sourceMappingURL=errors.js.map