import { Component, h } from '@monygroupcorp/microact';

/**
 * DiscRuntime — wraps a running app with an Eject button overlay.
 *
 * Props:
 *   App       — component class to render (e.g. PPO, Classic)
 *   appProps  — props to pass to the app component
 *   onEject   — callback to return to BIOS home
 *
 * Note: Microact does not pass h() children to component props,
 * so the app is received as a component class prop instead.
 */
class DiscRuntime extends Component {
  render() {
    const { App, appProps, onEject } = this.props;
    return h('div', { className: 'disc-runtime' },
      h(App, appProps),
      h('div', { className: 'overlay-controls' },
        h('button', { onClick: onEject }, '\u23CF EJECT')
      )
    );
  }
}

export default DiscRuntime;
