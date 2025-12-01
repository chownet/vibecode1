// Base Mini App Configuration
// Update ROOT_URL with your deployed domain
const ROOT_URL =
  process.env.VITE_ROOT_URL || 'https://auctionhauz.vercel.app';

export const minikitConfig = {
  accountAssociation: {
    "header": "eyJmaWQiOjEwNDk3NTMsInR5cGUiOiJhdXRoIiwia2V5IjoiMHgwNzFhNTU4OEQ3Q2Q1MGZDQzQ4MDFlRTE0RDM3RDZjQUQ1MEQxN0M5In0",
    "payload": "eyJkb21haW4iOiJhdWN0aW9uaGF1ei52ZXJjZWwuYXBwIn0",
    "signature": "1noB/H0lirS0igLIQqEoHBQ0u+NuS2YB04yJQe3oI4JURGeodVhGfeek8+Wcvjj82KyczgADP/ZrVJ0Zqg18oRw="
  },
  miniapp: {
    version: "1",
    name: "Farcaster Auction",
    subtitle: "Create and bid on auctions",
    description: "A decentralized auction platform where users can create auctions, set time limits or auto-accept prices, and bid on items.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#667eea",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["auction", "marketplace", "trading", "nft"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Auction anything, bid anywhere",
    ogTitle: "Farcaster Auction - Decentralized Auctions",
    ogDescription: "Create and participate in auctions on Farcaster",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
  },
} as const;

