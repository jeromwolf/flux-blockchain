"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluxGameAsset = void 0;
const BaseContract_1 = require("./BaseContract");
const constants_1 = require("../constants");
const utils_1 = require("../utils");
const FluxGameAsset_json_1 = __importDefault(require("../abis/FluxGameAsset.json"));
class FluxGameAsset extends BaseContract_1.BaseContract {
    constructor(address, signerOrProvider) {
        super(address, FluxGameAsset_json_1.default.abi, signerOrProvider);
    }
    // Read methods
    async name() {
        try {
            return await this.call('name');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async symbol() {
        try {
            return await this.call('symbol');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async totalSupply() {
        try {
            return await this.call('totalSupply');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async balanceOf(owner) {
        try {
            return await this.call('balanceOf', owner);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async ownerOf(tokenId) {
        try {
            return await this.call('ownerOf', tokenId);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async tokenURI(tokenId) {
        try {
            return await this.call('tokenURI', tokenId);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getApproved(tokenId) {
        try {
            return await this.call('getApproved', tokenId);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async isApprovedForAll(owner, operator) {
        try {
            return await this.call('isApprovedForAll', owner, operator);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getAssetMetadata(tokenId) {
        try {
            const metadata = await this.call('assetMetadata', tokenId);
            return {
                tokenId,
                assetType: metadata.assetType,
                level: metadata.level,
                experience: metadata.experience,
                rarity: metadata.rarity,
                attributes: metadata.attributes,
                createdAt: metadata.createdAt,
                lastUpgrade: metadata.lastUpgrade,
            };
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async getTokensOfOwner(owner) {
        try {
            const balance = await this.balanceOf(owner);
            const tokens = [];
            for (let i = 0; i < Number(balance); i++) {
                const tokenId = await this.call('tokenOfOwnerByIndex', owner, i);
                tokens.push(tokenId);
            }
            return tokens;
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async baseURI() {
        try {
            return await this.call('baseURI');
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async royaltyInfo(tokenId, salePrice) {
        try {
            return await this.call('royaltyInfo', tokenId, salePrice);
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
    async mint(to, metadataURI, rarity, options) {
        try {
            return await this.sendTransaction('mint', [to, metadataURI, rarity], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async mintWithSignature(signature, options) {
        try {
            return await this.sendTransaction('mintWithSignature', [
                signature.tokenId,
                signature.recipient,
                signature.metadataURI,
                signature.rarity,
                signature.deadline,
                signature.v,
                signature.r,
                signature.s
            ], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async batchMint(recipients, metadataURIs, rarities, options) {
        try {
            return await this.sendTransaction('batchMint', [recipients, metadataURIs, rarities], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async approve(to, tokenId, options) {
        try {
            return await this.sendTransaction('approve', [to, tokenId], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async setApprovalForAll(operator, approved, options) {
        try {
            return await this.sendTransaction('setApprovalForAll', [operator, approved], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async transferFrom(from, to, tokenId, options) {
        try {
            return await this.sendTransaction('transferFrom', [from, to, tokenId], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async safeTransferFrom(from, to, tokenId, data = '0x', options) {
        try {
            return await this.sendTransaction('safeTransferFrom(address,address,uint256,bytes)', [from, to, tokenId, data], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async burn(tokenId, options) {
        try {
            return await this.sendTransaction('burn', [tokenId], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async upgradeAsset(tokenId, newLevel, additionalExperience, options) {
        try {
            return await this.sendTransaction('upgradeAsset', [tokenId, newLevel, additionalExperience], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async updateAssetAttributes(tokenId, attributes, options) {
        try {
            return await this.sendTransaction('updateAssetAttributes', [tokenId, JSON.stringify(attributes)], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async combineAssets(tokenIds, newMetadataURI, newRarity, options) {
        try {
            return await this.sendTransaction('combineAssets', [tokenIds, newMetadataURI, newRarity], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async setBaseURI(baseURI, options) {
        try {
            return await this.sendTransaction('setBaseURI', [baseURI], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    async setDefaultRoyalty(receiver, feeNumerator, options) {
        try {
            return await this.sendTransaction('setDefaultRoyalty', [receiver, feeNumerator], options);
        }
        catch (error) {
            return (0, utils_1.handleError)(error);
        }
    }
    // Helper methods
    async canMint(account) {
        return this.hasRole(constants_1.GAME_ADMIN_ROLE, account);
    }
    async exists(tokenId) {
        try {
            await this.ownerOf(tokenId);
            return true;
        }
        catch {
            return false;
        }
    }
    async isOwner(tokenId, address) {
        try {
            const owner = await this.ownerOf(tokenId);
            return owner.toLowerCase() === address.toLowerCase();
        }
        catch {
            return false;
        }
    }
}
exports.FluxGameAsset = FluxGameAsset;
//# sourceMappingURL=FluxGameAsset.js.map