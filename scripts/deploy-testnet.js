import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base Sepolia testnet configuration
const RPC_URL = "https://sepolia.base.org";
const CHAIN_ID = 84532;

async function deploy() {
  console.log("🚀 Deploying AuctionEscrow to Base Sepolia Testnet...\n");

  // Check for private key
  if (!process.env.PRIVATE_KEY) {
    console.error("❌ Error: PRIVATE_KEY not found in environment variables");
    console.log("\nPlease create a .env file with:");
    console.log("PRIVATE_KEY=your_private_key_here");
    console.log("\nGet your private key from MetaMask:");
    console.log("1. Open MetaMask");
    console.log("2. Click account menu (three dots)");
    console.log("3. Account Details > Export Private Key");
    console.log("4. Copy the key (remove 0x prefix if present)");
    process.exit(1);
  }

  // Read contract source
  const contractPath = path.join(__dirname, "../contracts/AuctionEscrow.sol");
  if (!fs.existsSync(contractPath)) {
    console.error("❌ Contract file not found:", contractPath);
    process.exit(1);
  }

  // Connect to Base Sepolia
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  console.log("📡 Connected to Base Sepolia");
  console.log("👤 Deployer address:", wallet.address);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  const balanceEth = ethers.formatEther(balance);
  console.log("💰 Balance:", balanceEth, "ETH");

  if (parseFloat(balanceEth) < 0.001) {
    console.error("\n❌ Insufficient balance for deployment!");
    console.log("Get testnet ETH from:");
    console.log("https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
    process.exit(1);
  }

  // Compile contract using solc (we'll need to install it or use a different approach)
  // For now, let's use a simpler approach - deploy via bytecode
  // Actually, let's use Hardhat's compilation but in a different way
  
  console.log("\n📦 Compiling contract...");
  console.log("(This requires Hardhat to be installed)");
  
  // Use child process to run hardhat compile
  const { execSync } = await import("child_process");
  
  try {
    execSync("npx hardhat compile", { 
      cwd: path.join(__dirname, ".."),
      stdio: "inherit" 
    });
  } catch (error) {
    console.error("❌ Compilation failed. Trying alternative method...");
    // We'll need the ABI and bytecode - let me create a workaround
    throw error;
  }

  // Read compiled contract
  const artifactsPath = path.join(__dirname, "../artifacts/contracts/AuctionEscrow.sol/AuctionEscrow.json");
  
  if (!fs.existsSync(artifactsPath)) {
    console.error("❌ Compiled contract not found. Please run: npx hardhat compile");
    process.exit(1);
  }

  const contractArtifact = JSON.parse(fs.readFileSync(artifactsPath, "utf8"));
  const contractFactory = new ethers.ContractFactory(
    contractArtifact.abi,
    contractArtifact.bytecode,
    wallet
  );

  console.log("\n🚀 Deploying contract...");
  const contract = await contractFactory.deploy();
  
  console.log("⏳ Waiting for deployment transaction...");
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("\n✅ Contract deployed successfully!");
  console.log("📍 Contract address:", address);
  console.log("🔗 View on BaseScan:", `https://sepolia.basescan.org/address/${address}`);

  // Update .env file
  const envPath = path.join(__dirname, "../.env");
  let envContent = "";
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // Update or add VITE_CONTRACT_ADDRESS
  if (envContent.includes("VITE_CONTRACT_ADDRESS")) {
    envContent = envContent.replace(
      /VITE_CONTRACT_ADDRESS=.*/,
      `VITE_CONTRACT_ADDRESS=${address}`
    );
  } else {
    envContent += `\nVITE_CONTRACT_ADDRESS=${address}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log("\n✅ Updated .env file with contract address");

  // Also update contract.js as backup
  const contractJsPath = path.join(__dirname, "../src/utils/contract.js");
  let contractJsContent = fs.readFileSync(contractJsPath, "utf8");
  contractJsContent = contractJsContent.replace(
    /export const CONTRACT_ADDRESS = .*;/,
    `export const CONTRACT_ADDRESS = '${address}';`
  );
  fs.writeFileSync(contractJsPath, contractJsContent);
  console.log("✅ Updated src/utils/contract.js with contract address");

  console.log("\n📋 Next steps:");
  console.log("1. Restart your dev server: npm run dev");
  console.log("2. Test creating an auction");
  console.log("3. Test placing bids");
  console.log("\n🎉 Your contract is live on Base Sepolia testnet!");
}

deploy().catch((error) => {
  console.error("\n❌ Deployment failed:", error.message);
  if (error.transaction) {
    console.error("Transaction hash:", error.transaction.hash);
  }
  process.exit(1);
});

