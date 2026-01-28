import { Component, h } from '@monygroupcorp/microact';
import { IpfsImage } from '@monygroupcorp/micro-web3';

class TokenModal extends Component {
  _onBackdropClick(e) {
    if (e.target === e.currentTarget) {
      this.props.onClose();
    }
  }

  render() {
    const { token, collection, onClose } = this.props;
    if (!token) return null;

    const etherscanUrl = `https://etherscan.io/token/${collection.address}?a=${token.id}`;

    return h('div', {
      className: 'token-modal-backdrop',
      onClick: this.bind(this._onBackdropClick)
    },
      h('div', { className: 'token-modal' },
        h('div', { className: 'token-modal__header' },
          h('h3', null, token.name || '#' + token.id),
          h('button', {
            className: 'token-modal__close',
            onClick: onClose
          }, '\u00D7')
        ),

        h('div', { className: 'token-modal__image' },
          token.image
            ? h(IpfsImage, {
                src: token.image,
                alt: token.name || '#' + token.id,
                className: 'token-modal__img'
              })
            : h('div', { className: 'token-modal__img-placeholder' }, '#' + token.id)
        ),

        h('div', { className: 'token-modal__info' },
          h('p', { className: 'token-modal__collection' }, collection.name),
          h('p', { className: 'token-modal__id' }, 'Token #' + token.id),
          token.quantity && token.quantity > 1 &&
            h('p', { className: 'token-modal__quantity' }, 'Quantity: x' + token.quantity)
        ),

        token.attributes && token.attributes.length > 0 &&
          h('div', { className: 'token-modal__traits' },
            ...token.attributes.map(attr =>
              h('div', { key: attr.trait_type, className: 'token-modal__trait' },
                h('span', { className: 'token-modal__trait-type' }, attr.trait_type),
                h('span', { className: 'token-modal__trait-value' }, String(attr.value))
              )
            )
          ),

        h('a', {
          className: 'token-modal__link',
          href: etherscanUrl,
          target: '_blank',
          rel: 'noopener'
        }, 'View on Etherscan')
      )
    );
  }
}

export default TokenModal;
