const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("FluxToken", function () {
  // Constants
  const TOKEN_NAME = "Flux Token";
  const TOKEN_SYMBOL = "FLUX";
  const TOTAL_SUPPLY = ethers.parseEther("42000000000"); // 42 billion
  const ECOSYSTEM_ALLOCATION = ethers.parseEther("16800000000"); // 40%
  const TEAM_ALLOCATION = ethers.parseEther("8400000000"); // 20%
  const INVESTOR_ALLOCATION = ethers.parseEther("6300000000"); // 15%
  const FOUNDATION_ALLOCATION = ethers.parseEther("6300000000"); // 15%
  const MARS_RESERVE_ALLOCATION = ethers.parseEther("4200000000"); // 10%

  // Fixture for deploying the contract
  async function deployTokenFixture() {
    const [owner, ecosystem, team, investor, foundation, marsReserve, user1, user2] = 
      await ethers.getSigners();

    const FluxToken = await ethers.getContractFactory("FluxToken");
    const token = await FluxToken.deploy(
      ecosystem.address,
      team.address,
      investor.address,
      foundation.address,
      marsReserve.address
    );

    return { 
      token, 
      owner, 
      ecosystem, 
      team, 
      investor, 
      foundation, 
      marsReserve, 
      user1, 
      user2 
    };
  }

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      
      expect(await token.name()).to.equal(TOKEN_NAME);
      expect(await token.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should set the correct cap", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      
      expect(await token.cap()).to.equal(TOTAL_SUPPLY);
    });

    it("Should assign roles correctly", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      
      const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
      const MINTER_ROLE = await token.MINTER_ROLE();
      const PAUSER_ROLE = await token.PAUSER_ROLE();
      
      expect(await token.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await token.hasRole(MINTER_ROLE, owner.address)).to.be.true;
      expect(await token.hasRole(PAUSER_ROLE, owner.address)).to.be.true;
    });

    it("Should set wallet addresses correctly", async function () {
      const { token, ecosystem, team, investor, foundation, marsReserve } = 
        await loadFixture(deployTokenFixture);
      
      expect(await token.ecosystemWallet()).to.equal(ecosystem.address);
      expect(await token.teamWallet()).to.equal(team.address);
      expect(await token.investorWallet()).to.equal(investor.address);
      expect(await token.foundationWallet()).to.equal(foundation.address);
      expect(await token.marsReserveWallet()).to.equal(marsReserve.address);
    });

    it("Should start with zero total supply", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      
      expect(await token.totalSupply()).to.equal(0);
    });
  });

  describe("Token Distribution", function () {
    it("Should initialize distribution correctly", async function () {
      const { token, owner, ecosystem, foundation, marsReserve } = 
        await loadFixture(deployTokenFixture);
      
      await token.connect(owner).initializeDistribution();
      
      // Check immediate distributions
      expect(await token.balanceOf(ecosystem.address)).to.equal(ECOSYSTEM_ALLOCATION);
      expect(await token.balanceOf(foundation.address)).to.equal(FOUNDATION_ALLOCATION);
      expect(await token.balanceOf(marsReserve.address)).to.equal(MARS_RESERVE_ALLOCATION);
      
      // Check vested amounts are in contract
      const contractBalance = await token.balanceOf(token.target);
      expect(contractBalance).to.equal(TEAM_ALLOCATION + INVESTOR_ALLOCATION);
      
      // Check total supply
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("Should not allow double initialization", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      
      await token.connect(owner).initializeDistribution();
      
      await expect(
        token.connect(owner).initializeDistribution()
      ).to.be.revertedWith("Already initialized");
    });

    it("Should only allow admin to initialize", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      
      await expect(
        token.connect(user1).initializeDistribution()
      ).to.be.reverted;
    });
  });

  describe("Vesting", function () {
    it("Should not allow vesting release before time", async function () {
      const { token, owner, team } = await loadFixture(deployTokenFixture);
      
      await token.connect(owner).initializeDistribution();
      
      await expect(
        token.releaseVestedTokens(team.address)
      ).to.be.revertedWith("Vesting period not ended");
    });

    it("Should allow vesting release after time", async function () {
      const { token, owner, team } = await loadFixture(deployTokenFixture);
      
      await token.connect(owner).initializeDistribution();
      
      // Fast forward 2 years
      await ethers.provider.send("evm_increaseTime", [730 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      const initialBalance = await token.balanceOf(team.address);
      await token.releaseVestedTokens(team.address);
      const finalBalance = await token.balanceOf(team.address);
      
      expect(finalBalance - initialBalance).to.equal(TEAM_ALLOCATION);
    });

    it("Should not allow double vesting claim", async function () {
      const { token, owner, team } = await loadFixture(deployTokenFixture);
      
      await token.connect(owner).initializeDistribution();
      
      // Fast forward 2 years
      await ethers.provider.send("evm_increaseTime", [730 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
      
      await token.releaseVestedTokens(team.address);
      
      await expect(
        token.releaseVestedTokens(team.address)
      ).to.be.revertedWith("No vested tokens");
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      
      const mintAmount = ethers.parseEther("1000");
      await token.connect(owner).mint(user1.address, mintAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should emit TokensMinted event", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      
      const mintAmount = ethers.parseEther("1000");
      
      await expect(token.connect(owner).mint(user1.address, mintAmount))
        .to.emit(token, "TokensMinted")
        .withArgs(user1.address, mintAmount);
    });

    it("Should not allow non-minter to mint", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const mintAmount = ethers.parseEther("1000");
      
      await expect(
        token.connect(user1).mint(user2.address, mintAmount)
      ).to.be.reverted;
    });

    it("Should not allow minting beyond cap", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      
      await token.connect(owner).initializeDistribution();
      
      // Try to mint 1 more token
      await expect(
        token.connect(owner).mint(user1.address, 1)
      ).to.be.revertedWithCustomError(token, "ERC20ExceededCap");
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their tokens", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      await token.connect(owner).mint(user1.address, ethers.parseEther("1000"));
      
      const burnAmount = ethers.parseEther("100");
      const initialBalance = await token.balanceOf(user1.address);
      
      await token.connect(user1).burn(burnAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(initialBalance - burnAmount);
    });

    it("Should emit TokensBurned event", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      await token.connect(owner).mint(user1.address, ethers.parseEther("1000"));
      
      const burnAmount = ethers.parseEther("100");
      
      await expect(token.connect(user1).burn(burnAmount))
        .to.emit(token, "TokensBurned")
        .withArgs(user1.address, burnAmount);
    });

    it("Should allow burning with approval", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      await token.connect(owner).mint(user1.address, ethers.parseEther("1000"));
      
      const burnAmount = ethers.parseEther("100");
      
      await token.connect(user1).approve(owner.address, burnAmount);
      await token.connect(owner).burnFrom(user1.address, burnAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseEther("900")
      );
    });
  });

  describe("Pausing", function () {
    it("Should allow pauser to pause transfers", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      
      await token.connect(owner).pause();
      expect(await token.paused()).to.be.true;
    });

    it("Should prevent transfers when paused", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);
      
      await token.connect(owner).mint(user1.address, ethers.parseEther("1000"));
      await token.connect(owner).pause();
      
      await expect(
        token.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    it("Should allow transfers after unpausing", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);
      
      await token.connect(owner).mint(user1.address, ethers.parseEther("1000"));
      await token.connect(owner).pause();
      await token.connect(owner).unpause();
      
      await token.connect(user1).transfer(user2.address, ethers.parseEther("100"));
      expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther("100"));
    });

    it("Should not allow non-pauser to pause", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      
      await expect(token.connect(user1).pause()).to.be.reverted;
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to grant roles", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      
      const MINTER_ROLE = await token.MINTER_ROLE();
      
      await token.connect(owner).grantRole(MINTER_ROLE, user1.address);
      expect(await token.hasRole(MINTER_ROLE, user1.address)).to.be.true;
    });

    it("Should allow admin to revoke roles", async function () {
      const { token, owner, user1 } = await loadFixture(deployTokenFixture);
      
      const MINTER_ROLE = await token.MINTER_ROLE();
      
      await token.connect(owner).grantRole(MINTER_ROLE, user1.address);
      await token.connect(owner).revokeRole(MINTER_ROLE, user1.address);
      
      expect(await token.hasRole(MINTER_ROLE, user1.address)).to.be.false;
    });

    it("Should not allow non-admin to grant roles", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const MINTER_ROLE = await token.MINTER_ROLE();
      
      await expect(
        token.connect(user1).grantRole(MINTER_ROLE, user2.address)
      ).to.be.reverted;
    });
  });

  describe("ERC20 Standard Functions", function () {
    it("Should transfer tokens correctly", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);
      await token.connect(owner).mint(user1.address, ethers.parseEther("1000"));
      
      const transferAmount = ethers.parseEther("100");
      
      await token.connect(user1).transfer(user2.address, transferAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("900"));
      expect(await token.balanceOf(user2.address)).to.equal(transferAmount);
    });

    it("Should handle approve and transferFrom", async function () {
      const { token, owner, user1, user2 } = await loadFixture(deployTokenFixture);
      await token.connect(owner).mint(user1.address, ethers.parseEther("1000"));
      
      const amount = ethers.parseEther("100");
      
      await token.connect(user1).approve(user2.address, amount);
      expect(await token.allowance(user1.address, user2.address)).to.equal(amount);
      
      await token.connect(user2).transferFrom(user1.address, user2.address, amount);
      
      expect(await token.balanceOf(user1.address)).to.equal(ethers.parseEther("900"));
      expect(await token.balanceOf(user2.address)).to.equal(amount);
    });
  });
});