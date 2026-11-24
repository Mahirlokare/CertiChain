import { ethers } from "ethers";

// Keep this ABI synchronized with contracts/CertiChain.sol.
export const ABI = [
  "function owner() view returns (address)",
  "function isIssuer(address) view returns (bool)",
  "function setIssuer(address issuer, bool enabled)",
  "function issueCertificate(bytes32 certificateId, bytes32 documentHash, string holderName, string courseName)",
  "function revokeCertificate(bytes32 certificateId)",
  "function getCertificate(bytes32 certificateId) view returns (tuple(bytes32 certificateId,bytes32 documentHash,string holderName,string courseName,address issuer,uint64 issuedAt,bool revoked))",
  "function verifyCertificate(bytes32 certificateId, bytes32 documentHash) view returns (bool valid,bool revoked,tuple(bytes32 certificateId,bytes32 documentHash,string holderName,string courseName,address issuer,uint64 issuedAt,bool revoked) certificate)"
];

export function getReadProvider() {
  const chainId = Number(import.meta.env.VITE_CHAIN_ID || 31337);
  const rpcUrl = import.meta.env.VITE_RPC_URL || (chainId === 31337 ? "http://127.0.0.1:8545" : "");
  if (!rpcUrl) throw new Error("Set VITE_RPC_URL for public-network read access.");
  return new ethers.JsonRpcProvider(rpcUrl, chainId);
}

export function getContract(signerOrProvider) {
  const address = import.meta.env.VITE_CONTRACT_ADDRESS;
  if (!address || !ethers.isAddress(address)) throw new Error("Set a valid VITE_CONTRACT_ADDRESS in frontend/.env.");
  return new ethers.Contract(address, ABI, signerOrProvider);
}

export async function hashFile(file) {
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return "0x" + Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function certificateIdFromText(value) {
  return ethers.keccak256(ethers.toUtf8Bytes(value.trim()));
}
