// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialBalance
    ) ERC20(name, symbol) {
        _mint(initialAccount, initialBalance);
    }

    // Optional: Add a function to mint tokens for testing
    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    // Optional: Add a function to burn tokens for testing
    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }
}