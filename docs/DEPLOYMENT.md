# Deployment Guide

## Local development
1. Install Node.js 20+.
2. Run `npm install` in the repository root and `npm install` inside `frontend/`.
3. Run `npm test` and `npm run compile`.
4. Start a local node with `npm run node`.
5. In a second terminal, run `npm run deploy:local` and copy the deployed address.
6. Add MetaMask network: RPC `http://127.0.0.1:8545`, chain ID `31337`, currency `ETH`.
7. Import a disposable local Hardhat account into MetaMask. Never use a real wallet seed phrase.
8. Create `frontend/.env` with `VITE_CONTRACT_ADDRESS=0x...` and `VITE_CHAIN_ID=31337`.
9. Run `cd frontend && npm run dev`.

## Sepolia testnet
1. Create a dedicated test wallet and fund it with Sepolia test ETH.
2. Copy root `.env.example` to `.env`; set `SEPOLIA_RPC_URL` and `DEPLOYER_PRIVATE_KEY`.
3. Run `npm run deploy:sepolia`; record the printed contract address.
4. Set frontend environment values to that address and `VITE_CHAIN_ID=11155111`.
5. Run `cd frontend && npm run build`; host `frontend/dist` on a static hosting service.

Never commit `.env`, private keys, recovery phrases or real user credentials. Use a dedicated deployment wallet and rotate any key that may have been exposed. Verify the deployed contract source on the block explorer and test with both issuer and non-issuer wallets before a public demo.
