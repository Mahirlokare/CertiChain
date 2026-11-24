import { spawn } from "node:child_process";

const port = 4173;
const origin = `http://127.0.0.1:${port}`;
const server = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], {
  stdio: "ignore",
  shell: process.platform === "win32"
});

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) return response;
    } catch {
      // Vite may need a moment to start.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Vite preview did not become ready within 10 seconds.");
}

try {
  const response = await waitForServer();
  const html = await response.text();
  if (!html.includes("CertiChain — Document Verification")) {
    throw new Error("The preview page is missing the expected document title.");
  }

  const assetPaths = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((match) => match[1]);
  if (assetPaths.length === 0) throw new Error("No built JavaScript or CSS assets were referenced by the page.");

  for (const path of assetPaths) {
    const assetResponse = await fetch(new URL(path, origin));
    if (!assetResponse.ok) throw new Error(`Asset failed to load: ${path} (${assetResponse.status})`);
    const body = await assetResponse.text();
    if (!body.trim()) throw new Error(`Asset is empty: ${path}`);
  }

  console.log(`Smoke test passed: HTTP ${response.status}; page title and ${assetPaths.length} built asset(s) served successfully.`);
} finally {
  server.kill("SIGTERM");
}
