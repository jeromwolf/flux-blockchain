"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.toBigInt = exports.shortenAddress = exports.isAddress = void 0;
__exportStar(require("./errors"), exports);
__exportStar(require("./provider"), exports);
__exportStar(require("./transactions"), exports);
// Utility functions
function isAddress(address) {
    try {
        return address.length === 42 && address.startsWith('0x');
    }
    catch {
        return false;
    }
}
exports.isAddress = isAddress;
function shortenAddress(address, chars = 4) {
    if (!isAddress(address))
        return address;
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
exports.shortenAddress = shortenAddress;
function toBigInt(value) {
    if (typeof value === 'bigint')
        return value;
    if (typeof value === 'number')
        return BigInt(value);
    if (typeof value === 'string')
        return BigInt(value);
    throw new Error(`Cannot convert ${typeof value} to bigint`);
}
exports.toBigInt = toBigInt;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
//# sourceMappingURL=index.js.map