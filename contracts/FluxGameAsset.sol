// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IFluxGameAsset.sol";

/**
 * @title FluxGameAsset
 * @dev Implementation of Flux Game Asset NFTs - Unique game items on the blockchain
 */
contract FluxGameAsset is 
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Burnable,
    ERC2981,
    ReentrancyGuard,
    AccessControl,
    IFluxGameAsset
{
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // State variables
    uint256 private _tokenIdCounter;
    string private _baseTokenURI;
    
    // Mapping from token ID to asset data
    mapping(uint256 => AssetData) private _assetData;
    
    // Game server signatures for secure minting
    mapping(bytes32 => bool) private _usedSignatures;
    
    /**
     * @dev Constructor
     * @param name_ Collection name
     * @param symbol_ Collection symbol
     * @param baseURI_ Base URI for metadata
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721(name_, symbol_) {
        _baseTokenURI = baseURI_;
        
        // Grant roles to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(GAME_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        
        // Set default royalty (5% total: 2.5% creator + 2.5% platform)
        _setDefaultRoyalty(msg.sender, 500); // 5%
    }
    
    /**
     * @dev Mint a single NFT
     */
    function mint(
        address to,
        ItemType itemType,
        uint8 rarity,
        uint8 level,
        uint32 gameId
    ) public override onlyRole(MINTER_ROLE) returns (uint256) {
        return _mintAsset(to, itemType, rarity, level, gameId);
    }
    
    /**
     * @dev Internal mint function
     */
    function _mintAsset(
        address to,
        ItemType itemType,
        uint8 rarity,
        uint8 level,
        uint32 gameId
    ) internal returns (uint256) {
        require(rarity >= 1 && rarity <= 5, "Invalid rarity");
        require(level >= 1 && level <= 100, "Invalid level");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        
        _assetData[tokenId] = AssetData({
            itemType: itemType,
            rarity: rarity,
            level: level,
            gameId: gameId,
            mintedAt: block.timestamp
        });
        
        emit AssetMinted(tokenId, to, itemType, rarity);
        
        return tokenId;
    }
    
    /**
     * @dev Mint multiple NFTs in batch
     */
    function mintBatch(
        address to,
        ItemType[] calldata itemTypes,
        uint8[] calldata rarities,
        uint8[] calldata levels,
        uint32 gameId
    ) public override onlyRole(MINTER_ROLE) returns (uint256[] memory) {
        require(
            itemTypes.length == rarities.length && 
            rarities.length == levels.length,
            "Array length mismatch"
        );
        require(itemTypes.length > 0 && itemTypes.length <= 100, "Invalid batch size");
        
        uint256[] memory tokenIds = new uint256[](itemTypes.length);
        
        for (uint256 i = 0; i < itemTypes.length; i++) {
            tokenIds[i] = mint(to, itemTypes[i], rarities[i], levels[i], gameId);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Upgrade an asset's level
     */
    function upgradeAsset(
        uint256 tokenId,
        uint8 newLevel
    ) public override onlyRole(UPGRADER_ROLE) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(newLevel > _assetData[tokenId].level, "New level must be higher");
        require(newLevel <= 100, "Max level is 100");
        
        uint8 oldLevel = _assetData[tokenId].level;
        _assetData[tokenId].level = newLevel;
        
        emit AssetUpgraded(tokenId, oldLevel, newLevel);
    }
    
    /**
     * @dev Combine multiple assets into a new one
     */
    function combineAssets(
        uint256[] calldata tokenIds,
        ItemType newItemType,
        uint8 newRarity,
        uint8 newLevel
    ) public override nonReentrant returns (uint256) {
        require(tokenIds.length >= 2, "Need at least 2 assets");
        require(tokenIds.length <= 10, "Too many assets");
        
        address owner = ownerOf(tokenIds[0]);
        require(owner == msg.sender || hasRole(GAME_ROLE, msg.sender), "Not authorized");
        
        // Verify ownership and burn consumed assets
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(ownerOf(tokenIds[i]) == owner, "All assets must have same owner");
            _burn(tokenIds[i]);
            delete _assetData[tokenIds[i]];
        }
        
        // Mint new combined asset
        uint256 newTokenId = _mintAsset(owner, newItemType, newRarity, newLevel, _assetData[tokenIds[0]].gameId);
        
        emit AssetsCombined(tokenIds, newTokenId, owner);
        
        return newTokenId;
    }
    
    /**
     * @dev Get asset data
     */
    function getAssetData(uint256 tokenId) public view override returns (AssetData memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _assetData[tokenId];
    }
    
    /**
     * @dev Set base URI for metadata
     */
    function setBaseURI(string calldata newBaseURI) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }
    
    /**
     * @dev Set default royalty info
     */
    function setDefaultRoyalty(
        address receiver,
        uint96 royaltyBps
    ) public override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(royaltyBps <= 1000, "Royalty too high"); // Max 10%
        _setDefaultRoyalty(receiver, royaltyBps);
        emit RoyaltyUpdated(receiver, royaltyBps);
    }
    
    /**
     * @dev Check if token exists
     */
    function exists(uint256 tokenId) public view override returns (bool) {
        try this.ownerOf(tokenId) returns (address) {
            return true;
        } catch {
            return false;
        }
    }
    
    // totalSupply is inherited from ERC721Enumerable
    
    /**
     * @dev Secure minting with game server signature
     */
    function mintWithSignature(
        address to,
        ItemType itemType,
        uint8 rarity,
        uint8 level,
        uint32 gameId,
        uint256 nonce,
        bytes calldata signature
    ) public returns (uint256) {
        // Verify signature
        bytes32 messageHash = keccak256(
            abi.encodePacked(to, itemType, rarity, level, gameId, nonce)
        );
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        require(!_usedSignatures[ethSignedMessageHash], "Signature already used");
        require(hasRole(GAME_ROLE, recoverSigner(ethSignedMessageHash, signature)), "Invalid signature");
        
        _usedSignatures[ethSignedMessageHash] = true;
        
        return _mintAsset(to, itemType, rarity, level, gameId);
    }
    
    /**
     * @dev Recover signer from signature
     */
    function recoverSigner(bytes32 messageHash, bytes memory signature) private pure returns (address) {
        require(signature.length == 65, "Invalid signature length");
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
        
        return ecrecover(messageHash, v, r, s);
    }
    
    // Override functions
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // _burn is handled by ERC721URIStorage
    
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 amount) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, amount);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}