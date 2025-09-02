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
exports.VERSION = exports.FluxSDK = void 0;
// Main SDK export
var FluxSDK_1 = require("./FluxSDK");
Object.defineProperty(exports, "FluxSDK", { enumerable: true, get: function () { return FluxSDK_1.FluxSDK; } });
// Contract exports
__exportStar(require("./contracts"), exports);
// Type exports
__exportStar(require("./types"), exports);
// Constant exports
__exportStar(require("./constants"), exports);
// Utility exports
__exportStar(require("./utils"), exports);
// Version
exports.VERSION = '1.0.0';
//# sourceMappingURL=index.js.map