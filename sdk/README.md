# Flux Blockchain SDK

Official TypeScript SDK for interacting with Flux Blockchain smart contracts.

## Installation

```bash
npm install @flux-blockchain/sdk
# or
yarn add @flux-blockchain/sdk
```

## Quick Start

```typescript
import { FluxSDK, Network } from '@flux-blockchain/sdk';

// Initialize SDK
const sdk = new FluxSDK({
  network: Network.POLYGON,
  privateKey: process.env.PRIVATE_KEY, // Optional: for write operations
});

// Read token balance
const balance = await sdk.token.balanceOf('0x...');
console.log('Balance:', sdk.token.formatTokenAmount(balance));

// Transfer tokens
const tx = await sdk.token.transfer('0x...', sdk.token.parseTokenAmount('100'));
await tx.wait();
```

## Features

- 🚀 **Type-safe**: Full TypeScript support with comprehensive type definitions
- 🔒 **Secure**: Built-in error handling and transaction management
- 🎮 **Game-ready**: Specialized support for NFT game assets
- 💱 **Marketplace**: Complete trading system integration
- 🛡️ **Access Control**: Advanced role-based permissions
- ⚡ **Optimized**: Automatic gas estimation and retry logic

## Supported Networks

- **Polygon Mainnet** (chainId: 137)
- **Mumbai Testnet** (chainId: 80001)
- **Localhost** (chainId: 31337)

## Core Modules

### FluxToken
ERC-20 token with advanced features:
- Minting and burning
- Vesting schedules
- Pausable transfers
- Role-based access

### FluxGameAsset
ERC-721 NFT for game assets:
- Rarity system
- Level upgrades
- Asset combination
- Royalty support

### FluxMarketplace
Decentralized trading:
- Buy/sell listings
- Trade offers
- Fee management
- Multi-asset support

### FluxAccessHub
Centralized access control:
- Role hierarchy
- Time-locked operations
- Delegations
- Emergency controls

## API Reference

### SDK Initialization

```typescript
// Option 1: With private key
const sdk = new FluxSDK({
  network: Network.POLYGON,
  privateKey: '0x...',
  rpcUrl: 'https://custom-rpc.com', // Optional
});

// Option 2: With provider
const provider = new ethers.JsonRpcProvider('...');
const sdk = FluxSDK.createWithProvider(provider, Network.POLYGON);

// Option 3: With signer
const signer = new ethers.Wallet('0x...', provider);
const sdk = FluxSDK.createWithSigner(signer, Network.POLYGON);
```

### Token Operations

```typescript
// Get token info
const info = await sdk.token.getTokenInfo();

// Check balance
const balance = await sdk.token.balanceOf(address);

// Transfer tokens
const tx = await sdk.token.transfer(to, amount);
await sdk.token.waitForTransaction(tx);

// Approve spending
await sdk.token.approve(spender, amount);

// Create vesting schedule
await sdk.token.createVestingSchedule(
  beneficiary,
  totalAmount,
  startTime,
  cliff,
  duration,
  revocable
);
```

### NFT Operations

```typescript
// Mint NFT
await sdk.gameAsset.mint(to, metadataURI, AssetRarity.RARE);

// Get owned tokens
const tokens = await sdk.gameAsset.getTokensOfOwner(address);

// Transfer NFT
await sdk.gameAsset.transferFrom(from, to, tokenId);

// Upgrade asset
await sdk.gameAsset.upgradeAsset(tokenId, newLevel, experience);

// Combine assets
await sdk.gameAsset.combineAssets(tokenIds, newMetadataURI, newRarity);
```

### Marketplace Operations

```typescript
// Create listing
await sdk.marketplace.createListing(
  AssetType.ERC721,
  assetAddress,
  tokenId,
  amount,
  price,
  paymentToken,
  expiry
);

// Buy from listing
await sdk.marketplace.buyListing(listingId, amount);

// Create trade offer
await sdk.marketplace.createTradeOffer(
  targetListing,
  offerAssetType,
  offerAssetAddress,
  offerTokenId,
  offerAmount,
  additionalPayment,
  expiry
);

// Get active listings
const listings = await sdk.marketplace.getActiveListings(offset, limit);
```

### Access Control

```typescript
// Check role
const hasRole = await sdk.accessHub.hasRole(role, account);

// Grant role
await sdk.accessHub.grantRole(role, account);

// Create time lock
await sdk.accessHub.scheduleTimeLock(target, data, executionTime);

// Delegate role
await sdk.accessHub.delegateRole(role, delegatee, duration);
```

## Error Handling

```typescript
import { FluxSDKError, FluxErrorCode } from '@flux-blockchain/sdk';

try {
  await sdk.token.transfer(to, amount);
} catch (error) {
  if (error instanceof FluxSDKError) {
    switch (error.code) {
      case FluxErrorCode.INSUFFICIENT_BALANCE:
        console.error('Not enough tokens');
        break;
      case FluxErrorCode.TOKEN_PAUSED:
        console.error('Token transfers are paused');
        break;
      default:
        console.error('Transaction failed:', error.message);
    }
  }
}
```

## Event Listening

```typescript
// Listen for events
const listener = sdk.token.onEvent('Transfer', (from, to, amount) => {
  console.log(`Transfer: ${from} → ${to}: ${amount}`);
});

// Query past events
const events = await sdk.token.queryFilter('Transfer', fromBlock, toBlock);

// Remove listener
sdk.token.removeListener('Transfer', listener);
```

## Examples

See the [examples](./examples) directory for more detailed usage:
- [Basic Usage](./examples/basic-usage.ts)
- [Advanced Usage](./examples/advanced-usage.ts)

## Development

```bash
# Install dependencies
npm install

# Build SDK
npm run build

# Run tests
npm test

# Generate documentation
npm run docs
```

## License

MIT License

## Support

- GitHub Issues: [flux-blockchain/issues](https://github.com/jeromwolf/flux-blockchain/issues)
- Documentation: [flux-blockchain.io/docs](https://flux-blockchain.io/docs)
- Discord: [Join our community](https://discord.gg/flux)