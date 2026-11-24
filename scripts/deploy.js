const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CertiChain with:", deployer.address);
  const factory = await ethers.getContractFactory("CertiChain");
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  console.log("CertiChain deployed to:", await contract.getAddress());
  console.log("Network:", (await ethers.provider.getNetwork()).name);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
