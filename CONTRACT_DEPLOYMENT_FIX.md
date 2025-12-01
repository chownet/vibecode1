# Important: Contract Deployment Fix

## Issue

The contract constructor requires a USDC token address parameter, but the deployment might not be passing it.

## Solution

When deploying the contract via Remix, you need to pass the USDC address in the constructor:

### For Base Sepolia Testnet:

1. Deploy a test ERC20 token first (or use an existing test token)
2. When deploying `AuctionEscrow`, in Remix:
   - In the "Deploy" section, you'll see a field for constructor arguments
   - Enter your test USDC token address
   - Example: `0xYourTestUSDCTokenAddress`
   - Then click "Deploy"

### Contract Constructor:

```solidity
constructor(address _usdcToken)
```

So when deploying, you need to provide the USDC token address as the first (and only) parameter.

## Quick Fix: Deploy Test Token First

1. Go to Remix IDE
2. Create a simple ERC20 token contract
3. Deploy it to Base Sepolia
4. Copy the deployed token address
5. Deploy AuctionEscrow with that address as constructor parameter
6. Update `VITE_CONTRACT_ADDRESS` in your `.env` file

## Alternative: Update Contract to Not Require Constructor

If you want to deploy without a constructor parameter, we can update the contract to use a default or set the USDC address differently.

