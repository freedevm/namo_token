// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Embedded Chainlink AggregatorV3Interface
interface AggregatorV3Interface {
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);
    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract NAMOCoin is ERC20, Ownable, ReentrancyGuard {
    uint256 private constant TOTAL_SUPPLY = 1_428_627_663 * 10**18;
    uint256 private constant BURN_FEE = 250; // 2.5% total fee (in basis points)
    uint256 private constant BURN_SHARE = 100; // 10% of fee (40% of 2.5%)
    uint256 private constant ARMY_NGO_SHARE = 50; // 20% of fee (20% of 2.5%)
    uint256 private constant WAR_NGO_SHARE = 50; // 20% of fee (20% of 2.5%)
    uint256 private constant CREATOR_SHARE = 37; // 1.5% of fee (40% of 2.5%)
    uint256 private constant PLATFORM_SHARE = 13; // 0.5% of fee (10% of 2.5%)
    uint256 public tokenPrice = 12 * 10**16; // $0.12 in 18 decimals, editable

    address public armyNGOWallet;
    address public warNGOWallet;
    address public creatorWallet;
    address public platformWallet;
    address public usdtToken;
    address public busdToken;
    AggregatorV3Interface public priceFeed; // BNB/USD
    bool public mintingPaused;

    event TokensMinted(address indexed buyer, uint256 amount, address paymentToken, uint256 paymentAmount);
    event TokenPriceUpdated(uint256 newPrice);
    event BNBWithdrawn(address indexed to, uint256 amount);
    event USDTWithdrawn(address indexed to, uint256 amount);
    event BUSDWithdrawn(address indexed to, uint256 amount);

    constructor(
        address _armyNGOWallet,
        address _warNGOWallet,
        address _creatorWallet,
        address _platformWallet,
        address _usdtToken,
        address _busdToken,
        address _priceFeed
    ) ERC20("NAMO Coin", "NAMO") Ownable(msg.sender) {
        armyNGOWallet = _armyNGOWallet;
        warNGOWallet = _warNGOWallet;
        creatorWallet = _creatorWallet;
        platformWallet = _platformWallet;
        usdtToken = _usdtToken;
        busdToken = _busdToken;
        priceFeed = AggregatorV3Interface(_priceFeed);
        mintingPaused = false;
        _mint(address(this), TOTAL_SUPPLY); // Mint to contract for distribution
    }

    function mintWithUSDT(uint256 tokenAmount) external nonReentrant {
        require(!mintingPaused, "Minting is paused");
        require(tokenAmount <= balanceOf(address(this)), "Insufficient tokens in contract");
        uint256 usdtAmount = (tokenAmount * tokenPrice) / 10**18;
        require(IERC20(usdtToken).transferFrom(msg.sender, address(this), usdtAmount), "USDT transfer failed");
        _transfer(address(this), msg.sender, tokenAmount);
        emit TokensMinted(msg.sender, tokenAmount, usdtToken, usdtAmount);
    }

    function mintWithBUSD(uint256 tokenAmount) external nonReentrant {
        require(!mintingPaused, "Minting is paused");
        require(tokenAmount <= balanceOf(address(this)), "Insufficient tokens in contract");
        uint256 busdAmount = (tokenAmount * tokenPrice) / 10**18;
        require(IERC20(busdToken).transferFrom(msg.sender, address(this), busdAmount), "BUSD transfer failed");
        _transfer(address(this), msg.sender, tokenAmount);
        emit TokensMinted(msg.sender, tokenAmount, busdToken, busdAmount);
    }

    function mintWithBNB() external payable nonReentrant {
        require(!mintingPaused, "Minting is paused");
        (, int256 price,,,) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        uint256 bnbPrice = uint256(price); // 8 decimals
        // Calculate tokens: (msg.value * BNB/USD * 10^10) / (tokenPrice * 10^8)
        uint256 tokenAmount = (msg.value * bnbPrice * 10**10) / tokenPrice;
        require(tokenAmount <= balanceOf(address(this)), "Insufficient tokens in contract");
        _transfer(address(this), msg.sender, tokenAmount);
        emit TokensMinted(msg.sender, tokenAmount, address(0), msg.value);
    }

    function _update(address from, address to, uint256 amount) internal virtual override {
        super._update(from, to, amount);
        if (from != address(0) && to != address(0) && from != address(this)) {
            uint256 fee = (amount * BURN_FEE) / 10_000;
            uint256 burnAmount = (fee * BURN_SHARE) / BURN_FEE;
            uint256 armyNGOAmount = (fee * ARMY_NGO_SHARE) / BURN_FEE;
            uint256 warNGOAmount = (fee * WAR_NGO_SHARE) / BURN_FEE;
            uint256 creatorAmount = (fee * CREATOR_SHARE) / BURN_FEE;
            uint256 platformAmount = (fee * PLATFORM_SHARE) / BURN_FEE;

            _burn(from, burnAmount);
            _transfer(from, armyNGOWallet, armyNGOAmount);
            _transfer(from, warNGOWallet, warNGOAmount);
            _transfer(from, creatorWallet, creatorAmount);
            _transfer(from, platformWallet, platformAmount);
        }
    }

    function setTokenPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be greater than zero");
        tokenPrice = _newPrice;
        emit TokenPriceUpdated(_newPrice);
    }

    function setArmyNGOWallet(address _armyNGOWallet) external onlyOwner {
        armyNGOWallet = _armyNGOWallet;
    }

    function setWarNGOWallet(address _warNGOWallet) external onlyOwner {
        warNGOWallet = _warNGOWallet;
    }

    function setCreatorWallet(address _creatorWallet) external onlyOwner {
        creatorWallet = _creatorWallet;
    }

    function setPlatformWallet(address _platformWallet) external onlyOwner {
        platformWallet = _platformWallet;
    }

    function setUsdtToken(address _usdtToken) external onlyOwner {
        usdtToken = _usdtToken;
    }

    function setBusdToken(address _busdToken) external onlyOwner {
        busdToken = _busdToken;
    }

    function setPriceFeed(address _priceFeed) external onlyOwner {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function toggleMinting() external onlyOwner {
        mintingPaused = !mintingPaused;
    }

    function withdrawTokens(uint256 amount) external onlyOwner {
        _transfer(address(this), msg.sender, amount);
    }

    function withdrawBNB(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient BNB balance");
        payable(msg.sender).transfer(amount);
        emit BNBWithdrawn(msg.sender, amount);
    }

    function withdrawUSDT(uint256 amount) external onlyOwner {
        require(IERC20(usdtToken).balanceOf(address(this)) >= amount, "Insufficient USDT balance");
        require(IERC20(usdtToken).transfer(msg.sender, amount), "USDT transfer failed");
        emit USDTWithdrawn(msg.sender, amount);
    }

    function withdrawBUSD(uint256 amount) external onlyOwner {
        require(IERC20(busdToken).balanceOf(address(this)) >= amount, "Insufficient BUSD balance");
        require(IERC20(busdToken).transfer(msg.sender, amount), "BUSD transfer failed");
        emit BUSDWithdrawn(msg.sender, amount);
    }
}