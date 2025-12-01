# Deploy to Base Sepolia Testnet (Easiest Method)

## Option 1: Deploy via Remix IDE (Recommended - No Local Setup Needed)

This is the easiest way - everything happens in your browser!

### Step 1: Get Testnet ETH

1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Connect your MetaMask wallet
3. Make sure you're on Base Sepolia network:
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency Symbol: ETH
4. Request testnet ETH (you'll need some for gas)

### Step 2: Deploy via Remix

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create a new file called `AuctionEscrow.sol`
3. Copy the entire contract code from `contracts/AuctionEscrow.sol` and paste it into Remix
4. In the left sidebar, click "Solidity Compiler"
   - Select compiler version: **0.8.20**
   - Click "Compile AuctionEscrow.sol"
5. Click "Deploy & Run Transactions" in the left sidebar
   - Environment: Select "Injected Provider - MetaMask"
   - Make sure MetaMask is connected and on Base Sepolia network
   - Contract: Select "AuctionEscrow"
   - Click "Deploy"
6. Confirm the transaction in MetaMask
7. Once deployed, copy the contract address (it will appear below the deploy button)

### Step 3: Update Your App

After deployment, you'll get a contract address like: `0x1234...`

Update your app in one of these ways:

**Option A: Update .env file**
Create a `.env` file in the project root:
```
VITE_CONTRACT_ADDRESS=0xYourContractAddressHere
```

**Option B: Update contract.js directly**
Edit `src/utils/contract.js` and change:
```javascript
export const CONTRACT_ADDRESS = '0xYourContractAddressHere';
```

### Step 4: Test It!

1. Restart your dev server: `npm run dev`
2. Connect your wallet (make sure it's on Base Sepolia)
3. Create an auction
4. Place bids
5. Everything uses testnet tokens! 🎉

---

## Option 2: Deploy via Script (If Remix Doesn't Work)

If you prefer command line deployment:

1. Create `.env` file:
   ```
   PRIVATE_KEY=your_private_key_without_0x
   ```

2. Get testnet ETH from the faucet (see Step 1 above)

3. Run:
   ```bash
   npm run deploy:testnet
   ```

The script will:
- Compile the contract
- Deploy to Base Sepolia
- Update your .env and contract.js automatically

---

## Verify Your Contract (Optional)

After deployment, verify on BaseScan:

1. Go to [Base Sepolia BaseScan](https://sepolia.basescan.org)
2. Search for your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Enter:
   - Compiler: 0.8.20
   - License: MIT
   - Paste contract code
6. Click "Verify and Publish"

---

## Troubleshooting

**"Insufficient funds"**
- Get more testnet ETH from the faucet

**"Wrong network"**
- Make sure MetaMask is on Base Sepolia (Chain ID: 84532)

**"Contract not found"**
- Make sure you copied the contract address correctly
- Check that it starts with `0x`

---

## You're All Set! 🎉

Your contract is now on Base Sepolia testnet. All transactions will use testnet tokens, so you can test freely without spending real money!

