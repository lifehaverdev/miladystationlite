import { Component, h } from '@monygroupcorp/microact';
import { WalletButton, IpfsService } from '@monygroupcorp/micro-web3';
import SlideService from './SlideService.js';
import { SLIDE_STATUS, SLIDE_STATUS_LABELS, CIRCLE_LAYOUT_MAX } from './constants.js';

class NononSlide extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'browse', // 'browse' | 'detail' | 'gate' | 'history'
      connected: false,
      address: null,
      hasNonon: false,
      ownedNonons: [],
      nononImages: {},
      nononPointsInfo: {}, // tokenId -> { points, hasSent, hasReceived, potentialPoints }
      loadingNonons: false,
      slides: [],
      historySlides: [],
      loadingHistory: false,
      selectedSlide: null,
      loading: true,
      error: null,
      txPending: false,
      // Create modal
      showCreateModal: false,
      createMinPlayers: 2,
      createMaxPlayers: 0,
      createCreatorOnly: false,
      // Join flow
      selectedNononForJoin: null,
      isApproved: false,
      depositAmount: null,
      // Refunds
      refundAmount: null,
      creatorPenalties: null,
      // Collection info
      collectionDescription: null
    };

    this.slideService = new SlideService();
  }

  async didMount() {
    // Initialize service
    await this.slideService.initialize();

    // Subscribe to wallet events
    this.subscribe('wallet:connected', async (data) => {
      this.setState({ connected: true, address: data.address });
      await this.checkNononOwnership(data.address);
      await this.checkApproval(data.address);
    });

    this.subscribe('wallet:disconnected', () => {
      this.setState({
        connected: false,
        address: null,
        hasNonon: false,
        ownedNonons: [],
        nononImages: {},
        view: 'browse'
      });
    });

    // Check if already connected
    const ws = this.props.walletService;
    if (ws && ws.isConnected()) {
      const addr = ws.getAddress();
      this.setState({ connected: true, address: addr });
      await this.checkNononOwnership(addr);
      await this.checkApproval(addr);
    }

    // Load slides
    await this.loadSlides();
  }

  async checkNononOwnership(address) {
    try {
      this.setState({ loadingNonons: true });
      const balance = await this.slideService.getNononBalance(address);
      const hasNonon = balance > 0;

      if (hasNonon) {
        const ownedNonons = await this.slideService.getNononsOwned(address);
        this.setState({ hasNonon, ownedNonons });
        // Load images and points info for owned nonons
        this.loadNononImages(ownedNonons);
        this.loadNononPointsInfo(address, ownedNonons);
      } else {
        this.setState({ hasNonon: false, view: 'gate', loadingNonons: false });
      }
    } catch (e) {
      console.error('Failed to check Nonon ownership:', e);
      this.setState({ loadingNonons: false });
    }
  }

  async checkApproval(address) {
    try {
      const isApproved = await this.slideService.isApprovedForSlide(address);
      this.setState({ isApproved });
    } catch (e) {
      console.error('Failed to check approval:', e);
    }
  }

  async loadNononImages(tokenIds) {
    const imagesMap = {};
    let description = null;

    for (const tokenId of tokenIds) {
      try {
        const metadata = await this.slideService.getNononMetadata(tokenId);
        if (metadata && metadata.image) {
          imagesMap[tokenId] = IpfsService.resolveUrl(metadata.image);
        }
        // Capture collection description from first successful metadata
        if (!description && metadata && metadata.description) {
          description = metadata.description;
        }
      } catch (e) {
        // Skip failed images silently
      }
    }

    const newState = {
      nononImages: { ...this.state.nononImages, ...imagesMap }
    };
    if (description && !this.state.collectionDescription) {
      newState.collectionDescription = description;
    }
    this.setState(newState);
  }

  async loadNononPointsInfo(address, tokenIds) {
    const pointsInfoMap = {};
    for (const tokenId of tokenIds) {
      let info;
      try {
        info = await this.slideService.getNononPointsInfo(address, tokenId);
      } catch (e) {
        console.warn(`Failed to load points info for Nonon #${tokenId}:`, e);
        // Default to "fresh" (can earn points) if we can't fetch
        info = {
          hasSent: false,
          hasReceived: false
        };
      }
      pointsInfoMap[tokenId] = info;
    }
    // Set all at once
    this.setState({
      nononPointsInfo: { ...this.state.nononPointsInfo, ...pointsInfoMap },
      loadingNonons: false
    });
  }

  async loadSlideParticipantsPointsInfo(players, tokenIds) {
    const pointsInfoMap = {};
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const tokenId = tokenIds[i];
      let info;
      try {
        info = await this.slideService.getNononPointsInfo(player, tokenId);
      } catch (e) {
        console.warn(`Failed to load points info for participant Nonon #${tokenId}:`, e);
        info = {
          hasSent: false,
          hasReceived: false
        };
      }
      pointsInfoMap[tokenId] = info;
    }
    this.setState({
      nononPointsInfo: { ...this.state.nononPointsInfo, ...pointsInfoMap }
    });
  }

  async loadSlides() {
    this.setState({ loading: true, error: null });
    try {
      const slides = await this.slideService.getActiveSlides();
      this.setState({ slides, loading: false });
    } catch (e) {
      this.setState({ error: 'Failed to load slides', loading: false });
      console.error(e);
    }
  }

  async loadHistory() {
    this.setState({ loadingHistory: true });
    try {
      const historySlides = await this.slideService.getSlideHistory(20);
      this.setState({ historySlides, loadingHistory: false });
    } catch (e) {
      this.setState({ loadingHistory: false });
      console.error('Failed to load history:', e);
    }
  }

  async selectSlide(slide) {
    this.setState({
      selectedSlide: slide,
      view: 'detail',
      refundAmount: null,
      creatorPenalties: null
    });
    // Load images and points info for participants
    this.loadNononImages(slide.tokenIds);
    this.loadSlideParticipantsPointsInfo(slide.players, slide.tokenIds);
    // Calculate deposit if Open
    if (slide.status === SLIDE_STATUS.Open) {
      try {
        const deposit = await this.slideService.calculateRequiredDeposit(slide.id);
        const { ethers } = await import('ethers');
        this.setState({ depositAmount: ethers.utils.formatEther(deposit) });
      } catch (e) {
        console.warn('Failed to calculate deposit:', e);
      }
    }
    // Load refund amounts for Closed/Cancelled slides
    if (slide.status === SLIDE_STATUS.Closed || slide.status === SLIDE_STATUS.Cancelled) {
      this.loadRefundAmounts(slide.id);
    }
  }

  async loadRefundAmounts(slideId) {
    const { address } = this.state;
    const { ethers } = await import('ethers');

    try {
      // Check user's refund amount
      if (address) {
        const refund = await this.slideService.getRefundAmount(slideId, address);
        this.setState({ refundAmount: ethers.utils.formatEther(refund) });
      }
      // Check creator penalties
      const penalties = await this.slideService.getCreatorPenalties(slideId);
      this.setState({ creatorPenalties: ethers.utils.formatEther(penalties) });
    } catch (e) {
      console.warn('Failed to load refund amounts:', e);
    }
  }

  // --- Actions ---

  async handleApprove() {
    this.setState({ txPending: true, error: null });
    try {
      await this.slideService.approveForSlide();
      this.setState({ isApproved: true, txPending: false });
    } catch (e) {
      this.setState({ error: e.message, txPending: false });
    }
  }

  async handleJoin() {
    const { selectedSlide, selectedNononForJoin } = this.state;
    if (!selectedNononForJoin) {
      this.setState({ error: 'Please select a Nonon to slide' });
      return;
    }

    this.setState({ txPending: true, error: null });
    try {
      await this.slideService.joinSlide(selectedSlide.id, selectedNononForJoin);
      this.setState({ txPending: false });
      // Refresh slide data
      const updated = await this.slideService.getSlide(selectedSlide.id);
      this.setState({ selectedSlide: updated });
      await this.loadSlides();
    } catch (e) {
      this.setState({ error: e.message, txPending: false });
    }
  }

  async handleExecute() {
    const { selectedSlide } = this.state;
    this.setState({ txPending: true, error: null });
    try {
      await this.slideService.executeSlide(selectedSlide.id);
      this.setState({ txPending: false });
      // Refresh
      const updated = await this.slideService.getSlide(selectedSlide.id);
      this.setState({ selectedSlide: updated });
      await this.loadSlides();
    } catch (e) {
      this.setState({ error: e.message, txPending: false });
    }
  }

  async handleCancel() {
    const { selectedSlide } = this.state;
    this.setState({ txPending: true, error: null });
    try {
      await this.slideService.cancelSlide(selectedSlide.id);
      this.setState({ txPending: false });
      const updated = await this.slideService.getSlide(selectedSlide.id);
      this.setState({ selectedSlide: updated });
      await this.loadSlides();
    } catch (e) {
      this.setState({ error: e.message, txPending: false });
    }
  }

  async handleClaimRefund() {
    const { selectedSlide } = this.state;
    this.setState({ txPending: true, error: null });
    try {
      await this.slideService.claimRefund(selectedSlide.id);
      this.setState({ txPending: false, refundAmount: '0' });
    } catch (e) {
      this.setState({ error: e.message, txPending: false });
    }
  }

  async handleClaimPenalties() {
    const { selectedSlide } = this.state;
    this.setState({ txPending: true, error: null });
    try {
      await this.slideService.claimCreatorPenalties(selectedSlide.id);
      this.setState({ txPending: false, creatorPenalties: '0' });
    } catch (e) {
      this.setState({ error: e.message, txPending: false });
    }
  }

  async handleCreateSlide() {
    const { createMinPlayers, createMaxPlayers, createCreatorOnly } = this.state;
    this.setState({ txPending: true, error: null, showCreateModal: false });
    try {
      const { slideId } = await this.slideService.createSlide(
        createMinPlayers,
        createMaxPlayers,
        createCreatorOnly
      );
      this.setState({ txPending: false });
      await this.loadSlides();
      // Navigate to the new slide
      const slide = await this.slideService.getSlide(slideId);
      this.selectSlide(slide);
    } catch (e) {
      this.setState({ error: e.message, txPending: false });
    }
  }

  // --- Render Helpers ---

  truncateAddress(addr) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  isUserInSlide(slide) {
    const { address } = this.state;
    if (!address || !slide.players) return false;
    return slide.players.some(p => p.toLowerCase() === address.toLowerCase());
  }

  isUserCreator(slide) {
    const { address } = this.state;
    if (!address) return false;
    return slide.creator.toLowerCase() === address.toLowerCase();
  }

  canUserExecute(slide) {
    if (slide.status !== SLIDE_STATUS.Ready) return false;
    if (!this.isUserInSlide(slide)) return false;
    if (slide.creatorOnlyExecute && !this.isUserCreator(slide)) return false;
    return true;
  }

  // --- Render Methods ---

  renderNavBar() {
    const { walletService } = this.props;

    return h('div', { className: 'nonon-bar' },
      h('button', {
        className: 'nonon-bar-back',
        onClick: () => this.props.onBack && this.props.onBack()
      }, 'Exit'),
      h('span', { className: 'nonon-bar-title' }, 'Nonon Slide'),
      h('div', { className: 'nonon-connect-wrap' },
        h(WalletButton, { walletService })
      )
    );
  }

  renderGate() {
    return h('div', { className: 'nonon-gate' },
      h('h2', null, 'You need a Nonon to slide'),
      h('p', null, 'Get a Nonon NFT to participate in slides'),
      h('a', {
        href: 'https://nonon.house/',
        target: '_blank',
        rel: 'noreferrer'
      },
        h('button', { className: 'nonon-gate-btn' }, 'Get a Nonon')
      )
    );
  }

  renderNononHouseSection() {
    const { collectionDescription } = this.state;

    return h('div', { className: 'nonon-house-section' },
      h('div', { className: 'nonon-house-content' },
        h('h2', null, 'About Nonon'),
        h('p', { className: 'nonon-house-description' },
          collectionDescription || 'nonon is a 5,000 piece collection of vibrant hand-painted characters by the artist known as three; an experiment in living blockchain art featuring a 100% on-chain dynamic soulbound token that acts as both your pass to a one of a kind on chain collectathon and a key to unlocking new friendships.'
        ),
        h('div', { className: 'nonon-house-links' },
          h('a', {
            href: 'https://nonon.house/',
            target: '_blank',
            rel: 'noreferrer',
            className: 'nonon-house-link'
          }, 'nonon.house'),
          h('a', {
            href: 'https://x.com/nonon_house',
            target: '_blank',
            rel: 'noreferrer',
            className: 'nonon-house-link'
          }, '@nonon_house')
        )
      )
    );
  }

  renderInfoSection() {
    const contractUrl = 'https://etherscan.io/address/0xeddC891e17471071A7a5F9aa10178C57fAc6F352';

    return h('div', { className: 'nonon-info-section' },
      h('div', { className: 'nonon-info-overview' },
        h('h2', null, 'What is Nonon Slide?'),
        h('p', null,
          'Nonon Slide is a social game for Nonon holders. Players join a slide with their Nonon, ' +
          'and when the slide executes, everyone\'s Nonon gets sent to the next player in the circle. ' +
          'It\'s a fun way to trade Nonons with friends and earn Friend Card points!'
        ),
        h('a', {
          href: contractUrl,
          target: '_blank',
          rel: 'noreferrer',
          className: 'nonon-contract-link'
        }, 'View Contract on Etherscan')
      ),
      h('div', { className: 'nonon-faq' },
        h('h3', null, 'FAQ'),
        h('div', { className: 'nonon-faq-item' },
          h('h4', null, 'Are my NFTs safe?'),
          h('p', null,
            'Yes! The contract is designed to only transfer NFTs to the next position in a slide, ' +
            'and it is always a complete loop. Everyone in a slide will always receive a Nonon ' +
            'for every one they send. The contract is fully on-chain and trustless.'
          )
        ),
        h('div', { className: 'nonon-faq-item' },
          h('h4', null, 'Do I still get Friend Card points?'),
          h('p', null,
            'Yes! This is why you don\'t send your Nonon to the contract directly. Instead, you ' +
            'approve the contract to transfer NFTs from your wallet. When the slide executes, ' +
            'transfers happen wallet-to-wallet, triggering Friend Card points. Look for the "+1" ' +
            'badge on Nonons that haven\'t been sent yet.'
          )
        ),
        h('div', { className: 'nonon-faq-item' },
          h('h4', null, 'Why do I have to deposit ETH?'),
          h('p', null,
            'The deposit covers gas fees for executing the slide. When the slide runs, it transfers ' +
            'multiple NFTs in one transaction. Any unused ETH is refunded. This ensures slides can ' +
            'always execute without someone having to pay for everyone.'
          )
        )
      )
    );
  }

  renderDisclaimer() {
    return h('div', { className: 'nonon-disclaimer' },
      h('p', null,
        'Nonon Slide is an independent fan project by Mony Group Corp. We are not affiliated with, ' +
        'endorsed by, or officially connected to Nonon House or the N.I.I.T. syndicate. ' +
        'We just think they\'re great and built this for fun. All Nonon IP belongs to its respective creators.'
      )
    );
  }

  renderBrowseView() {
    const { slides, loading, connected } = this.state;

    return h('div', { className: 'nonon-browse' },
      h('div', { className: 'nonon-browse-header' },
        h('h1', null, 'Active Slides'),
        h('div', { className: 'nonon-browse-actions' },
          h('button', {
            className: 'nonon-history-btn',
            onClick: () => {
              this.setState({ view: 'history' });
              this.loadHistory();
            }
          }, 'History'),
          connected && h('button', {
            className: 'nonon-create-btn',
            onClick: () => this.setState({ showCreateModal: true })
          }, 'Create Slide')
        )
      ),
      loading
        ? h('div', { className: 'nonon-loading' }, 'Loading slides...')
        : slides.length === 0
          ? h('div', { className: 'nonon-empty' },
              h('p', null, 'No active slides'),
              h('p', null, 'Be the first to create one!')
            )
          : h('div', { className: 'nonon-slide-list' },
              ...slides.map(slide => this.renderSlideCard(slide))
            ),
      this.renderOwnedNonons(),
      this.renderNononHouseSection(),
      this.renderInfoSection(),
      this.renderDisclaimer()
    );
  }

  renderOwnedNonons() {
    const { connected, hasNonon, ownedNonons, nononImages, nononPointsInfo, loadingNonons } = this.state;

    if (!connected) {
      return null;
    }

    if (loadingNonons) {
      return h('div', { className: 'nonon-owned-section' },
        h('div', { className: 'nonon-owned-header' },
          h('h2', null, 'Your Nonons'),
          h('span', { className: 'nonon-owned-count' }, 'Loading...')
        ),
        h('div', { className: 'nonon-loading' }, 'Loading your Nonons...')
      );
    }

    if (!hasNonon || ownedNonons.length === 0) {
      return null;
    }

    return h('div', { className: 'nonon-owned-section' },
      h('div', { className: 'nonon-owned-header' },
        h('h2', null, 'Your Nonons'),
        h('span', { className: 'nonon-owned-count' }, `${ownedNonons.length} owned`)
      ),
      h('div', { className: 'nonon-owned-grid' },
        ...ownedNonons.map(tokenId => {
          const imageUrl = nononImages[tokenId];
          const pointsInfo = nononPointsInfo[tokenId];

          const canEarnPoint = pointsInfo && !pointsInfo.hasSent;

          return h('div', {
            className: `nonon-owned-item ${canEarnPoint ? 'can-earn' : ''}`,
            key: tokenId
          },
            canEarnPoint && h('div', { className: 'nonon-point-banner' }, '+1'),
            imageUrl
              ? h('img', { src: imageUrl, alt: `Nonon #${tokenId}` })
              : h('div', { className: 'nonon-owned-placeholder' }, `#${tokenId}`),
            h('div', { className: 'nonon-owned-id' }, `#${tokenId}`),
            h('div', { className: 'nonon-slide-hint' },
              pointsInfo ? (pointsInfo.hasSent ? '...' : 'send me!') : ''
            )
          );
        })
      )
    );
  }

  renderSlideCard(slide) {
    const statusClass = slide.status === SLIDE_STATUS.Open ? 'open' : 'ready';

    return h('div', {
      className: 'nonon-slide-card',
      key: slide.id,
      onClick: () => this.selectSlide(slide)
    },
      h('div', { className: 'nonon-slide-card-header' },
        h('span', { className: 'nonon-slide-card-id' }, `Slide #${slide.id}`),
        h('span', { className: `nonon-slide-card-status ${statusClass}` },
          SLIDE_STATUS_LABELS[slide.status]
        )
      ),
      h('div', { className: 'nonon-slide-card-info' },
        h('span', null, `${slide.players.length} / ${slide.maxPlayers || '∞'} players`),
        h('span', null, `Created by ${this.truncateAddress(slide.creator)}`)
      )
    );
  }

  renderDetailView() {
    const { selectedSlide, error } = this.state;
    if (!selectedSlide) return null;

    const slide = selectedSlide;
    const isInSlide = this.isUserInSlide(slide);
    const isCreator = this.isUserCreator(slide);

    return h('div', { className: 'nonon-detail' },
      h('button', {
        className: 'nonon-detail-back',
        onClick: () => this.setState({ view: 'browse', selectedSlide: null })
      }, '← Back to slides'),

      h('div', { className: 'nonon-detail-header' },
        h('div', null,
          h('h1', { className: 'nonon-detail-title' }, `Slide #${slide.id}`),
          h('p', { className: 'nonon-detail-creator' },
            'Created by ',
            h('a', {
              href: `https://etherscan.io/address/${slide.creator}`,
              target: '_blank'
            }, this.truncateAddress(slide.creator))
          )
        ),
        h('div', { className: 'nonon-detail-stats' },
          h('div', { className: 'nonon-detail-stat' },
            h('div', { className: 'nonon-detail-stat-value' }, slide.players.length),
            h('div', { className: 'nonon-detail-stat-label' }, 'Players')
          ),
          h('div', { className: 'nonon-detail-stat' },
            h('div', { className: 'nonon-detail-stat-value' },
              `${slide.minPlayers}-${slide.maxPlayers || '∞'}`
            ),
            h('div', { className: 'nonon-detail-stat-label' }, 'Min-Max')
          ),
          h('div', { className: 'nonon-detail-stat' },
            h('div', { className: 'nonon-detail-stat-value' },
              SLIDE_STATUS_LABELS[slide.status]
            ),
            h('div', { className: 'nonon-detail-stat-label' }, 'Status')
          )
        )
      ),

      error && h('div', { className: 'nonon-error' }, error),

      this.renderCascade(slide),
      this.renderActions(slide, isInSlide, isCreator)
    );
  }

  renderCascade(slide) {
    const { players, tokenIds } = slide;
    if (players.length === 0) {
      return h('div', { className: 'nonon-cascade' },
        h('p', { className: 'nonon-cascade-title' }, 'No participants yet')
      );
    }

    const useCircle = players.length <= CIRCLE_LAYOUT_MAX;

    return h('div', { className: 'nonon-cascade' },
      h('p', { className: 'nonon-cascade-title' }, 'The Cascade'),
      useCircle
        ? this.renderCascadeCircle(players, tokenIds)
        : this.renderCascadeLinear(players, tokenIds)
    );
  }

  renderCascadeCircle(players, tokenIds) {
    const { nononImages, nononPointsInfo } = this.state;
    const count = players.length;
    const radius = 150;
    const centerX = 200;
    const centerY = 200;

    return h('div', { className: 'nonon-cascade-circle' },
      ...players.map((player, i) => {
        const angle = (2 * Math.PI * i / count) - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle) - 40;
        const y = centerY + radius * Math.sin(angle) - 40;
        const tokenId = tokenIds[i];
        const imageUrl = nononImages[tokenId];
        const pointsInfo = nononPointsInfo[tokenId];
        const canEarnPoint = pointsInfo && !pointsInfo.hasSent;

        return h('div', {
          className: `nonon-cascade-participant ${canEarnPoint ? 'can-earn' : ''}`,
          style: { left: `${x}px`, top: `${y}px` },
          key: i
        },
          canEarnPoint && h('div', { className: 'nonon-point-banner small' }, '+1'),
          imageUrl
            ? h('img', { className: 'nonon-cascade-nft', src: imageUrl, alt: `Nonon #${tokenId}` })
            : h('div', { className: 'nonon-cascade-nft-placeholder' }, `#${tokenId}`),
          h('div', { className: 'nonon-cascade-address' }, this.truncateAddress(player))
        );
      })
    );
  }

  renderCascadeLinear(players, tokenIds) {
    const { nononImages, nononPointsInfo } = this.state;

    return h('div', { className: 'nonon-cascade-linear' },
      ...players.map((player, i) => {
        const tokenId = tokenIds[i];
        const imageUrl = nononImages[tokenId];
        const nextPlayer = players[(i + 1) % players.length];
        const pointsInfo = nononPointsInfo[tokenId];
        const canEarnPoint = pointsInfo && !pointsInfo.hasSent;

        return h('div', { className: `nonon-cascade-row ${canEarnPoint ? 'can-earn' : ''}`, key: i },
          h('div', { className: 'nonon-cascade-nft-wrap' },
            canEarnPoint && h('div', { className: 'nonon-point-banner small' }, '+1'),
            imageUrl
              ? h('img', { className: 'nonon-cascade-nft', src: imageUrl, alt: `Nonon #${tokenId}` })
              : h('div', { className: 'nonon-cascade-nft-placeholder' }, `#${tokenId}`)
          ),
          h('div', { className: 'nonon-cascade-row-info' },
            h('div', { className: 'nonon-cascade-row-address' }, this.truncateAddress(player)),
            h('div', { className: 'nonon-cascade-row-token' }, `Nonon #${tokenId}`)
          ),
          h('span', { className: 'nonon-cascade-arrow' }, '→'),
          h('span', { style: { color: 'rgba(255,255,255,0.7)', fontSize: '12px' } }, this.truncateAddress(nextPlayer))
        );
      })
    );
  }

  renderActions(slide, isInSlide, isCreator) {
    const { connected, isApproved, selectedNononForJoin, depositAmount, hasNonon } = this.state;

    if (!connected) {
      return h('div', { className: 'nonon-actions' },
        h('p', null, 'Connect your wallet to participate')
      );
    }

    if (!hasNonon) {
      return h('div', { className: 'nonon-actions' },
        h('p', null, 'You need a Nonon to join slides')
      );
    }

    // Open slide - can join
    if (slide.status === SLIDE_STATUS.Open && !isInSlide) {
      return h('div', { className: 'nonon-actions' },
        h('h3', { className: 'nonon-actions-title' }, 'Join this Slide'),
        this.renderNononPicker(),
        depositAmount && h('div', { className: 'nonon-deposit-info' },
          h('p', null,
            'Required deposit: ',
            h('span', { className: 'amount' }, `${depositAmount} ETH`),
            ' (refunded after slide)'
          )
        ),
        !isApproved
          ? h('button', {
              className: 'nonon-action-btn',
              onClick: () => this.handleApprove()
            }, 'Approve Nonon for Sliding')
          : h('button', {
              className: 'nonon-action-btn',
              onClick: () => this.handleJoin(),
              disabled: !selectedNononForJoin
            }, 'Join Slide')
      );
    }

    // Ready slide - can execute
    if (slide.status === SLIDE_STATUS.Ready) {
      return h('div', { className: 'nonon-actions' },
        h('h3', { className: 'nonon-actions-title' }, 'Slide is Ready!'),
        this.canUserExecute(slide) && h('button', {
          className: 'nonon-action-btn',
          onClick: () => this.handleExecute()
        }, 'Execute Slide'),
        isCreator && h('button', {
          className: 'nonon-action-btn secondary',
          onClick: () => this.handleCancel()
        }, 'Cancel Slide')
      );
    }

    // Open slide but already joined
    if (slide.status === SLIDE_STATUS.Open && isInSlide) {
      return h('div', { className: 'nonon-actions' },
        h('h3', { className: 'nonon-actions-title' }, 'You\'re in this slide'),
        h('p', null, `Waiting for ${slide.minPlayers - slide.players.length} more player(s)...`),
        isCreator && h('button', {
          className: 'nonon-action-btn danger',
          onClick: () => this.handleCancel()
        }, 'Cancel Slide')
      );
    }

    // Closed/Cancelled - claim refund
    if (slide.status === SLIDE_STATUS.Closed || slide.status === SLIDE_STATUS.Cancelled) {
      const { refundAmount, creatorPenalties } = this.state;
      const hasRefund = refundAmount && parseFloat(refundAmount) > 0;
      const hasPenalties = creatorPenalties && parseFloat(creatorPenalties) > 0;

      return h('div', { className: 'nonon-actions' },
        h('h3', { className: 'nonon-actions-title' },
          slide.status === SLIDE_STATUS.Closed ? 'Slide Complete!' : 'Slide Cancelled'
        ),
        hasRefund && h('button', {
          className: 'nonon-action-btn',
          onClick: () => this.handleClaimRefund()
        }, `Claim Refund (${refundAmount} ETH)`),
        isCreator && hasPenalties && h('button', {
          className: 'nonon-action-btn secondary',
          onClick: () => this.handleClaimPenalties()
        }, `Claim Penalties (${creatorPenalties} ETH)`),
        !hasRefund && !hasPenalties && h('p', null, 'No refunds available')
      );
    }

    return null;
  }

  renderNononPicker() {
    const { ownedNonons, nononImages, nononPointsInfo, selectedNononForJoin } = this.state;

    if (ownedNonons.length === 0) {
      return h('p', null, 'Loading your Nonons...');
    }

    // Sort by can earn point (hasn't sent = can earn, show first)
    const sortedNonons = [...ownedNonons].sort((a, b) => {
      const aInfo = nononPointsInfo[a];
      const bInfo = nononPointsInfo[b];
      const aCanEarn = aInfo && !aInfo.hasSent ? 1 : 0;
      const bCanEarn = bInfo && !bInfo.hasSent ? 1 : 0;
      return bCanEarn - aCanEarn;
    });

    return h('div', { className: 'nonon-picker' },
      h('p', { className: 'nonon-picker-title' }, 'Select a Nonon to slide (sorted by potential points):'),
      h('div', { className: 'nonon-picker-grid' },
        ...sortedNonons.map(tokenId => {
          const isSelected = selectedNononForJoin === tokenId;
          const imageUrl = nononImages[tokenId];
          const pointsInfo = nononPointsInfo[tokenId];

          const canEarnPoint = pointsInfo && !pointsInfo.hasSent;

          return h('div', {
            className: `nonon-picker-item ${isSelected ? 'selected' : ''} ${canEarnPoint ? 'can-earn' : ''}`,
            key: tokenId,
            onClick: () => this.setState({ selectedNononForJoin: tokenId })
          },
            canEarnPoint && h('div', { className: 'nonon-point-banner' }, '+1'),
            imageUrl
              ? h('img', { src: imageUrl, alt: `Nonon #${tokenId}` })
              : h('div', { className: 'nonon-cascade-nft-placeholder' }, `#${tokenId}`),
            h('div', { className: 'nonon-picker-item-id' }, `#${tokenId}`)
          );
        })
      )
    );
  }

  renderCreateModal() {
    const { showCreateModal, createMinPlayers, createMaxPlayers, createCreatorOnly } = this.state;
    if (!showCreateModal) return null;

    return h('div', { className: 'nonon-modal-overlay' },
      h('div', { className: 'nonon-modal' },
        h('h2', null, 'Create a Slide'),
        h('div', { className: 'nonon-modal-field' },
          h('label', null, 'Minimum Players'),
          h('input', {
            type: 'number',
            min: 2,
            value: createMinPlayers,
            onInput: (e) => this.setState({ createMinPlayers: parseInt(e.target.value) || 2 })
          })
        ),
        h('div', { className: 'nonon-modal-field' },
          h('label', null, 'Maximum Players (0 = unlimited)'),
          h('input', {
            type: 'number',
            min: 0,
            value: createMaxPlayers,
            onInput: (e) => this.setState({ createMaxPlayers: parseInt(e.target.value) || 0 })
          })
        ),
        h('div', { className: 'nonon-modal-field' },
          h('label', { className: 'nonon-modal-checkbox' },
            h('input', {
              type: 'checkbox',
              checked: createCreatorOnly,
              onChange: (e) => this.setState({ createCreatorOnly: e.target.checked })
            }),
            'Only I can execute this slide'
          )
        ),
        h('div', { className: 'nonon-modal-actions' },
          h('button', {
            className: 'nonon-action-btn secondary',
            onClick: () => this.setState({ showCreateModal: false })
          }, 'Cancel'),
          h('button', {
            className: 'nonon-action-btn',
            onClick: () => this.handleCreateSlide()
          }, 'Create')
        )
      )
    );
  }

  renderHistoryView() {
    const { historySlides, loadingHistory } = this.state;

    return h('div', { className: 'nonon-history' },
      h('div', { className: 'nonon-browse-header' },
        h('h1', null, 'Slide History'),
        h('button', {
          className: 'nonon-history-btn',
          onClick: () => this.setState({ view: 'browse' })
        }, 'Back to Active')
      ),
      loadingHistory
        ? h('div', { className: 'nonon-loading' }, 'Loading history...')
        : historySlides.length === 0
          ? h('div', { className: 'nonon-empty' },
              h('p', null, 'No completed slides yet')
            )
          : h('div', { className: 'nonon-slide-list' },
              ...historySlides.map(slide => this.renderHistoryCard(slide))
            )
    );
  }

  renderHistoryCard(slide) {
    return h('div', {
      className: 'nonon-slide-card history',
      key: slide.id,
      onClick: () => this.selectSlide(slide)
    },
      h('div', { className: 'nonon-slide-card-header' },
        h('span', { className: 'nonon-slide-card-id' }, `Slide #${slide.id}`),
        h('span', { className: 'nonon-slide-card-status closed' }, 'Completed')
      ),
      h('div', { className: 'nonon-slide-card-info' },
        h('span', null, `${slide.players.length} players`),
        h('span', null, `Created by ${this.truncateAddress(slide.creator)}`)
      )
    );
  }

  renderTxPending() {
    const { txPending } = this.state;
    if (!txPending) return null;

    return h('div', { className: 'nonon-tx-pending' },
      h('div', { className: 'nonon-loading' }, '...'),
      h('p', null, 'Transaction pending...')
    );
  }

  render() {
    const { view, hasNonon, connected } = this.state;

    // Gate for non-holders (only if connected and no Nonon)
    const showGate = connected && !hasNonon && view !== 'browse';

    return h('div', { className: 'nononslide-page' },
      this.renderNavBar(),
      h('div', { className: 'nonon-main' },
        showGate
          ? this.renderGate()
          : view === 'detail'
            ? this.renderDetailView()
            : view === 'history'
              ? this.renderHistoryView()
              : this.renderBrowseView()
      ),
      this.renderCreateModal(),
      this.renderTxPending()
    );
  }
}

export default NononSlide;
