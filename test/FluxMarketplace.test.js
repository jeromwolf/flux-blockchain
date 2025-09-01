const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("FluxMarketplace", function () {
  // Constants
  const PLATFORM_FEE_BPS = 250; // 2.5%
  const PRICE = ethers.parseEther("100");
  const TOKEN_AMOUNT = ethers.parseEther("1000");
  const NFT_TOKEN_ID = 0;
  
  // AssetType enum
  const AssetType = {
    ERC20: 0,
    ERC721: 1,
    ERC1155: 2
  };
  
  // ListingStatus enum
  const ListingStatus = {
    CREATED: 0,
    ACTIVE: 1,
    PARTIALLY_FILLED: 2,
    FILLED: 3,
    CANCELLED: 4,
    EXPIRED: 5
  };
  
  // OfferStatus enum
  const OfferStatus = {
    PENDING: 0,
    ACCEPTED: 1,
    REJECTED: 2,
    CANCELLED: 3,
    EXPIRED: 4
  };

  // Fixture
  async function deployMarketplaceFixture() {
    const [owner, seller, buyer, feeRecipient, user1, user2] = await ethers.getSigners();

    // Deploy tokens
    const FluxToken = await ethers.getContractFactory("FluxToken");
    const token = await FluxToken.deploy(
      owner.address, // ecosystem
      owner.address, // team
      owner.address, // investor
      owner.address, // foundation
      owner.address  // mars reserve
    );
    
    const FluxGameAsset = await ethers.getContractFactory("FluxGameAsset");
    const nft = await FluxGameAsset.deploy("Test NFT", "TNFT", "https://test.com/");
    
    // Deploy marketplace
    const FluxMarketplace = await ethers.getContractFactory("FluxMarketplace");
    const marketplace = await FluxMarketplace.deploy(PLATFORM_FEE_BPS, feeRecipient.address);
    
    // Setup tokens
    await token.initializeDistribution();
    await token.transfer(seller.address, TOKEN_AMOUNT);
    await token.transfer(buyer.address, TOKEN_AMOUNT);
    
    // Mint NFTs
    await nft.mint(seller.address, 0, 3, 10, 1); // Weapon, Rare, Level 10
    await nft.mint(seller.address, 1, 4, 20, 1); // Armor, Epic, Level 20
    
    // Approvals
    await token.connect(seller).approve(marketplace.target, ethers.MaxUint256);
    await token.connect(buyer).approve(marketplace.target, ethers.MaxUint256);
    await nft.connect(seller).setApprovalForAll(marketplace.target, true);
    
    return { 
      marketplace, 
      token, 
      nft,
      owner, 
      seller, 
      buyer, 
      feeRecipient,
      user1,
      user2
    };
  }

  describe("Deployment", function () {
    it("Should set the correct fee configuration", async function () {
      const { marketplace, feeRecipient } = await loadFixture(deployMarketplaceFixture);
      
      const feeConfig = await marketplace.feeConfig();
      expect(feeConfig.platformFeeBps).to.equal(PLATFORM_FEE_BPS);
      expect(feeConfig.feeRecipient).to.equal(feeRecipient.address);
    });

    it("Should assign roles correctly", async function () {
      const { marketplace, owner } = await loadFixture(deployMarketplaceFixture);
      
      const ADMIN_ROLE = await marketplace.ADMIN_ROLE();
      const OPERATOR_ROLE = await marketplace.OPERATOR_ROLE();
      
      expect(await marketplace.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
      expect(await marketplace.hasRole(OPERATOR_ROLE, owner.address)).to.be.true;
    });
  });

  describe("ERC20 Listings", function () {
    it("Should create ERC20 listing", async function () {
      const { marketplace, token, seller } = await loadFixture(deployMarketplaceFixture);
      
      const amount = ethers.parseEther("100");
      const price = ethers.parseEther("50");
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      
      await expect(
        marketplace.connect(seller).createListing(
          AssetType.ERC20,
          token.target,
          0, // tokenId not used for ERC20
          amount,
          ethers.ZeroAddress, // ETH payment
          price,
          deadline
        )
      ).to.emit(marketplace, "ListingCreated")
        .withArgs(0, seller.address, token.target, 0, price);
      
      const listing = await marketplace.getListing(0);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.assetType).to.equal(AssetType.ERC20);
      expect(listing.amount).to.equal(amount);
      expect(listing.price).to.equal(price);
      expect(listing.status).to.equal(ListingStatus.ACTIVE);
    });

    it("Should buy ERC20 with ETH", async function () {
      const { marketplace, token, seller, buyer } = await loadFixture(deployMarketplaceFixture);
      
      const amount = ethers.parseEther("100");
      const price = ethers.parseEther("1");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      // Create listing
      await marketplace.connect(seller).createListing(
        AssetType.ERC20,
        token.target,
        0,
        amount,
        ethers.ZeroAddress,
        price,
        deadline
      );
      
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      const buyerTokenBalanceBefore = await token.balanceOf(buyer.address);
      
      // Buy tokens
      await expect(
        marketplace.connect(buyer).buyItem(0, amount, { value: price })
      ).to.emit(marketplace, "TradeExecuted");
      
      // Check balances
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      const buyerTokenBalanceAfter = await token.balanceOf(buyer.address);
      
      const platformFee = (price * BigInt(PLATFORM_FEE_BPS)) / 10000n;
      const sellerAmount = price - platformFee;
      
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(sellerAmount);
      expect(buyerTokenBalanceAfter - buyerTokenBalanceBefore).to.equal(amount);
      
      // Check listing status
      const listing = await marketplace.getListing(0);
      expect(listing.status).to.equal(ListingStatus.FILLED);
    });
  });

  describe("NFT Listings", function () {
    it("Should create NFT listing", async function () {
      const { marketplace, nft, seller, token } = await loadFixture(deployMarketplaceFixture);
      
      const tokenId = 0;
      const price = ethers.parseEther("10");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      await expect(
        marketplace.connect(seller).createListing(
          AssetType.ERC721,
          nft.target,
          tokenId,
          1, // Amount is always 1 for ERC721
          token.target, // Payment in FLUX tokens
          price,
          deadline
        )
      ).to.emit(marketplace, "ListingCreated")
        .withArgs(0, seller.address, nft.target, tokenId, price);
      
      // Check NFT transferred to marketplace
      expect(await nft.ownerOf(tokenId)).to.equal(marketplace.target);
    });

    it("Should buy NFT with tokens", async function () {
      const { marketplace, nft, token, seller, buyer, feeRecipient } = await loadFixture(deployMarketplaceFixture);
      
      const tokenId = 0;
      const price = ethers.parseEther("10");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      // Create listing
      await marketplace.connect(seller).createListing(
        AssetType.ERC721,
        nft.target,
        tokenId,
        1,
        token.target,
        price,
        deadline
      );
      
      const sellerBalanceBefore = await token.balanceOf(seller.address);
      const feeRecipientBalanceBefore = await token.balanceOf(feeRecipient.address);
      
      // Buy NFT
      await expect(
        marketplace.connect(buyer).buyItem(0, 1)
      ).to.emit(marketplace, "TradeExecuted");
      
      // Check NFT ownership
      expect(await nft.ownerOf(tokenId)).to.equal(buyer.address);
      
      // Check token balances
      const platformFee = (price * BigInt(PLATFORM_FEE_BPS)) / 10000n;
      const royaltyInfo = await nft.royaltyInfo(tokenId, price);
      const royaltyFee = royaltyInfo[1];
      const sellerAmount = price - platformFee - royaltyFee;
      
      expect(await token.balanceOf(seller.address)).to.equal(sellerBalanceBefore + sellerAmount);
      expect(await token.balanceOf(feeRecipient.address)).to.equal(feeRecipientBalanceBefore + platformFee);
    });

    it("Should handle royalties correctly", async function () {
      const { marketplace, nft, token, seller, buyer, owner } = await loadFixture(deployMarketplaceFixture);
      
      const tokenId = 0;
      const price = ethers.parseEther("100");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      // Create listing
      await marketplace.connect(seller).createListing(
        AssetType.ERC721,
        nft.target,
        tokenId,
        1,
        token.target,
        price,
        deadline
      );
      
      const royaltyRecipientBalanceBefore = await token.balanceOf(owner.address);
      
      // Buy NFT
      await marketplace.connect(buyer).buyItem(0, 1);
      
      // Check royalty payment (5% default royalty)
      const expectedRoyalty = (price * 500n) / 10000n; // 5%
      const royaltyRecipientBalanceAfter = await token.balanceOf(owner.address);
      
      expect(royaltyRecipientBalanceAfter - royaltyRecipientBalanceBefore).to.equal(expectedRoyalty);
    });
  });

  describe("Offers", function () {
    it("Should create an offer", async function () {
      const { marketplace, nft, seller, buyer, token } = await loadFixture(deployMarketplaceFixture);
      
      // Create NFT listing first
      const tokenId = 0;
      const price = ethers.parseEther("10");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      await marketplace.connect(seller).createListing(
        AssetType.ERC721,
        nft.target,
        tokenId,
        1,
        token.target,
        price,
        deadline
      );
      
      const offerPrice = ethers.parseEther("8");
      const expiration = Math.floor(Date.now() / 1000) + 1800;
      
      const buyerBalanceBefore = await token.balanceOf(buyer.address);
      
      await expect(
        marketplace.connect(buyer).createOffer(0, offerPrice, 1, expiration)
      ).to.emit(marketplace, "OfferCreated")
        .withArgs(0, 0, buyer.address, offerPrice);
      
      // Check tokens locked in escrow
      expect(await token.balanceOf(buyer.address)).to.equal(buyerBalanceBefore - offerPrice);
      
      const offer = await marketplace.getOffer(0);
      expect(offer.buyer).to.equal(buyer.address);
      expect(offer.offerPrice).to.equal(offerPrice);
      expect(offer.status).to.equal(OfferStatus.PENDING);
    });

    it("Should accept an offer", async function () {
      const { marketplace, nft, token, seller, buyer } = await loadFixture(deployMarketplaceFixture);
      
      // Create NFT listing first
      const tokenId = 0;
      const price = ethers.parseEther("10");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      await marketplace.connect(seller).createListing(
        AssetType.ERC721,
        nft.target,
        tokenId,
        1,
        token.target,
        price,
        deadline
      );
      
      const offerPrice = ethers.parseEther("8");
      const expiration = Math.floor(Date.now() / 1000) + 1800;
      
      // Create offer
      await marketplace.connect(buyer).createOffer(0, offerPrice, 1, expiration);
      
      const sellerBalanceBefore = await token.balanceOf(seller.address);
      
      // Accept offer
      await expect(
        marketplace.connect(seller).acceptOffer(0)
      ).to.emit(marketplace, "TradeExecuted");
      
      // Check NFT transferred
      expect(await nft.ownerOf(0)).to.equal(buyer.address);
      
      // Check payment
      const platformFee = (offerPrice * BigInt(PLATFORM_FEE_BPS)) / 10000n;
      const royaltyInfo = await nft.royaltyInfo(0, offerPrice);
      const royaltyFee = royaltyInfo[1];
      const sellerAmount = offerPrice - platformFee - royaltyFee;
      
      expect(await token.balanceOf(seller.address)).to.equal(sellerBalanceBefore + sellerAmount);
      
      // Check offer status
      const offer = await marketplace.getOffer(0);
      expect(offer.status).to.equal(OfferStatus.ACCEPTED);
    });

    it("Should cancel an offer", async function () {
      const { marketplace, nft, seller, buyer, token } = await loadFixture(deployMarketplaceFixture);
      
      // Create NFT listing first
      const tokenId = 0;
      const price = ethers.parseEther("10");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      await marketplace.connect(seller).createListing(
        AssetType.ERC721,
        nft.target,
        tokenId,
        1,
        token.target,
        price,
        deadline
      );
      
      const offerPrice = ethers.parseEther("8");
      const expiration = Math.floor(Date.now() / 1000) + 1800;
      
      // Create offer
      await marketplace.connect(buyer).createOffer(0, offerPrice, 1, expiration);
      
      const buyerBalanceBefore = await token.balanceOf(buyer.address);
      
      // Cancel offer
      await expect(
        marketplace.connect(buyer).cancelOffer(0)
      ).to.emit(marketplace, "OfferCancelled")
        .withArgs(0);
      
      // Check refund
      expect(await token.balanceOf(buyer.address)).to.equal(buyerBalanceBefore + offerPrice);
      
      // Check offer status
      const offer = await marketplace.getOffer(0);
      expect(offer.status).to.equal(OfferStatus.CANCELLED);
    });
  });

  describe("Listing Management", function () {
    it("Should update listing", async function () {
      const { marketplace, nft, seller, token } = await loadFixture(deployMarketplaceFixture);
      
      const tokenId = 0;
      const price = ethers.parseEther("10");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      // Create listing
      await marketplace.connect(seller).createListing(
        AssetType.ERC721,
        nft.target,
        tokenId,
        1,
        token.target,
        price,
        deadline
      );
      
      const newPrice = ethers.parseEther("15");
      const newDeadline = deadline + 3600;
      
      await expect(
        marketplace.connect(seller).updateListing(0, newPrice, newDeadline)
      ).to.emit(marketplace, "ListingUpdated")
        .withArgs(0, newPrice, newDeadline);
      
      const listing = await marketplace.getListing(0);
      expect(listing.price).to.equal(newPrice);
      expect(listing.deadline).to.equal(newDeadline);
    });

    it("Should cancel listing", async function () {
      const { marketplace, nft, seller, token } = await loadFixture(deployMarketplaceFixture);
      
      const tokenId = 0;
      const price = ethers.parseEther("10");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      // Create listing
      await marketplace.connect(seller).createListing(
        AssetType.ERC721,
        nft.target,
        tokenId,
        1,
        token.target,
        price,
        deadline
      );
      
      // Cancel listing
      await expect(
        marketplace.connect(seller).cancelListing(0)
      ).to.emit(marketplace, "ListingCancelled")
        .withArgs(0);
      
      // Check NFT returned
      expect(await nft.ownerOf(tokenId)).to.equal(seller.address);
      
      // Check listing status
      const listing = await marketplace.getListing(0);
      expect(listing.status).to.equal(ListingStatus.CANCELLED);
    });
  });

  describe("Partial Fills", function () {
    it("Should handle partial token fills", async function () {
      const { marketplace, token, seller, buyer, user1 } = await loadFixture(deployMarketplaceFixture);
      
      const amount = ethers.parseEther("100");
      const price = ethers.parseEther("10");
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      
      // Transfer tokens to user1
      await token.transfer(user1.address, TOKEN_AMOUNT);
      await token.connect(user1).approve(marketplace.target, ethers.MaxUint256);
      
      // Create listing
      await marketplace.connect(seller).createListing(
        AssetType.ERC20,
        token.target,
        0,
        amount,
        ethers.ZeroAddress,
        price,
        deadline
      );
      
      // Buy partial amount
      const buyAmount1 = ethers.parseEther("30");
      const buyPrice1 = (price * buyAmount1) / amount;
      
      await marketplace.connect(buyer).buyItem(0, buyAmount1, { value: buyPrice1 });
      
      // Check listing updated
      let listing = await marketplace.getListing(0);
      expect(listing.amount).to.equal(amount - buyAmount1);
      expect(listing.status).to.equal(ListingStatus.PARTIALLY_FILLED);
      
      // Buy remaining (should be exactly what's left)
      const remainingAmount = listing.amount;
      const buyPrice2 = (price * remainingAmount) / amount;
      
      await marketplace.connect(user1).buyItem(0, remainingAmount, { value: buyPrice2 });
      
      // Check listing filled
      listing = await marketplace.getListing(0);
      expect(listing.amount).to.equal(0);
      expect(listing.status).to.equal(ListingStatus.FILLED);
    });
  });

  describe("Fee Management", function () {
    it("Should calculate fees correctly", async function () {
      const { marketplace } = await loadFixture(deployMarketplaceFixture);
      
      const price = ethers.parseEther("100");
      const [platformFee, total] = await marketplace.calculateFees(price);
      
      expect(platformFee).to.equal((price * BigInt(PLATFORM_FEE_BPS)) / 10000n);
      expect(total).to.equal(platformFee);
    });

    it("Should update fee configuration", async function () {
      const { marketplace, owner, user1 } = await loadFixture(deployMarketplaceFixture);
      
      const newFeeBps = 300; // 3%
      
      await expect(
        marketplace.connect(owner).updateFeeConfig(newFeeBps, user1.address)
      ).to.emit(marketplace, "FeeConfigUpdated")
        .withArgs(newFeeBps, user1.address);
      
      const feeConfig = await marketplace.feeConfig();
      expect(feeConfig.platformFeeBps).to.equal(newFeeBps);
      expect(feeConfig.feeRecipient).to.equal(user1.address);
    });

    it("Should not allow excessive fees", async function () {
      const { marketplace, owner, user1 } = await loadFixture(deployMarketplaceFixture);
      
      await expect(
        marketplace.connect(owner).updateFeeConfig(600, user1.address) // 6%
      ).to.be.revertedWith("Fee too high");
    });
  });

  describe("Access Control", function () {
    it("Should only allow admin to update fees", async function () {
      const { marketplace, user1 } = await loadFixture(deployMarketplaceFixture);
      
      await expect(
        marketplace.connect(user1).updateFeeConfig(300, user1.address)
      ).to.be.reverted;
    });

    it("Should only allow operator to pause", async function () {
      const { marketplace, user1 } = await loadFixture(deployMarketplaceFixture);
      
      await expect(
        marketplace.connect(user1).pause()
      ).to.be.reverted;
    });
  });

  describe("Pausable", function () {
    it("Should pause and unpause", async function () {
      const { marketplace, owner, seller, token } = await loadFixture(deployMarketplaceFixture);
      
      await marketplace.connect(owner).pause();
      
      // Should not allow creating listings when paused
      await expect(
        marketplace.connect(seller).createListing(
          AssetType.ERC20,
          token.target,
          0,
          ethers.parseEther("100"),
          ethers.ZeroAddress,
          ethers.parseEther("10"),
          Math.floor(Date.now() / 1000) + 3600
        )
      ).to.be.revertedWithCustomError(marketplace, "EnforcedPause");
      
      await marketplace.connect(owner).unpause();
      
      // Should allow after unpause
      await expect(
        marketplace.connect(seller).createListing(
          AssetType.ERC20,
          token.target,
          0,
          ethers.parseEther("100"),
          ethers.ZeroAddress,
          ethers.parseEther("10"),
          Math.floor(Date.now() / 1000) + 3600
        )
      ).to.emit(marketplace, "ListingCreated");
    });
  });
});