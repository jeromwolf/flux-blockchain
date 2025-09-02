"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxMarketplace = void 0;
const BaseContract_1 = require("./BaseContract");
const types_1 = require("../types");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const FluxMarketplace_json_1 = __importDefault(require("../abis/FluxMarketplace.json"));
class FluxMarketplace extends BaseContract_1.BaseContract {
    constructor(address, signerOrProvider) {
        super(address, FluxMarketplace_json_1.default.abi, signerOrProvider);
    }
    // Read methods
    async fluxToken() {
        try {
            return await this.call('fluxToken');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async fluxGameAsset() {
        try {
            return await this.call('fluxGameAsset');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async feePercentage() {
        try {
            return await this.call('feePercentage');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async feeRecipient() {
        try {
            return await this.call('feeRecipient');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async nextListingId() {
        try {
            return await this.call('nextListingId');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async nextOfferId() {
        try {
            return await this.call('nextOfferId');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getListing(listingId) {
        try {
            const listing = await this.call('listings', listingId);
            return {
                listingId,
                seller: listing.seller,
                assetType: listing.assetType,
                assetAddress: listing.assetAddress,
                tokenId: listing.tokenId,
                amount: listing.amount,
                originalAmount: listing.originalAmount,
                price: listing.price,
                paymentToken: listing.paymentToken,
                expiry: listing.expiry,
                status: listing.status,
            };
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getTradeOffer(offerId) {
        try {
            const offer = await this.call('tradeOffers', offerId);
            return {
                offerId,
                offerer: offer.offerer,
                targetListing: offer.targetListing,
                offerAssetType: offer.offerAssetType,
                offerAssetAddress: offer.offerAssetAddress,
                offerTokenId: offer.offerTokenId,
                offerAmount: offer.offerAmount,
                additionalPayment: offer.additionalPayment,
                expiry: offer.expiry,
                status: offer.status,
            };
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getActiveListings(offset = 0, limit = 100) {
        try {
            const totalListings = await this.nextListingId();
            const listings = [];
            const start = BigInt(offset);
            const end = BigInt(Math.min(Number(totalListings), offset + limit));
            for (let i = start; i < end; i++) {
                const listing = await this.getListing(i);
                if (listing.status === types_1.ListingStatus.ACTIVE) {
                    listings.push(listing);
                }
            }
            return listings;
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getListingsBySeller(seller) {
        try {
            const totalListings = await this.nextListingId();
            const listings = [];
            for (let i = BigInt(0); i < totalListings; i++) {
                const listing = await this.getListing(i);
                if (listing.seller.toLowerCase() === seller.toLowerCase()) {
                    listings.push(listing);
                }
            }
            return listings;
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async hasRole(role, account) {
        try {
            return await this.call('hasRole', role, account);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    // Write methods
    async createListing(assetType, assetAddress, tokenId, amount, price, paymentToken, expiry, options) {
        try {
            return await this.sendTransaction('createListing', [assetType, assetAddress, tokenId, amount, price, paymentToken, expiry], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async buyListing(listingId, amount, options) {
        try {
            return await this.sendTransaction('buyListing', [listingId, amount], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async cancelListing(listingId, options) {
        try {
            return await this.sendTransaction('cancelListing', [listingId], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async createTradeOffer(targetListing, offerAssetType, offerAssetAddress, offerTokenId, offerAmount, additionalPayment, expiry, options) {
        try {
            return await this.sendTransaction('createTradeOffer', [
                targetListing,
                offerAssetType,
                offerAssetAddress,
                offerTokenId,
                offerAmount,
                additionalPayment,
                expiry
            ], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async acceptTradeOffer(offerId, options) {
        try {
            return await this.sendTransaction('acceptTradeOffer', [offerId], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async cancelTradeOffer(offerId, options) {
        try {
            return await this.sendTransaction('cancelTradeOffer', [offerId], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async setFeePercentage(newFeePercentage, options) {
        try {
            return await this.sendTransaction('setFeePercentage', [newFeePercentage], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async setFeeRecipient(newFeeRecipient, options) {
        try {
            return await this.sendTransaction('setFeeRecipient', [newFeeRecipient], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async emergencyWithdraw(token, amount, options) {
        try {
            return await this.sendTransaction('emergencyWithdraw', [token, amount], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    // Helper methods
    async canAdmin(account) {
        return this.hasRole(constants_1.MARKETPLACE_ADMIN_ROLE, account);
    }
    calculateFee(price, feePercentage) {
        return (price * feePercentage) / BigInt(10000);
    }
    calculateSellerProceeds(price, feePercentage) {
        const fee = this.calculateFee(price, feePercentage);
        return price - fee;
    }
    async isListingActive(listingId) {
        try {
            const listing = await this.getListing(listingId);
            return listing.status === types_1.ListingStatus.ACTIVE &&
                listing.expiry > BigInt(Math.floor(Date.now() / 1000));
        }
        catch {
            return false;
        }
    }
    async isOfferActive(offerId) {
        try {
            const offer = await this.getTradeOffer(offerId);
            return offer.status === 0 && // Active status
                offer.expiry > BigInt(Math.floor(Date.now() / 1000));
        }
        catch {
            return false;
        }
    }
}
exports.FluxMarketplace = FluxMarketplace;
//# sourceMappingURL=FluxMarketplace.js.map