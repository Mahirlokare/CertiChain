# CertiChain — Blockchain Document Verification

CertiChain is a decentralized certificate issuance and verification MVP. Issuers register document fingerprints on an EVM-compatible blockchain; anyone can independently hash a supplied file and verify that its fingerprint matches an issued, non-revoked record.

> **Academic project / MVP:** This repository provides a working smart-contract and browser dApp foundation. It is not a legally accredited credential issuer or a production identity platform. Deployments, wallet funding, contract verification and end-to-end browser tests must be completed in the target environment.

## Features
- SHA-256 document fingerprinting in the browser (the document itself is never uploaded).
- Issuer-only certificate issuance and revocation.
- Unique certificate IDs and duplicate document-hash rejection.
- Public verification by certificate ID and file fingerprint.
- MetaMask wallet connection and transaction status.
- Solidity unit tests and Hardhat local deployment.
- Sepolia configuration through environment variables.

## Architecture
1. React client reads a selected file locally and computes SHA-256 using the Web Crypto API.
2. The issuer connects an EVM wallet and submits certificate metadata plus the hash.
3. The smart contract checks issuer authorization, ID uniqueness and hash uniqueness, then emits an event.
4. A verifier enters the certificate ID and optionally selects the original file. The client hashes it locally and compares it with the on-chain record.
5. Only metadata, hashes, timestamps and issuer address are stored on-chain. Do not put sensitive personal data in public transaction metadata.

## Repository layout
- `contracts/CertiChain.sol` — access-controlled registry.
- `scripts/deploy.js` — deployment script.
- `test/CertiChain.test.js` — contract tests.
- `frontend/` — React + Vite dApp.
- `docs/` — architecture, API, security and test documentation.

## Requirements
- Node.js 20+
- npm
- MetaMask or another injected EVM wallet
- Hardhat local node for local development; Sepolia ETH for public testnet deployment

## Quick start

### 1. Install
```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Configure
Copy `.env.example` to `.env`. For local development, the frontend uses the local Hardhat network (chain ID 31337). After deploying, copy the printed contract address into `frontend/.env` as `VITE_CONTRACT_ADDRESS`.

### 3. Run tests
```bash
npm test
```

### 4. Start a local chain and deploy
Terminal 1:
```bash
npm run node
```
Terminal 2:
```bash
npm run deploy:local
```

Add the Hardhat Local network to MetaMask:
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency: `ETH`

Import a **local development account** from the Hardhat node output. Never use a real wallet seed phrase in a project or share it with anyone.

### 5. Start the dApp
Create `frontend/.env`:
```env
VITE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
VITE_CHAIN_ID=31337
```
Then:
```bash
cd frontend
npm run dev
```
Open the local URL printed by Vite.

### Sepolia deployment
Set `SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY` in the root `.env`, ensure the wallet has Sepolia test ETH, then run:
```bash
npm run deploy:sepolia
```
Never commit `.env` or private keys. Only use a dedicated test wallet.

## Important limitations
- SHA-256 proves file-byte integrity, not that the document is genuine or that the issuer is institutionally authorized.
- Certificate metadata is public and permanent on a public chain. Store only data that is safe to disclose.
- The current app expects the configured chain and deployed contract address to match.
- No production audit, legal accreditation, institutional identity verification, IPFS storage or production monitoring is claimed.

## Documentation
See [System Architecture](docs/ARCHITECTURE.md), [Smart Contract](docs/SMART_CONTRACT.md), [Security](docs/SECURITY.md), [Testing](docs/TESTING.md), and [Deployment](docs/DEPLOYMENT.md).

## License
MIT — see [LICENSE](LICENSE).
