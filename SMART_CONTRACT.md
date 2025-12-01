# Smart Contract Escrow System

## Overview

The auction app now uses a smart contract escrow system that:
- ✅ Holds funds in escrow until auction ends
- ✅ Automatically refunds outbid users
- ✅ Transfers funds to seller when auction closes
- ✅ Supports auto-accept price functionality
- ✅ Allows users to withdraw refunds

## Contract Features

### `AuctionEscrow.sol`

Located in `contracts/AuctionEscrow.sol`, this contract provides:

1. **Auction Creation**: Sellers create auctions with end time and optional auto-accept price
2. **Bidding**: Bidders place bids that are held in escrow
3. **Automatic Refunds**: When a higher bid is placed, the previous highest bidder's funds are marked for refund
4. **Auction Closing**: Auctions close when:
   - Time limit is reached
   - Auto-accept price is met
5. **Fund Distribution**: 
   - Winner's bid goes to seller
   - All other bidders can withdraw refunds
6. **Refund Withdrawal**: Users can withdraw their refunded bids at any time

## Deployment

See `DEPLOY_CONTRACT.md` for detailed deployment instructions.

### Quick Start

1. Deploy the contract to Base network (mainnet or testnet)
2. Copy the deployed contract address
3. Set environment variable:
   ```bash
   VITE_CONTRACT_ADDRESS=0xYourContractAddress
   ```
4. Or update `src/utils/contract.js`:
   ```javascript
   export const CONTRACT_ADDRESS = '0xYourContractAddress';
   ```

## Frontend Integration

The frontend automatically:
- Creates auctions on-chain when users create them
- Uses contract for all bidding (no direct transfers)
- Closes auctions on-chain when time expires or price is met
- Shows pending refunds in the header
- Allows users to withdraw refunds with one click

## Security Features

- Funds are held in contract escrow (not sent directly)
- Only contract owner can emergency withdraw (for safety)
- All refunds are tracked and withdrawable
- Seller receives funds only after auction closes
- Prevents bidding below current highest bid

## Contract Address

**Important**: You must deploy the contract and set the address before the app will work properly. Without a deployed contract, auction creation and bidding will fail.

## Testing

1. Deploy to Base Sepolia testnet first
2. Test auction creation
3. Test bidding (should see refunds for outbid users)
4. Test auction closing
5. Test refund withdrawal
6. Deploy to Base mainnet when ready

