import { Component, h } from '@monygroupcorp/microact';
import { DISC_APPS, CD_FOLDERS } from '../config.js';

/**
 * BiosCdMenu — CD Player with subdomain discs shown flat
 * and external links grouped into subfolders.
 */
class BiosCdMenu extends Component {
  constructor(props) {
    super(props);
    this.state = { folder: null };
    this._goBack = this.bind(this._goBack);
  }

  _goBack() {
    if (this.state.folder) {
      this.setState({ folder: null });
    } else {
      this.props.navigate('home');
    }
  }

  _selectDisc(app) {
    if (app.external) {
      window.open(app.url, '_blank');
    } else {
      this.props.navigate(app.id);
    }
  }

  _renderDiscItem(app) {
    return h('button', {
      key: app.id,
      className: 'disc-item' + (app.stub ? ' disc-item--stub' : ''),
      onClick: () => this._selectDisc(app)
    },
      h('img', {
        src: app.image,
        alt: app.name,
        className: 'disc-icon',
        onError: (e) => { e.target.style.display = 'none'; }
      }),
      h('span', null, app.name),
      app.stub
        ? h('span', { className: 'disc-stub-badge' }, 'Soon')
        : app.badge
          ? h('span', { className: 'disc-badge' }, app.badge)
          : null
    );
  }

  _renderTopLevel() {
    return h('div', { className: 'disc-list' },
      ...DISC_APPS.map(app => this._renderDiscItem(app)),
      ...CD_FOLDERS.map(folder =>
        h('button', {
          key: folder.id,
          className: 'disc-item disc-folder',
          onClick: () => this.setState({ folder: folder.id })
        },
          h('span', { className: 'disc-folder-icon' }, '\u25B8'),
          h('span', null, folder.name)
        )
      )
    );
  }

  _renderFolder(folder) {
    return h('div', null,
      h('h3', { className: 'disc-folder-heading' }, folder.name),
      h('div', { className: 'disc-list' },
        ...folder.apps.map(app => this._renderDiscItem(app))
      )
    );
  }

  render() {
    const { folder } = this.state;
    const activeFolder = folder
      ? CD_FOLDERS.find(f => f.id === folder)
      : null;

    return h('div', { className: 'bios-cd-menu' },
      h('h2', { className: 'bios-heading' }, 'CD Player'),
      activeFolder
        ? this._renderFolder(activeFolder)
        : this._renderTopLevel(),
      h('div', { className: 'overlay-controls' },
        h('button', { onClick: this._goBack }, 'BACK')
      )
    );
  }
}

export default BiosCdMenu;
