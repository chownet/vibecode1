# Deploy Contracts to Base Sepolia Testnet

## Step-by-Step Guide

### Step 1: Get Testnet ETH

1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Connect your MetaMask wallet
3. Make sure you're on **Base Sepolia** network (Chain ID: 84532)
4. Request testnet ETH (you'll need some for gas)

### Step 2: Deploy Test USDC Token

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create a new file: `TestUSDC.sol`
3. Copy the code from `contracts/TestUSDC.sol` in this project
4. Compile:
   - Click "Solidity Compiler" (left sidebar)
   - Select version **0.8.20**
   - Click "Compile TestUSDC.sol"
5. Deploy:
   - Click "Deploy & Run Transactions"
   - Environment: **Injected Provider - MetaMask**
   - Make sure MetaMask shows "Base Sepolia"
   - Contract: Select "TestUSDC"
   - Click **"Deploy"**
   - Confirm in MetaMask
6. **Copy the deployed token address** (shown below Deploy button)
   - Example: `0x1234567890abcdef...`

### Step 3: Deploy AuctionEscrow Contract

1. Still in Remix IDE
2. Create a new file: `AuctionEscrow.sol`
3. Copy the code from `contracts/AuctionEscrow.sol` in this project
4. Compile:
   - Click "Solidity Compiler"
   - Select version **0.8.20**
   - Click "Compile AuctionEscrow.sol"
5. Deploy:
   - Click "Deploy & Run Transactions"
   - Environment: **Injected Provider - MetaMask**
   - Make sure you're still on Base Sepolia
   - Contract: Select "AuctionEscrow"
   - **Important**: In the "Deploy" section, you'll see a field for constructor arguments
   - Enter your TestUSDC token address from Step 2
   - Click **"Deploy"**
   - Confirm in MetaMask
6. **Copy the deployed contract address** (shown below Deploy button)
   - Example: `0xabcdef1234567890...`

### Step 4: Update Your App

After deployment, update your app with the contract addresses:

**Option A: Update .env file**
Create a `.env` file in the project root:
```
VITE_CONTRACT_ADDRESS=0xYourAuctionEscrowAddress
VITE_USDC_ADDRESS_TESTNET=0xYourTestUSDCAddress
```

**Option B: Update contract.js directly**
Edit `src/utils/contract.js`:
```javascript
export const CONTRACT_ADDRESS = '0xYourAuctionEscrowAddress';
export const USDC_ADDRESS_TESTNET = '0xYourTestUSDCAddress';
```

### Step 5: Mint Test USDC to Your Wallet

1. In Remix, go to "Deploy & Run Transactions"
2. Find your deployed TestUSDC contract
3. Expand it to see the functions
4. Use the `mint` function:
   - Enter your wallet address
   - Enter amount: `1000000000000` (1,000,000 tUSDC with 6 decimals)
   - Click "mint"
   - Confirm in MetaMask

### Step 6: Test It!

1. Restart your dev server: `npm run dev`
2. Create an auction (no wallet needed)
3. Place a bid (wallet will prompt for approval)
4. Everything uses testnet tokens! 🎉

## Quick Reference

- **Test USDC Contract**: `contracts/TestUSDC.sol`
- **Auction Escrow Contract**: `contracts/AuctionEscrow.sol`
- **Network**: Base Sepolia (Chain ID: 84532)
- **Compiler Version**: 0.8.20
- **Block Explorer**: https://sepolia.basescan.org

## Troubleshooting

**"Insufficient funds"**
- Get more testnet ETH from the faucet

**"Contract deployment failed"**
- Make sure you're on Base Sepolia network
- Check you have enough testnet ETH for gas
- Verify the constructor parameter (USDC address) is correct

**"Token not found"**
- Make sure you deployed TestUSDC first
- Copy the exact address (starts with 0x)
- Check the address on BaseScan to verify it exists

