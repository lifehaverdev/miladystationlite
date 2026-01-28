import { ethers } from 'ethers';
// import { IpfsService } from '@monygroupcorp/micro-web3';
import assets from './assets.json';

function truncate2(value) {
  const dot = value.indexOf('.');
  return dot === -1 ? value : value.slice(0, dot + 3);
}

export default class MemoryCardService {
  constructor(walletService) {
    this.walletService = walletService;
    this.collections = assets;
  }

  _getProvider() {
    return this.walletService.ethersProvider
      || (typeof window.ethereum !== 'undefined'
        ? new ethers.providers.Web3Provider(window.ethereum)
        : null);
  }

  _makeContract(address, abi) {
    const provider = this._getProvider();
    if (!provider) return null;
    return new ethers.Contract(address, abi, provider);
  }

  async loadHoldings(address) {
    const results = await Promise.allSettled(
      this.collections.map(col => this._loadBalance(address, col))
    );
    return results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return { collection: this.collections[i], balance: 0, error: r.reason?.message };
    });
  }

  async _loadBalance(address, collection) {
    const abi = [`function ${collection.query.balance}`];
    const contract = this._makeContract(collection.address, abi);
    if (!contract) return { collection, balance: 0, error: 'No provider' };

    if (collection.standard === 'ERC-1155') {
      const max = collection.tokenIdMax || 0;
      const ids = [];
      for (let i = 1; i <= max; i++) ids.push(i);
      const addrs = ids.map(() => address);
      const bals = await contract.balanceOfBatch(addrs, ids);
      const balance = bals.reduce((sum, b) => sum + b.toNumber(), 0);
      return { collection, balance };
    }

    if (collection.standard === 'ERC-20') {
      const raw = await contract.balanceOf(address);
      const decimals = collection.decimals || 18;
      const balance = truncate2(ethers.utils.formatUnits(raw, decimals));
      return { collection, balance };
    }

    if (collection.standard === 'ERC-404') {
      // ERC-404 has both fungible balance (18 decimals) and NFT ownership
      const enumAbi = [`function ${collection.query.enumerate}`];
      const enumContract = this._makeContract(collection.address, enumAbi);
      let nftCount = 0;
      try {
        const tokenIds = await enumContract.getOwnerTokens(address);
        nftCount = tokenIds.length;
      } catch { /* ignore */ }
      const raw = await contract.balanceOf(address);
      const tokenBalance = truncate2(ethers.utils.formatUnits(raw, 18));
      return { collection, balance: nftCount, tokenBalance };
    }

    // ERC-721
    const raw = await contract.balanceOf(address);
    return { collection, balance: raw.toNumber() };
  }

  // ──────────────────────────────────────────────────────────
  // TOKEN ENUMERATION + METADATA (earmarked for future expansion)
  // ──────────────────────────────────────────────────────────

  // async _loadCollection721(contract, address, collection, bypassCache) {
  //   const raw = await contract.balanceOf(address);
  //   const balance = raw.toNumber();
  //   if (balance === 0) return { collection, balance: 0, tokens: [] };
  //
  //   let tokenIds;
  //   try {
  //     tokenIds = await contract.tokenOfOwnerIn(address, 0, balance - 1);
  //   } catch {
  //     return { collection, balance, tokens: [] };
  //   }
  //
  //   const tokens = await this._fetchMetadataForIds(contract, collection, tokenIds);
  //   return { collection, balance, tokens };
  // }

  // async _loadCollection404(contract, address, collection, bypassCache) {
  //   let tokenIds;
  //   try {
  //     tokenIds = await contract.getOwnerTokens(address);
  //   } catch {
  //     try {
  //       const raw = await contract.balanceOf(address);
  //       const balance = parseFloat(ethers.utils.formatUnits(raw, 18));
  //       return { collection, balance: balance > 0 ? Math.floor(balance) : 0, tokens: [] };
  //     } catch {
  //       return { collection, balance: 0, tokens: [] };
  //     }
  //   }
  //
  //   const balance = tokenIds.length;
  //   if (balance === 0) return { collection, balance: 0, tokens: [] };
  //
  //   const tokens = await this._fetchMetadataForIds(contract, collection, tokenIds);
  //   return { collection, balance, tokens };
  // }

  // async _loadCollection1155(contract, address, collection, bypassCache) {
  //   const max = collection.tokenIdMax || 0;
  //   const ids = [];
  //   for (let i = 1; i <= max; i++) ids.push(i);
  //
  //   const addrs = ids.map(() => address);
  //   const bals = await contract.balanceOfBatch(addrs, ids);
  //   const idBalances = ids.map((id, i) => ({ id, balance: bals[i].toNumber() }));
  //   const held = idBalances.filter(x => x.balance > 0);
  //   const balance = held.reduce((sum, x) => sum + x.balance, 0);
  //
  //   if (balance === 0) return { collection, balance: 0, tokens: [] };
  //
  //   const tokens = [];
  //   for (const { id, balance: qty } of held) {
  //     try {
  //       const meta = await this._getMetadata(contract, collection, id);
  //       tokens.push({ id: String(id), quantity: qty, ...meta });
  //     } catch (err) {
  //       tokens.push({ id: String(id), quantity: qty, name: `Token ${id}`, image: null, attributes: [], error: err.message });
  //     }
  //   }
  //
  //   return { collection, balance, tokens };
  // }

  // async _fetchMetadataForIds(contract, collection, tokenIds) {
  //   const tokens = [];
  //   for (const tokenId of tokenIds) {
  //     try {
  //       const meta = await this._getMetadata(contract, collection, tokenId);
  //       tokens.push({ id: tokenId.toString(), ...meta });
  //     } catch (err) {
  //       tokens.push({ id: tokenId.toString(), name: `#${tokenId}`, image: null, attributes: [], error: err.message });
  //     }
  //   }
  //   return tokens;
  // }

  // async _getMetadata(contract, collection, tokenId) {
  //   const mKey = `ms1:meta:${collection.id}:${tokenId}`;
  //   try {
  //     const raw = localStorage.getItem(mKey);
  //     if (raw) return JSON.parse(raw);
  //   } catch { /* ignore */ }
  //
  //   let uri;
  //   if (collection.query.metadata.startsWith('uri(')) {
  //     uri = await contract.uri(tokenId);
  //   } else {
  //     uri = await contract.tokenURI(tokenId);
  //   }
  //
  //   if (uri && uri.includes('{id}')) {
  //     uri = uri.replace('{id}', String(tokenId));
  //   }
  //
  //   try {
  //     const json = await IpfsService.fetchJsonWithIpfsSupport(uri);
  //     const meta = {
  //       name: json.name || `#${tokenId}`,
  //       image: json.image || null,
  //       attributes: json.attributes || []
  //     };
  //     try { localStorage.setItem(mKey, JSON.stringify(meta)); } catch { /* full */ }
  //     return meta;
  //   } catch {
  //     return { name: `#${tokenId}`, image: null, attributes: [] };
  //   }
  // }
}
