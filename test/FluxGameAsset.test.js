const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("FluxGameAsset", function () {
  // Constants
  const NAME = "Flux Game Assets";
  const SYMBOL = "FGA";
  const BASE_URI = "https://api.fluxgame.io/metadata/";
  
  // Enum values
  const ItemType = {
    Weapon: 0,
    Armor: 1,
    Consumable: 2,
    Material: 3,
    Character: 4,
    Land: 5
  };

  // Fixture
  async function deployNFTFixture() {
    const [owner, minter, gameServer, upgrader, user1, user2] = await ethers.getSigners();

    const FluxGameAsset = await ethers.getContractFactory("FluxGameAsset");
    const nft = await FluxGameAsset.deploy(NAME, SYMBOL, BASE_URI);

    // Get role constants
    const MINTER_ROLE = await nft.MINTER_ROLE();
    const GAME_ROLE = await nft.GAME_ROLE();
    const UPGRADER_ROLE = await nft.UPGRADER_ROLE();

    // Grant roles
    await nft.grantRole(MINTER_ROLE, minter.address);
    await nft.grantRole(GAME_ROLE, gameServer.address);
    await nft.grantRole(UPGRADER_ROLE, upgrader.address);

    return { 
      nft, 
      owner, 
      minter, 
      gameServer, 
      upgrader, 
      user1, 
      user2,
      MINTER_ROLE,
      GAME_ROLE,
      UPGRADER_ROLE
    };
  }

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { nft } = await loadFixture(deployNFTFixture);
      
      expect(await nft.name()).to.equal(NAME);
      expect(await nft.symbol()).to.equal(SYMBOL);
    });

    it("Should set the correct base URI", async function () {
      const { nft, owner } = await loadFixture(deployNFTFixture);
      
      // Mint a token to test URI
      await nft.connect(owner).mint(owner.address, ItemType.Weapon, 3, 10, 1);
      expect(await nft.tokenURI(0)).to.equal(BASE_URI + "0");
    });

    it("Should set default royalty", async function () {
      const { nft, owner, user1 } = await loadFixture(deployNFTFixture);
      
      // Check royalty info for a hypothetical sale
      const salePrice = ethers.parseEther("1");
      const [receiver, royaltyAmount] = await nft.royaltyInfo(0, salePrice);
      
      expect(receiver).to.equal(owner.address);
      expect(royaltyAmount).to.equal(salePrice * 500n / 10000n); // 5%
    });

    it("Should assign roles correctly", async function () {
      const { nft, owner, minter, gameServer, upgrader, MINTER_ROLE, GAME_ROLE, UPGRADER_ROLE } = 
        await loadFixture(deployNFTFixture);
      
      expect(await nft.hasRole(MINTER_ROLE, minter.address)).to.be.true;
      expect(await nft.hasRole(GAME_ROLE, gameServer.address)).to.be.true;
      expect(await nft.hasRole(UPGRADER_ROLE, upgrader.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should mint a single NFT", async function () {
      const { nft, minter, user1 } = await loadFixture(deployNFTFixture);
      
      const itemType = ItemType.Weapon;
      const rarity = 4; // Epic
      const level = 50;
      const gameId = 1;
      
      await expect(nft.connect(minter).mint(user1.address, itemType, rarity, level, gameId))
        .to.emit(nft, "AssetMinted")
        .withArgs(0, user1.address, itemType, rarity);
      
      expect(await nft.ownerOf(0)).to.equal(user1.address);
      expect(await nft.totalSupply()).to.equal(1);
      
      const assetData = await nft.getAssetData(0);
      expect(assetData.itemType).to.equal(itemType);
      expect(assetData.rarity).to.equal(rarity);
      expect(assetData.level).to.equal(level);
      expect(assetData.gameId).to.equal(gameId);
    });

    it("Should enforce rarity limits", async function () {
      const { nft, minter, user1 } = await loadFixture(deployNFTFixture);
      
      await expect(
        nft.connect(minter).mint(user1.address, ItemType.Weapon, 0, 50, 1)
      ).to.be.revertedWith("Invalid rarity");
      
      await expect(
        nft.connect(minter).mint(user1.address, ItemType.Weapon, 6, 50, 1)
      ).to.be.revertedWith("Invalid rarity");
    });

    it("Should enforce level limits", async function () {
      const { nft, minter, user1 } = await loadFixture(deployNFTFixture);
      
      await expect(
        nft.connect(minter).mint(user1.address, ItemType.Weapon, 3, 0, 1)
      ).to.be.revertedWith("Invalid level");
      
      await expect(
        nft.connect(minter).mint(user1.address, ItemType.Weapon, 3, 101, 1)
      ).to.be.revertedWith("Invalid level");
    });

    it("Should only allow minters to mint", async function () {
      const { nft, user1, user2 } = await loadFixture(deployNFTFixture);
      
      await expect(
        nft.connect(user1).mint(user2.address, ItemType.Weapon, 3, 50, 1)
      ).to.be.reverted;
    });

    it("Should mint batch NFTs", async function () {
      const { nft, minter, user1 } = await loadFixture(deployNFTFixture);
      
      const itemTypes = [ItemType.Weapon, ItemType.Armor, ItemType.Material];
      const rarities = [3, 4, 2];
      const levels = [10, 20, 5];
      const gameId = 1;
      
      const tx = await nft.connect(minter).mintBatch(
        user1.address,
        itemTypes,
        rarities,
        levels,
        gameId
      );
      
      const receipt = await tx.wait();
      
      expect(await nft.totalSupply()).to.equal(3);
      expect(await nft.balanceOf(user1.address)).to.equal(3);
      
      // Check each minted token
      for (let i = 0; i < 3; i++) {
        expect(await nft.ownerOf(i)).to.equal(user1.address);
        const assetData = await nft.getAssetData(i);
        expect(assetData.itemType).to.equal(itemTypes[i]);
        expect(assetData.rarity).to.equal(rarities[i]);
        expect(assetData.level).to.equal(levels[i]);
      }
    });
  });

  describe("Upgrading", function () {

    it("Should upgrade asset level", async function () {
      const { nft, minter, upgrader, user1 } = await loadFixture(deployNFTFixture);
      
      // First mint a token
      await nft.connect(minter).mint(user1.address, ItemType.Weapon, 3, 10, 1);
      
      const tokenId = 0;
      const newLevel = 20;
      
      await expect(nft.connect(upgrader).upgradeAsset(tokenId, newLevel))
        .to.emit(nft, "AssetUpgraded")
        .withArgs(tokenId, 10, newLevel);
      
      const assetData = await nft.getAssetData(tokenId);
      expect(assetData.level).to.equal(newLevel);
    });

    it("Should not allow downgrade", async function () {
      const { nft, minter, upgrader, user1 } = await loadFixture(deployNFTFixture);
      
      // First mint a token
      await nft.connect(minter).mint(user1.address, ItemType.Weapon, 3, 10, 1);
      
      await expect(
        nft.connect(upgrader).upgradeAsset(0, 5)
      ).to.be.revertedWith("New level must be higher");
    });

    it("Should respect max level", async function () {
      const { nft, minter, upgrader, user1 } = await loadFixture(deployNFTFixture);
      
      // First mint a token
      await nft.connect(minter).mint(user1.address, ItemType.Weapon, 3, 10, 1);
      
      await expect(
        nft.connect(upgrader).upgradeAsset(0, 101)
      ).to.be.revertedWith("Max level is 100");
    });

    it("Should only allow upgraders to upgrade", async function () {
      const { nft, minter, user1 } = await loadFixture(deployNFTFixture);
      
      // First mint a token
      await nft.connect(minter).mint(user1.address, ItemType.Weapon, 3, 10, 1);
      
      await expect(
        nft.connect(user1).upgradeAsset(0, 20)
      ).to.be.reverted;
    });
  });

  describe("Combining Assets", function () {
    it("Should combine multiple assets", async function () {
      const { nft, minter, user1 } = await loadFixture(deployNFTFixture);
      
      // Mint 3 assets to combine
      await nft.connect(minter).mint(user1.address, ItemType.Material, 2, 5, 1);
      await nft.connect(minter).mint(user1.address, ItemType.Material, 2, 5, 1);
      await nft.connect(minter).mint(user1.address, ItemType.Material, 2, 5, 1);
      
      const tokenIds = [0, 1, 2];
      const newItemType = ItemType.Weapon;
      const newRarity = 4;
      const newLevel = 15;
      
      await expect(
        nft.connect(user1).combineAssets(tokenIds, newItemType, newRarity, newLevel)
      ).to.emit(nft, "AssetsCombined");
      
      // Check old tokens are burned
      await expect(nft.ownerOf(0)).to.be.reverted;
      await expect(nft.ownerOf(1)).to.be.reverted;
      await expect(nft.ownerOf(2)).to.be.reverted;
      
      // Check new token exists
      expect(await nft.ownerOf(3)).to.equal(user1.address);
      const newAssetData = await nft.getAssetData(3);
      expect(newAssetData.itemType).to.equal(newItemType);
      expect(newAssetData.rarity).to.equal(newRarity);
      expect(newAssetData.level).to.equal(newLevel);
    });

    it("Should require at least 2 assets", async function () {
      const { nft, minter, user1 } = await loadFixture(deployNFTFixture);
      
      await nft.connect(minter).mint(user1.address, ItemType.Material, 2, 5, 1);
      
      await expect(
        nft.connect(user1).combineAssets([0], ItemType.Weapon, 4, 15)
      ).to.be.revertedWith("Need at least 2 assets");
    });

    it("Should require same owner for all assets", async function () {
      const { nft, minter, user1, user2 } = await loadFixture(deployNFTFixture);
      
      await nft.connect(minter).mint(user1.address, ItemType.Material, 2, 5, 1);
      await nft.connect(minter).mint(user2.address, ItemType.Material, 2, 5, 1);
      
      await expect(
        nft.connect(user1).combineAssets([0, 1], ItemType.Weapon, 4, 15)
      ).to.be.revertedWith("All assets must have same owner");
    });
  });

  describe("Signature Minting", function () {
    it("Should mint with valid signature", async function () {
      const { nft, gameServer, user1 } = await loadFixture(deployNFTFixture);
      
      const itemType = ItemType.Weapon;
      const rarity = 5;
      const level = 60;
      const gameId = 1;
      const nonce = 12345;
      
      // Create message hash
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint8", "uint8", "uint8", "uint32", "uint256"],
        [user1.address, itemType, rarity, level, gameId, nonce]
      );
      
      // Sign the message
      const signature = await gameServer.signMessage(ethers.getBytes(messageHash));
      
      await nft.mintWithSignature(
        user1.address,
        itemType,
        rarity,
        level,
        gameId,
        nonce,
        signature
      );
      
      expect(await nft.ownerOf(0)).to.equal(user1.address);
    });

    it("Should prevent signature reuse", async function () {
      const { nft, gameServer, user1 } = await loadFixture(deployNFTFixture);
      
      const itemType = ItemType.Weapon;
      const rarity = 5;
      const level = 60;
      const gameId = 1;
      const nonce = 12345;
      
      const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint8", "uint8", "uint8", "uint32", "uint256"],
        [user1.address, itemType, rarity, level, gameId, nonce]
      );
      
      const signature = await gameServer.signMessage(ethers.getBytes(messageHash));
      
      // First mint should succeed
      await nft.mintWithSignature(
        user1.address,
        itemType,
        rarity,
        level,
        gameId,
        nonce,
        signature
      );
      
      // Second mint with same signature should fail
      await expect(
        nft.mintWithSignature(
          user1.address,
          itemType,
          rarity,
          level,
          gameId,
          nonce,
          signature
        )
      ).to.be.revertedWith("Signature already used");
    });
  });

  describe("ERC721 Functionality", function () {
    it("Should transfer NFT", async function () {
      const { nft, minter, user1, user2 } = await loadFixture(deployNFTFixture);
      
      // First mint a token
      await nft.connect(minter).mint(user1.address, ItemType.Weapon, 4, 50, 1);
      
      await nft.connect(user1).transferFrom(user1.address, user2.address, 0);
      expect(await nft.ownerOf(0)).to.equal(user2.address);
    });

    it("Should approve and transferFrom", async function () {
      const { nft, minter, user1, user2 } = await loadFixture(deployNFTFixture);
      
      // First mint a token
      await nft.connect(minter).mint(user1.address, ItemType.Weapon, 4, 50, 1);
      
      await nft.connect(user1).approve(user2.address, 0);
      await nft.connect(user2).transferFrom(user1.address, user2.address, 0);
      expect(await nft.ownerOf(0)).to.equal(user2.address);
    });

    it("Should support burning", async function () {
      const { nft, minter, user1 } = await loadFixture(deployNFTFixture);
      
      // First mint a token
      await nft.connect(minter).mint(user1.address, ItemType.Weapon, 4, 50, 1);
      
      await nft.connect(user1).burn(0);
      await expect(nft.ownerOf(0)).to.be.reverted;
      expect(await nft.totalSupply()).to.equal(0);
    });
  });

  describe("Enumerable", function () {
    it("Should track token by index", async function () {
      const { nft, minter, user1 } = await loadFixture(deployNFTFixture);
      
      await nft.connect(minter).mint(user1.address, ItemType.Weapon, 3, 10, 1);
      await nft.connect(minter).mint(user1.address, ItemType.Armor, 4, 20, 1);
      await nft.connect(minter).mint(user1.address, ItemType.Material, 2, 5, 1);
      
      expect(await nft.tokenByIndex(0)).to.equal(0);
      expect(await nft.tokenByIndex(1)).to.equal(1);
      expect(await nft.tokenByIndex(2)).to.equal(2);
      
      expect(await nft.tokenOfOwnerByIndex(user1.address, 0)).to.equal(0);
      expect(await nft.tokenOfOwnerByIndex(user1.address, 1)).to.equal(1);
      expect(await nft.tokenOfOwnerByIndex(user1.address, 2)).to.equal(2);
    });
  });

  describe("Admin Functions", function () {
    it("Should update base URI", async function () {
      const { nft, owner, minter, user1 } = await loadFixture(deployNFTFixture);
      
      const newBaseURI = "https://newapi.fluxgame.io/metadata/";
      
      await expect(nft.connect(owner).setBaseURI(newBaseURI))
        .to.emit(nft, "BaseURIUpdated")
        .withArgs(newBaseURI);
      
      await nft.connect(minter).mint(user1.address, ItemType.Weapon, 3, 10, 1);
      expect(await nft.tokenURI(0)).to.equal(newBaseURI + "0");
    });

    it("Should update royalty", async function () {
      const { nft, owner, user1 } = await loadFixture(deployNFTFixture);
      
      const newReceiver = user1.address;
      const newRoyaltyBps = 750; // 7.5%
      
      await expect(nft.connect(owner).setDefaultRoyalty(newReceiver, newRoyaltyBps))
        .to.emit(nft, "RoyaltyUpdated")
        .withArgs(newReceiver, newRoyaltyBps);
      
      const salePrice = ethers.parseEther("1");
      const [receiver, royaltyAmount] = await nft.royaltyInfo(0, salePrice);
      
      expect(receiver).to.equal(newReceiver);
      expect(royaltyAmount).to.equal(salePrice * 750n / 10000n);
    });

    it("Should not allow excessive royalty", async function () {
      const { nft, owner, user1 } = await loadFixture(deployNFTFixture);
      
      await expect(
        nft.connect(owner).setDefaultRoyalty(user1.address, 1001)
      ).to.be.revertedWith("Royalty too high");
    });
  });
});