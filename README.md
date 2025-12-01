# Farcaster Auction Mini App

A decentralized auction platform built as a Farcaster mini app on Base. Users can create auctions, set time limits or auto-accept prices, and bid on items.

## Features

- 🏛️ **Create Auctions**: List items for auction with descriptions and images
- ⏰ **Time-Based Auctions**: Set a duration for your auction
- 🎯 **Auto-Accept Price**: Optionally set a price that automatically closes the auction when reached
- 💰 **Bidding System**: Place bids on active auctions
- 📱 **Farcaster Integration**: Built for the Base app ecosystem
- 🎨 **Modern UI**: Beautiful, responsive design

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your Mini App

1. Update `minikit.config.ts` with your domain:
   - Replace `ROOT_URL` with your deployed domain (e.g., `https://your-app.vercel.app`)

2. Update `public/.well-known/farcaster.json`:
   - Replace all `https://yourdomain.com` URLs with your actual domain
   - Update metadata (name, description, tags, etc.)

### 3. Deploy to Vercel

1. Push your code to GitHub
2. Import the repository to Vercel
3. Deploy to get your public URL

### 4. Associate Your Account

1. Ensure your app is deployed and accessible
2. Go to [Base Build Account Association Tool](https://base.org/build/account-association)
3. Enter your app URL and follow the verification steps
4. Copy the `accountAssociation` object
5. Paste it into `minikit.config.ts`

### 5. Update Images

Add the following images to your `public` folder:
- `icon.png` - App icon (recommended: 512x512px)
- `splash.png` - Splash screen image
- `hero.png` - Hero image
- `og-image.png` - Open Graph image
- `screenshot-portrait.png` - Portrait screenshot

### 6. Preview Your App

1. Go to [base.dev/preview](https://base.dev/preview)
2. Enter your app URL to test
3. Verify embeds, account association, and metadata

### 7. Publish

Post your app URL in the Base app to publish it!

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How It Works

### Creating an Auction

1. Click "Create Auction"
2. Fill in the auction details:
   - Title and description
   - Optional image URL
   - Starting price
   - Duration (15 minutes to 24 hours)
   - Optional auto-accept price
3. Click "Create Auction"

### Auto-Close Conditions

Auctions automatically close when:
- **Time Limit Reached**: The duration expires
- **Price Reached**: A bid meets or exceeds the auto-accept price (if set)

### Bidding

1. Browse active auctions
2. Click "Place Bid"
3. Enter your bid amount (must be higher than current highest bid)
4. Submit your bid

If your bid meets the auto-accept price, the auction closes immediately!

## Project Structure

```
├── public/
│   └── .well-known/
│       └── farcaster.json      # Mini app manifest
├── src/
│   ├── components/
│   │   ├── AuctionCard.jsx      # Individual auction display
│   │   ├── AuctionList.jsx      # List of auctions
│   │   ├── CountdownTimer.jsx   # Timer component
│   │   └── CreateAuction.jsx    # Auction creation form
│   ├── App.jsx                  # Main app component
│   ├── App.css                  # Styles
│   ├── index.css                # Global styles
│   └── main.jsx                 # Entry point
├── minikit.config.ts            # Base mini app configuration
└── package.json
```

## Technologies

- React 18
- Vite
- Farcaster Mini App SDK
- Base MiniKit

## Notes

- Auctions are stored in localStorage (client-side only)
- For production, consider using a backend/database
- The app follows Base mini app guidelines and best practices

## Resources

- [Base Mini Apps Documentation](https://docs.base.org/mini-apps/quickstart/create-new-miniapp)
- [Farcaster Documentation](https://docs.farcaster.xyz/)
- [Base Build](https://base.org/build)

## License

MIT

