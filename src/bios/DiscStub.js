import { Component, h } from '@monygroupcorp/microact';

/**
 * DiscStub — placeholder for apps that are not yet available.
 * Displayed inside DiscRuntime with an Eject button.
 */
class DiscStub extends Component {
  render() {
    return h('div', { className: 'disc-stub' },
      h('p', { className: 'disc-stub__label' }, 'No disc data.'),
      h('p', { className: 'disc-stub__hint' }, 'Coming Soon')
    );
  }
}

export default DiscStub;
