const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const NAMOCoin = await hre.ethers.getContractFactory("NAMOCoin");
    const armyNGOWallet = "0xYourArmyNGOWalletAddress";
    const warNGOWallet = "0xYourWarNGOWalletAddress";
    const creatorWallet = "0xYourCreatorWalletAddress";
    const platformWallet = "0xYourPlatformWalletAddress";
    const usdtToken = "0x55d398326f99059fF775485246999027B319795"; // USDT on BSC Mainnet
    const busdToken = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"; // BUSD on BSC Mainnet
    const priceFeed = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42ae"; // BNB/USD on BSC Mainnet

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

    // Verify contract on BscScan
    console.log("Verifying contract on BscScan...");
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