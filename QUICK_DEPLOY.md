# Quick Deploy to Testnet - 3 Steps

## 🚀 Fastest Way to Deploy

### 1️⃣ Get Testnet ETH (2 minutes)
- Go to: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Connect MetaMask
- Switch to Base Sepolia network
- Request testnet ETH

### 2️⃣ Deploy via Remix (5 minutes)
- Go to: https://remix.ethereum.org
- Create file: `AuctionEscrow.sol`
- Copy code from: `contracts/AuctionEscrow.sol`
- Compile with Solidity 0.8.20
- Deploy with "Injected Provider - MetaMask"
- Copy the contract address

### 3️⃣ Update Your App (1 minute)
Edit `src/utils/contract.js`:
```javascript
export const CONTRACT_ADDRESS = '0xPASTE_YOUR_ADDRESS_HERE';
```

Then restart: `npm run dev`

**Done!** 🎉 Your app now uses testnet tokens.

---

## Need Help?

See `DEPLOY_TESTNET.md` for detailed instructions.

