const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertiChain", function () {
  async function deployFixture() {
    const [owner, issuer, outsider] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("CertiChain");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    await contract.setIssuer(issuer.address, true);
    return { contract, owner, issuer, outsider };
  }

  const id = (value) => ethers.keccak256(ethers.toUtf8Bytes(value));

  it("sets the deployer as owner and initial issuer", async function () {
    const { contract, owner } = await deployFixture();
    expect(await contract.owner()).to.equal(owner.address);
    expect(await contract.isIssuer(owner.address)).to.equal(true);
  });

  it("allows an authorized issuer to register and verify a certificate", async function () {
    const { contract, issuer } = await deployFixture();
    const certId = id("CERT-001");
    const hash = id("document-bytes");
    await contract.connect(issuer).issueCertificate(certId, hash, "Asha Patil", "BSc Agriculture");
    const record = await contract.getCertificate(certId);
    expect(record.documentHash).to.equal(hash);
    expect(record.holderName).to.equal("Asha Patil");
    const [valid, revoked] = await contract.verifyCertificate(certId, hash);
    expect(valid).to.equal(true);
    expect(revoked).to.equal(false);
  });

  it("rejects issuance by a non-issuer", async function () {
    const { contract, outsider } = await deployFixture();
    await expect(contract.connect(outsider).issueCertificate(id("C"), id("H"), "Name", "Course"))
      .to.be.revertedWithCustomError(contract, "Unauthorized");
  });

  it("rejects duplicate IDs and document fingerprints", async function () {
    const { contract, issuer } = await deployFixture();
    const certId = id("CERT-001");
    const hash = id("document-bytes");
    await contract.connect(issuer).issueCertificate(certId, hash, "Asha", "Course");
    await expect(contract.connect(issuer).issueCertificate(certId, id("other"), "Asha", "Course"))
      .to.be.revertedWithCustomError(contract, "CertificateAlreadyExists");
    await expect(contract.connect(issuer).issueCertificate(id("CERT-002"), hash, "Asha", "Course"))
      .to.be.revertedWithCustomError(contract, "DocumentAlreadyRegistered");
  });

  it("rejects invalid metadata", async function () {
    const { contract, issuer } = await deployFixture();
    await expect(contract.connect(issuer).issueCertificate(id("C"), id("H"), "", "Course"))
      .to.be.revertedWithCustomError(contract, "InvalidMetadata");
  });

  it("allows original issuer to revoke and verification becomes invalid", async function () {
    const { contract, issuer } = await deployFixture();
    const certId = id("CERT-001");
    const hash = id("document-bytes");
    await contract.connect(issuer).issueCertificate(certId, hash, "Asha", "Course");
    await contract.connect(issuer).revokeCertificate(certId);
    const [valid, revoked] = await contract.verifyCertificate(certId, hash);
    expect(valid).to.equal(false);
    expect(revoked).to.equal(true);
  });

  it("does not allow an unrelated issuer to revoke another issuer's certificate", async function () {
    const { contract, issuer, outsider } = await deployFixture();
    const certId = id("CERT-001");
    await contract.connect(issuer).issueCertificate(certId, id("H"), "Asha", "Course");
    await contract.setIssuer(outsider.address, true);
    await expect(contract.connect(outsider).revokeCertificate(certId))
      .to.be.revertedWithCustomError(contract, "Unauthorized");
  });
  it("allows the owner to revoke even after owner issuer status is disabled", async function () {
    const { contract, owner, issuer } = await deployFixture();
    const certId = id("OWNER-REVOKE");
    await contract.connect(issuer).issueCertificate(certId, id("OWNER-HASH"), "Asha", "Course");
    await contract.setIssuer(owner.address, false);
    await contract.revokeCertificate(certId);
    const [valid, revoked] = await contract.verifyCertificate(certId, id("OWNER-HASH"));
    expect(valid).to.equal(false);
    expect(revoked).to.equal(true);
  });

  it("rejects metadata exceeding the documented length limit", async function () {
    const { contract, issuer } = await deployFixture();
    await expect(contract.connect(issuer).issueCertificate(
      id("LONG-METADATA"), id("LONG-HASH"), "A".repeat(121), "Course"
    )).to.be.revertedWithCustomError(contract, "InvalidMetadata");
  });

});
