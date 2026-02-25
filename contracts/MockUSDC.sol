// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDC
 * @notice A mock USDC token for Arc Testnet development and testing.
 * @dev Anyone can mint tokens for testing purposes. Uses 6 decimals like real USDC.
 */
contract MockUSDC is ERC20 {

    uint8 private constant DECIMALS = 6;

    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 1_000_000 * 10 ** DECIMALS);
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @notice Mint test tokens to any address.
     * @param _to Recipient address.
     * @param _amount Amount to mint (in 6-decimal units).
     */
    function mint(address _to, uint256 _amount) external {
        _mint(_to, _amount);
    }

    /**
     * @notice Convenience faucet – mints 10,000 USDC to the caller.
     */
    function faucet() external {
        _mint(msg.sender, 10_000 * 10 ** DECIMALS);
    }
}
