import { ethers } from 'ethers';
import { BaseContract } from './BaseContract';
import { Address, TransactionOptions, AssetType, Listing, TradeOffer } from '../types';
export declare class FluxMarketplace extends BaseContract {
    constructor(address: Address, signerOrProvider: ethers.Signer | ethers.Provider);
    fluxToken(): Promise<Address>;
    fluxGameAsset(): Promise<Address>;
    feePercentage(): Promise<bigint>;
    feeRecipient(): Promise<Address>;
    nextListingId(): Promise<bigint>;
    nextOfferId(): Promise<bigint>;
    getListing(listingId: bigint): Promise<Listing>;
    getTradeOffer(offerId: bigint): Promise<TradeOffer>;
    getActiveListings(offset?: number, limit?: number): Promise<Listing[]>;
    getListingsBySeller(seller: Address): Promise<Listing[]>;
    hasRole(role: string, account: Address): Promise<boolean>;
    createListing(assetType: AssetType, assetAddress: Address, tokenId: bigint, amount: bigint, price: bigint, paymentToken: Address, expiry: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    buyListing(listingId: bigint, amount: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    cancelListing(listingId: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    createTradeOffer(targetListing: bigint, offerAssetType: AssetType, offerAssetAddress: Address, offerTokenId: bigint, offerAmount: bigint, additionalPayment: bigint, expiry: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    acceptTradeOffer(offerId: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    cancelTradeOffer(offerId: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    setFeePercentage(newFeePercentage: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    setFeeRecipient(newFeeRecipient: Address, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    emergencyWithdraw(token: Address, amount: bigint, options?: TransactionOptions): Promise<ethers.ContractTransactionResponse>;
    canAdmin(account: Address): Promise<boolean>;
    calculateFee(price: bigint, feePercentage: bigint): bigint;
    calculateSellerProceeds(price: bigint, feePercentage: bigint): bigint;
    isListingActive(listingId: bigint): Promise<boolean>;
    isOfferActive(offerId: bigint): Promise<boolean>;
}
//# sourceMappingURL=FluxMarketplace.d.ts.map