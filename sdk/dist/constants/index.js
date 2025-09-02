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
exports.ONE_YEAR = exports.ONE_MONTH = exports.ONE_WEEK = exports.ONE_DAY = exports.MAX_MARKETPLACE_FEE = exports.MARKETPLACE_FEE_BASIS_POINTS = exports.FLUX_TOKEN_CAP = exports.FLUX_TOKEN_DECIMALS = exports.MARKETPLACE_ADMIN_ROLE = exports.GAME_ADMIN_ROLE = exports.BURNER_ROLE = exports.PAUSER_ROLE = exports.MINTER_ROLE = exports.DEFAULT_ADMIN_ROLE = exports.ZERO_BYTES32 = exports.ZERO_ADDRESS = void 0;
__exportStar(require("./networks"), exports);
__exportStar(require("./addresses"), exports);
// Common constants
exports.ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
exports.ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
// Role hashes
exports.DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
exports.MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6';
exports.PAUSER_ROLE = '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a';
exports.BURNER_ROLE = '0x51f4231475d91734c657e212cfb2e9728a863d53c9057d6ce6ca203d6e5cfd5d';
exports.GAME_ADMIN_ROLE = '0x2db57a2d5f40c0588fb4a27a0fe6bd5de9ed0de616047273cbdfded8350d2a0d';
exports.MARKETPLACE_ADMIN_ROLE = '0x71840dc4906352362b0cdaf79870196c8e42acafade72d5d5a6d59291253ceb1';
// Token constants
exports.FLUX_TOKEN_DECIMALS = 18;
exports.FLUX_TOKEN_CAP = BigInt('42000000000') * BigInt(10 ** exports.FLUX_TOKEN_DECIMALS); // 42 billion
// Marketplace constants
exports.MARKETPLACE_FEE_BASIS_POINTS = 250; // 2.5%
exports.MAX_MARKETPLACE_FEE = 1000; // 10%
// Time constants
exports.ONE_DAY = 86400;
exports.ONE_WEEK = exports.ONE_DAY * 7;
exports.ONE_MONTH = exports.ONE_DAY * 30;
exports.ONE_YEAR = exports.ONE_DAY * 365;
//# sourceMappingURL=index.js.map