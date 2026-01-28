import { Component, h } from '@monygroupcorp/microact';
// import { IpfsImage } from '@monygroupcorp/micro-web3';

class CollectionCard extends Component {
  render() {
    const { collection, balance, tokenBalance, error, loading } = this.props;
    const isERC20 = collection.standard === 'ERC-20';
    const isERC404 = collection.standard === 'ERC-404';
    const isEmpty = !loading && balance === 0 && (!tokenBalance || parseFloat(tokenBalance) === 0);
    const hasLink = !!collection.opensea;
    const cardClass = 'collection-card'
      + (isEmpty ? ' collection-card--empty' : '')
      + (hasLink ? ' collection-card--linked' : '');

    return h('div', {
      className: cardClass,
      onClick: hasLink ? () => window.open(collection.opensea, '_blank', 'noopener') : undefined
    },
      h('div', { className: 'collection-card__header' },
        h('img', {
          className: 'collection-card__icon',
          src: collection.image,
          alt: collection.name
        }),
        h('span', { className: 'collection-card__name' }, collection.name),
        !loading && balance > 0 && !isERC20 &&
          h('span', { className: 'collection-card__badge' }, 'x' + balance)
      ),

      loading && h('div', { className: 'collection-card__loading' },
        h('div', { className: 'wallet-spinner' })
      ),

      error && h('p', { className: 'collection-card__error' }, error),

      !loading && isERC20 && balance &&
        h('div', { className: 'collection-card__erc20-balance' },
          h('span', { className: 'collection-card__erc20-value' }, balance),
          h('span', { className: 'collection-card__erc20-symbol' }, collection.name)
        ),

      !loading && isERC404 && tokenBalance &&
        h('div', { className: 'collection-card__erc20-balance' },
          h('span', { className: 'collection-card__erc20-value' }, tokenBalance),
          h('span', { className: 'collection-card__erc20-symbol' }, collection.name)
        ),

      // ── Token gallery (earmarked for future expansion) ──
      // !loading && !isERC20 && tokens && tokens.length > 0 &&
      //   h('div', { className: 'collection-card__gallery' },
      //     ...tokens.map(token =>
      //       h('button', {
      //         key: token.id,
      //         className: 'collection-card__thumb',
      //         onClick: () => onTokenClick(token, collection)
      //       },
      //         token.image
      //           ? h(IpfsImage, {
      //               src: token.image,
      //               alt: token.name || '#' + token.id,
      //               className: 'collection-card__thumb-img'
      //             })
      //           : h('div', { className: 'collection-card__thumb-placeholder' }, '#' + token.id)
      //       )
      //     )
      //   ),

      isEmpty && !loading &&
        h('p', { className: 'collection-card__empty' }, 'No holdings')
    );
  }
}

export default CollectionCard;
