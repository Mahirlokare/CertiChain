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
9. Switch to the wrong chain; confirm writes are blocked by the contract chain configuration check.

## Status
Test cases are included in the repository. They have **not been executed in this upload session**. Run the commands above in a Node.js environment before presenting a test-pass claim.
