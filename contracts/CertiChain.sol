// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CertiChain
/// @notice On-chain registry for document fingerprints and certificate metadata.
/// @dev The document itself is never stored on-chain. Only its SHA-256 digest is.
contract CertiChain {
    struct Certificate {
        bytes32 certificateId;
        bytes32 documentHash;
        string holderName;
        string courseName;
        address issuer;
        uint64 issuedAt;
        bool revoked;
    }

    address public owner;
    mapping(address => bool) public isIssuer;
    mapping(bytes32 => Certificate) private certificates;
    mapping(bytes32 => bool) public documentHashUsed;

    event IssuerUpdated(address indexed issuer, bool enabled);
    event CertificateIssued(
        bytes32 indexed certificateId,
        bytes32 indexed documentHash,
        address indexed issuer,
        string holderName,
        string courseName,
        uint64 issuedAt
    );
    event CertificateRevoked(bytes32 indexed certificateId, address indexed issuer, uint64 revokedAt);

    error Unauthorized();
    error InvalidAddress();
    error InvalidCertificateId();
    error InvalidDocumentHash();
    error InvalidMetadata();
    error CertificateAlreadyExists();
    error DocumentAlreadyRegistered();
    error CertificateNotFound();
    error AlreadyRevoked();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyIssuer() {
        if (!isIssuer[msg.sender]) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
        isIssuer[msg.sender] = true;
        emit IssuerUpdated(msg.sender, true);
    }

    function setIssuer(address issuer, bool enabled) external onlyOwner {
        if (issuer == address(0)) revert InvalidAddress();
        isIssuer[issuer] = enabled;
        emit IssuerUpdated(issuer, enabled);
    }

    function issueCertificate(
        bytes32 certificateId,
        bytes32 documentHash,
        string calldata holderName,
        string calldata courseName
    ) external onlyIssuer {
        if (certificateId == bytes32(0)) revert InvalidCertificateId();
        if (documentHash == bytes32(0)) revert InvalidDocumentHash();
        if (bytes(holderName).length == 0 || bytes(courseName).length == 0) revert InvalidMetadata();
        if (certificates[certificateId].issuedAt != 0) revert CertificateAlreadyExists();
        if (documentHashUsed[documentHash]) revert DocumentAlreadyRegistered();

        uint64 timestamp = uint64(block.timestamp);
        certificates[certificateId] = Certificate({
            certificateId: certificateId,
            documentHash: documentHash,
            holderName: holderName,
            courseName: courseName,
            issuer: msg.sender,
            issuedAt: timestamp,
            revoked: false
        });
        documentHashUsed[documentHash] = true;

        emit CertificateIssued(certificateId, documentHash, msg.sender, holderName, courseName, timestamp);
    }

    function revokeCertificate(bytes32 certificateId) external onlyIssuer {
        Certificate storage certificate = certificates[certificateId];
        if (certificate.issuedAt == 0) revert CertificateNotFound();
        if (certificate.revoked) revert AlreadyRevoked();
        // Only the original issuer or contract owner may revoke a record.
        if (msg.sender != certificate.issuer && msg.sender != owner) revert Unauthorized();
        certificate.revoked = true;
        emit CertificateRevoked(certificateId, msg.sender, uint64(block.timestamp));
    }

    function getCertificate(bytes32 certificateId) external view returns (Certificate memory) {
        Certificate memory certificate = certificates[certificateId];
        if (certificate.issuedAt == 0) revert CertificateNotFound();
        return certificate;
    }

    function verifyCertificate(bytes32 certificateId, bytes32 documentHash)
        external view returns (bool valid, bool revoked, Certificate memory certificate)
    {
        certificate = certificates[certificateId];
        if (certificate.issuedAt == 0) return (false, false, certificate);
        revoked = certificate.revoked;
        valid = !revoked && certificate.documentHash == documentHash;
    }
}
