import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { certificateIdFromText, getContract, getReadProvider, hashFile } from "./contract";

const targetChain = Number(import.meta.env.VITE_CHAIN_ID || 31337);
const short = (value) => value ? value.slice(0, 6) + "…" + value.slice(-4) : "";
const date = (seconds) => seconds ? new Date(Number(seconds) * 1000).toLocaleString() : "—";

export default function App() {
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [issuer, setIssuer] = useState(false);
  const [holder, setHolder] = useState("");
  const [course, setCourse] = useState("");
  const [newId, setNewId] = useState("");
  const [issueFile, setIssueFile] = useState(null);
  const [lookupId, setLookupId] = useState("");
  const [verifyFile, setVerifyFile] = useState(null);
  const [record, setRecord] = useState(null);
  const [verification, setVerification] = useState(null);
  const [revokeId, setRevokeId] = useState("");

  const connected = Boolean(account && provider);
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const canConfigure = useMemo(() => Boolean(contractAddress && ethers.isAddress(contractAddress)), [contractAddress]);

  async function connectWallet() {
    try {
      if (!window.ethereum) throw new Error("MetaMask was not detected. Install the browser wallet first.");
      const p = new ethers.BrowserProvider(window.ethereum);
      await p.send("eth_requestAccounts", []);
      const signer = await p.getSigner();
      const address = await signer.getAddress();
      const network = await p.getNetwork();
      setProvider(p);
      setAccount(address);
      if (Number(network.chainId) !== targetChain) {
        setIssuer(false);
        setNotice(`Wallet connected on chain ${network.chainId}. Switch to configured chain ID ${targetChain}.`);
        return;
      }
      const c = getContract(signer);
      setIssuer(await c.isIssuer(address));
      setNotice("Wallet connected successfully.");
    } catch (error) { setNotice(error.shortMessage || error.message); }
  }

  async function refreshRole() {
    if (!provider || !account) return;
    try {
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== targetChain) throw new Error(`Switch wallet to chain ID ${targetChain}.`);
      setIssuer(await getContract(await provider.getSigner()).isIssuer(account));
    } catch (error) { setNotice(error.message); }
  }

  async function issueCertificate(event) {
    event.preventDefault();
    if (!connected || !issuer) return setNotice("Connect an authorized issuer wallet.");
    if (!issueFile || !holder.trim() || !course.trim() || !newId.trim()) return setNotice("Complete every field and select the certificate file.");
    setBusy(true); setNotice("Hashing file locally…");
    try {
      const digest = await hashFile(issueFile);
      const id = certificateIdFromText(newId);
      const c = getContract(await provider.getSigner());
      const tx = await c.issueCertificate(id, digest, holder.trim(), course.trim());
      setNotice("Transaction submitted. Waiting for confirmation…");
      await tx.wait();
      setNotice("Certificate issued successfully. Transaction: " + tx.hash);
      setHolder(""); setCourse(""); setNewId(""); setIssueFile(null);
    } catch (error) { setNotice(error.shortMessage || error.reason || error.message); }
    finally { setBusy(false); }
  }

  async function verifyCertificate(event) {
    event.preventDefault();
    if (!canConfigure) return setNotice("Configure the contract address in frontend/.env.");
    if (!lookupId.trim()) return setNotice("Enter the certificate ID.");
    setBusy(true); setRecord(null); setVerification(null);
    try {
      // Use the connected wallet only when it is on the configured chain.
      // Otherwise use the explicitly configured, chain-bound public RPC endpoint.
      let readProvider = getReadProvider();
      if (provider) {
        const walletNetwork = await provider.getNetwork();
        if (Number(walletNetwork.chainId) === targetChain) readProvider = provider;
      }
      const c = getContract(readProvider);
      const id = certificateIdFromText(lookupId);
      const network = await readProvider.getNetwork();
      if (Number(network.chainId) !== targetChain) throw new Error("RPC endpoint is connected to the wrong network.");
      const certificate = await c.getCertificate(id);
      setRecord(certificate);
      if (verifyFile) {
        const digest = await hashFile(verifyFile);
        const result = await c.verifyCertificate(id, digest);
        setVerification({ valid: result.valid, revoked: result.revoked });
      } else {
        setVerification({ valid: !certificate.revoked, revoked: certificate.revoked, hashNotChecked: true });
      }
    } catch (error) { setNotice(error.shortMessage || error.reason || error.message); }
    finally { setBusy(false); }
  }

  async function revokeCertificate(event) {
    event.preventDefault();
    if (!connected || !issuer) return setNotice("Connect an authorized issuer wallet.");
    if (!revokeId.trim()) return setNotice("Enter the certificate ID to revoke.");
    setBusy(true);
    try {
      const tx = await getContract(await provider.getSigner()).revokeCertificate(certificateIdFromText(revokeId));
      setNotice("Revocation submitted…"); await tx.wait();
      setNotice("Certificate revoked. Transaction: " + tx.hash);
    } catch (error) { setNotice(error.shortMessage || error.reason || error.message); }
    finally { setBusy(false); }
  }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#"><span className="brandmark">C</span> CertiChain</a>
      <div className="wallet"><span className={connected ? "dot online" : "dot"} />{connected ? short(account) : "Wallet not connected"}
        <button className="button secondary" onClick={connectWallet}>{connected ? "Reconnect" : "Connect wallet"}</button></div>
    </header>
    <section className="hero"><div className="eyebrow">BLOCKCHAIN DOCUMENT TRUST</div><h1>Credentials you can<br/><em>verify with confidence.</em></h1>
      <p>Issue tamper-evident certificate fingerprints and verify documents against an on-chain record. Your files stay on your device.</p>
      <div className="hero-meta"><span>SHA-256 fingerprinting</span><span>Issuer-controlled</span><span>Public verification</span></div>
    </section>
    {notice && <div className="notice" role="status">{notice}</div>}
    {!canConfigure && <div className="notice warning">Contract not configured. Copy frontend/.env.example to frontend/.env and set VITE_CONTRACT_ADDRESS after deployment.</div>}
    <section className="grid">
      <article className="panel"><div className="panel-head"><div><div className="eyebrow">01 / ISSUER PORTAL</div><h2>Issue a certificate</h2></div><span className="pill">{issuer ? "Authorized issuer" : "Issuer access required"}</span></div>
        <p className="muted">Register the document fingerprint. Only an authorized wallet can issue credentials.</p>
        <form onSubmit={issueCertificate}>
          <label>Certificate ID<input value={newId} onChange={e => setNewId(e.target.value)} placeholder="e.g. AIKTC-2026-001" /></label>
          <label>Certificate holder<input value={holder} onChange={e => setHolder(e.target.value)} placeholder="Full name" /></label>
          <label>Course / qualification<input value={course} onChange={e => setCourse(e.target.value)} placeholder="Course or qualification" /></label>
          <label>Original document<input type="file" onChange={e => setIssueFile(e.target.files?.[0] || null)} /></label>
          <p className="hint">The file is hashed locally; it is not uploaded to a server or stored on-chain.</p>
          <button className="button primary" disabled={busy || !issuer}>Issue on blockchain ↗</button>
        </form>
      </article>
      <article className="panel"><div className="panel-head"><div><div className="eyebrow">02 / PUBLIC PORTAL</div><h2>Verify a document</h2></div><span className="pill green">Public access</span></div>
        <p className="muted">Enter the certificate ID. Select the original file to verify its exact SHA-256 fingerprint.</p>
        <form onSubmit={verifyCertificate}>
          <label>Certificate ID<input value={lookupId} onChange={e => setLookupId(e.target.value)} placeholder="Enter issued certificate ID" /></label>
          <label>Document to verify <span className="optional">optional but recommended</span><input type="file" onChange={e => setVerifyFile(e.target.files?.[0] || null)} /></label>
          <p className="hint">Without a file, this checks whether the certificate exists and is not revoked, but does not verify document integrity.</p>
          <button className="button primary" disabled={busy}>Verify certificate ↗</button>
        </form>
        {record && <div className="result"><div className="result-title">On-chain record</div>
          <div className="detail"><span>Holder</span><strong>{record.holderName}</strong></div>
          <div className="detail"><span>Course</span><strong>{record.courseName}</strong></div>
          <div className="detail"><span>Issuer</span><strong>{short(record.issuer)}</strong></div>
          <div className="detail"><span>Issued</span><strong>{date(record.issuedAt)}</strong></div>
          <div className="detail"><span>Document hash</span><strong className="hash">{record.documentHash}</strong></div>
          {verification && <div className={verification.valid ? "verdict good" : "verdict bad"}>{verification.valid ? "✓ " : "✕ "}{verification.hashNotChecked ? "Record exists and is not revoked — file integrity not checked" : verification.revoked ? "Certificate has been revoked" : "Document fingerprint matches"}</div>}
        </div>}
      </article>
    </section>
    <section className="panel revoke"><div><div className="eyebrow">03 / ISSUER CONTROL</div><h2>Revoke a certificate</h2><p className="muted">Only the original issuer or contract owner can revoke a certificate.</p></div>
      <form onSubmit={revokeCertificate}><label>Certificate ID<input value={revokeId} onChange={e => setRevokeId(e.target.value)} placeholder="Enter certificate ID" /></label><button className="button danger" disabled={busy || !issuer}>Revoke certificate</button></form>
    </section>
    <footer><span>CertiChain · Academic project</span><span>On-chain records are public and permanent.</span><button className="text-button" onClick={refreshRole}>Refresh issuer access</button></footer>
  </main>;
}
