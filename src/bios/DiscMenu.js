import { Component, h } from '@monygroupcorp/microact';
import { APPS } from '../config.js';

/**
 * DiscMenu — BIOS disc submenu listing all apps.
 *
 * Same app list as the legacy side-scrolling menu,
 * but presented as a vertical disc-style list.
 * Placeholder structure — styling comes later.
 */
class DiscMenu extends Component {
  handleSelect(app) {
    const { navigate } = this.props;
    if (app.external) {
      window.open(app.url, '_blank');
    } else {
      navigate(app.id);
    }
  }

  render() {
    const { navigate } = this.props;
    return h('div', { className: 'disc-menu' },
      h('h2', null, 'CD PLAYER'),
      h('div', { className: 'disc-list' },
        ...APPS.map(app =>
          h('button', {
            key: app.id,
            className: 'disc-item',
            onClick: () => this.handleSelect(app)
          }, app.name)
        )
      ),
      h('button', { className: 'disc-back', onClick: () => navigate('biosLanding') }, 'BACK')
    );
  }
}

export default DiscMenu;
