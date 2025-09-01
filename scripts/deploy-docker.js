const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting Flux Blockchain deployment on Docker...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy FluxToken
  console.log("\n📄 Deploying FluxToken...");
  const FluxToken = await hre.ethers.getContractFactory("FluxToken");
  const fluxToken = await FluxToken.deploy(
    deployer.address, // ecosystem wallet
    deployer.address, // team wallet
    deployer.address, // investor wallet
    deployer.address, // foundation wallet
    deployer.address  // mars reserve wallet
  );
  await fluxToken.waitForDeployment();
  console.log("FluxToken deployed to:", await fluxToken.getAddress());

  // Initialize token distribution
  await fluxToken.initializeDistribution();
  console.log("Token distribution initialized");

  // Deploy FluxGameAsset (NFT)
  console.log("\n🎮 Deploying FluxGameAsset...");
  const FluxGameAsset = await hre.ethers.getContractFactory("FluxGameAsset");
  const fluxNFT = await FluxGameAsset.deploy(
    "Flux Game Assets",
    "FGA",
    "https://api.fluxgame.io/metadata/"
  );
  await fluxNFT.waitForDeployment();
  console.log("FluxGameAsset deployed to:", await fluxNFT.getAddress());

  // Deploy FluxMarketplace
  console.log("\n🛒 Deploying FluxMarketplace...");
  const FluxMarketplace = await hre.ethers.getContractFactory("FluxMarketplace");
  const marketplace = await FluxMarketplace.deploy(
    250, // 2.5% platform fee
    deployer.address // fee recipient
  );
  await marketplace.waitForDeployment();
  console.log("FluxMarketplace deployed to:", await marketplace.getAddress());

  // Deploy FluxAccessHub
  console.log("\n🔐 Deploying FluxAccessHub...");
  const FluxAccessHub = await hre.ethers.getContractFactory("FluxAccessHub");
  const accessHub = await FluxAccessHub.deploy();
  await accessHub.waitForDeployment();
  console.log("FluxAccessHub deployed to:", await accessHub.getAddress());

  // Register contracts in AccessHub
  console.log("\n📝 Registering contracts in AccessHub...");
  const ContractType = {
    TOKEN: 0,
    NFT: 1,
    MARKETPLACE: 2
  };

  await accessHub.registerContract(await fluxToken.getAddress(), ContractType.TOKEN);
  await accessHub.registerContract(await fluxNFT.getAddress(), ContractType.NFT);
  await accessHub.registerContract(await marketplace.getAddress(), ContractType.MARKETPLACE);
  console.log("All contracts registered in AccessHub");

  // Save deployment addresses
  const deployments = {
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      FluxToken: await fluxToken.getAddress(),
      FluxGameAsset: await fluxNFT.getAddress(),
      FluxMarketplace: await marketplace.getAddress(),
      FluxAccessHub: await accessHub.getAddress()
    }
  };

  const fs = require("fs");
  const deploymentDir = "./deployments";
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir);
  }
  
  fs.writeFileSync(
    `${deploymentDir}/docker-deployment.json`,
    JSON.stringify(deployments, null, 2)
  );

  console.log("\n✅ Deployment complete!");
  console.log("Deployment info saved to deployments/docker-deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });