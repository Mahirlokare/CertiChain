# Security and Privacy Notes

## Implemented controls
- Owner-only issuer administration.
- Issuer-only issuance.
- Original-issuer-or-owner revocation rule; owner emergency revocation remains available even if owner issuer status is disabled.
- Zero-value and empty metadata checks, with holder/course labels capped at 120 UTF-8 bytes each.
- Unique certificate ID and document fingerprint checks.
- Browser-local file hashing; no file upload endpoint exists.
- Environment files and private-key patterns are ignored by Git.

## Risks and mitigations
- **Public metadata:** blockchain records are public and permanent. Use minimal labels and obtain appropriate consent.
- **Issuer key compromise:** a compromised issuer can issue fraudulent records. Use a dedicated institutional wallet, hardware-backed key custody and a multisignature owner for production.
- **False trust:** a valid hash only shows byte integrity against a registered record; it does not prove the document was legitimately issued.
- **RPC/provider risk:** verify the chain ID and contract address; use trusted RPC endpoints.
- **Frontend configuration:** users must confirm they are connected to the intended network and contract.

## Dependency audit snapshot
- Frontend dependency audit: 0 known vulnerabilities in the latest completed CI audit.
- Contract/development toolchain audit: 16 advisories were reported (13 low, 3 moderate), with no high-severity findings after overriding vulnerable `tmp` and `serialize-javascript` transitive packages.
- The remaining findings are in the Hardhat 2 / test-tooling dependency tree. CI blocks high-severity findings; a clean full toolchain audit requires a reviewed Hardhat 3 migration and regression testing.

## Before production
- Independent smart-contract audit and threat model.
- Institutional identity/KYC and issuer onboarding process.
- Multisig governance, key rotation and emergency procedures.
- Privacy/legal review of on-chain personal data.
- Rate limiting and abuse monitoring if an API/indexer is added.
- Contract verification and reproducible deployment records.

This project is an academic MVP and has not undergone a professional security audit.
