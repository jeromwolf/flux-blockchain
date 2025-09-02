import { ethers } from 'ethers';
import { BaseContract } from './BaseContract';
import { Address, TransactionOptions, AssetMetadata, AssetRarity, MintSignature } from '../types';
export declare class FluxGameAsset extends BaseContract {
    constructor(address: Address, signerOrProvider: ethers.Signer | ethers.Provider);
    name(): Promise<string>;
    symbol(): Promise<string>;
    totalSupply(): Promise<bigint>;
    balanceOf(owner: Address): Promise<bigint>;
    ownerOf(tokenId: bigint): Promise<Address>;
    tokenURI(tokenId: bigint): Promise<string>;
    getApproved(tokenId: bigint): Promise<Address>;
    isApprovedForAll(owner: Address, operator: Address): Promise<boolean>;
    getAssetMetadata(tokenId: bigint): Promise<AssetMetadata>;
    getTokensOfOwner(owner: Address): Promise<bigint[]>;
    baseURI(): Promise<string>;
    royaltyInfo(tokenId: bigint, salePrice: bigint): Promise<[Address, bigint]>;
    hasRole(role: string, account: Address): Promise<boolean>;
    mint(to: Address, metadataURI: string, rarity: AssetRarity, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    mintWithSignature(signature: MintSignature, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    batchMint(recipients: Address[], metadataURIs: string[], rarities: AssetRarity[], options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    approve(to: Address, tokenId: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    setApprovalForAll(operator: Address, approved: boolean, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    transferFrom(from: Address, to: Address, tokenId: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    safeTransferFrom(from: Address, to: Address, tokenId: bigint, data?: string, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    burn(tokenId: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    upgradeAsset(tokenId: bigint, newLevel: number, additionalExperience: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    updateAssetAttributes(tokenId: bigint, attributes: Record<string, any>, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    combineAssets(tokenIds: bigint[], newMetadataURI: string, newRarity: AssetRarity, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    setBaseURI(baseURI: string, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    setDefaultRoyalty(receiver: Address, feeNumerator: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    canMint(account: Address): Promise<boolean>;
    exists(tokenId: bigint): Promise<boolean>;
    isOwner(tokenId: bigint, address: Address): Promise<boolean>;
}
//# sourceMappingURL=FluxGameAsset.d.ts.map