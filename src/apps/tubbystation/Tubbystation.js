import { Component, h } from '@monygroupcorp/microact';
import { WalletButton, IpfsService } from '@monygroupcorp/micro-web3';
import { TUBBY_ASSETS } from '../../config.js';
import { tubbyHat } from './tubbyHat.js';

const TUBBY_CONTRACT_ADDRESS = '0x8Dddc7710A40e138d0b6b637e84114494280d69f';
const TUBBY_METADATA_CID = 'bafybeibin567fwd3rfgp23t5mci7nftlhnkqoowr7oxwomua2jrtfb2rpm';
const TUBBY_ABI = [
  {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"saleOn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"freeMinted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"bytes32[]","name":"proof","type":"bytes32[]"}],"name":"freeMint","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"tokensOfOwner","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"}
];

const MAX_SUPPLY = 365;
const MINT_PRICE = '10000000000000000'; // 0.01 ETH in wei

/**
 * Tubbystation — NFT minting page for TubbyStation collection.
 * 365 AI-generated Stable Diffusion NFTs on Ethereum.
 */
class Tubbystation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'home', // 'home' | 'about'
      connected: false,
      address: null,
      wrongNetwork: false,
      saleOn: false,
      totalSupply: 0,
      isOnWhitelist: false,
      hasFreeMinted: false,
      merkleProof: [],
      txPending: false,
      receipt: null,
      error: null,
      mintAmount: 1,
      ownedTokens: [],
      tokenImages: {}
    };

    this.mintFlow = this.bind(this.mintFlow);
    this.closeReceipt = this.bind(this.closeReceipt);
  }

  async didMount() {
    // Subscribe to wallet events
    this.subscribe('wallet:connected', (data) => {
      this.setState({ connected: true, address: data.address, wrongNetwork: false });
      this._setupChainListener();
      this._checkChain();
      this.checkWhitelist(data.address);
      this.loadOwnedTokens(data.address);
    });

    this.subscribe('wallet:disconnected', () => {
      this.setState({
        connected: false,
        address: null,
        wrongNetwork: false,
        isOnWhitelist: false,
        hasFreeMinted: false,
        merkleProof: [],
        ownedTokens: [],
        tokenImages: {}
      });
    });

    this.subscribe('wallet:changed', (data) => {
      this.setState({ address: data.address, ownedTokens: [], tokenImages: {} });
      this.checkWhitelist(data.address);
      this.loadOwnedTokens(data.address);
    });

    // Load contract state (uses public RPC, no wallet prompt)
    await this.loadContractState();

    // Check if already connected
    const ws = this.props.walletService;
    if (ws && ws.isConnected()) {
      const addr = ws.getAddress();
      this.setState({ connected: true, address: addr });
      this._setupChainListener();
      this._checkChain();
      await this.checkWhitelist(addr);
      this.loadOwnedTokens(addr);
    }
  }

  _setupChainListener() {
    if (this._chainListenerActive || !window.ethereum) return;
    this._chainListenerActive = true;

    this._onChainChanged = (chainId) => {
      const isMainnet = parseInt(chainId, 16) === 1;
      this.setState({ wrongNetwork: !isMainnet });
    };
    window.ethereum.on('chainChanged', this._onChainChanged);
    this.registerCleanup(() => {
      if (this._onChainChanged) {
        window.ethereum.removeListener('chainChanged', this._onChainChanged);
      }
    });
  }

  async _checkChain() {
    // Only check chain if wallet is already connected (avoid triggering prompts)
    const ws = this.props.walletService;
    if (!ws || !ws.isConnected()) return;

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

  async loadContractState() {
    try {
      const { ethers } = await import('ethers');

      // Use connected wallet's provider if available, otherwise fall back to public RPC
      let provider;
      if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else {
        provider = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com');
      }

      const contract = new ethers.Contract(TUBBY_CONTRACT_ADDRESS, TUBBY_ABI, provider);

      const [totalSupply, saleOn] = await Promise.all([
        contract.totalSupply(),
        contract.saleOn()
      ]);

      this.setState({
        totalSupply: totalSupply.toNumber(),
        saleOn: saleOn
      });
    } catch (err) {
      console.error('Failed to load contract state:', err);
    }
  }

  async checkWhitelist(account) {
    if (!account) return;

    try {
      const MerkleTree = (await import('merkletreejs')).default;
      const Web3 = (await import('web3')).default;
      const web3 = new Web3(window.ethereum);

      // Build merkle tree from whitelist
      const leaves = tubbyHat.map(x => web3.utils.soliditySha3(x));
      const tree = new MerkleTree(leaves, web3.utils.soliditySha3, { sort: true });

      const accountHash = web3.utils.soliditySha3(account);
      const proof = tree.getHexProof(accountHash);
      const root = tree.getHexRoot();
      const isOnWhitelist = tree.verify(proof, accountHash, root);

      // Check if already free minted
      const contract = new web3.eth.Contract(TUBBY_ABI, TUBBY_CONTRACT_ADDRESS);
      const hasFreeMinted = await contract.methods.freeMinted(account).call();

      this.setState({
        isOnWhitelist,
        hasFreeMinted,
        merkleProof: proof
      });
    } catch (err) {
      console.error('Whitelist check failed:', err);
    }
  }

  async loadOwnedTokens(account) {
    if (!account || !window.ethereum) return;

    try {
      const Web3 = (await import('web3')).default;
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(TUBBY_ABI, TUBBY_CONTRACT_ADDRESS);

      const tokens = await contract.methods.tokensOfOwner(account).call();
      const tokenIds = tokens.map(t => Number(t));
      this.setState({ ownedTokens: tokenIds });

      // Load images for each token
      // TODO: Replace with IpfsService.fetchJson() once implemented
      // See: docs/micro-web3-ipfs-gateway-rotation-spec.md
      const gateway = typeof IpfsService.getGateway === 'function'
        ? IpfsService.getGateway()
        : 'https://cloudflare-ipfs.com/ipfs/';

      for (const tokenId of tokenIds) {
        try {
          const metadataUrl = `${gateway}${TUBBY_METADATA_CID}/${tokenId}`;
          const res = await fetch(metadataUrl);
          const metadata = await res.json();
          if (metadata && metadata.image) {
            // TODO: Replace with IpfsService.resolveUrl() once implemented
            const imageUrl = metadata.image.replace('ipfs://', gateway);
            this.setState(prev => ({
              tokenImages: { ...prev.tokenImages, [tokenId]: imageUrl }
            }));
          }
        } catch (e) {
          console.warn(`Failed to load metadata for token ${tokenId}:`, e);
        }
      }
    } catch (err) {
      console.error('Failed to load owned tokens:', err);
    }
  }

  async mintFlow() {
    const { connected, address, isOnWhitelist, hasFreeMinted, merkleProof, saleOn, wrongNetwork } = this.state;

    if (!connected) {
      this.setState({ error: 'Please connect your wallet first' });
      return;
    }

    if (wrongNetwork) {
      this.setState({ error: 'Please switch to Ethereum Mainnet' });
      return;
    }

    if (!saleOn) {
      this.setState({ error: 'Sale is not currently open' });
      return;
    }

    try {
      const Web3 = (await import('web3')).default;
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(TUBBY_ABI, TUBBY_CONTRACT_ADDRESS);

      this.setState({ txPending: true, error: null });

      if (isOnWhitelist && !hasFreeMinted) {
        // Free mint for whitelisted users
        const tx = await contract.methods.freeMint(merkleProof).send({ from: address });
        this.setState({
          txPending: false,
          receipt: { hash: tx.transactionHash, desc: 'minted 2 free TubbyStation Player Characters' },
          hasFreeMinted: true
        });
      } else {
        // Paid mint using selected amount from state
        const amount = this.state.mintAmount;
        const value = BigInt(MINT_PRICE) * BigInt(amount);
        const tx = await contract.methods.mint(amount).send({
          from: address,
          value: value.toString()
        });

        this.setState({
          txPending: false,
          receipt: { hash: tx.transactionHash, desc: `minted ${amount} TubbyStation Player Character(s)` }
        });
      }

      // Refresh state
      await this.loadContractState();
      this.loadOwnedTokens(address);
    } catch (err) {
      this.setState({ txPending: false, error: err.message });
    }
  }

  closeReceipt() {
    this.setState({ receipt: null });
  }

  getMintButtonText() {
    const { connected, saleOn, isOnWhitelist, hasFreeMinted, txPending, wrongNetwork } = this.state;

    if (txPending) return 'Processing...';
    if (!connected) return 'Connect to Mint';
    if (wrongNetwork) return 'Wrong Network';
    if (!saleOn) return 'Sale Not Open';
    if (isOnWhitelist && !hasFreeMinted) return 'Mint 2 Free';
    return 'Mint';
  }

  adjustMintAmount(delta) {
    const newAmount = Math.max(1, Math.min(8, this.state.mintAmount + delta));
    this.setState({ mintAmount: newAmount });
  }

  renderMintControls() {
    const { connected, isOnWhitelist, hasFreeMinted, mintAmount, txPending } = this.state;
    const showQuantity = connected && !(isOnWhitelist && !hasFreeMinted);
    const totalCost = (0.01 * mintAmount).toFixed(2);

    return h('div', { className: 'tubby-mint-controls' },
      showQuantity && h('div', { className: 'tubby-quantity-selector' },
        h('button', {
          className: 'tubby-qty-btn',
          onClick: () => this.adjustMintAmount(-1),
          disabled: mintAmount <= 1 || txPending
        }, '-'),
        h('span', { className: 'tubby-qty-value' }, mintAmount),
        h('button', {
          className: 'tubby-qty-btn',
          onClick: () => this.adjustMintAmount(1),
          disabled: mintAmount >= 8 || txPending
        }, '+')
      ),
      showQuantity && h('p', { className: 'tubby-total-cost' }, `Total: ${totalCost} ETH`),
      h('button', {
        className: 'tubby-mint-btn',
        onClick: this.mintFlow,
        disabled: txPending
      }, this.getMintButtonText())
    );
  }

  renderNavBar() {
    const { view } = this.state;
    const { walletService } = this.props;
    const A = TUBBY_ASSETS;

    return h('div', { className: 'tubby-bar' },
      h('div', { className: 'tubby-bar-inner' },
        h('div', { className: 'tubby-logo-wrap' },
          h('a', { href: '/', onClick: (e) => { e.preventDefault(); this.props.onBack && this.props.onBack(); } },
            h('img', { alt: 'tubby station logo', src: `${A}/catlogo.png`, className: 'tubby-catlogo' })
          )
        ),
        h('div', { className: 'tubby-nav-links' },
          h('a', {
            className: view === 'home' ? 'active' : '',
            onClick: () => this.setState({ view: 'home' })
          }, 'Home'),
          h('a', {
            className: view === 'about' ? 'active' : '',
            onClick: () => this.setState({ view: 'about' })
          }, 'About')
        ),
        h('div', { className: 'tubby-connect-wrap' },
          h(WalletButton, { walletService })
        ),
        h('div', { className: 'tubby-social-links' },
          h('a', { href: 'https://x.com/miladystation', target: '_blank', rel: 'noreferrer' },
            h('img', { alt: 'Twitter', src: `${A}/twitter.svg`, className: 'tubby-social-icon' })
          )
        )
      )
    );
  }

  renderWrongNetwork() {
    const { wrongNetwork, connected } = this.state;
    if (!connected || !wrongNetwork) return null;

    return h('div', { className: 'tubby-wrong-network' },
      h('p', null, 'Please switch to Ethereum Mainnet'),
      h('button', {
        className: 'tubby-switch-btn',
        onClick: this.bind(this._switchToMainnet)
      }, 'Switch to Mainnet')
    );
  }

  renderFreeMintStatus() {
    const { connected, isOnWhitelist, hasFreeMinted } = this.state;
    if (!connected) return null;

    if (isOnWhitelist && hasFreeMinted) {
      return h('p', { className: 'tubby-free-status tubby-free-claimed' },
        'You have already claimed your 2 free TubbyStation NFTs!'
      );
    }

    if (isOnWhitelist && !hasFreeMinted) {
      return h('p', { className: 'tubby-free-status tubby-free-eligible' },
        'You are eligible for 2 free TubbyStation NFTs!'
      );
    }

    return null;
  }

  renderGallery() {
    const { connected, ownedTokens, tokenImages } = this.state;
    if (!connected || ownedTokens.length === 0) return null;

    return h('div', { className: 'tubby-gallery' },
      h('h3', { className: 'tubby-gallery-title' }, `Your TubbyStation Collection (${ownedTokens.length})`),
      h('div', { className: 'tubby-gallery-grid' },
        ...ownedTokens.map(tokenId =>
          h('div', { className: 'tubby-gallery-item', key: tokenId },
            tokenImages[tokenId]
              ? h('img', {
                  src: tokenImages[tokenId],
                  alt: `TubbyStation #${tokenId}`,
                  className: 'tubby-gallery-img'
                })
              : h('div', { className: 'tubby-gallery-placeholder' }, `#${tokenId}`),
            h('span', { className: 'tubby-gallery-id' }, `#${tokenId}`)
          )
        )
      )
    );
  }

  renderHome() {
    const { totalSupply, error } = this.state;
    const A = TUBBY_ASSETS;
    const remaining = MAX_SUPPLY - totalSupply;

    return h('div', { className: 'tubby-main' },
      this.renderWrongNetwork(),
      h('div', { className: 'tubby-hero' },
        h('div', { className: 'tubby-stars-left' },
          h('img', { alt: 'Stars', src: `${A}/starsI.png` })
        ),
        h('div', { className: 'tubby-logo-center' },
          h('img', { alt: 'tubby station logo', src: `${A}/tubbystationpp.png` })
        ),
        h('div', { className: 'tubby-stars-right' },
          h('img', { alt: 'Stars', src: `${A}/starsII.png` })
        )
      ),
      h('div', { className: 'tubby-info' },
        h('p', { className: 'tubby-tagline' }, '365 NFTS ON THE ETHEREUM BLOCKCHAIN.'),
        h('p', { className: 'tubby-count' }, `Only ${remaining} left!`),
        h('p', { className: 'tubby-derived' },
          'Derived From ',
          h('a', { href: 'https://x.com/tubbyCollective', target: '_blank' }, '@tubbyCollective'),
          ' by ',
          h('a', { href: 'https://x.com/miladystation', target: '_blank' }, '@miladystation')
        ),
        h('p', { className: 'tubby-free-info' }, '2 Free for Tubby, Milady and MiladyStation Holders'),
        h('p', { className: 'tubby-price' }, '0.01ETH each')
      ),
      this.renderFreeMintStatus(),
      error && h('p', { className: 'tubby-error' }, error),
      this.renderMintControls(),
      h('p', { className: 'tubby-contract' },
        'Contract: ',
        h('a', { href: `https://etherscan.io/address/${TUBBY_CONTRACT_ADDRESS}`, target: '_blank' },
          '0x8Ddd...0d69f'
        )
      ),
      this.renderGallery()
    );
  }

  renderAbout() {
    const A = TUBBY_ASSETS;

    return h('div', { className: 'tubby-about' },
      this.renderWrongNetwork(),
      h('div', { className: 'tubby-hero' },
        h('div', { className: 'tubby-stars-left' },
          h('img', { alt: 'Stars', src: `${A}/starsI.png` })
        ),
        h('div', { className: 'tubby-about-header' },
          h('h1', null, 'About'),
          h('img', { alt: 'tubby station logo', src: `${A}/tubbystationpp.png` })
        ),
        h('div', { className: 'tubby-stars-right' },
          h('img', { alt: 'Stars', src: `${A}/starsII.png` })
        )
      ),

      h('div', { className: 'tubby-about-section' },
        h('div', { className: 'tubby-about-text' },
          h('h2', null, 'The Collection'),
          h('p', null, 'tubbystation is a collection of 365 miladystation trained stable diffusion textual inversion generated and hand-picked nfts on ethereum.'),
          h('p', null, 'art: ', h('a', { href: 'https://x.com/miladystation', target: '_blank' }, '@miladystation')),
          h('p', null, 'code: ', h('a', { href: 'https://x.com/miladystation', target: '_blank' }, '@miladystation')),
          h('p', null, 'smart contract: ', h('a', { href: 'https://x.com/miladystation', target: '_blank' }, '@miladystation'))
        ),
        h('div', { className: 'tubby-about-gif' },
          h('img', { alt: 'Tubby Cats Gif', src: `${A}/tubbygif.gif` })
        )
      ),

      h('div', { className: 'tubby-about-full' },
        h('h2', null, 'creating tubbystation'),
        h('p', null, 'rather than creating from one of 120 various themed palettes, each tubbystation cat player character is generated completely randomly from the collection.'),
        h('p', null, 'tubbystation player character cats are not generated with individual trait rarity in mind. rarity is based on the themed gen palettes and which traits the AI was able to render properly.'),
        h('p', null, 'the collection also contains 56 one-of-ones, which are created by different artists on tubbycat team (Except Fatwell). each one-of-one has an attribute that displays the artist of each.')
      ),

      h('h1', { className: 'tubby-team-header' }, 'The Team'),
      h('div', { className: 'tubby-team' },
        h('a', { href: 'https://x.com/miladystation', target: '_blank', className: 'tubby-team-card' },
          h('img', { alt: 'team member', src: `${A}/90.png`, className: 'tubby-team-avatar' }),
          h('div', { className: 'tubby-team-info' },
            h('p', { className: 'tubby-team-role' }, 'Project lead & Producer & Website Post-Authorship & Smart Contract Developer & Art Director & tubby holder'),
            h('h3', null, '@miladystation'),
            h('p', { className: 'tubby-team-quote' }, 'Tubbystation would be a beautiful name for a baby boy')
          )
        )
      )
    );
  }

  renderReceipt() {
    const { receipt } = this.state;
    if (!receipt) return null;

    const A = TUBBY_ASSETS;

    return h('div', { className: 'tubby-receipt-overlay' },
      h('div', { className: 'tubby-receipt-modal' },
        h('div', { className: 'tubby-receipt-close', onClick: this.closeReceipt }, 'x'),
        h('img', { src: `${A}/tuntunz.gif`, className: 'tubby-receipt-gif' }),
        h('div', { className: 'tubby-receipt-content' },
          h('h3', null, `Congratulations! You have just ${receipt.desc}`),
          h('p', null, 'You can see your transaction here:'),
          h('a', {
            href: `https://etherscan.io/tx/${receipt.hash}`,
            target: '_blank',
            className: 'tubby-receipt-link'
          }, receipt.hash)
        )
      )
    );
  }

  render() {
    const { view } = this.state;

    return h('div', { className: 'tubbystation-page' },
      this.renderNavBar(),
      view === 'home' ? this.renderHome() : this.renderAbout(),
      this.renderReceipt()
    );
  }
}

export default Tubbystation;
