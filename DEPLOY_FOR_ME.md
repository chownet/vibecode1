# Deploy Contract - Easiest Method

## 🚀 Quick Deploy via Remix (Recommended - 5 minutes)

This is the easiest and safest way - no private key sharing needed!

### Step 1: Get Testnet ETH
1. Go to: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
2. Connect MetaMask
3. Switch to **Base Sepolia** network:
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency: ETH
4. Request testnet ETH

### Step 2: Deploy on Remix
1. Open: https://remix.ethereum.org
2. Click "File Explorer" → "Create new file"
3. Name it: `AuctionEscrow.sol`
4. Open `contracts/AuctionEscrow.sol` in this project
5. Copy ALL the code and paste into Remix
6. Click "Solidity Compiler" (left sidebar)
   - Select: **0.8.20**
   - Click "Compile AuctionEscrow.sol"
7. Click "Deploy & Run Transactions"
   - Environment: **Injected Provider - MetaMask**
   - Make sure MetaMask shows "Base Sepolia"
   - Contract: Select "AuctionEscrow"
   - Click **"Deploy"**
8. Confirm in MetaMask
9. **Copy the contract address** (shown below Deploy button)

### Step 3: Update Your App
Edit `src/utils/contract.js`:
```javascript
export const CONTRACT_ADDRESS = '0xPASTE_YOUR_ADDRESS_HERE';
```

### Step 4: Done! 🎉
Restart: `npm run dev`

---

## Alternative: Use Deployment Script

If you prefer command line:

1. Run: `npm run deploy`
2. Enter your private key when prompted
3. Script will deploy and update files automatically

**Get private key from MetaMask:**
- Account menu (⋮) → Account Details → Export Private Key

---

## Which Method?

- **Remix**: Easier, no private key needed, visual interface
- **Script**: Faster if you already have .env set up, automated

Both work the same - your choice! 🚀

