import { Network, NetworkConfig } from '../types';

export const NETWORK_CONFIGS: Record<Network, NetworkConfig> = {
  [Network.POLYGON]: {
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
  [Network.MUMBAI]: {
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
  [Network.LOCALHOST]: {
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

export const DEFAULT_NETWORK = Network.LOCALHOST;