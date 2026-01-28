import { Component, h } from '@monygroupcorp/microact';
import { initEngine, destroyEngine } from './engine.js';

/**
 * PPO — Power Packs Onchained game wrapper.
 *
 * This Microact component renders a full-viewport container and
 * delegates all game logic to engine.js, which is a consolidated
 * port of the original Lite PPO scripts (core, index, anime, sound, web3).
 *
 * The engine operates on raw DOM inside the container — it is NOT
 * rendered via Microact's virtual DOM. This is intentional: the game
 * was written as imperative DOM manipulation and porting every function
 * to declarative components would be a rewrite, not a migration.
 */
class PPO extends Component {
  constructor(props) {
    super(props);
    this._containerRef = null;
    this._rafId = null;
  }

  didMount() {
    // Microact calls didMount before the node is in the document tree,
    // so defer to next frame when getElementById will work.
    this._rafId = requestAnimationFrame(() => {
      const container = document.getElementById('ppo-container');
      if (container) {
        this._containerRef = container;
        initEngine(container, {
          soundEnabled: this.props.soundEnabled,
          onBack: this.props.onBack
        });
      }
    });
    this.registerCleanup(() => {
      cancelAnimationFrame(this._rafId);
      destroyEngine();
    });
  }

  render() {
    return h('div', { id: 'ppo-container', className: 'ppo-root' });
  }
}

export default PPO;
