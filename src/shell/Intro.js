import { Component, h } from '@monygroupcorp/microact';
import { Howl } from 'howler';
import { CADENCE, MAIN_ASSETS, ASSET_BASE } from '../config.js';

/**
 * Intro — MONY logo fade-in/out → MiladyStation logo fade-in/out → navigate to menu.
 *
 * Plays immediately with sound. Bottom-left MUTE / SKIP buttons overlay the animation.
 * On completion (or skip), passes the final sound preference back via onComplete(soundEnabled).
 */
class Intro extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phase: 'mony',   // 'mony' | 'ms'
      opacity: 0,
      muted: true
    };
    this._sound = null;
    this._startTime = 0;
  }

  didMount() {
    this._startTime = Date.now();
    this._sound = new Howl({
      src: [`${MAIN_ASSETS}/intro.mp3`],
      html5: true
    });
    this.registerCleanup(() => {
      this._sound.stop();
      this._sound.unload();
    });
    this._startMonyPhase();
  }

  _toggleMute() {
    const muted = !this.state.muted;
    this.setState({ muted });
    if (this._sound) {
      if (muted) {
        this._sound.pause();
      } else {
        const elapsed = (Date.now() - this._startTime) / 1000;
        this._sound.seek(elapsed);
        this._sound.play();
      }
    }
  }

  _skip() {
    this.props.onComplete(!this.state.muted);
  }

  _fadeInOut(duration, onDone) {
    let opacity = 0;
    let fadingIn = true;

    const interval = this.setInterval(() => {
      if (fadingIn) {
        opacity += 0.01;
        if (opacity >= 1) {
          opacity = 1;
          fadingIn = false;
          clearInterval(interval);
          this.setTimeout(() => {
            const outInterval = this.setInterval(() => {
              opacity -= 0.01;
              if (opacity <= 0) {
                opacity = 0;
                clearInterval(outInterval);
                if (onDone) onDone();
              }
              this.setState({ opacity });
            }, 4);
          }, duration);
        }
        this.setState({ opacity });
      }
    }, 2);
  }

  _startMonyPhase() {
    this.setState({ phase: 'mony', opacity: 0 });
    this._fadeInOut(CADENCE.intro.mony, () => {
      this._startMsPhase();
    });
  }

  _startMsPhase() {
    this.setState({ phase: 'ms', opacity: 0 });
    this._fadeInOut(CADENCE.intro.ms, () => {
      this.props.onComplete(!this.state.muted);
    });
  }

  render() {
    const { phase, opacity, muted } = this.state;

    const controls = h('div', { className: 'intro-controls' },
      h('button', { onClick: () => this._toggleMute() }, muted ? 'UNMUTE' : 'MUTE'),
      h('button', { onClick: () => this._skip() }, 'SKIP')
    );

    if (phase === 'mony') {
      return h('div', { className: 'intro-container' },
        h('h2', { id: 'top-title', style: `opacity:${opacity}` }, 'MONY'),
        h('img', { id: 'mony-logo', src: `${ASSET_BASE}/mony.png`, alt: 'mony', style: `opacity:${opacity}` }),
        h('h3', { id: 'bottom-title', style: `opacity:${opacity}` }, 'COMPUTER ENTERTAINMENT'),
        controls
      );
    }

    return h('div', { className: 'intro-container', style: 'background-color:black' },
      h('img', { id: 'ms-logo', src: `${ASSET_BASE}/msinvert.png`, alt: 'miladystation', style: `opacity:${opacity}` }),
      controls
    );
  }
}

export default Intro;
