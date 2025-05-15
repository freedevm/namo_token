const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const NAMOCoin = await hre.ethers.getContractFactory("NAMOCoin");
    const armyNGOWallet = "0xYourArmyNGOWalletAddressTestnet";
    const warNGOWallet = "0xYourWarNGOWalletAddressTestnet";
    const creatorWallet = "0xYourCreatorWalletAddressTestnet";
    const platformWallet = "0xYourPlatformWalletAddressTestnet";
    const usdtToken = "0xYourTestnetUSDTAddress"; // Replace with Testnet USDT address
    const busdToken = "0xYourTestnetBUSDAddress"; // Replace with Testnet BUSD address
    const priceFeed = "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c9759"; // BNB/USD on BSC Testnet

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