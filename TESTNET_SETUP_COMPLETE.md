# ⚠️ IMPORTANT: Contracts Must Be Deployed First

## The Issue

The bid button won't work until you deploy the contracts to Base Sepolia testnet. The contract address is currently `0x0000...` which means it's not deployed yet.

## Quick Fix (5 minutes)

### Step 1: Deploy TestUSDC Token

1. Go to [Remix IDE](https://remix.ethereum.org)
2. Create `TestUSDC.sol`
3. Copy code from `contracts/TestUSDC.sol`
4. Compile (0.8.20)
5. Deploy to Base Sepolia
6. **Copy the address** → Save it!

### Step 2: Deploy AuctionEscrow

1. Still in Remix
2. Create `AuctionEscrow.sol`
3. Copy code from `contracts/AuctionEscrow.sol`
4. Compile (0.8.20)
5. **Important**: When deploying, enter your TestUSDC address in the constructor field
6. Deploy to Base Sepolia
7. **Copy the address** → Save it!

### Step 3: Update Your App

Edit `src/utils/contract.js`:

```javascript
export const CONTRACT_ADDRESS = '0xPASTE_AUCTION_ESCROW_ADDRESS';
export const USDC_ADDRESS_TESTNET = '0xPASTE_TEST_USDC_ADDRESS';
```

### Step 4: Mint Test USDC

In Remix, use the `mint` function on your TestUSDC contract to mint tokens to your wallet.

## After Deployment

Once you update the addresses, the bid button will work! It will:
1. Create the auction on-chain (first bid only)
2. Request wallet approval for USDC spending
3. Send USDC to escrow
4. Record the bid

## Why Testnet?

- ✅ No real money needed
- ✅ Free testnet ETH from faucet
- ✅ Free test USDC (mint as much as you want)
- ✅ Safe to test everything

See `DEPLOY_TO_TESTNET.md` for detailed instructions!

