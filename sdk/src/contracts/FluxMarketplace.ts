import { ethers } from 'ethers';
import { BaseContract } from './BaseContract';
import { 
  Address, 
  TransactionOptions, 
  AssetType,
  ListingStatus,
  Listing,
  TradeOffer
} from '../types';
import { MARKETPLACE_ADMIN_ROLE } from '../constants';
import { handleError } from '../utils';
import FluxMarketplaceABI from '../abis/FluxMarketplace.json';

export class FluxMarketplace extends BaseContract {
  constructor(
    address: Address,
    signerOrProvider: ethers.Signer | ethers.Provider
  ) {
    super(address, FluxMarketplaceABI.abi, signerOrProvider);
  }

  // Read methods
  async fluxToken(): Promise<Address> {
    try {
      return await this.call<Address>('fluxToken');
    } catch (error) {
      return handleError(error);
    }
  }

  async fluxGameAsset(): Promise<Address> {
    try {
      return await this.call<Address>('fluxGameAsset');
    } catch (error) {
      return handleError(error);
    }
  }

  async feePercentage(): Promise<bigint> {
    try {
      return await this.call<bigint>('feePercentage');
    } catch (error) {
      return handleError(error);
    }
  }

  async feeRecipient(): Promise<Address> {
    try {
      return await this.call<Address>('feeRecipient');
    } catch (error) {
      return handleError(error);
    }
  }

  async nextListingId(): Promise<bigint> {
    try {
      return await this.call<bigint>('nextListingId');
    } catch (error) {
      return handleError(error);
    }
  }

  async nextOfferId(): Promise<bigint> {
    try {
      return await this.call<bigint>('nextOfferId');
    } catch (error) {
      return handleError(error);
    }
  }

  async getListing(listingId: bigint): Promise<Listing> {
    try {
      const listing = await this.call<any>('listings', listingId);
      
      return {
        listingId,
        seller: listing.seller,
        assetType: listing.assetType as AssetType,
        assetAddress: listing.assetAddress,
        tokenId: listing.tokenId,
        amount: listing.amount,
        originalAmount: listing.originalAmount,
        price: listing.price,
        paymentToken: listing.paymentToken,
        expiry: listing.expiry,
        status: listing.status as ListingStatus,
      };
    } catch (error) {
      return handleError(error);
    }
  }

  async getTradeOffer(offerId: bigint): Promise<TradeOffer> {
    try {
      const offer = await this.call<any>('tradeOffers', offerId);
      
      return {
        offerId,
        offerer: offer.offerer,
        targetListing: offer.targetListing,
        offerAssetType: offer.offerAssetType as AssetType,
        offerAssetAddress: offer.offerAssetAddress,
        offerTokenId: offer.offerTokenId,
        offerAmount: offer.offerAmount,
        additionalPayment: offer.additionalPayment,
        expiry: offer.expiry,
        status: offer.status,
      };
    } catch (error) {
      return handleError(error);
    }
  }

  async getActiveListings(offset: number = 0, limit: number = 100): Promise<Listing[]> {
    try {
      const totalListings = await this.nextListingId();
      const listings: Listing[] = [];
      
      const start = BigInt(offset);
      const end = BigInt(Math.min(Number(totalListings), offset + limit));
      
      for (let i = start; i < end; i++) {
        const listing = await this.getListing(i);
        if (listing.status === ListingStatus.ACTIVE) {
          listings.push(listing);
        }
      }
      
      return listings;
    } catch (error) {
      return handleError(error);
    }
  }

  async getListingsBySeller(seller: Address): Promise<Listing[]> {
    try {
      const totalListings = await this.nextListingId();
      const listings: Listing[] = [];
      
      for (let i = BigInt(0); i < totalListings; i++) {
        const listing = await this.getListing(i);
        if (listing.seller.toLowerCase() === seller.toLowerCase()) {
          listings.push(listing);
        }
      }
      
      return listings;
    } catch (error) {
      return handleError(error);
    }
  }

  async hasRole(role: string, account: Address): Promise<boolean> {
    try {
      return await this.call<boolean>('hasRole', role, account);
    } catch (error) {
      return handleError(error);
    }
  }

  // Write methods
  async createListing(
    assetType: AssetType,
    assetAddress: Address,
    tokenId: bigint,
    amount: bigint,
    price: bigint,
    paymentToken: Address,
    expiry: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction(
        'createListing',
        [assetType, assetAddress, tokenId, amount, price, paymentToken, expiry],
        options
      );
    } catch (error) {
      return handleError(error);
    }
  }

  async buyListing(
    listingId: bigint,
    amount: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('buyListing', [listingId, amount], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async cancelListing(
    listingId: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('cancelListing', [listingId], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async createTradeOffer(
    targetListing: bigint,
    offerAssetType: AssetType,
    offerAssetAddress: Address,
    offerTokenId: bigint,
    offerAmount: bigint,
    additionalPayment: bigint,
    expiry: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction(
        'createTradeOffer',
        [
          targetListing,
          offerAssetType,
          offerAssetAddress,
          offerTokenId,
          offerAmount,
          additionalPayment,
          expiry
        ],
        options
      );
    } catch (error) {
      return handleError(error);
    }
  }

  async acceptTradeOffer(
    offerId: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('acceptTradeOffer', [offerId], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async cancelTradeOffer(
    offerId: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('cancelTradeOffer', [offerId], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async setFeePercentage(
    newFeePercentage: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('setFeePercentage', [newFeePercentage], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async setFeeRecipient(
    newFeeRecipient: Address,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('setFeeRecipient', [newFeeRecipient], options);
    } catch (error) {
      return handleError(error);
    }
  }

  async emergencyWithdraw(
    token: Address,
    amount: bigint,
    options?: TransactionOptions
  ): Promise<ethers.ContractTransactionResponse> {
    try {
      return await this.sendTransaction('emergencyWithdraw', [token, amount], options);
    } catch (error) {
      return handleError(error);
    }
  }

  // Helper methods
  async canAdmin(account: Address): Promise<boolean> {
    return this.hasRole(MARKETPLACE_ADMIN_ROLE, account);
  }

  calculateFee(price: bigint, feePercentage: bigint): bigint {
    return (price * feePercentage) / BigInt(10000);
  }

  calculateSellerProceeds(price: bigint, feePercentage: bigint): bigint {
    const fee = this.calculateFee(price, feePercentage);
    return price - fee;
  }

  async isListingActive(listingId: bigint): Promise<boolean> {
    try {
      const listing = await this.getListing(listingId);
      return listing.status === ListingStatus.ACTIVE && 
             listing.expiry > BigInt(Math.floor(Date.now() / 1000));
    } catch {
      return false;
    }
  }

  async isOfferActive(offerId: bigint): Promise<boolean> {
    try {
      const offer = await this.getTradeOffer(offerId);
      return offer.status === 0 && // Active status
             offer.expiry > BigInt(Math.floor(Date.now() / 1000));
    } catch {
      return false;
    }
  }
}