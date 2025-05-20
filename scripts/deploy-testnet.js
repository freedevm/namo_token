const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy mock USDT and BUSD if not already deployed on testnet
    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    const usdt = await MockUSDT.deploy();
    await usdt.waitForDeployment();
    console.log("MockUSDT deployed to:", await usdt.getAddress());

    const MockBUSD = await hre.ethers.getContractFactory("MockBUSD");
    const busd = await MockBUSD.deploy();
    await busd.waitForDeployment();
    console.log("MockBUSD deployed to:", await busd.getAddress());

    const NAMOCoin = await hre.ethers.getContractFactory("NAMOCoin");
    const armyNGOWallet = deployer.address; // Use deployer's address for simplicity
    const warNGOWallet = deployer.address;
    const creatorWallet = deployer.address;
    const platformWallet = deployer.address;
    const usdtToken = await usdt.getAddress();
    const busdToken = await busd.getAddress();
    const priceFeed = "0x1A26d803C2e796601794f8C5609549643832702C"; // BNB/USD on BSC Testnet

    const namoCoin = await NAMOCoin.deploy(
        armyNGOWallet,
        warNGOWallet,
        creatorWallet,
        platformWallet,
        usdtToken,
        busdToken,
        priceFeed
    );

    await namoCoin.waitForDeployment();
    console.log("NAMOCoin deployed to:", await namoCoin.getAddress());

    // Verify contract on BscScan Testnet
    console.log("Verifying contract on BscScan Testnet...");
    await hre.run("verify:verify", {
        address: await namoCoin.getAddress(),
        constructorArguments: [
            armyNGOWallet,
            warNGOWallet,
            creatorWallet,
            platformWallet,
            usdtToken,
            busdToken,
            priceFeed
        ],
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });