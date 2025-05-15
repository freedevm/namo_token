const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NAMOCoin", function () {
    let NAMOCoin, MockAggregatorV3, MockBUSD, MockUSDT;
    let namoCoin, aggregator, busd, usdt;
    let owner, addr1, addr2;
    const TOTAL_SUPPLY = ethers.parseUnits("1428627663", 18);
    const TOKEN_PRICE = ethers.parseUnits("0.12", 18);

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy Mock Aggregator (BNB/USD price feed)
        MockAggregatorV3 = await ethers.getContractFactory("MockAggregatorV3");
        aggregator = await MockAggregatorV3.deploy(ethers.parseUnits("500", 8)); // $500 per BNB, 8 decimals
        await aggregator.waitForDeployment();

        // Deploy Mock BUSD
        MockBUSD = await ethers.getContractFactory("MockBUSD");
        busd = await MockBUSD.deploy();
        await busd.waitForDeployment();

        // Deploy Mock USDT
        MockUSDT = await ethers.getContractFactory("MockUSDT");
        usdt = await MockUSDT.deploy();
        await usdt.waitForDeployment();

        // Deploy NAMOCoin
        NAMOCoin = await ethers.getContractFactory("NAMOCoin");
        namoCoin = await NAMOCoin.deploy(
            addr1.address, // armyNGOWallet
            addr2.address, // warNGOWallet
            owner.address, // creatorWallet
            owner.address, // platformWallet
            usdt.getAddress(), // usdtToken
            busd.getAddress(), // busdToken
            aggregator.getAddress() // priceFeed
        );
        await namoCoin.waitForDeployment();

        // Transfer some BUSD and USDT to addr1 for minting
        await busd.transfer(addr1.address, ethers.parseUnits("10000", 18));
        await usdt.transfer(addr1.address, ethers.parseUnits("10000", 18));
    });

    it("Should deploy with correct initial state", async function () {
        expect(await namoCoin.owner()).to.equal(owner.address);
        expect(await namoCoin.tokenPrice()).to.equal(TOKEN_PRICE);
        expect(await namoCoin.balanceOf(namoCoin.getAddress())).to.equal(TOTAL_SUPPLY);
    });

    it("Should mint tokens with BNB", async function () {
        const bnbPrice = 500; // $500 per BNB (from mock aggregator)
        const bnbAmount = ethers.parseEther("1.0"); // 1 BNB
        const expectedTokens = (bnbAmount * BigInt(bnbPrice) * BigInt(10**10)) / TOKEN_PRICE;
        const initialBalance = await namoCoin.balanceOf(addr1.address);
        await namoCoin.connect(addr1).mintWithBNB({ value: bnbAmount });
        const newBalance = await namoCoin.balanceOf(addr1.address);
        expect(newBalance - initialBalance).to.equal(expectedTokens);
        expect(await ethers.provider.getBalance(namoCoin.getAddress())).to.equal(bnbAmount);
    });

    it("Should mint tokens with USDT", async function () {
        const tokenAmount = ethers.parseUnits("1000", 18); // 1000 NAMO tokens
        const usdtAmount = (tokenAmount * TOKEN_PRICE) / BigInt(10**18); // $120
        await usdt.connect(addr1).approve(namoCoin.getAddress(), usdtAmount);
        const initialBalance = await namoCoin.balanceOf(addr1.address);
        await namoCoin.connect(addr1).mintWithUSDT(tokenAmount);
        const newBalance = await namoCoin.balanceOf(addr1.address);
        expect(newBalance - initialBalance).to.equal(tokenAmount);
        expect(await usdt.balanceOf(namoCoin.getAddress())).to.equal(usdtAmount);
    });

    it("Should mint tokens with BUSD", async function () {
        const tokenAmount = ethers.parseUnits("1000", 18); // 1000 NAMO tokens
        const busdAmount = (tokenAmount * TOKEN_PRICE) / BigInt(10**18); // $120
        await busd.connect(addr1).approve(namoCoin.getAddress(), busdAmount);
        const initialBalance = await namoCoin.balanceOf(addr1.address);
        await namoCoin.connect(addr1).mintWithBUSD(tokenAmount);
        const newBalance = await namoCoin.balanceOf(addr1.address);
        expect(newBalance - initialBalance).to.equal(tokenAmount);
        expect(await busd.balanceOf(namoCoin.getAddress())).to.equal(busdAmount);
    });

    it("Should update token price", async function () {
        const newPrice = ethers.parseUnits("0.15", 18); // $0.15
        await namoCoin.setTokenPrice(newPrice);
        expect(await namoCoin.tokenPrice()).to.equal(newPrice);
    });

    it("Should allow owner to withdraw BNB", async function () {
        const bnbAmount = ethers.parseEther("1.0"); // 1 BNB
        await namoCoin.connect(addr1).mintWithBNB({ value: bnbAmount });
        const initialBalance = await ethers.provider.getBalance(owner.address);
        const tx = await namoCoin.withdrawBNB(bnbAmount);
        const receipt = await tx.wait();
        const gasUsed = receipt.gasUsed * receipt.gasPrice;
        const newBalance = await ethers.provider.getBalance(owner.address);
        expect(newBalance - initialBalance + gasUsed).to.equal(bnbAmount);
    });

    it("Should allow owner to withdraw USDT", async function () {
        const tokenAmount = ethers.parseUnits("1000", 18); // 1000 NAMO tokens
        const usdtAmount = (tokenAmount * TOKEN_PRICE) / BigInt(10**18); // $120
        await usdt.connect(addr1).approve(namoCoin.getAddress(), usdtAmount);
        await namoCoin.connect(addr1).mintWithUSDT(tokenAmount);
        const initialBalance = await usdt.balanceOf(owner.address);
        await namoCoin.withdrawUSDT(usdtAmount);
        const newBalance = await usdt.balanceOf(owner.address);
        expect(newBalance - initialBalance).to.equal(usdtAmount);
    });

    it("Should allow owner to withdraw BUSD", async function () {
        const tokenAmount = ethers.parseUnits("1000", 18); // 1000 NAMO tokens
        const busdAmount = (tokenAmount * TOKEN_PRICE) / BigInt(10**18); // $120
        await busd.connect(addr1).approve(namoCoin.getAddress(), busdAmount);
        await namoCoin.connect(addr1).mintWithBUSD(tokenAmount);
        const initialBalance = await busd.balanceOf(owner.address);
        await namoCoin.withdrawBUSD(busdAmount);
        const newBalance = await busd.balanceOf(owner.address);
        expect(newBalance - initialBalance).to.equal(busdAmount);
    });

    it("Should fail to withdraw BNB if insufficient balance", async function () {
        await expect(namoCoin.withdrawBNB(ethers.parseEther("1.0")))
            .to.be.revertedWith("Insufficient BNB balance");
    });

    it("Should fail to withdraw USDT if insufficient balance", async function () {
        await expect(namoCoin.withdrawUSDT(ethers.parseUnits("1000", 18)))
            .to.be.revertedWith("Insufficient USDT balance");
    });

    it("Should fail to withdraw BUSD if insufficient balance", async function () {
        await expect(namoCoin.withdrawBUSD(ethers.parseUnits("1000", 18)))
            .to.be.revertedWith("Insufficient BUSD balance");
    });

    it("Should fail to withdraw BNB if not owner", async function () {
        await expect(namoCoin.connect(addr1).withdrawBNB(ethers.parseEther("1.0")))
            .to.be.revertedWithCustomError(namoCoin, "OwnableUnauthorizedAccount");
    });
});