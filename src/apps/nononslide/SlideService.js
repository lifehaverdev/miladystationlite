import {
  NONON_SLIDE_ADDRESS,
  NONON_NFT_ADDRESS,
  FRIEND_CARD_ADDRESS,
  NONON_SLIDE_ABI,
  NONON_NFT_ABI,
  FRIEND_CARD_ABI,
  GAS_ESTIMATE_PER_PLAYER,
  SLIDE_STATUS
} from './constants.js';
import { IpfsService } from '@monygroupcorp/micro-web3';

// Fork mode detection
const USE_FORK = import.meta.env.VITE_USE_FORK === 'true';
const FORK_RPC_URL = 'http://127.0.0.1:8545';

/**
 * SlideService - handles all NononSlideV2 contract interactions
 */
class SlideService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.slideContract = null;
    this.nononContract = null;
    this.friendCardContract = null;
  }

  async initialize() {
    const { ethers } = await import('ethers');

    // Use fork RPC in fork mode, otherwise use wallet or public RPC
    if (USE_FORK) {
      this.provider = new ethers.providers.JsonRpcProvider(FORK_RPC_URL);
    } else if (window.ethereum) {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
    } else {
      this.provider = new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com');
    }

    this.slideContract = new ethers.Contract(
      NONON_SLIDE_ADDRESS,
      NONON_SLIDE_ABI,
      this.provider
    );

    this.nononContract = new ethers.Contract(
      NONON_NFT_ADDRESS,
      NONON_NFT_ABI,
      this.provider
    );

    this.friendCardContract = new ethers.Contract(
      FRIEND_CARD_ADDRESS,
      FRIEND_CARD_ABI,
      this.provider
    );
  }

  async getSigner() {
    if (!window.ethereum) throw new Error('No wallet connected');
    const { ethers } = await import('ethers');
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return provider.getSigner();
  }

  // --- Read Functions ---

  async getNextSlideId() {
    return (await this.slideContract.nextSlideId()).toNumber();
  }

  async getSlide(slideId) {
    const data = await this.slideContract.slides(slideId);
    const [players, tokenIds] = await this.slideContract.getSlideParticipants(slideId);

    return {
      id: slideId,
      creator: data.creator,
      gasPriceStandard: data.gasPriceStandard,
      minPlayers: data.minPlayers?.toNumber() || 0,
      maxPlayers: data.maxPlayers?.toNumber() || 0,
      pot: data.pot,
      status: data.status,
      creatorOnlyExecute: data.creatorOnlyExecute,
      creatorPenalties: data.creatorPenalties,
      players: players,
      tokenIds: tokenIds.map(t => t.toNumber())
    };
  }

  async getActiveSlides() {
    const nextId = await this.getNextSlideId();
    const slides = [];

    // Fetch slides in reverse order (newest first)
    for (let i = nextId - 1; i >= 0; i--) {
      try {
        const slide = await this.getSlide(i);
        // Only include Open or Ready slides
        if (slide.status === SLIDE_STATUS.Open || slide.status === SLIDE_STATUS.Ready) {
          slides.push(slide);
        }
      } catch (e) {
        // Skip slides that fail to load
      }
    }

    return slides;
  }

  async getSlideHistory(limit = 20) {
    // Query SlideExecuted events to find completed slides
    const filter = this.slideContract.filters.SlideExecuted();
    const events = await this.slideContract.queryFilter(filter);

    // Get the most recent ones (reversed, limited)
    const recentEvents = events.slice(-limit).reverse();

    // Fetch full slide data for each
    const slides = [];
    for (const event of recentEvents) {
      try {
        const slideId = event.args.slideId.toNumber();
        const slide = await this.getSlide(slideId);
        slide.executedBy = event.args.executor;
        slide.executedAt = event.blockNumber;
        slides.push(slide);
      } catch (e) {
        // Skip slides that fail to load
      }
    }

    return slides;
  }

  async getRefundAmount(slideId, address) {
    const amount = await this.slideContract.getRefundAmount(slideId, address);
    return amount;
  }

  async getCreatorPenalties(slideId) {
    const amount = await this.slideContract.getCreatorPenalties(slideId);
    return amount;
  }

  // --- Nonon NFT Functions ---

  async getNononBalance(address) {
    const balance = await this.nononContract.balanceOf(address);
    return balance.toNumber();
  }

  async getNononsOwned(address) {
    try {
      const tokenIds = await this.nononContract.tokensOfOwner(address);
      return tokenIds.map(t => t.toNumber());
    } catch (e) {
      // Fallback if tokensOfOwner not available
      console.warn('tokensOfOwner failed, returning empty:', e);
      return [];
    }
  }

  async getNononMetadata(tokenId) {
    try {
      const uri = await this.nononContract.tokenURI(tokenId);
      const url = IpfsService.resolveUrl(uri);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`Failed to fetch metadata for token ${tokenId}:`, e.message);
      return null;
    }
  }

  async isApprovedForSlide(address) {
    return await this.nononContract.isApprovedForAll(address, NONON_SLIDE_ADDRESS);
  }

  // --- Friend Card Functions ---

  async hasSentToken(address, tokenId) {
    try {
      return await this.friendCardContract.hasSentToken(address, tokenId);
    } catch (e) {
      return false;
    }
  }

  async hasReceivedToken(address, tokenId) {
    try {
      return await this.friendCardContract.hasReceivedToken(address, tokenId);
    } catch (e) {
      return false;
    }
  }

  async getNononPointsInfo(address, tokenId) {
    try {
      const [hasSent, hasReceived] = await Promise.all([
        this.hasSentToken(address, tokenId),
        this.hasReceivedToken(address, tokenId)
      ]);
      return { hasSent, hasReceived };
    } catch (e) {
      return { hasSent: false, hasReceived: false };
    }
  }

  // --- Write Functions ---

  async approveForSlide() {
    const signer = await this.getSigner();
    const contract = this.nononContract.connect(signer);
    const tx = await contract.setApprovalForAll(NONON_SLIDE_ADDRESS, true);
    return await tx.wait();
  }

  async createSlide(minPlayers, maxPlayers, creatorOnlyExecute) {
    const signer = await this.getSigner();
    const contract = this.slideContract.connect(signer);

    // Estimate gas with buffer
    const gasEstimate = await contract.estimateGas.createSlide(minPlayers, maxPlayers, creatorOnlyExecute);
    const gasLimit = gasEstimate.mul(150).div(100);

    const tx = await contract.createSlide(minPlayers, maxPlayers, creatorOnlyExecute, { gasLimit });
    const receipt = await tx.wait();

    // Parse SlideCreated event to get slideId
    const event = receipt.events?.find(e => e.event === 'SlideCreated');
    let slideId;
    if (event?.args?.slideId) {
      slideId = event.args.slideId.toNumber();
    } else if (receipt.events?.length > 0 && receipt.events[0].args?.[0]) {
      const arg = receipt.events[0].args[0];
      slideId = typeof arg.toNumber === 'function' ? arg.toNumber() : Number(arg);
    }

    return { receipt, slideId };
  }

  async calculateRequiredDeposit(slideId) {
    const slide = await this.getSlide(slideId);

    if (!slide.gasPriceStandard) {
      const { ethers } = await import('ethers');
      return ethers.utils.parseEther('0.001');
    }

    // (GAS_ESTIMATE_PER_PLAYER * gasPriceStandard * 110) / 100
    const deposit = slide.gasPriceStandard
      .mul(GAS_ESTIMATE_PER_PLAYER)
      .mul(110)
      .div(100);
    return deposit;
  }

  async joinSlide(slideId, tokenId) {
    const deposit = await this.calculateRequiredDeposit(slideId);
    const signer = await this.getSigner();
    const contract = this.slideContract.connect(signer);
    const gasEstimate = await contract.estimateGas.joinSlide(slideId, tokenId, { value: deposit });
    const gasLimit = gasEstimate.mul(150).div(100);
    const tx = await contract.joinSlide(slideId, tokenId, { value: deposit, gasLimit });
    return await tx.wait();
  }

  async executeSlide(slideId) {
    const signer = await this.getSigner();
    const contract = this.slideContract.connect(signer);
    const gasEstimate = await contract.estimateGas.executeSlide(slideId);
    const gasLimit = gasEstimate.mul(150).div(100);
    const tx = await contract.executeSlide(slideId, { gasLimit });
    return await tx.wait();
  }

  async cancelSlide(slideId) {
    const signer = await this.getSigner();
    const contract = this.slideContract.connect(signer);
    const gasEstimate = await contract.estimateGas.cancelSlide(slideId);
    const gasLimit = gasEstimate.mul(150).div(100);
    const tx = await contract.cancelSlide(slideId, { gasLimit });
    return await tx.wait();
  }

  async claimRefund(slideId) {
    const signer = await this.getSigner();
    const contract = this.slideContract.connect(signer);
    const gasEstimate = await contract.estimateGas.claimRefund(slideId);
    const gasLimit = gasEstimate.mul(150).div(100);
    const tx = await contract.claimRefund(slideId, { gasLimit });
    return await tx.wait();
  }

  async claimCreatorPenalties(slideId) {
    const signer = await this.getSigner();
    const contract = this.slideContract.connect(signer);
    const gasEstimate = await contract.estimateGas.claimCreatorPenalties(slideId);
    const gasLimit = gasEstimate.mul(150).div(100);
    const tx = await contract.claimCreatorPenalties(slideId, { gasLimit });
    return await tx.wait();
  }
}

export default SlideService;
