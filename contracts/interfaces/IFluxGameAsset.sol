// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

/**
 * @title IFluxGameAsset
 * @dev Interface for Flux Game Asset NFTs (ERC-721)
 */
interface IFluxGameAsset {
    // Enums
    enum ItemType {
        Weapon,
        Armor,
        Consumable,
        Material,
        Character,
        Land
    }
    
    // Structs
    struct AssetData {
        ItemType itemType;
        uint8 rarity;      // 1-5 (Common to Legendary)
        uint8 level;       // 1-100
        uint32 gameId;     // Game identifier
        uint256 mintedAt;  // Timestamp
    }
    
    // RoyaltyInfo struct is defined in IERC2981
    
    // Events
    event AssetMinted(
        uint256 indexed tokenId,
        address indexed to,
        ItemType itemType,
        uint8 rarity
    );
    
    event AssetUpgraded(
        uint256 indexed tokenId,
        uint8 oldLevel,
        uint8 newLevel
    );
    
    event AssetsCombined(
        uint256[] consumedTokenIds,
        uint256 newTokenId,
        address indexed owner
    );
    
    event BaseURIUpdated(string newBaseURI);
    
    event RoyaltyUpdated(address receiver, uint96 royaltyBps);
    
    // Functions
    function mint(
        address to,
        ItemType itemType,
        uint8 rarity,
        uint8 level,
        uint32 gameId
    ) external returns (uint256);
    
    function mintBatch(
        address to,
        ItemType[] calldata itemTypes,
        uint8[] calldata rarities,
        uint8[] calldata levels,
        uint32 gameId
    ) external returns (uint256[] memory);
    
    function upgradeAsset(uint256 tokenId, uint8 newLevel) external;
    
    function combineAssets(
        uint256[] calldata tokenIds,
        ItemType newItemType,
        uint8 newRarity,
        uint8 newLevel
    ) external returns (uint256);
    
    function getAssetData(uint256 tokenId) external view returns (AssetData memory);
    
    function setBaseURI(string calldata newBaseURI) external;
    
    function setDefaultRoyalty(address receiver, uint96 royaltyBps) external;
    
    function exists(uint256 tokenId) external view returns (bool);
    
    // totalSupply is already defined in IERC721Enumerable
}