// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IFluxMarketplace
 * @dev Interface for Flux Marketplace - P2P trading for tokens and NFTs
 */
interface IFluxMarketplace {
    // Enums
    enum AssetType {
        ERC20,
        ERC721,
        ERC1155
    }
    
    enum ListingStatus {
        CREATED,
        ACTIVE,
        PARTIALLY_FILLED,
        FILLED,
        CANCELLED,
        EXPIRED
    }
    
    enum OfferStatus {
        PENDING,
        ACCEPTED,
        REJECTED,
        CANCELLED,
        EXPIRED
    }
    
    // Structs
    struct Listing {
        uint256 listingId;
        address seller;
        AssetType assetType;
        address assetContract;
        uint256 tokenId;        // For NFTs, 0 for ERC20
        uint256 amount;         // Current amount available
        uint256 originalAmount; // Original amount listed
        address paymentToken;   // address(0) for native token
        uint256 price;          // Total price for the original listing
        uint256 deadline;
        ListingStatus status;
    }
    
    struct Offer {
        uint256 offerId;
        uint256 listingId;
        address buyer;
        uint256 offerPrice;
        uint256 quantity;       // For partial fills
        uint256 expiration;
        OfferStatus status;
    }
    
    struct Trade {
        uint256 tradeId;
        uint256 listingId;
        address seller;
        address buyer;
        uint256 executedPrice;
        uint256 executedQuantity;
        uint256 timestamp;
        uint256 platformFee;
        uint256 royaltyFee;
    }
    
    struct FeeConfig {
        uint256 platformFeeBps;     // Platform fee in basis points
        address feeRecipient;       // Platform fee recipient
        address royaltyEngine;      // Royalty calculation contract
    }
    
    // Events
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address indexed assetContract,
        uint256 tokenId,
        uint256 price
    );
    
    event ListingUpdated(
        uint256 indexed listingId,
        uint256 newPrice,
        uint256 newDeadline
    );
    
    event ListingCancelled(uint256 indexed listingId);
    
    event OfferCreated(
        uint256 indexed offerId,
        uint256 indexed listingId,
        address indexed buyer,
        uint256 offerPrice
    );
    
    event OfferCancelled(uint256 indexed offerId);
    
    event TradeExecuted(
        uint256 indexed tradeId,
        uint256 indexed listingId,
        address seller,
        address buyer,
        uint256 price,
        uint256 quantity
    );
    
    event FeesCollected(
        uint256 indexed tradeId,
        uint256 platformFee,
        uint256 royaltyFee
    );
    
    event FeeConfigUpdated(
        uint256 platformFeeBps,
        address feeRecipient
    );
    
    // Core Functions
    
    /**
     * @dev Create a new listing
     */
    function createListing(
        AssetType assetType,
        address assetContract,
        uint256 tokenId,
        uint256 amount,
        address paymentToken,
        uint256 price,
        uint256 deadline
    ) external returns (uint256 listingId);
    
    /**
     * @dev Update listing price and deadline
     */
    function updateListing(
        uint256 listingId,
        uint256 newPrice,
        uint256 newDeadline
    ) external;
    
    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 listingId) external;
    
    /**
     * @dev Buy a listed item at asking price
     */
    function buyItem(
        uint256 listingId,
        uint256 quantity
    ) external payable;
    
    /**
     * @dev Create an offer for a listing
     */
    function createOffer(
        uint256 listingId,
        uint256 offerPrice,
        uint256 quantity,
        uint256 expiration
    ) external payable returns (uint256 offerId);
    
    /**
     * @dev Accept an offer
     */
    function acceptOffer(uint256 offerId) external;
    
    /**
     * @dev Cancel an offer
     */
    function cancelOffer(uint256 offerId) external;
    
    // View Functions
    
    /**
     * @dev Get listing details
     */
    function getListing(uint256 listingId) external view returns (Listing memory);
    
    /**
     * @dev Get offer details
     */
    function getOffer(uint256 offerId) external view returns (Offer memory);
    
    /**
     * @dev Get trade details
     */
    function getTrade(uint256 tradeId) external view returns (Trade memory);
    
    /**
     * @dev Get active listings for a seller
     */
    function getSellerListings(address seller) external view returns (uint256[] memory);
    
    /**
     * @dev Get offers for a listing
     */
    function getListingOffers(uint256 listingId) external view returns (uint256[] memory);
    
    /**
     * @dev Calculate fees for a trade
     */
    function calculateFees(uint256 price) external view returns (uint256 platformFee, uint256 total);
    
    // Admin Functions
    
    /**
     * @dev Update fee configuration
     */
    function updateFeeConfig(uint256 platformFeeBps, address feeRecipient) external;
    
    /**
     * @dev Pause trading
     */
    function pause() external;
    
    /**
     * @dev Unpause trading
     */
    function unpause() external;
    
    /**
     * @dev Emergency withdraw stuck funds
     */
    function emergencyWithdraw(address token, uint256 amount) external;
}