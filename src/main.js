import './shell/shell.css';
import './apps/classic/classic.css';
import './apps/ppo/ppo.css';
import './apps/tubbystation/tubbystation.css';
import './apps/nononslide/nononslide.css';
import { render, h, eventBus } from '@monygroupcorp/microact';
import { WalletService, IpfsService } from '@monygroupcorp/micro-web3';
import Shell from './shell/Shell.js';

// Fork mode detection
const USE_FORK = import.meta.env.VITE_USE_FORK === 'true';
const FORK_RPC_URL = 'http://127.0.0.1:8545';
const FORK_CHAIN_ID = 1337;

if (USE_FORK) {
  console.log('%c🔧 FORK MODE ENABLED', 'background: #4ade80; color: #000; padding: 4px 8px; font-weight: bold;');
  console.log('Connect MetaMask to http://127.0.0.1:8545 (Chain ID: 1337)');
}

// Export for other modules to use
export { USE_FORK, FORK_RPC_URL, FORK_CHAIN_ID };

async function main() {
  // IpfsService now handles gateway rotation automatically

  const walletService = new WalletService(eventBus);

  // Enforce correct chain (Mainnet or Fork)
  const MAINNET_CHAIN_ID = 1;
  const TARGET_CHAIN_ID = USE_FORK ? FORK_CHAIN_ID : MAINNET_CHAIN_ID;

  const enforceNetwork = async () => {
    if (!window.ethereum) return;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainId, 16);

      if (currentChainId !== TARGET_CHAIN_ID) {
        if (USE_FORK) {
          // Try to add/switch to anvil network
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x' + FORK_CHAIN_ID.toString(16),
                chainName: 'Anvil Fork',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: [FORK_RPC_URL]
              }]
            });
          } catch (addErr) {
            console.warn('Could not add Anvil network:', addErr);
          }
        } else {
          await walletService.switchNetwork(TARGET_CHAIN_ID);
        }
      }
    } catch (err) {
      console.error('Failed to switch network:', err);
    }
  };

  // Register before initialize so we catch auto-reconnect
  eventBus.on('wallet:connected', enforceNetwork);

  if (window.ethereum) {
    window.ethereum.on('chainChanged', (chainId) => {
      const currentChainId = parseInt(chainId, 16);
      if (currentChainId !== TARGET_CHAIN_ID) {
        if (!USE_FORK) {
          walletService.switchNetwork(TARGET_CHAIN_ID).catch(err => {
            console.error('Failed to switch network:', err);
          });
        }
      }
    });
  }

  try {
    await walletService.initialize({ autoReconnect: false });
  } catch (error) {
    console.error('Failed to initialize WalletService:', error);
  }

  // If already connected after init, enforce now
  if (walletService.isConnected()) {
    enforceNetwork();
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
