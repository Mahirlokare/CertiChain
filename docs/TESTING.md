# Testing Plan

## Automated smart-contract tests
Run `npm test`. The suite covers:
- Deployer owner and initial issuer setup.
- Successful issuance and public verification.
- Unauthorized issuance rejection.
- Duplicate certificate ID rejection.
- Duplicate document hash rejection.
- Empty metadata rejection.
- Revocation invalidates verification.
- An unrelated issuer cannot revoke another issuer's certificate.

## Manual dApp checks
1. Deploy locally and configure frontend contract address and chain ID.
2. Connect the deployer wallet; confirm issuer access.
3. Issue a certificate using a small test file.
4. Verify using the same file; expect a matching fingerprint.
5. Verify using a different file; expect a mismatch.
6. Verify without a file; confirm UI explicitly says file integrity was not checked.
7. Revoke as the original issuer; verify again and confirm revoked state.
8. Connect a non-issuer wallet; confirm issue/revoke controls are unavailable and contract rejects unauthorized calls.
9. Disable the owner's issuer flag and confirm the owner can still revoke as the emergency authority.
10. Submit holder/course labels longer than 120 UTF-8 bytes; confirm the contract rejects them.
11. Switch to the wrong chain; confirm writes are blocked and reads use the configured public RPC only when needed.
12. Test on Sepolia with a real MetaMask browser session, including account/network changes and both matching and mismatching files.

## Automated CI status
The latest completed CI run before the latest documentation-only commit reported:
- Solidity compilation successful.
- 9 smart-contract tests passing.
- Vite production build successful.
- Production-preview HTTP smoke test successful (HTTP 200, HTML title and built JS/CSS assets served).
- Frontend production dependency audit: 0 vulnerabilities.

## Not yet verified
- Real MetaMask browser interaction and account/network switching.
- Sepolia deployment and on-chain transactions.
- Hosted URL uptime, TLS, headers, browser console and runtime error monitoring.
- Independent smart-contract audit.

