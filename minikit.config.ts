// Base Mini App Configuration
// Update ROOT_URL with your deployed domain
const ROOT_URL =
  process.env.VITE_ROOT_URL || 'https://vibecode1-xi.vercel.app';

export const minikitConfig = {
  accountAssociation: {
    "header": "eyJmaWQiOjEwNDk3NTMsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhGYWEzMzczYUNCNkZBYzA4Q0VkNkQ0OTU0MzdkMjlGNjY3NTAyOTk5In0",
    "payload": "eyJkb21haW4iOiJ2aWJlY29kZTEteGkudmVyY2VsLmFwcCJ9",
    "signature": "otVc1Tfm2yWIvPLJ/LWiE4YhIj0391jRvznblz6IubpfjFk5R2+5mFvVuUGZ/qyZSWfCek9tBOMcCU/E4JlS2Bw="
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

