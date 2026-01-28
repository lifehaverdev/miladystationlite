/*
 * MiladyStation One — Global Configuration
 */

/* ── Asset base paths ── */
export const ASSET_BASE = 'public';        // matches Lite's relative asset refs
export const MAIN_ASSETS = `${ASSET_BASE}/main`;
export const PPO_ASSETS  = `${ASSET_BASE}/PPO`;
export const CLASSIC_ASSETS = `${ASSET_BASE}/classic`;
export const TUBBY_ASSETS = `${ASSET_BASE}/tubby`;

/* ── CD Player: subdomain discs (shown flat at top level) ── */
export const DISC_APPS = [
  {
    id: 'ppo',
    name: 'Power Packs Onchained',
    image: `${MAIN_ASSETS}/ppo.gif`,
    route: 'powerpacksonchained',
    external: false
  },
  {
    id: 'classic',
    name: 'MiladyStation Classic',
    image: `${MAIN_ASSETS}/msclassic.gif`,
    route: 'classic',
    external: false
  },
  {
    id: 'tubbystation',
    name: 'Tubbystation',
    image: `${MAIN_ASSETS}/tubbystation.avif`,
    route: 'tubbystation',
    external: false,
    badge: 'STILL MINTING'
  },
  {
    id: 'nononslide',
    name: 'Nonon Slide',
    image: `${MAIN_ASSETS}/nonon.gif`,
    route: 'nononslide',
    external: false,
    stub: true
  }
];

/* ── CD Player: subdirectory folders (external links grouped) ── */
export const CD_FOLDERS = [
  {
    id: 'ms2',
    name: 'MiladyStation 2',
    apps: [
      {
        id: 'ms2net',
        name: 'miladystation2.net',
        image: `${MAIN_ASSETS}/ms2.jpg`,
        url: 'https://miladystation2.net',
        external: true
      },
      {
        id: 'ms2fun',
        name: 'ms2.fun',
        image: `${MAIN_ASSETS}/ms2fun.gif`,
        url: 'https://ms2.fun',
        external: true
      },
      {
        id: 'noema',
        name: 'noema.art',
        image: `${MAIN_ASSETS}/noema.gif`,
        url: 'https://noema.art',
        external: true
      }
    ]
  },
  {
    id: 'links',
    name: 'Links',
    apps: [
      {
        id: 'miladycola',
        name: 'MiladyCola',
        image: `${MAIN_ASSETS}/cola.gif`,
        url: 'https://miladycola.net',
        external: true
      },
      {
        id: 'monygroup',
        name: 'Mony Group Corp',
        image: `${MAIN_ASSETS}/mony.gif`,
        url: 'https://monygroup.net',
        external: true
      },
      {
        id: 'twitter',
        name: 'Twitter / X',
        image: `${MAIN_ASSETS}/twitter.gif`,
        url: 'https://x.com/MiladyStation',
        external: true
      }
    ]
  }
];

/* ── Flat app list (for Shell routing) ── */
export const APPS = [
  ...DISC_APPS,
  ...CD_FOLDERS.flatMap(f => f.apps)
];

/* ── Intro timing (ms) — matches Lite cadence ── */
export const CADENCE = {
  intro: {
    mony: 11000,
    ms: 7500
  }
};

/* ── Web3 / Contract Config ── */
export const CHAIN_ID = 421613; // Arbitrum Goerli
export const CHAIN_SCAN_PRE = 'https://goerli.arbiscan.io/address/';
export const MASTER_ADDRESS = '0xb8013ef2286ab59bd4f961f7ed761e87b69117f3';
export const EXP_ADDRESS = '0xbE9FDCB860f1341946251a31820B674870930AcB';
