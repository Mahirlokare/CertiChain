# System Architecture

## Context
CertiChain is a browser-based decentralized application. The browser talks directly to an EVM smart contract through an injected wallet for writes and an RPC provider for reads.

## Components
- **React/Vite frontend:** form validation, wallet connection, file selection, local SHA-256 calculation, contract calls and result rendering.
- **Injected wallet:** signs issuer transactions; users approve each transaction.
- **CertiChain contract:** enforces issuer roles, unique IDs, unique document fingerprints and revocation rules.
- **EVM network:** stores state and emits immutable event history.

## Data flow
### Issuance
1. Issuer selects a document and enters certificate ID, holder and course.
2. Browser reads file bytes and calculates SHA-256 using Web Crypto.
3. Certificate ID is deterministically converted to bytes32 using keccak256 of its trimmed UTF-8 text.
4. Wallet signs `issueCertificate`.
5. Contract validates issuer role and uniqueness, stores metadata and emits `CertificateIssued`.

### Verification
1. Verifier enters the original certificate ID.
2. Frontend derives the same bytes32 ID and reads the record.
3. If a file is selected, browser computes SHA-256 locally and calls `verifyCertificate`.
4. The contract reports match and revocation status.

### Revocation
The original issuer or contract owner submits `revokeCertificate`. The record remains readable but becomes invalid for verification.

## Trust boundaries
- Browser and selected file are untrusted input.
- Wallet signing is controlled by the wallet provider and user approval.
- Contract authorization is the enforcement boundary for writes.
- Public chain state is visible to all network participants.

## Storage model
The contract stores certificate ID, SHA-256 digest, holder label, course label, issuer address, issue timestamp and revoked flag. No file bytes are stored. Metadata is public; do not use confidential personal data.
