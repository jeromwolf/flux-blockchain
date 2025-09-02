import { BigNumberish } from 'ethers';
import { Address } from './index';

// FluxToken Types
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  cap: bigint;
}

export interface VestingSchedule {
  beneficiary: Address;
  totalAmount: bigint;
  releasedAmount: bigint;
  startTime: bigint;
  cliff: bigint;
  duration: bigint;
  revocable: boolean;
  revoked: boolean;
}

// FluxGameAsset Types
export enum AssetRarity {
  COMMON = 0,
  UNCOMMON = 1,
  RARE = 2,
  EPIC = 3,
  LEGENDARY = 4,
  MYTHIC = 5,
}

export interface AssetMetadata {
  tokenId: bigint;
  assetType: string;
  level: number;
  experience: bigint;
  rarity: AssetRarity;
  attributes: Record<string, any>;
  createdAt: bigint;
  lastUpgrade: bigint;
}

export interface MintSignature {
  tokenId: BigNumberish;
  recipient: Address;
  metadataURI: string;
  rarity: AssetRarity;
  deadline: BigNumberish;
  v: number;
  r: string;
  s: string;
}

// FluxMarketplace Types
export enum AssetType {
  ERC20 = 0,
  ERC721 = 1,
  ERC1155 = 2,
}

export enum ListingStatus {
  ACTIVE = 0,
  SOLD = 1,
  CANCELLED = 2,
  EXPIRED = 3,
}

export interface Listing {
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

export interface TradeOffer {
  offerId: bigint;
  offerer: Address;
  targetListing: bigint;
  offerAssetType: AssetType;
  offerAssetAddress: Address;
  offerTokenId: bigint;
  offerAmount: bigint;
  additionalPayment: bigint;
  expiry: bigint;
  status: number;
}

// FluxAccessHub Types
export interface RoleInfo {
  role: string;
  adminRole: string;
  members: Address[];
}

export interface TimeLock {
  target: Address;
  data: string;
  executionTime: bigint;
  executed: boolean;
  cancelled: boolean;
}

export interface Delegation {
  delegator: Address;
  delegatee: Address;
  role: string;
  expiresAt: bigint;
  revoked: boolean;
}