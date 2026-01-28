import { Component, h } from '@monygroupcorp/microact';
import { APPS, MAIN_ASSETS } from '../config.js';
import MenuCard from './MenuCard.js';

/**
 * Menu — horizontal side-scrolling app launcher.
 * Matches miladystationlite mainMenu() + populate() in home.js.
 */
class Menu extends Component {
  render() {
    const { navigate } = this.props;
    return h('div', {
      className: 'menu-container',
      style: `background-image:url(${MAIN_ASSETS}/ms_menu.jpeg)`
    },
      h('div', { className: 'menu-choices' },
        ...APPS.map(app =>
          h(MenuCard, { key: app.id, app, navigate })
        )
      )
    );
  }
}

export default Menu;
