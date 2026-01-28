import { Component, h } from '@monygroupcorp/microact';

/**
 * MenuCard — one app entry in the side-scrolling menu.
 * External apps open their URL; internal apps call navigate().
 */
class MenuCard extends Component {
  handleClick(e) {
    const { app, navigate } = this.props;
    if (!app.external) {
      e.preventDefault();
      navigate(app.id);
    }
    // External links: default <a> behavior takes over
  }

  render() {
    const { app } = this.props;
    const base = import.meta.env.BASE_URL || '/';
    const href = app.external ? app.url : base + (app.route || app.id);
    return h('div', { className: 'menu-card' },
      h('a', {
        href,
        onClick: (e) => this.handleClick(e),
        ...(app.external ? { target: '_blank', rel: 'noopener' } : {})
      },
        h('img', { src: app.image, alt: app.name }),
        h('h3', null, app.name)
      )
    );
  }
}

export default MenuCard;
