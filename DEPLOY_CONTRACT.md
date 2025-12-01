# Deploying the Auction Escrow Smart Contract

## Prerequisites

1. **Hardhat** or **Remix IDE** for compiling and deploying
2. **Base network** configured in your wallet
3. **Test ETH** on Base for gas fees

## Option 1: Deploy with Hardhat

### 1. Install Hardhat

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

### 2. Configure Hardhat

Create `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY],
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY],
    }
  }
};
```

### 3. Deploy Script

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const AuctionEscrow = await hre.ethers.getContractFactory("AuctionEscrow");
  const auctionEscrow = await AuctionEscrow.deploy();

  await auctionEscrow.waitForDeployment();

  console.log("AuctionEscrow deployed to:", await auctionEscrow.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 4. Deploy

```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

## Option 2: Deploy with Remix IDE

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create new file `AuctionEscrow.sol`
3. Copy the contract code from `contracts/AuctionEscrow.sol`
4. Compile with Solidity 0.8.20
5. Deploy to Base network
6. Copy the deployed contract address

## Update Frontend

After deployment, update the contract address:

1. Create `.env` file:
```
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

2. Or update `src/utils/contract.js`:
```javascript
export const CONTRACT_ADDRESS = '0xYourDeployedContractAddress';
```

## Contract Features

- ✅ Holds funds in escrow until auction ends
- ✅ Automatically refunds outbid users
- ✅ Transfers funds to seller when auction closes
- ✅ Supports auto-accept price
- ✅ Allows users to withdraw refunds
- ✅ Tracks all bids and bidders

## Security Notes

- Contract is non-upgradeable (immutable after deployment)
- Only contract owner can emergency withdraw
- All refunds are handled automatically
- Seller receives funds only after auction closes

