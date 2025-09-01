// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IFluxToken
 * @dev Interface for the FLUX token with additional functionality
 */
interface IFluxToken is IERC20 {
    /**
     * @dev Emitted when tokens are minted
     */
    event TokensMinted(address indexed to, uint256 amount);
    
    /**
     * @dev Emitted when tokens are burned
     */
    event TokensBurned(address indexed from, uint256 amount);

    /**
     * @dev Mints new tokens to the specified address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external;
    
    /**
     * @dev Burns tokens from the caller's balance
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) external;
    
    /**
     * @dev Burns tokens from the specified address
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     */
    function burnFrom(address from, uint256 amount) external;
    
    /**
     * @dev Pauses all token transfers
     */
    function pause() external;
    
    /**
     * @dev Unpauses all token transfers
     */
    function unpause() external;
    
    /**
     * @dev Returns true if the contract is paused
     */
    function paused() external view returns (bool);
    
    /**
     * @dev Returns the cap on the token's total supply (42 billion for hitchhiker's guide reference)
     */
    function cap() external view returns (uint256);
}