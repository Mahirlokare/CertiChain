# Smart Contract Reference

Contract: `CertiChain` — Solidity 0.8.24.

## Roles
- Contract owner: deployer; can enable or disable issuer addresses and revoke any certificate.
- Issuer: may issue certificates and revoke certificates it originally issued.
- Public: may read and verify certificates.

## Functions
| Function | Access | Purpose |
|---|---|---|
| `setIssuer(address,bool)` | Owner | Grant or remove issuer permission |
| `issueCertificate(bytes32,bytes32,string,string)` | Issuer | Register unique certificate ID and file hash |
| `revokeCertificate(bytes32)` | Original issuer or owner | Mark a record revoked |
| `getCertificate(bytes32)` | Public | Read full record |
| `verifyCertificate(bytes32,bytes32)` | Public | Check existence, revocation and hash equality |

## Events
- `IssuerUpdated`
- `CertificateIssued`
- `CertificateRevoked`

## Identifier conventions
- Certificate ID: `keccak256(UTF8(trimmed user ID))`.
- Document fingerprint: 32-byte SHA-256 digest of the exact file bytes.

The original file must be byte-for-byte identical for a match. Re-saving a PDF or changing metadata may change its digest.
