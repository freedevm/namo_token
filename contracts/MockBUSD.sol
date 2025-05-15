// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockBUSD is ERC20 {
    constructor() ERC20("Mock BUSD", "BUSD") {
        _mint(msg.sender, 1_000_000 * 10**18); // Mint 1M tokens to deployer
    }
}