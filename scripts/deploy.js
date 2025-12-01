import hre from "hardhat";

async function main() {
  console.log("Deploying AuctionEscrow contract...");
  
  // Get the contract factory
  const AuctionEscrow = await hre.ethers.getContractFactory("AuctionEscrow");
  
  // Deploy the contract
  console.log("Deploying...");
  const auctionEscrow = await AuctionEscrow.deploy();
  
  // Wait for deployment
  await auctionEscrow.waitForDeployment();
  
  const address = await auctionEscrow.getAddress();
  console.log("\n✅ AuctionEscrow deployed to:", address);
  console.log("\nNetwork:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  
  // Verify on BaseScan if API key is provided
  if (hre.network.name !== "hardhat" && process.env.BASESCAN_API_KEY) {
    console.log("\nWaiting for block confirmations...");
    await auctionEscrow.deploymentTransaction().wait(5);
    
    console.log("Verifying contract on BaseScan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on BaseScan!");
    } catch (error) {
      console.log("⚠️  Verification failed (this is okay if contract is already verified):", error.message);
    }
  }
  
  console.log("\n📋 Next steps:");
  console.log("1. Update your .env file with:");
  console.log(`   VITE_CONTRACT_ADDRESS=${address}`);
  console.log("\n2. Or update src/utils/contract.js with:");
  console.log(`   export const CONTRACT_ADDRESS = '${address}';`);
  console.log("\n3. Restart your development server");
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
