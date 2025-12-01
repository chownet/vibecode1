# Smart Contract Deployment Instructions

## Quick Deploy Guide

### Step 1: Get Your Private Key

1. Open MetaMask (or your wallet)
2. Click the account menu (three dots)
3. Select "Account Details"
4. Click "Export Private Key"
5. Enter your password
6. Copy the private key (starts with `0x`)

⚠️ **SECURITY WARNING**: Never share your private key or commit it to Git!

### Step 2: Get Test ETH (for Base Sepolia)

If deploying to testnet first (recommended):

1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Connect your wallet
3. Request test ETH (you'll need some for gas fees)

### Step 3: Create .env File

Create a `.env` file in the project root:

```bash
PRIVATE_KEY=your_private_key_here_without_0x_prefix
BASESCAN_API_KEY=your_basescan_api_key_optional
```

**Important**: 
- Remove the `0x` prefix from your private key when adding to .env
- The .env file is already in .gitignore, so it won't be committed

### Step 4: Deploy to Base Sepolia (Testnet)

Test on testnet first:

```bash
npx hardhat run scripts/deploy.js --network baseSepolia
```

This will:
- Compile the contract
- Deploy to Base Sepolia
- Show you the contract address
- Optionally verify on BaseScan

### Step 5: Update Contract Address

After deployment, you'll see output like:

```
✅ AuctionEscrow deployed to: 0x1234567890abcdef...
```

Update your `.env` file:

```bash
VITE_CONTRACT_ADDRESS=0x1234567890abcdef...
```

Or update `src/utils/contract.js` directly:

```javascript
export const CONTRACT_ADDRESS = '0x1234567890abcdef...';
```

### Step 6: Deploy to Base Mainnet (Production)

Once tested on testnet:

1. Make sure you have ETH on Base mainnet for gas
2. Update your wallet to use Base mainnet
3. Deploy:

```bash
npx hardhat run scripts/deploy.js --network base
```

4. Update the contract address in your app

## Alternative: Deploy via Remix IDE

If you prefer a browser-based deployment:

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create new file `AuctionEscrow.sol`
3. Copy the contract code from `contracts/AuctionEscrow.sol`
4. Compile with Solidity 0.8.20
5. In "Deploy & Run":
   - Select "Injected Provider - MetaMask"
   - Make sure you're on Base network
   - Click "Deploy"
   - Copy the deployed address

## Verify Contract on BaseScan

After deployment, verify the contract:

1. Go to [BaseScan](https://basescan.org) (or Base Sepolia for testnet)
2. Find your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Enter:
   - Compiler: 0.8.20
   - License: MIT
   - Paste the contract code
6. Click "Verify and Publish"

Or use the automatic verification in the deploy script (if BASESCAN_API_KEY is set).

## Troubleshooting

### "Insufficient funds"
- Make sure you have ETH in your wallet for gas fees
- For testnet, get test ETH from a faucet

### "Nonce too high"
- Reset your MetaMask account nonce
- Or wait a few minutes and try again

### "Contract verification failed"
- This is okay, you can verify manually on BaseScan
- Or skip verification (contract will still work)

## Next Steps

After deployment:
1. ✅ Contract is deployed
2. ✅ Contract address is set in `.env` or `contract.js`
3. ✅ Restart your dev server: `npm run dev`
4. ✅ Test creating an auction
5. ✅ Test placing bids
6. ✅ Test refund withdrawal

Your auction app is now fully functional with on-chain escrow! 🎉

