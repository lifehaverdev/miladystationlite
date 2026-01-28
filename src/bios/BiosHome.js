import { Component, h } from '@monygroupcorp/microact';
import { MAIN_ASSETS } from '../config.js';

/**
 * BiosHome — PSone BIOS landing screen.
 * Two options: Memory Card and CD Player.
 */
class BiosHome extends Component {
  render() {
    const { navigate } = this.props;
    return h('div', {
      className: 'bios-home',
      style: `background-image:url(${MAIN_ASSETS}/ms_menu.jpeg)`
    },
      h('div', { className: 'bios-options' },
        h('button', {
          className: 'bios-option',
          onClick: () => navigate('memoryCard')
        },
          h('span', { className: 'bios-label', style: 'background:rgb(210,181,63)' }, 'Memory Card'),
          h('span', { className: 'bios-icon' }, '\uD83D\uDCBE')
        ),
        h('button', {
          className: 'bios-option',
          onClick: () => navigate('cdMenu')
        },
          h('span', { className: 'bios-label', style: 'background:rgb(135,25,15)' }, 'CD Player'),
          h('span', { className: 'bios-icon' }, '\uD83D\uDCBF')
        )
      )
    );
  }
}

export default BiosHome;
