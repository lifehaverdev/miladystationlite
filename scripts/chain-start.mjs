#!/usr/bin/env node
/**
 * Chain orchestrator for miladystation dapps.
 *
 * Usage:
 *   npm run chain:start <config>
 *   npm run chain:start nononslide
 *   npm run chain:start nononslide -- --background
 *
 * Each dapp can have its own chain config in scripts/chains/<name>.mjs
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fsSync from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(__filename);
const projectRoot = path.resolve(scriptsDir, '..');
const chainsDir = path.join(scriptsDir, 'chains');
const pidFile = path.join(projectRoot, '.anvil.pid');
const cacheDir = path.join(projectRoot, '.anvil-cache');

// --- Parse arguments ---
const args = process.argv.slice(2);
const configName = args.find(a => !a.startsWith('--'));
const cliFlags = parseFlags(args);

if (!configName) {
  console.error('Usage: npm run chain:start <config>');
  console.error('');
  console.error('Available configs:');
  listConfigs();
  process.exit(1);
}

// --- Load config ---
const configPath = path.join(chainsDir, `${configName}.mjs`);
if (!fsSync.existsSync(configPath)) {
  console.error(`Config not found: ${configName}`);
  console.error(`Expected file: ${configPath}`);
  console.error('');
  console.error('Available configs:');
  listConfigs();
  process.exit(1);
}

loadEnvFiles();

const config = (await import(configPath)).default;
console.log(`[chain] Loading config: ${config.name}`);
console.log(`[chain] ${config.description}`);
console.log('');

// --- Setup ---
ensureDir(cacheDir);

const port = cliFlags.port || '8545';
const rpcUrl = `http://127.0.0.1:${port}`;
const chainId = String(config.chainId || 31337);
const blockTime = String(config.blockTime || 2);
const runInBackground = cliFlags.background || cliFlags.bg;

checkExistingInstance();

// --- Start Anvil ---
let chainProcess = null;

try {
  chainProcess = await startAnvil();
} catch (error) {
  console.error('[chain] Failed to start Anvil:', error.message);
  process.exit(1);
}

// --- Handle shutdown ---
if (runInBackground) {
  chainProcess.unref();
} else {
  const shutdown = () => {
    console.log(`\n[chain] Shutting down...`);
    return killProcess(chainProcess).finally(() => process.exit());
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// --- Run deployment if configured ---
if (config.deploy) {
  console.log('[chain] Running deployment...');
  try {
    await config.deploy({ rpcUrl, chainId });
    console.log('[chain] Deployment complete.');
  } catch (error) {
    console.error('[chain] Deployment failed:', error.message);
  }
}

// --- Fund user wallet if configured ---
await fundUserWallet(rpcUrl);

// --- Done ---
console.log('');
console.log(`[chain] ${config.name} chain is running.`);
console.log('');
console.log('To connect MetaMask:');
console.log(`  Network Name: ${config.name} (Anvil)`);
console.log(`  RPC URL: ${rpcUrl}`);
console.log(`  Chain ID: ${chainId}`);
console.log(`  Currency: ETH`);
console.log('');

if (config.contracts) {
  console.log('Contracts:');
  for (const [name, address] of Object.entries(config.contracts)) {
    console.log(`  ${name}: ${address}`);
  }
  console.log('');
}

if (runInBackground) {
  console.log('[chain] Background mode. Run "npm run chain:stop" to shut down.');
  process.exit(0);
}

console.log('Press Ctrl+C to stop.');
await new Promise((resolve) => chainProcess.on('exit', resolve));
removePidFile();

// ============================================================================
// Helper Functions
// ============================================================================

function listConfigs() {
  if (!fsSync.existsSync(chainsDir)) {
    console.error('  (no configs found)');
    return;
  }
  const files = fsSync.readdirSync(chainsDir).filter(f => f.endsWith('.mjs'));
  if (files.length === 0) {
    console.error('  (no configs found)');
    return;
  }
  for (const file of files) {
    console.error(`  - ${file.replace('.mjs', '')}`);
  }
}

function parseFlags(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.replace(/^--/, '');
    const next = args[i + 1];
    if (!next || next.startsWith('--')) {
      result[key] = true;
    } else {
      result[key] = next;
      i++;
    }
  }
  return result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRpc(url, attempts = 20) {
  const body = JSON.stringify({ jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 });
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body
      });
      if (res.ok) return true;
    } catch {}
    await sleep(1500);
  }
  throw new Error(`Timed out waiting for RPC at ${url}`);
}

async function startAnvil() {
  const args = ['--chain-id', chainId, '--port', port, '--block-time', blockTime, '--cache-path', cacheDir];

  if (config.fork?.enabled && config.fork?.url) {
    args.unshift('--fork-url', config.fork.url);
    console.log(`[chain] Forking from: ${config.fork.url}`);
  }

  const spawnOptions = runInBackground
    ? { stdio: 'ignore', detached: true }
    : { stdio: 'inherit' };

  console.log(`[chain] Starting anvil...`);
  const child = spawn('anvil', args, spawnOptions);
  writePid(child.pid);

  try {
    await waitForRpcOrExit(child, rpcUrl);
    return child;
  } catch (error) {
    await killProcess(child);
    throw error;
  }
}

function waitForRpcOrExit(childProcess, url) {
  return new Promise((resolve, reject) => {
    const onExit = (code, signal) => {
      cleanup();
      const reason = typeof code === 'number' ? `code ${code}` : `signal ${signal || 'unknown'}`;
      reject(new Error(`Anvil exited before RPC ready (${reason})`));
    };
    const cleanup = () => childProcess.removeListener('exit', onExit);

    childProcess.once('exit', onExit);
    waitForRpc(url).then(() => { cleanup(); resolve(); }, (err) => { cleanup(); reject(err); });
  });
}

async function fundUserWallet(rpcUrl) {
  const userAddress = process.env.USER_ADDRESS;
  if (!userAddress) return;

  const fundingEth = process.env.USER_FUNDING_ETH || '10.0';
  console.log(`[chain] Funding ${userAddress} with ${fundingEth} ETH...`);

  try {
    const { ethers } = await import('ethers');
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const anvilKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    const wallet = new ethers.Wallet(anvilKey, provider);
    const tx = await wallet.sendTransaction({
      to: userAddress,
      value: ethers.utils.parseEther(fundingEth)
    });
    await tx.wait();
    console.log(`[chain] Funded successfully.`);
  } catch (error) {
    console.warn(`[chain] Failed to fund wallet:`, error.message);
  }
}

function loadEnvFiles() {
  for (const file of ['.env', '.env.local']) {
    const full = path.join(projectRoot, file);
    if (!fsSync.existsSync(full)) continue;
    const content = fsSync.readFileSync(full, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
      const [rawKey, ...rest] = line.split('=');
      const key = rawKey.trim();
      const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key && !process.env[key]) process.env[key] = value;
    }
  }
}

function checkExistingInstance() {
  if (!fsSync.existsSync(pidFile)) return;
  const pid = Number(fsSync.readFileSync(pidFile, 'utf8'));
  if (pid && Number.isFinite(pid)) {
    try {
      process.kill(pid, 0);
      console.log(`[chain] Killing existing anvil (pid ${pid})...`);
      try { process.kill(pid, 'SIGINT'); } catch {}
      setTimeout(() => {
        try { process.kill(pid, 'SIGKILL'); } catch {}
        removePidFile();
      }, 1500);
    } catch {
      removePidFile();
    }
  } else {
    removePidFile();
  }
}

function writePid(pid) {
  try { fsSync.writeFileSync(pidFile, String(pid)); } catch {}
}

function removePidFile() {
  try { if (fsSync.existsSync(pidFile)) fsSync.unlinkSync(pidFile); } catch {}
}

function ensureDir(dir) {
  if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir, { recursive: true });
}

function killProcess(childProcess) {
  if (!childProcess || childProcess.exitCode !== null || childProcess.killed) {
    removePidFile();
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const pid = childProcess.pid;
    const timer = setTimeout(() => { try { process.kill(pid, 'SIGKILL'); } catch {} }, 2000);
    childProcess.once('exit', () => { clearTimeout(timer); removePidFile(); resolve(); });
    try { process.kill(pid, 'SIGINT'); } catch { clearTimeout(timer); removePidFile(); resolve(); }
  });
}
