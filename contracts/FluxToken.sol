// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./interfaces/IFluxToken.sol";

/**
 * @title FluxToken
 * @dev Implementation of the FLUX token - The Interplanetary Digital Asset Protocol
 * Total supply: 42 billion tokens (reference to Hitchhiker's Guide to the Galaxy)
 */
contract FluxToken is IFluxToken, ERC20, ERC20Burnable, ERC20Capped, ERC20Pausable, AccessControl {
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Token distribution allocations (in basis points, 10000 = 100%)
    uint256 public constant ECOSYSTEM_ALLOCATION = 4000; // 40%
    uint256 public constant TEAM_ALLOCATION = 2000; // 20%
    uint256 public constant INVESTOR_ALLOCATION = 1500; // 15%
    uint256 public constant FOUNDATION_ALLOCATION = 1500; // 15%
    uint256 public constant MARS_RESERVE_ALLOCATION = 1000; // 10%
    
    // Addresses for token distribution (immutable for gas optimization)
    address public immutable ecosystemWallet;
    address public immutable teamWallet;
    address public immutable investorWallet;
    address public immutable foundationWallet;
    address public immutable marsReserveWallet;
    
    // Vesting tracking
    mapping(address => uint256) public vestingAmount;
    mapping(address => uint256) public vestingReleaseTime;
    
    // Custom events (already defined in interface, no need to redefine)
    
    /**
     * @dev Constructor
     * @param _ecosystemWallet Address for ecosystem rewards
     * @param _teamWallet Address for team allocation (2 year vesting)
     * @param _investorWallet Address for investor allocation (1 year vesting)
     * @param _foundationWallet Address for foundation allocation
     * @param _marsReserveWallet Address for Mars economy reserve
     */
    constructor(
        address _ecosystemWallet,
        address _teamWallet,
        address _investorWallet,
        address _foundationWallet,
        address _marsReserveWallet
    ) ERC20("Flux Token", "FLUX") ERC20Capped(42_000_000_000 * 10**18) {
        require(_ecosystemWallet != address(0), "Invalid ecosystem wallet");
        require(_teamWallet != address(0), "Invalid team wallet");
        require(_investorWallet != address(0), "Invalid investor wallet");
        require(_foundationWallet != address(0), "Invalid foundation wallet");
        require(_marsReserveWallet != address(0), "Invalid Mars reserve wallet");
        
        ecosystemWallet = _ecosystemWallet;
        teamWallet = _teamWallet;
        investorWallet = _investorWallet;
        foundationWallet = _foundationWallet;
        marsReserveWallet = _marsReserveWallet;
        
        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }
    
    /**
     * @dev Initialize token distribution
     * Can only be called once by admin
     */
    function initializeDistribution() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(totalSupply() == 0, "Already initialized");
        
        uint256 totalCap = cap();
        
        // Ecosystem allocation (40%) - immediate
        uint256 ecosystemAmount = (totalCap * ECOSYSTEM_ALLOCATION) / 10000;
        _mint(ecosystemWallet, ecosystemAmount);
        
        // Team allocation (20%) - 2 year vesting
        uint256 teamAmount = (totalCap * TEAM_ALLOCATION) / 10000;
        _mint(address(this), teamAmount);
        vestingAmount[teamWallet] = teamAmount;
        vestingReleaseTime[teamWallet] = block.timestamp + 730 days; // 2 years
        
        // Investor allocation (15%) - 1 year vesting
        uint256 investorAmount = (totalCap * INVESTOR_ALLOCATION) / 10000;
        _mint(address(this), investorAmount);
        vestingAmount[investorWallet] = investorAmount;
        vestingReleaseTime[investorWallet] = block.timestamp + 365 days; // 1 year
        
        // Foundation allocation (15%) - immediate
        uint256 foundationAmount = (totalCap * FOUNDATION_ALLOCATION) / 10000;
        _mint(foundationWallet, foundationAmount);
        
        // Mars Reserve allocation (10%) - immediate but locked in contract
        uint256 marsReserveAmount = (totalCap * MARS_RESERVE_ALLOCATION) / 10000;
        _mint(marsReserveWallet, marsReserveAmount);
    }
    
    /**
     * @dev Release vested tokens
     * @param beneficiary Address to release tokens to
     * Note: Using block.timestamp is safe here as precision is not critical
     */
    function releaseVestedTokens(address beneficiary) external {
        require(vestingAmount[beneficiary] > 0, "No vested tokens");
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp >= vestingReleaseTime[beneficiary], "Vesting period not ended");
        
        uint256 amount = vestingAmount[beneficiary];
        vestingAmount[beneficiary] = 0;
        
        _transfer(address(this), beneficiary, amount);
    }
    
    /**
     * @dev Mint new tokens (only for authorized minters)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public override onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Override burn to emit event
     */
    function burn(uint256 amount) public override(IFluxToken, ERC20Burnable) {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Override burnFrom to emit event
     */
    function burnFrom(address account, uint256 amount) public override(IFluxToken, ERC20Burnable) {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }
    
    /**
     * @dev Pause token transfers
     */
    function pause() public override onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause token transfers
     */
    function unpause() public override onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Returns true if the contract is paused
     */
    function paused() public view override(IFluxToken, Pausable) returns (bool) {
        return super.paused();
    }
    
    /**
     * @dev Returns the cap on the token's total supply
     */
    function cap() public view override(IFluxToken, ERC20Capped) returns (uint256) {
        return super.cap();
    }
    
    /**
     * @dev Required override for multiple inheritance
     * Implements pausable transfers
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Capped, ERC20Pausable) {
        super._update(from, to, amount);
    }
}