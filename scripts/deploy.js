const fs = require("node:fs");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  console.log("Deploying CertiChain with:", deployer.address);
  const factory = await ethers.getContractFactory("CertiChain");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const chainId = network.chainId.toString();
  const details = [
    "# CertiChain deployment",
    "",
    "- Contract: `" + address + "`",
    "- Network: `" + network.name + "`",
    "- Chain ID: `" + chainId + "`",
    "- Deployer: `" + deployer.address + "`",
    "- Explorer: https://sepolia.etherscan.io/address/" + address,
    "",
    "Set the contract address and matching network/RPC values in the Render static-site environment, then redeploy the frontend."
  ].join("\n");

  console.log("CertiChain deployed to:", address);
  console.log("Network:", network.name);
  console.log("Chain ID:", chainId);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, "contract_address=" + address + "\nchain_id=" + chainId + "\n");
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, details + "\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});