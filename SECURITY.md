# Security - Wallet Integration

## ✅ Secure Wallet Connection

This app **NEVER** asks for or stores private keys. It uses secure wallet integration:

### How It Works

1. **Farcaster SDK Wallet Provider**
   - Uses `sdk.wallet.getEthereumProvider()` to get the wallet provider
   - This connects to MetaMask or the Farcaster wallet through the SDK
   - No private keys are ever exposed

2. **Standard MetaMask Connection**
   - Uses `eth_requestAccounts` to request wallet connection
   - This is the standard, secure way to connect wallets
   - User approves connection in their wallet - no key sharing

3. **Transaction Signing**
   - All transactions are signed by the user's wallet
   - Private keys stay in the wallet (MetaMask/Farcaster wallet)
   - The app never sees or touches private keys

### Code Locations

**Secure wallet connection:**
- `src/App.jsx` - Uses `sdk.wallet.getEthereumProvider()` and `eth_requestAccounts`
- `src/components/AuctionCard.jsx` - Uses wallet provider for transactions
- `src/utils/contract.js` - Uses ethers with wallet provider (no private keys)

### What We Removed

- ❌ All deployment scripts that asked for private keys
- ❌ Any code that would request private key export
- ❌ Hardhat configs that required private keys for deployment

### Deployment

Contract deployment is done via **Remix IDE** which uses MetaMask's injected provider - no private keys needed.

## 🔒 Your Private Keys Are Safe

- Private keys never leave your wallet
- All transactions require your approval
- No key export or sharing is ever requested
- Standard Web3 wallet integration only

