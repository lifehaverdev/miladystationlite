import { Component, h } from '@monygroupcorp/microact';

/**
 * BiosLanding — PSone SCPH-101 BIOS-style navigation scaffold.
 *
 * Feature-flagged behind UI_MODE === 'bios' in config.js.
 * Placeholder structure only — no pixel-perfect styling yet.
 *
 * Two primary choices:
 *   - MEMORY CARD → wallet profile (placeholder)
 *   - CD PLAYER   → disc submenu (app list)
 */
class BiosLanding extends Component {
  render() {
    const { navigate } = this.props;
    return h('div', { className: 'bios-landing' },
      h('h1', { className: 'bios-title' }, 'MiladyStation'),
      h('div', { className: 'bios-choices' },
        h('button', {
          className: 'bios-choice',
          onClick: () => navigate('memoryCard')
        },
          h('div', { className: 'bios-icon' }, '\u{1F4BE}'),
          h('div', null, 'MEMORY CARD')
        ),
        h('button', {
          className: 'bios-choice',
          onClick: () => navigate('discMenu')
        },
          h('div', { className: 'bios-icon' }, '\u{1F4BF}'),
          h('div', null, 'CD PLAYER')
        )
      )
    );
  }
}

export default BiosLanding;
