"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_NETWORK = exports.NETWORK_CONFIGS = void 0;
const types_1 = require("../types");
exports.NETWORK_CONFIGS = {
    [types_1.Network.POLYGON]: {
        chainId: 137,
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com',
        explorerUrl: 'https://polygonscan.com',
        contracts: {
            fluxToken: '0x0000000000000000000000000000000000000000',
            fluxGameAsset: '0x0000000000000000000000000000000000000000',
            fluxMarketplace: '0x0000000000000000000000000000000000000000',
            fluxAccessHub: '0x0000000000000000000000000000000000000000',
        },
    },
    [types_1.Network.MUMBAI]: {
        chainId: 80001,
        name: 'Polygon Mumbai Testnet',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        explorerUrl: 'https://mumbai.polygonscan.com',
        contracts: {
            fluxToken: '0x0000000000000000000000000000000000000000',
            fluxGameAsset: '0x0000000000000000000000000000000000000000',
            fluxMarketplace: '0x0000000000000000000000000000000000000000',
            fluxAccessHub: '0x0000000000000000000000000000000000000000',
        },
    },
    [types_1.Network.LOCALHOST]: {
        chainId: 31337,
        name: 'Localhost',
        rpcUrl: 'http://localhost:8545',
        contracts: {
            fluxToken: '0x0000000000000000000000000000000000000000',
            fluxGameAsset: '0x0000000000000000000000000000000000000000',
            fluxMarketplace: '0x0000000000000000000000000000000000000000',
            fluxAccessHub: '0x0000000000000000000000000000000000000000',
        },
    },
};
exports.DEFAULT_NETWORK = types_1.Network.LOCALHOST;
//# sourceMappingURL=networks.js.map