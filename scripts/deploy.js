const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║       ARC Milestone Vault — Deployment          ║");
  console.log("╚══════════════════════════════════════════════════╝");
  console.log(`  Deployer : ${deployer.address}`);
  console.log(`  Network  : ${hre.network.name}`);
  console.log(`  Balance  : ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ARC\n`);

  // ── 1. Deploy MockUSDC ────────────────────────────────────────────────────
  console.log("▸ Deploying MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log(`  ✔ MockUSDC deployed at: ${usdcAddress}\n`);

  // ── 2. Deploy VaultFactory ────────────────────────────────────────────────
  console.log("▸ Deploying VaultFactory...");
  const VaultFactory = await hre.ethers.getContractFactory("VaultFactory");
  const factory = await VaultFactory.deploy(usdcAddress);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log(`  ✔ VaultFactory deployed at: ${factoryAddress}\n`);

  // ── 3. Save deployed addresses ────────────────────────────────────────────
  const addresses = {
    MockUSDC: usdcAddress,
    VaultFactory: factoryAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 1114,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "..", "src", "abi");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(
    path.join(outputDir, "deployed-addresses.json"),
    JSON.stringify(addresses, null, 2)
  );

  // ── 4. Copy ABIs ─────────────────────────────────────────────────────────
  const artifactDir = path.join(__dirname, "..", "artifacts", "contracts");

  const copyABI = (contractName) => {
    const artifactPath = path.join(artifactDir, `${contractName}.sol`, `${contractName}.json`);
    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      fs.writeFileSync(
        path.join(outputDir, `${contractName}.json`),
        JSON.stringify(artifact.abi, null, 2)
      );
      console.log(`  ✔ ABI copied: ${contractName}.json`);
    }
  };

  copyABI("MockUSDC");
  copyABI("VaultFactory");
  copyABI("MilestoneVault");

  console.log(`\n  ✔ Addresses & ABIs saved to src/abi/\n`);
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║         Deployment Complete! 🚀                  ║");
  console.log("╚══════════════════════════════════════════════════╝");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
