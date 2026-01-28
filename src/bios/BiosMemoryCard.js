import { Component, h } from '@monygroupcorp/microact';
import { WalletButton } from '@monygroupcorp/micro-web3';
import MemoryCardService from './memoryCardService.js';
import CollectionCard from './CollectionCard.js';
// import TokenModal from './TokenModal.js';
import assets from './assets.json';

class BiosMemoryCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connected: false,
      address: null,
      wrongNetwork: false,
      holdings: assets.map(col => ({ collection: col, balance: 0, loading: false })),
      refreshing: false
      // modalToken: null,
      // modalCollection: null
    };
    this._service = new MemoryCardService(props.walletService);
    this._touchStartY = 0;
  }

  didMount() {
    this.subscribe('wallet:connected', (data) => {
      this.setState({ connected: true, address: data.address });
      this._checkChain();
      this._loadAll(data.address);
    });
    this.subscribe('wallet:disconnected', () => {
      this.setState({
        connected: false,
        address: null,
        wrongNetwork: false,
        holdings: assets.map(col => ({ collection: col, balance: 0, loading: false }))
      });
    });
    this.subscribe('wallet:changed', (data) => {
      this.setState({ address: data.address });
      this._loadAll(data.address);
    });

    // Listen for chain changes
    if (window.ethereum) {
      this._onChainChanged = (chainId) => {
        const isMainnet = parseInt(chainId, 16) === 1;
        this.setState({ wrongNetwork: !isMainnet });
      };
      window.ethereum.on('chainChanged', this._onChainChanged);
      this.registerCleanup(() => {
        window.ethereum.removeListener('chainChanged', this._onChainChanged);
      });
    }

    // Check if already connected
    const ws = this.props.walletService;
    if (ws && ws.isConnected()) {
      const addr = ws.getAddress();
      this.setState({ connected: true, address: addr });
      this._checkChain();
      this._loadAll(addr);
    }

    // Pull-to-refresh touch handlers
    this._onTouchStart = (e) => { this._touchStartY = e.touches[0].clientY; };
    this._onTouchEnd = (e) => {
      const dy = e.changedTouches[0].clientY - this._touchStartY;
      const el = this._el;
      if (el && el.scrollTop === 0 && dy > 80 && this.state.connected) {
        this._refresh();
      }
    };
  }

  async _checkChain() {
    if (!window.ethereum) return;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      this.setState({ wrongNetwork: parseInt(chainId, 16) !== 1 });
    } catch { /* ignore */ }
  }

  _switchToMainnet() {
    this.props.walletService.switchNetwork(1).catch(err => {
      console.error('Failed to switch to mainnet:', err);
    });
  }

  async _loadAll(address, bypassCache = false) {
    this.setState({
      refreshing: bypassCache,
      holdings: assets.map(col => ({ collection: col, balance: 0, loading: true }))
    });

    const results = await this._service.loadHoldings(address);

    // Sort: held first
    results.sort((a, b) => {
      const aHeld = a.balance > 0 ? 1 : 0;
      const bHeld = b.balance > 0 ? 1 : 0;
      return bHeld - aHeld;
    });

    this.setState({ holdings: results.map(r => ({ ...r, loading: false })), refreshing: false });
  }

  _refresh() {
    if (this.state.address) {
      this._loadAll(this.state.address, true);
    }
  }

  // ── Token modal (earmarked for future expansion) ──
  // _openModal(token, collection) {
  //   this.setState({ modalToken: token, modalCollection: collection });
  // }
  //
  // _closeModal() {
  //   this.setState({ modalToken: null, modalCollection: null });
  // }

  render() {
    const { navigate, walletService } = this.props;
    const { connected, wrongNetwork, holdings, refreshing } = this.state;

    return h('div', {
      className: 'bios-memory-card' + (connected ? ' bios-memory-card--connected' : ''),
      onTouchStart: this._onTouchStart,
      onTouchEnd: this._onTouchEnd
    },
      h('div', { className: 'memory-card-top' },
        h('h2', { className: 'bios-heading' }, 'Memory Card')
      ),

      connected && wrongNetwork &&
        h('div', { className: 'memory-card-wrong-network' },
          h('p', null, 'Please switch to Ethereum Mainnet.'),
          h('button', {
            className: 'memory-card-switch-network',
            onClick: this.bind(this._switchToMainnet)
          }, 'Switch to Mainnet')
        ),

      !connected &&
        h('div', { className: 'memory-card-content' },
          h('p', null, 'Connect your wallet to view your collection.')
        ),

      connected && !wrongNetwork &&
        h('div', { className: 'memory-card-grid' },
          ...holdings.map(item =>
            h(CollectionCard, {
              key: item.collection.id,
              collection: item.collection,
              balance: item.balance,
              tokenBalance: item.tokenBalance,
              error: item.error,
              loading: item.loading
            })
          )
        ),

      // ── Token modal (earmarked for future expansion) ──
      // modalToken && h(TokenModal, {
      //   token: modalToken,
      //   collection: modalCollection,
      //   onClose: this.bind(this._closeModal)
      // }),

      h(WalletButton, { walletService }),
      h('div', { className: 'overlay-controls' },
        h('button', { onClick: () => navigate('home') }, 'BACK'),
        // connected && !wrongNetwork && h('button', {
        //   className: 'memory-card-refresh',
        //   onClick: this.bind(this._refresh),
        //   disabled: refreshing
        // }, refreshing ? 'Refreshing...' : 'Refresh')
      )
    );
  }
}

export default BiosMemoryCard;
