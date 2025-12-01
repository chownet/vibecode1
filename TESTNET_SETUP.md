# Testnet Setup Guide

## Important: Base Sepolia Testnet Configuration

This app is configured to use **Base Sepolia testnet** to avoid spending real money on gas fees.

### Network Requirements

- **Network**: Base Sepolia
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Block Explorer**: https://sepolia.basescan.org

### Automatic Network Detection

The app will automatically:
1. Detect if you're on the wrong network
2. Prompt you to switch to Base Sepolia
3. Add Base Sepolia to your wallet if it's not already added

### Test USDC Token

For Base Sepolia, you need a test USDC token. You have two options:

#### Option 1: Deploy Your Own Test Token

Deploy a simple ERC20 token on Base Sepolia for testing:

1. Use Remix IDE to deploy a standard ERC20 token
2. Update `VITE_USDC_ADDRESS_TESTNET` in your `.env` file with the deployed address
3. Or update `src/utils/contract.js` directly

#### Option 2: Use Existing Test Token

If there's a test USDC token on Base Sepolia, update the address in:
- `.env` file: `VITE_USDC_ADDRESS_TESTNET=0xYourTestTokenAddress`
- Or `src/utils/contract.js`: `USDC_ADDRESS_TESTNET`

### Getting Testnet ETH

1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Connect your wallet
3. Make sure you're on Base Sepolia network
4. Request testnet ETH (for gas fees)

### Getting Test USDC

After deploying your test token:
1. Mint some test tokens to your wallet
2. Or use a faucet if available for the test token

### Environment Variables

Create a `.env` file:

```bash
# Contract address (deploy to Base Sepolia first)
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress

# Test USDC token address (deploy your own test token)
VITE_USDC_ADDRESS_TESTNET=0xYourTestTokenAddress
```

### Verifying You're on Testnet

The app will show a warning if you're on the wrong network. Make sure:
- Your wallet shows "Base Sepolia" network
- Chain ID is 84532
- You're using testnet ETH (free from faucet)

### Troubleshooting

**"Insufficient funds" error:**
- Get testnet ETH from the faucet
- Make sure you're on Base Sepolia, not mainnet

**"Wrong network" error:**
- The app will prompt you to switch
- Click "OK" to automatically switch to Base Sepolia

**"USDC token not found" error:**
- Deploy a test ERC20 token on Base Sepolia
- Update the `VITE_USDC_ADDRESS_TESTNET` in your `.env` file

