NAMO Coin 🪙
Welcome to NAMO Coin - a BEP-20 token on the BNB Smart Chain designed to support meaningful causes while providing a sustainable token economy. With a fixed supply, burn mechanism, and support for Army and War Relief NGOs, NAMO Coin aims to combine financial innovation with social impact.
Overview
NAMO Coin ($NAMO) is a decentralized token built on the BNB Smart Chain (BSC) with a total supply of 1,428,627,663 tokens. It features a unique transaction fee structure that supports charitable causes, burns tokens to reduce supply, and rewards creators and platform operations. Users can mint NAMO tokens using BNB, USDT, or BUSD at a dynamic price set by the contract owner.
Features

BEP-20 Token Standard: Fully compliant with the BEP-20 standard on BNB Smart Chain.
Dynamic Pricing: Token price starts at $0.12 but can be updated by the owner.
Minting Options: Mint tokens using BNB, USDT, or BUSD with real-time BNB/USD price feeds via Chainlink.
Transaction Fees (2.5% per transfer):
10% burned to reduce total supply.
20% to Army-support NGO wallet.
20% to War-relief NGO wallet.
40% to creator remuneration wallet.
10% to platform operations wallet.


Withdrawal Support: Owner can withdraw accumulated BNB, USDT, and BUSD from the contract.
Security: Uses OpenZeppelin's battle-tested contracts for ERC20, Ownable, and ReentrancyGuard.

Tokenomics

Name: NAMO Coin
Symbol: $NAMO
Total Supply: 1,428,627,663 NAMO
Decimals: 18
Blockchain: BNB Smart Chain
Token Standard: BEP-20
Initial Price: $0.12 (editable by owner)

Transaction Fee Allocation (2.5% per transfer)

Burn: 10% (0.25% of transfer)
Army NGO: 20% (0.5% of transfer)
War Relief NGO: 20% (0.5% of transfer)
Creator Fee: 40% (1% of transfer)
Platform Fee: 10% (0.25% of transfer)

Getting Started
Prerequisites

Node.js: v16.x or higher
Hardhat: For compiling, testing, and deploying the smart contract
MetaMask: For interacting with BNB Smart Chain
BNB: For gas fees on BSC Mainnet or Testnet

Installation

Clone the repository:git clone https://github.com/your-username/namo-coin.git
cd namo-coin


Install dependencies:npm install


Create a .env file in the root directory and add your private key and BscScan API key:PRIVATE_KEY=your_private_key_here
BSCSCAN_API_KEY=your_bscscan_api_key_here



Project Setup Method
This section guides you through setting up the development environment for NAMO Coin.

Initialize the Project:

If starting from scratch, initialize a new Hardhat project:npx hardhat init


Select "Create a JavaScript project" and follow the prompts.


If using the cloned repository, this step is already done.


Install Required Dependencies:

Ensure the following dependencies are installed (already in package.json if cloned):npm install --save-dev @nomicfoundation/hardhat-toolbox chai dotenv hardhat
npm install @openzeppelin/contracts


Verify the package.json includes:{
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^5.0.0",
    "chai": "^5.2.0",
    "dotenv": "^16.5.0",
    "hardhat": "^2.24.0"
  },
  "dependencies": {
    "@openzeppelin/contracts": "^5.3.0"
  }
}




Configure Hardhat:

Ensure hardhat.config.cjs is set up for BNB Smart Chain Mainnet and Testnet:require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: "0.8.20",
    networks: {
        hardhat: {},
        bscMainnet: {
            url: "https://bsc-dataseed.binance.org/",
            accounts: [process.env.PRIVATE_KEY],
        },
        bscTestnet: {
            url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
            accounts: [process.env.PRIVATE_KEY],
        },
    },
    etherscan: {
        apiKey: process.env.BSCSCAN_API_KEY,
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts",
    },
};


Note: The .cjs extension is used due to potential ESM settings in package.json. If you set "type": "commonjs" in package.json, you can rename it to hardhat.config.js.


Prepare Smart Contracts:

Place NAMOCoin.sol, MockAggregatorV3.sol, MockBUSD.sol, and MockUSDT.sol in the contracts/ directory.
Ensure all imports (e.g., @openzeppelin/contracts) resolve correctly.


Set Up Deployment Scripts:

Place deploy-mainnet.js and deploy-testnet.js in the scripts/ directory.
Update the scripts with the correct wallet and token addresses for your deployment environment.


Set Up Tests:

Place NAMOCoin.test.js in the test/ directory.
Ensure all mock contracts are available for testing.


Verify Environment:

Test the setup by compiling the contracts:npx hardhat compile


Run the test suite to confirm everything is working:npx hardhat test





Project Structure

contracts/: Smart contracts (NAMOCoin.sol, mock contracts for testing)
scripts/: Deployment scripts (deploy-mainnet.js, deploy-testnet.js)
test/: Test files (NAMOCoin.test.js)
hardhat.config.cjs: Hardhat configuration file

Deployment
Deploy to BNB Chain Testnet

Update scripts/deploy-testnet.js with appropriate wallet and token addresses.
Deploy the contract:npx hardhat run scripts/deploy-testnet.js --network bscTestnet


Verify on BscScan Testnet (automatically handled by the script if BSCSCAN_API_KEY is set).

Deploy to BNB Chain Mainnet

Update scripts/deploy-mainnet.js with appropriate wallet and token addresses.
Deploy the contract:npx hardhat run scripts/deploy-mainnet.js --network bscMainnet


Verify on BscScan (automatically handled by the script).

Contract Addresses

USDT (Mainnet): 0x55d398326f99059fF775485246999027B319795
BUSD (Mainnet): 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56
BNB/USD Price Feed (Mainnet): 0x0567F2323251f0Aab15c8dFb1967E4e8A7D42ae
BNB/USD Price Feed (Testnet): 0x2514895c72f50D8bd4B4F9b1110F0D6bD2c9759

Testing
Run the full test suite to ensure the contract works as expected:
npx hardhat test

The test suite includes:

Deployment validation
Minting with BNB, USDT, and BUSD
Token price updates
Withdrawals of BNB, USDT, and BUSD
Edge cases (insufficient balance, unauthorized access)

Mock Contracts

MockAggregatorV3.sol: Simulates Chainlink BNB/USD price feed
MockBUSD.sol: Mock BUSD token
MockUSDT.sol: Mock USDT token

Usage

Mint Tokens:
Call mintWithBNB to mint with BNB.
Approve the contract to spend USDT/BUSD, then call mintWithUSDT or mintWithBUSD.


Withdraw Funds (Owner Only):
Use withdrawBNB, withdrawUSDT, or withdrawBUSD to retrieve accumulated funds.


Update Price (Owner Only):
Call setTokenPrice to adjust the token price.



Contributing
We welcome contributions! To contribute:

Fork the repository.
Create a new branch (git checkout -b feature/your-feature).
Make your changes and commit (git commit -m "Add your feature").
Push to your branch (git push origin feature/your-feature).
Open a Pull Request.

License
This project is licensed under the MIT License - see the LICENSE file for details.
Contact
For questions or support, reach out to us:

Email: support@namocoin.org
Twitter: @NAMOCoin


🌟 Support a Cause with NAMO Coin! 🌟
