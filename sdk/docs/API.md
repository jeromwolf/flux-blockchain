# Flux Blockchain SDK API Documentation

## Table of Contents

- [FluxSDK](#fluxsdk)
- [FluxToken](#fluxtoken)
- [FluxGameAsset](#fluxgameasset)
- [FluxMarketplace](#fluxmarketplace)
- [FluxAccessHub](#fluxaccesshub)
- [Types](#types)
- [Constants](#constants)
- [Errors](#errors)

## FluxSDK

The main SDK class that provides access to all Flux Blockchain contracts.

### Constructor

```typescript
new FluxSDK(config: FluxSDKConfig)
```

**Parameters:**
- `config`: SDK configuration object
  - `network`: Target network (Network enum)
  - `privateKey?`: Private key for write operations
  - `rpcUrl?`: Custom RPC URL
  - `contracts?`: Override contract addresses

### Static Methods

#### `create(config: FluxSDKConfig): Promise<FluxSDK>`
Creates and validates SDK instance asynchronously.

#### `createWithProvider(provider: Provider, network: Network, contracts?: Partial<ContractAddresses>): FluxSDK`
Creates SDK with existing ethers Provider.

#### `createWithSigner(signer: Signer, network: Network, contracts?: Partial<ContractAddresses>): FluxSDK`
Creates SDK with existing ethers Signer.

### Instance Methods

#### Network Management
- `getNetwork(): Network` - Get current network
- `getNetworkConfig(): NetworkConfig` - Get network configuration
- `validateNetwork(): Promise<void>` - Validate network connection
- `getChainId(): Promise<bigint>` - Get chain ID

#### Account Management
- `getAddress(): Promise<Address | null>` - Get signer address
- `getBalance(address?: Address): Promise<bigint>` - Get ETH balance

#### Contract Addresses
- `getContractAddresses(): ContractAddresses` - Get all contract addresses
- `getTokenAddress(): Address` - Get FluxToken address
- `getGameAssetAddress(): Address` - Get FluxGameAsset address
- `getMarketplaceAddress(): Address` - Get FluxMarketplace address
- `getAccessHubAddress(): Address` - Get FluxAccessHub address

## FluxToken

ERC-20 token contract interface.

### Read Methods

#### `getTokenInfo(): Promise<TokenInfo>`
Returns complete token information.

#### `balanceOf(address: Address): Promise<bigint>`
Get token balance of an address.

#### `allowance(owner: Address, spender: Address): Promise<bigint>`
Get spending allowance.

#### `paused(): Promise<boolean>`
Check if token transfers are paused.

#### `hasRole(role: string, account: Address): Promise<boolean>`
Check if account has specific role.

#### `getVestingSchedule(beneficiary: Address): Promise<VestingSchedule | null>`
Get vesting schedule for beneficiary.

#### `getReleasableAmount(beneficiary: Address): Promise<bigint>`
Get amount available for release from vesting.

### Write Methods

#### `transfer(to: Address, amount: bigint, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Transfer tokens to address.

#### `approve(spender: Address, amount: bigint, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Approve spending allowance.

#### `mint(to: Address, amount: bigint, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Mint new tokens (requires MINTER_ROLE).

#### `burn(amount: bigint, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Burn tokens from caller.

#### `pause(options?: TransactionOptions): Promise<ContractTransactionResponse>`
Pause token transfers (requires PAUSER_ROLE).

#### `createVestingSchedule(...): Promise<ContractTransactionResponse>`
Create new vesting schedule.

### Helper Methods

#### `formatTokenAmount(amount: bigint): string`
Format raw token amount to human-readable string.

#### `parseTokenAmount(amount: string): bigint`
Parse human-readable amount to raw bigint.

## FluxGameAsset

ERC-721 NFT contract interface for game assets.

### Read Methods

#### `name(): Promise<string>`
Get NFT collection name.

#### `symbol(): Promise<string>`
Get NFT collection symbol.

#### `totalSupply(): Promise<bigint>`
Get total number of NFTs minted.

#### `balanceOf(owner: Address): Promise<bigint>`
Get NFT balance of owner.

#### `ownerOf(tokenId: bigint): Promise<Address>`
Get owner of specific token.

#### `getAssetMetadata(tokenId: bigint): Promise<AssetMetadata>`
Get complete metadata for asset.

#### `getTokensOfOwner(owner: Address): Promise<bigint[]>`
Get all token IDs owned by address.

### Write Methods

#### `mint(to: Address, metadataURI: string, rarity: AssetRarity, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Mint new NFT (requires GAME_ADMIN_ROLE).

#### `batchMint(recipients: Address[], metadataURIs: string[], rarities: AssetRarity[], options?: TransactionOptions): Promise<ContractTransactionResponse>`
Mint multiple NFTs in one transaction.

#### `transferFrom(from: Address, to: Address, tokenId: bigint, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Transfer NFT between addresses.

#### `upgradeAsset(tokenId: bigint, newLevel: number, additionalExperience: bigint, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Upgrade asset level and experience.

#### `combineAssets(tokenIds: bigint[], newMetadataURI: string, newRarity: AssetRarity, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Combine multiple assets into new one.

## FluxMarketplace

Decentralized marketplace contract interface.

### Read Methods

#### `getListing(listingId: bigint): Promise<Listing>`
Get listing details by ID.

#### `getActiveListings(offset?: number, limit?: number): Promise<Listing[]>`
Get paginated active listings.

#### `getListingsBySeller(seller: Address): Promise<Listing[]>`
Get all listings by seller.

#### `getTradeOffer(offerId: bigint): Promise<TradeOffer>`
Get trade offer details.

#### `feePercentage(): Promise<bigint>`
Get marketplace fee percentage (basis points).

### Write Methods

#### `createListing(...): Promise<ContractTransactionResponse>`
Create new marketplace listing.

**Parameters:**
- `assetType`: Type of asset (ERC20/ERC721/ERC1155)
- `assetAddress`: Contract address of asset
- `tokenId`: Token ID (0 for ERC20)
- `amount`: Amount to sell
- `price`: Price per unit
- `paymentToken`: Payment token address
- `expiry`: Expiration timestamp

#### `buyListing(listingId: bigint, amount: bigint, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Buy from active listing.

#### `cancelListing(listingId: bigint, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Cancel own listing.

#### `createTradeOffer(...): Promise<ContractTransactionResponse>`
Create trade offer for listing.

#### `acceptTradeOffer(offerId: bigint, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Accept incoming trade offer.

### Helper Methods

#### `calculateFee(price: bigint, feePercentage: bigint): bigint`
Calculate marketplace fee for price.

#### `isListingActive(listingId: bigint): Promise<boolean>`
Check if listing is active and not expired.

## FluxAccessHub

Centralized access control contract interface.

### Read Methods

#### `hasRole(role: string, account: Address): Promise<boolean>`
Check if account has role.

#### `getRoleAdmin(role: string): Promise<string>`
Get admin role for a role.

#### `getAllRoleMembers(role: string): Promise<Address[]>`
Get all members of a role.

#### `getTimeLock(id: string): Promise<TimeLock | null>`
Get time lock details by ID.

#### `getDelegation(delegator: Address, role: string): Promise<Delegation | null>`
Get delegation details.

### Write Methods

#### `grantRole(role: string, account: Address, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Grant role to account.

#### `revokeRole(role: string, account: Address, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Revoke role from account.

#### `scheduleTimeLock(target: Address, data: string, executionTime: bigint, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Schedule time-locked operation.

#### `delegateRole(role: string, delegatee: Address, duration: bigint, options?: TransactionOptions): Promise<ContractTransactionResponse>`
Delegate role temporarily.

### Helper Methods

#### `generateTimeLockId(target: Address, data: string, executionTime: bigint): string`
Generate time lock ID for operation.

#### `calculateExecutionTime(delayInSeconds: number): bigint`
Calculate execution timestamp from delay.

## Types

### Core Types

```typescript
type Address = string;
type TransactionHash = string;

enum Network {
  POLYGON = 137,
  MUMBAI = 80001,
  LOCALHOST = 31337,
}

interface TransactionOptions {
  gasLimit?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
  value?: bigint;
}
```

### Token Types

```typescript
interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  cap: bigint;
}

interface VestingSchedule {
  beneficiary: Address;
  totalAmount: bigint;
  releasedAmount: bigint;
  startTime: bigint;
  cliff: bigint;
  duration: bigint;
  revocable: boolean;
  revoked: boolean;
}
```

### NFT Types

```typescript
enum AssetRarity {
  COMMON = 0,
  UNCOMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4,
  MYTHIC = 5,
}

interface AssetMetadata {
  tokenId: bigint;
  assetType: string;
  level: number;
  experience: bigint;
  rarity: AssetRarity;
  attributes: Record<string, any>;
  createdAt: bigint;
  lastUpgrade: bigint;
}
```

### Marketplace Types

```typescript
enum AssetType {
  ERC20 = 0,
  ERC721 = 1,
  ERC1155 = 2,
}

enum ListingStatus {
  ACTIVE = 0,
  SOLD = 1,
  CANCELLED = 2,
  EXPIRED = 3,
}

interface Listing {
  listingId: bigint;
  seller: Address;
  assetType: AssetType;
  assetAddress: Address;
  tokenId: bigint;
  amount: bigint;
  originalAmount: bigint;
  price: bigint;
  paymentToken: Address;
  expiry: bigint;
  status: ListingStatus;
}
```

## Constants

### Roles
- `DEFAULT_ADMIN_ROLE`: Default admin role hash
- `MINTER_ROLE`: Token minter role
- `PAUSER_ROLE`: Token pauser role
- `BURNER_ROLE`: Token burner role
- `GAME_ADMIN_ROLE`: Game admin role
- `MARKETPLACE_ADMIN_ROLE`: Marketplace admin role

### Token
- `FLUX_TOKEN_DECIMALS`: 18
- `FLUX_TOKEN_CAP`: 42 billion tokens

### Time
- `ONE_DAY`: 86400 seconds
- `ONE_WEEK`: 604800 seconds
- `ONE_MONTH`: 2592000 seconds
- `ONE_YEAR`: 31536000 seconds

## Errors

### FluxSDKError

Custom error class with error codes.

```typescript
class FluxSDKError extends Error {
  code: FluxErrorCode;
  originalError?: unknown;
}
```

### Error Codes

```typescript
enum FluxErrorCode {
  UNKNOWN_ERROR,
  NETWORK_ERROR,
  INVALID_ARGUMENT,
  MISSING_ARGUMENT,
  UNAUTHORIZED,
  CONTRACT_NOT_FOUND,
  TRANSACTION_FAILED,
  INSUFFICIENT_BALANCE,
  INSUFFICIENT_ALLOWANCE,
  TOKEN_CAP_EXCEEDED,
  TOKEN_PAUSED,
  INVALID_VESTING_SCHEDULE,
  TOKEN_NOT_FOUND,
  NOT_TOKEN_OWNER,
  INVALID_SIGNATURE,
  SIGNATURE_EXPIRED,
  LISTING_NOT_FOUND,
  LISTING_EXPIRED,
  LISTING_NOT_ACTIVE,
  INVALID_PRICE,
  OFFER_NOT_FOUND,
  ROLE_NOT_GRANTED,
  TIMELOCK_NOT_READY,
  DELEGATION_EXPIRED,
}
```

### Error Handling

```typescript
try {
  await sdk.token.transfer(to, amount);
} catch (error) {
  if (error instanceof FluxSDKError) {
    console.error(`Error ${error.code}: ${error.message}`);
  }
}
```