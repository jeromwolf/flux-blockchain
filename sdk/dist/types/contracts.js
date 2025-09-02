"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingStatus = exports.AssetType = exports.AssetRarity = void 0;
// FluxGameAsset Types
var AssetRarity;
(function (AssetRarity) {
    AssetRarity[AssetRarity["COMMON"] = 0] = "COMMON";
    AssetRarity[AssetRarity["UNCOMMON"] = 1] = "UNCOMMON";
    AssetRarity[AssetRarity["RARE"] = 2] = "RARE";
    AssetRarity[AssetRarity["EPIC"] = 3] = "EPIC";
    AssetRarity[AssetRarity["LEGENDARY"] = 4] = "LEGENDARY";
    AssetRarity[AssetRarity["MYTHIC"] = 5] = "MYTHIC";
})(AssetRarity || (exports.AssetRarity = AssetRarity = {}));
// FluxMarketplace Types
var AssetType;
(function (AssetType) {
    AssetType[AssetType["ERC20"] = 0] = "ERC20";
    AssetType[AssetType["ERC721"] = 1] = "ERC721";
    AssetType[AssetType["ERC1155"] = 2] = "ERC1155";
})(AssetType || (exports.AssetType = AssetType = {}));
var ListingStatus;
(function (ListingStatus) {
    ListingStatus[ListingStatus["ACTIVE"] = 0] = "ACTIVE";
    ListingStatus[ListingStatus["SOLD"] = 1] = "SOLD";
    ListingStatus[ListingStatus["CANCELLED"] = 2] = "CANCELLED";
    ListingStatus[ListingStatus["EXPIRED"] = 3] = "EXPIRED";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
//# sourceMappingURL=contracts.js.map