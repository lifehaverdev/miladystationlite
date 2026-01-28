import { Component, h } from '@monygroupcorp/microact';

/**
 * Boot — first screen the user sees.
 * Three choices: SOUND, NO SOUND, SKIP.
 * Matches miladystationlite boot() in home.js.
 */
class Boot extends Component {
  render() {
    const { onSound, onNoSound, onSkip } = this.props;
    return h('div', { className: 'boot-screen' },
      h('button', { id: 'sound',   onClick: onSound },   'SOUND'),
      h('button', { id: 'quiet',   onClick: onNoSound }, 'NO SOUND'),
      h('button', { id: 'skip',    onClick: onSkip },    'SKIP')
    );
  }
}

export default Boot;
