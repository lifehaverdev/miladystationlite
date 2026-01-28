import './shell/shell.css';
import './apps/classic/classic.css';
import './apps/ppo/ppo.css';
import './apps/tubbystation/tubbystation.css';
import { render, h, eventBus } from '@monygroupcorp/microact';
import { WalletService, IpfsService } from '@monygroupcorp/micro-web3';
import Shell from './shell/Shell.js';

const createIconDataUri = (label, background, textColor = '#ffffff') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
      <rect width="64" height="64" rx="12" fill="${background}" />
      <text x="50%" y="55%" font-size="20" font-family="Arial, sans-serif" text-anchor="middle" fill="${textColor}">
        ${label}
      </text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

async function main() {
  // Set a working IPFS gateway (cloudflare-ipfs.com is dead)
  IpfsService.setCustomGateway('https://ipfs.io/ipfs/');

  const walletService = new WalletService(eventBus);

  // Enforce Ethereum Mainnet (chain ID 1)
  const MAINNET_CHAIN_ID = 1;

  const enforceMainnet = async () => {
    if (!window.ethereum) return;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (parseInt(chainId, 16) !== MAINNET_CHAIN_ID) {
        await walletService.switchNetwork(MAINNET_CHAIN_ID);
      }
    } catch (err) {
      console.error('Failed to switch to mainnet:', err);
    }
  };

  // Register before initialize so we catch auto-reconnect
  eventBus.on('wallet:connected', enforceMainnet);

  if (window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
      if (parseInt(chainId, 16) !== MAINNET_CHAIN_ID) {
        walletService.switchNetwork(MAINNET_CHAIN_ID).catch(err => {
          console.error('Failed to switch to mainnet:', err);
        });
      }
    });
  }

  try {
    await walletService.initialize({ autoReconnect: false });
    walletService.walletIcons = {
      rabby: createIconDataUri('RB', '#7c5dff'),
      rainbow: createIconDataUri('RB', '#ff8f70'),
      phantom: createIconDataUri('PH', '#6a5acd'),
      metamask: createIconDataUri('MM', '#f6851b'),
    };
  } catch (error) {
    console.error('Failed to initialize WalletService:', error);
  }

  // If already connected after init, enforce now
  if (walletService.isConnected()) {
    enforceMainnet();
  }

  const appRoot = document.getElementById('app');
  if (appRoot) {
    render(h(Shell, { walletService }), appRoot);
  }

  eventBus.on('wallet:error', (error) => {
    console.error('Wallet error:', error);
  });
}

main().catch(console.error);
