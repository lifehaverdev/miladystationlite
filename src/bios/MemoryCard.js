import { Component, h } from '@monygroupcorp/microact';

/**
 * MemoryCard — BIOS wallet profile placeholder.
 *
 * Will eventually show wallet connection state,
 * owned NFTs, and profile info.
 * Placeholder structure only.
 */
class MemoryCard extends Component {
  render() {
    const { navigate } = this.props;
    return h('div', { className: 'memory-card' },
      h('h2', null, 'MEMORY CARD'),
      h('p', null, 'Wallet profile placeholder. Connect wallet to view your identity and holdings.'),
      h('button', { onClick: () => navigate('biosLanding') }, 'BACK')
    );
  }
}

export default MemoryCard;
