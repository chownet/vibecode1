# Simple Deployment - No Private Keys Needed!

## Use Remix IDE (5 minutes, no private keys)

### 1. Get Testnet ETH
- Go to: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Connect MetaMask
- Switch to Base Sepolia network
- Request testnet ETH

### 2. Deploy on Remix
1. Open: **https://remix.ethereum.org**
2. Create file: `AuctionEscrow.sol`
3. Copy code from: `contracts/AuctionEscrow.sol` in this project
4. Compile:
   - Click "Solidity Compiler"
   - Version: **0.8.20**
   - Click "Compile"
5. Deploy:
   - Click "Deploy & Run"
   - Environment: **Injected Provider - MetaMask**
   - Make sure you're on Base Sepolia
   - Click **"Deploy"**
6. Copy the contract address

### 3. Update Your App
Edit `src/utils/contract.js`:
```javascript
export const CONTRACT_ADDRESS = '0xYOUR_ADDRESS_HERE';
```

### 4. Done!
Restart: `npm run dev`

---

**That's it!** Remix uses MetaMask directly - no private keys exposed. 🎉

