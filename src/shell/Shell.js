import { Component, h } from '@monygroupcorp/microact';
import { APPS } from '../config.js';
import Intro from './Intro.js';
import BiosHome from '../bios/BiosHome.js';
import BiosCdMenu from '../bios/BiosCdMenu.js';
import BiosMemoryCard from '../bios/BiosMemoryCard.js';
import DiscRuntime from '../bios/DiscRuntime.js';
import DiscStub from '../bios/DiscStub.js';
import Classic from '../apps/classic/Classic.js';
import PPO from '../apps/ppo/PPO.js';
import Tubbystation from '../apps/tubbystation/Tubbystation.js';
import NononSlide from '../apps/nononslide/NononSlide.js';

/* ── Route mapping built from APPS config ── */
const ROUTE_TO_VIEW = {};
const VIEW_TO_ROUTE = {};
APPS.forEach(app => {
  if (!app.external && app.route) {
    ROUTE_TO_VIEW[app.route] = app.id;
    VIEW_TO_ROUTE[app.id] = app.route;
  }
});

/* ── App ID → component class ── */
const APP_COMPONENTS = {
  classic: Classic,
  ppo: PPO,
  tubbystation: Tubbystation,
  nononslide: NononSlide
};

function getBasePath() {
  return import.meta.env.BASE_URL || '/';
}

function getViewFromPath() {
  const base = getBasePath().replace(/\/$/, '');
  const pathname = window.location.pathname;
  const relative = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const clean = relative.replace(/^\//, '').replace(/\/$/, '');
  return ROUTE_TO_VIEW[clean] || null;
}

/**
 * Shell — top-level app shell.
 *
 * BIOS state machine:
 *   intro → home → cdMenu → [running disc]
 *                → memoryCard
 *
 * Running discs are wrapped in DiscRuntime with an Eject button.
 *
 * URL routing:
 *   /                      → intro (first visit) or home
 *   /powerpacksonchained   → PPO
 *   /classic               → Classic
 *   /tubbystation          → Stub (coming soon)
 *   /nononslide            → Stub (coming soon)
 */
class Shell extends Component {
  constructor(props) {
    super(props);

    const deepView = getViewFromPath();
    this.state = {
      view: deepView || 'intro',
      soundEnabled: true
    };

    if (deepView) {
      window.history.replaceState({ view: deepView }, '');
    }

    this.navigate = this.bind(this.navigate);
    this._onPopState = this._onPopState.bind(this);
  }

  didMount() {
    window.addEventListener('popstate', this._onPopState);
    this.registerCleanup(() => {
      window.removeEventListener('popstate', this._onPopState);
    });
  }

  _onPopState(e) {
    if (e.state && e.state.view) {
      this.setState({ view: e.state.view });
    } else {
      this.setState({ view: 'home' });
    }
  }

  navigate(view) {
    const base = getBasePath();

    if (VIEW_TO_ROUTE[view]) {
      window.history.pushState({ view }, '', base + VIEW_TO_ROUTE[view]);
    } else if (view === 'home') {
      window.history.pushState({ view }, '', base);
    }

    this.setState({ view });
  }

  goToNav(soundEnabled) {
    this.setState({ soundEnabled });
    this.navigate('home');
  }

  render() {
    const { view, soundEnabled } = this.state;

    switch (view) {
      case 'intro':
        return h(Intro, {
          onComplete: (sound) => this.goToNav(sound)
        });

      case 'home':
        return h(BiosHome, {
          navigate: this.navigate
        });

      case 'cdMenu':
        return h(BiosCdMenu, {
          navigate: this.navigate
        });

      case 'memoryCard':
        return h(BiosMemoryCard, {
          navigate: this.navigate,
          walletService: this.props.walletService
        });

      default: {
        // Running disc — wrap app in DiscRuntime with Eject
        const AppComponent = APP_COMPONENTS[view];
        if (AppComponent) {
          return h(DiscRuntime, {
            App: AppComponent,
            appProps: {
              soundEnabled,
              walletService: this.props.walletService,
              onBack: () => this.navigate('home')
            },
            onEject: () => this.navigate('home')
          });
        }
        return h('div', { className: 'shell-error' }, 'Unknown view: ' + view);
      }
    }
  }
}

export default Shell;
