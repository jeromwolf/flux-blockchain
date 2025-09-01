// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "./interfaces/IFluxMarketplace.sol";

/**
 * @title FluxMarketplace
 * @dev P2P trading marketplace for tokens and NFTs with escrow mechanism
 */
contract FluxMarketplace is 
    IFluxMarketplace,
    ReentrancyGuard,
    AccessControl,
    Pausable 
{
    using SafeERC20 for IERC20;
    
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    // State variables
    uint256 private _listingIdCounter;
    uint256 private _offerIdCounter;
    uint256 private _tradeIdCounter;
    
    // Fee configuration
    FeeConfig public feeConfig;
    
    // Mappings
    mapping(uint256 => Listing) private _listings;
    mapping(uint256 => Offer) private _offers;
    mapping(uint256 => Trade) private _trades;
    
    mapping(address => uint256[]) private _sellerListings;
    mapping(uint256 => uint256[]) private _listingOffers;
    mapping(address => uint256[]) private _buyerOffers;
    
    // Escrow balances
    mapping(address => mapping(address => uint256)) private _escrowBalances; // user => token => amount
    
    // Constants
    uint256 public constant MAX_PLATFORM_FEE = 500; // 5%
    uint256 public constant DENOMINATOR = 10000;
    
    /**
     * @dev Constructor
     * @param platformFeeBps_ Initial platform fee in basis points
     * @param feeRecipient_ Initial fee recipient address
     */
    constructor(
        uint256 platformFeeBps_,
        address feeRecipient_
    ) {
        require(platformFeeBps_ <= MAX_PLATFORM_FEE, "Fee too high");
        require(feeRecipient_ != address(0), "Invalid fee recipient");
        
        feeConfig = FeeConfig({
            platformFeeBps: platformFeeBps_,
            feeRecipient: feeRecipient_,
            royaltyEngine: address(0) // Can be set later
        });
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }
    
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
    ) external override whenNotPaused nonReentrant returns (uint256 listingId) {
        require(assetContract != address(0), "Invalid asset contract");
        require(amount > 0, "Invalid amount");
        require(price > 0, "Invalid price");
        require(deadline > block.timestamp, "Invalid deadline");
        
        listingId = _listingIdCounter++;
        
        // Transfer assets to escrow
        _transferToEscrow(msg.sender, assetType, assetContract, tokenId, amount);
        
        _listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            assetType: assetType,
            assetContract: assetContract,
            tokenId: tokenId,
            amount: amount,
            originalAmount: amount,
            paymentToken: paymentToken,
            price: price,
            deadline: deadline,
            status: ListingStatus.ACTIVE
        });
        
        _sellerListings[msg.sender].push(listingId);
        
        emit ListingCreated(listingId, msg.sender, assetContract, tokenId, price);
    }
    
    /**
     * @dev Update listing price and deadline
     */
    function updateListing(
        uint256 listingId,
        uint256 newPrice,
        uint256 newDeadline
    ) external override whenNotPaused {
        Listing storage listing = _listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.status == ListingStatus.ACTIVE, "Listing not active");
        require(newPrice > 0, "Invalid price");
        require(newDeadline > block.timestamp, "Invalid deadline");
        
        listing.price = newPrice;
        listing.deadline = newDeadline;
        
        emit ListingUpdated(listingId, newPrice, newDeadline);
    }
    
    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 listingId) external override nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(
            listing.status == ListingStatus.ACTIVE || 
            listing.status == ListingStatus.PARTIALLY_FILLED,
            "Cannot cancel"
        );
        
        uint256 remainingAmount = listing.amount;
        listing.status = ListingStatus.CANCELLED;
        
        // Return escrowed assets
        _transferFromEscrow(
            msg.sender,
            listing.assetType,
            listing.assetContract,
            listing.tokenId,
            remainingAmount
        );
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @dev Buy a listed item at asking price
     */
    function buyItem(
        uint256 listingId,
        uint256 quantity
    ) external payable override whenNotPaused nonReentrant {
        Listing storage listing = _listings[listingId];
        require(listing.status == ListingStatus.ACTIVE || listing.status == ListingStatus.PARTIALLY_FILLED, "Not available");
        require(listing.deadline >= block.timestamp, "Listing expired");
        require(quantity > 0 && quantity <= listing.amount, "Invalid quantity");
        
        uint256 totalPrice = (listing.price * quantity) / listing.originalAmount;
        
        // Handle payment
        if (listing.paymentToken == address(0)) {
            require(msg.value == totalPrice, "Incorrect payment");
        } else {
            require(msg.value == 0, "No ETH needed");
            IERC20(listing.paymentToken).safeTransferFrom(msg.sender, address(this), totalPrice);
        }
        
        // Execute trade
        _executeTrade(listingId, msg.sender, quantity, totalPrice);
    }
    
    /**
     * @dev Create an offer for a listing
     */
    function createOffer(
        uint256 listingId,
        uint256 offerPrice,
        uint256 quantity,
        uint256 expiration
    ) external payable override whenNotPaused nonReentrant returns (uint256 offerId) {
        Listing storage listing = _listings[listingId];
        require(listing.status == ListingStatus.ACTIVE || listing.status == ListingStatus.PARTIALLY_FILLED, "Not available");
        require(offerPrice > 0, "Invalid offer price");
        require(quantity > 0 && quantity <= listing.amount, "Invalid quantity");
        require(expiration > block.timestamp, "Invalid expiration");
        
        offerId = _offerIdCounter++;
        
        // Lock payment in escrow
        if (listing.paymentToken == address(0)) {
            require(msg.value == offerPrice, "Incorrect payment");
            _escrowBalances[msg.sender][address(0)] += offerPrice;
        } else {
            require(msg.value == 0, "No ETH needed");
            IERC20(listing.paymentToken).safeTransferFrom(msg.sender, address(this), offerPrice);
            _escrowBalances[msg.sender][listing.paymentToken] += offerPrice;
        }
        
        _offers[offerId] = Offer({
            offerId: offerId,
            listingId: listingId,
            buyer: msg.sender,
            offerPrice: offerPrice,
            quantity: quantity,
            expiration: expiration,
            status: OfferStatus.PENDING
        });
        
        _listingOffers[listingId].push(offerId);
        _buyerOffers[msg.sender].push(offerId);
        
        emit OfferCreated(offerId, listingId, msg.sender, offerPrice);
    }
    
    /**
     * @dev Accept an offer
     */
    function acceptOffer(uint256 offerId) external override whenNotPaused nonReentrant {
        Offer storage offer = _offers[offerId];
        Listing storage listing = _listings[offer.listingId];
        
        require(listing.seller == msg.sender, "Not the seller");
        require(offer.status == OfferStatus.PENDING, "Offer not pending");
        require(offer.expiration >= block.timestamp, "Offer expired");
        require(listing.status == ListingStatus.ACTIVE || listing.status == ListingStatus.PARTIALLY_FILLED, "Listing not active");
        
        offer.status = OfferStatus.ACCEPTED;
        
        // Remove payment from buyer's escrow
        _escrowBalances[offer.buyer][listing.paymentToken] -= offer.offerPrice;
        
        // Execute trade
        _executeTrade(offer.listingId, offer.buyer, offer.quantity, offer.offerPrice);
    }
    
    /**
     * @dev Cancel an offer
     */
    function cancelOffer(uint256 offerId) external override nonReentrant {
        Offer storage offer = _offers[offerId];
        require(offer.buyer == msg.sender, "Not the buyer");
        require(offer.status == OfferStatus.PENDING, "Cannot cancel");
        
        offer.status = OfferStatus.CANCELLED;
        
        Listing storage listing = _listings[offer.listingId];
        
        // Return escrowed payment
        uint256 refundAmount = offer.offerPrice;
        _escrowBalances[msg.sender][listing.paymentToken] -= refundAmount;
        
        if (listing.paymentToken == address(0)) {
            payable(msg.sender).transfer(refundAmount);
        } else {
            IERC20(listing.paymentToken).safeTransfer(msg.sender, refundAmount);
        }
        
        emit OfferCancelled(offerId);
    }
    
    /**
     * @dev Execute a trade
     */
    function _executeTrade(
        uint256 listingId,
        address buyer,
        uint256 quantity,
        uint256 totalPrice
    ) private {
        Listing storage listing = _listings[listingId];
        
        uint256 tradeId = _tradeIdCounter++;
        
        // Calculate fees
        (uint256 platformFee, uint256 royaltyFee) = _calculateFees(
            listing.assetContract,
            listing.tokenId,
            totalPrice
        );
        
        uint256 sellerAmount = totalPrice - platformFee - royaltyFee;
        
        // Transfer payment to seller
        if (listing.paymentToken == address(0)) {
            payable(listing.seller).transfer(sellerAmount);
            if (platformFee > 0) {
                payable(feeConfig.feeRecipient).transfer(platformFee);
            }
        } else {
            IERC20(listing.paymentToken).safeTransfer(listing.seller, sellerAmount);
            if (platformFee > 0) {
                IERC20(listing.paymentToken).safeTransfer(feeConfig.feeRecipient, platformFee);
            }
        }
        
        // Handle royalties
        if (royaltyFee > 0 && listing.assetType == AssetType.ERC721) {
            try IERC2981(listing.assetContract).royaltyInfo(listing.tokenId, totalPrice) 
                returns (address royaltyRecipient, uint256 royaltyAmount) {
                if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
                    if (listing.paymentToken == address(0)) {
                        payable(royaltyRecipient).transfer(royaltyAmount);
                    } else {
                        IERC20(listing.paymentToken).safeTransfer(royaltyRecipient, royaltyAmount);
                    }
                }
            } catch {}
        }
        
        // Transfer asset from escrow to buyer
        _transferFromEscrow(
            buyer,
            listing.assetType,
            listing.assetContract,
            listing.tokenId,
            quantity
        );
        
        // Update listing status
        listing.amount -= quantity;
        if (listing.amount == 0) {
            listing.status = ListingStatus.FILLED;
        } else {
            listing.status = ListingStatus.PARTIALLY_FILLED;
        }
        
        // Record trade
        _trades[tradeId] = Trade({
            tradeId: tradeId,
            listingId: listingId,
            seller: listing.seller,
            buyer: buyer,
            executedPrice: totalPrice,
            executedQuantity: quantity,
            timestamp: block.timestamp,
            platformFee: platformFee,
            royaltyFee: royaltyFee
        });
        
        emit TradeExecuted(tradeId, listingId, listing.seller, buyer, totalPrice, quantity);
        emit FeesCollected(tradeId, platformFee, royaltyFee);
    }
    
    /**
     * @dev Transfer assets to escrow
     */
    function _transferToEscrow(
        address from,
        AssetType assetType,
        address assetContract,
        uint256 tokenId,
        uint256 amount
    ) private {
        if (assetType == AssetType.ERC20) {
            IERC20(assetContract).safeTransferFrom(from, address(this), amount);
        } else if (assetType == AssetType.ERC721) {
            IERC721(assetContract).transferFrom(from, address(this), tokenId);
        } else if (assetType == AssetType.ERC1155) {
            IERC1155(assetContract).safeTransferFrom(from, address(this), tokenId, amount, "");
        }
    }
    
    /**
     * @dev Transfer assets from escrow
     */
    function _transferFromEscrow(
        address to,
        AssetType assetType,
        address assetContract,
        uint256 tokenId,
        uint256 amount
    ) private {
        if (assetType == AssetType.ERC20) {
            IERC20(assetContract).safeTransfer(to, amount);
        } else if (assetType == AssetType.ERC721) {
            IERC721(assetContract).transferFrom(address(this), to, tokenId);
        } else if (assetType == AssetType.ERC1155) {
            IERC1155(assetContract).safeTransferFrom(address(this), to, tokenId, amount, "");
        }
    }
    
    /**
     * @dev Calculate fees including royalties
     */
    function _calculateFees(
        address assetContract,
        uint256 tokenId,
        uint256 price
    ) private view returns (uint256 platformFee, uint256 royaltyFee) {
        platformFee = (price * feeConfig.platformFeeBps) / DENOMINATOR;
        
        // Try to get royalty info
        try IERC2981(assetContract).royaltyInfo(tokenId, price) 
            returns (address, uint256 royaltyAmount) {
            royaltyFee = royaltyAmount;
        } catch {
            royaltyFee = 0;
        }
    }
    
    // View Functions
    
    function getListing(uint256 listingId) external view override returns (Listing memory) {
        return _listings[listingId];
    }
    
    function getOffer(uint256 offerId) external view override returns (Offer memory) {
        return _offers[offerId];
    }
    
    function getTrade(uint256 tradeId) external view override returns (Trade memory) {
        return _trades[tradeId];
    }
    
    function getSellerListings(address seller) external view override returns (uint256[] memory) {
        return _sellerListings[seller];
    }
    
    function getListingOffers(uint256 listingId) external view override returns (uint256[] memory) {
        return _listingOffers[listingId];
    }
    
    function calculateFees(uint256 price) external view override returns (uint256 platformFee, uint256 total) {
        platformFee = (price * feeConfig.platformFeeBps) / DENOMINATOR;
        total = platformFee;
    }
    
    // Admin Functions
    
    function updateFeeConfig(
        uint256 platformFeeBps,
        address feeRecipient
    ) external override onlyRole(ADMIN_ROLE) {
        require(platformFeeBps <= MAX_PLATFORM_FEE, "Fee too high");
        require(feeRecipient != address(0), "Invalid recipient");
        
        feeConfig.platformFeeBps = platformFeeBps;
        feeConfig.feeRecipient = feeRecipient;
        
        emit FeeConfigUpdated(platformFeeBps, feeRecipient);
    }
    
    function pause() external override onlyRole(OPERATOR_ROLE) {
        _pause();
    }
    
    function unpause() external override onlyRole(OPERATOR_ROLE) {
        _unpause();
    }
    
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external override onlyRole(ADMIN_ROLE) {
        if (token == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }
    }
    
    // ERC1155 Receiver
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }
    
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
    
    // Receive ETH
    receive() external payable {}
}