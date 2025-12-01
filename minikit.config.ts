// Base Mini App Configuration
// Update ROOT_URL with your deployed domain
const ROOT_URL =
  process.env.VITE_ROOT_URL ||
  'https://vibecode1-641fgi4kc-sarahs-projects-79aa0250.vercel.app';

export const minikitConfig = {
  accountAssociation: {
    // This will be generated when you associate your account
    // See: https://docs.base.org/mini-apps/quickstart/create-new-miniapp#step-4
    "header": "",
    "payload": "",
    "signature": ""
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

