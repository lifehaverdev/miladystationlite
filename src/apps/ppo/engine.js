/**
 * PPO Game Engine
 *
 * Consolidated port of miladystationlite PPO JS files:
 *   core.js, index.js, anime.js, sound.js, web3.js
 *
 * Adapted to:
 *   - Render into a container element (not document.body)
 *   - Use ES module imports (Howl from howler)
 *   - Reference Web3 and interact from CDN globals
 *   - Provide init/destroy lifecycle functions
 */

import { Howl } from 'howler';

/* ═══════════════════════════
   Module State
   ═══════════════════════════ */
let container = null;
let callbacks = {};
let _timers = [];
let _intervals = [];

/* ── Game state (from index.js) ── */
const stageMax = 12;
const totalSup = 222;
const charPre = 'char/';
const pre = './public/PPO/';
const assetPre = './public/PPO/assets/';
const soundPre = './public/PPO/sounds/';

let phase = '';
let hear = false;
let character = 1;
let character1 = 8;
let arena = 1;
let walletPacks = [];
let onChained = false;
let userXP = 0;
let curInt;
let level = 0;
let win = 0;
let streak = 0;
let stocks = 3;
let random = [];
let score = [];
let round = 0;
let game = { p1: { stock: 0 }, p2: { stock: 0 } };
let accounts = [];
let fee = 0;
let openBusiness = false;
let toteOpen = false;
let found = false;
let position = { x: 0, y: 0 };

/* ── Animation state (from anime.js) ── */
let aniTimeout = [];
let timer = [];
let delta = [];

const cadence = {
  menu: { barLag: 800 },
  fight: { applause: 4000, spawn: 1000, countdown: 2000, battle: 6000 },
  countDown: { tempo: 1000 },
  hit: { flicker: 400, count: 800 },
  battle1: { bell: 7000 },
  smash: { air: 1000 }
};

/* ═══════════════════════════
   Sound System (from sound.js)
   ═══════════════════════════ */
let titleMusic, menuMusic, fightMusic, smashFX, smashFX2, announce;

function initSound() {
  titleMusic = new Howl({
    src: [soundPre + 'title.mp3'],
    html5: true,
    onend: function () { menuMusics(); }
  });

  // Player class for playlists
  function Player(playlist) {
    this.playlist = playlist;
    this.index = 0;
    this.isPlaying = false;
  }
  Player.prototype = {
    play: function (index) {
      var self = this;
      index = typeof index === 'number' ? index : self.index;
      var data = self.playlist[index];
      if (!data.howl) {
        data.howl = new Howl({
          src: [soundPre + 'st/' + data.file + '.mp3'],
          html5: true,
          onend: function () { self.skip(); }
        });
      }
      data.howl.play();
      self.index = index;
      self.isPlaying = true;
    },
    stop: function () {
      var self = this;
      if (self.playlist[self.index] && self.playlist[self.index].howl) {
        self.playlist[self.index].howl.stop();
      }
      self.isPlaying = false;
    },
    skip: function (direction) {
      var self = this;
      var index = direction === 'prev'
        ? (self.index - 1 < 0 ? self.playlist.length - 1 : self.index - 1)
        : (self.index + 1 >= self.playlist.length ? 0 : self.index + 1);
      self.skipTo(index);
    },
    skipTo: function (index) {
      this.stop();
      this.play(index);
    }
  };

  // Sprite class for sound effects
  function Sprite(options) {
    this._spriteMap = options.spriteMap;
    this._sprite = options.sprite;
    this.sound = new Howl({ src: options.src, sprite: options.sprite });
  }
  Sprite.prototype = {
    play: function (key) {
      var self = this;
      var spriteTime = self._sprite[self._spriteMap[key]][1] - self._sprite[self._spriteMap[key]][0];
      self.sound.play(key);
      setTimeout(() => { self.sound.stop(); }, spriteTime);
    }
  };

  menuMusic = new Player([
    { title: 'For Past Present and Future', file: 'for-past-present-and-future', howl: null },
    { title: 'Someone Like You', file: 'someone-like-you', howl: null },
    { title: 'Power', file: 'power', howl: null },
    { title: 'Tard Mode', file: 'tard-mode', howl: null },
    { title: 'I Care About You', file: 'i-care-about-you', howl: null }
  ]);

  fightMusic = new Player([
    { title: 'Mainframe', file: 'mainframe', howl: null },
    { title: 'Run and Gun', file: 'run-and-gun', howl: null },
    { title: 'Falling for You', file: 'falling-for-you', howl: null }
  ]);

  smashFX = new Sprite({
    src: [soundPre + 'smash.mp3'],
    sprite: {
      fightStart: [0, 1467], click: [1766, 2228], web3: [20162, 20596],
      back: [26113, 26760], spawn: [46909, 48005], disc: [56954, 57130],
      homerun: [60303, 62199], selection: [77200, 77654], startButton: [98724, 99017],
      menuButton: [99919, 100058], hit: [108042, 108203], sparkle: [119104, 119595]
    },
    spriteMap: {
      fightStart: 'fightStart', click: 'click', web3: 'web3', back: 'back',
      spawn: 'spawn', disc: 'disc', homerun: 'homerun', selection: 'selection',
      startButton: 'startButton', menuButton: 'menuButton', hit: 'hit', sparkle: 'sparkle'
    }
  });

  smashFX2 = new Sprite({
    src: [soundPre + 'smash.mp3'],
    sprite: { applause: [31750, 39211] },
    spriteMap: { applause: 'applause' }
  });

  announce = new Sprite({
    src: [soundPre + 'announcer.mp3'],
    sprite: {
      three: [43305, 43791], two: [44774, 45156], one: [36610, 37121],
      ffight: [36074, 36604], defeated: [32818, 33853], ggame: [35211, 36064],
      congrats: [51620, 53286], choose: [81065, 82477]
    },
    spriteMap: {
      three: 'three', two: 'two', one: 'one', ffight: 'ffight',
      defeated: 'defeated', ggame: 'ggame', congrats: 'congrats', choose: 'choose'
    }
  });
}

function playSprite(which) {
  if (hear) {
    if (which === 'applause') {
      smashFX2.play(which);
    } else if ('threetwooneffightdefeatedggamecongratschoose'.includes(which)) {
      announce.play(which);
    } else {
      smashFX.play(which);
    }
  }
}

function menuMusics() {
  if (fightMusic && fightMusic.isPlaying) fightMusic.stop();
  if (hear && menuMusic) menuMusic.play(Math.floor(5 * Math.random()));
}

function fightMusics() {
  if (menuMusic && menuMusic.isPlaying) menuMusic.stop();
  if (hear && fightMusic) fightMusic.play(Math.floor(3 * Math.random()));
}

function stopMusics() {
  if (fightMusic && fightMusic.isPlaying) fightMusic.stop();
  if (menuMusic && menuMusic.isPlaying) menuMusic.stop();
}

function volume() {
  return hear ? '\u{1F509}' : '\u{1F50A}';
}

function soundSwitch() {
  if (hear) {
    if (menuMusic && menuMusic.isPlaying) menuMusic.stop();
    if (fightMusic && fightMusic.isPlaying) fightMusic.stop();
  } else {
    if ('maincharstageresult'.includes(phase) && menuMusic) menuMusic.play();
    else if ('battle'.includes(phase) && fightMusic) fightMusic.play();
  }
  hear = !hear;
  updateBar();
}

/* ═══════════════════════════
   Core DOM Helpers (from core.js)
   — adapted to target container
   ═══════════════════════════ */

function create(elem, id, clast, onclick, bod) {
  return `<${elem} id="${id}" class="${clast}" onclick="${onclick}">${bod}</${elem}>`;
}

function cast(...inner) {
  if (container) container.innerHTML = inner.join('');
}

function frame(idO, clastO, idI, clastI, bod) {
  cast(
    create('div', idO, 'container ' + clastO, '',
      create('div', idI, 'container ' + clastI, '', bod) + bar()
    )
  );
  if (phase === 'battle' || phase === 'wait') {
    var backBtn = get('back');
    var cashBtn = get('cash-out');
    if (backBtn) backBtn.disabled = true;
    if (cashBtn) cashBtn.disabled = true;
  }
}

function get(id) {
  return document.getElementById(id);
}

function show(id) { var t = get(id); if (t) t.style.display = 'block'; }
function hide(id) { var t = get(id); if (t) t.style.display = 'none'; }
function errorTell(msg) { alert(msg); }

/* ═══════════════════════════
   Bar / Navigation (from core.js)
   ═══════════════════════════ */

function bar() {
  return create('div', 'bar', '', '',
    create('button', 'back', '', 'window.__ppo.back()', 'BACK')
    + create('button', 'vol', '', 'window.__ppo.soundSwitch()', volume())
    + create('div', 'balance', '', '', headline())
    + create('button', 'cash-out', '', 'window.__ppo.settings()', 'Menu')
    + create('button', 'close-settings', '', 'window.__ppo.hideSettings()', 'Menu')
  );
}

function headline() {
  if (onChained) {
    return isMobileDevice()
      ? create('h3', 'wallet', '', '', `EXP:${userXP}`)
      : create('h3', 'wallet', '', '', `WINS:${streak} EXP:${userXP}`);
  }
  return create('h3', 'wallet', '', '', `WINS:${streak}`);
}

function updateBar() {
  var w = get('wallet');
  var v = get('vol');
  if (w) {
    if (onChained && !isMobileDevice()) w.innerHTML = `WINS:${streak} EXP:${userXP}`;
    else if (onChained) w.innerHTML = `EXP:${userXP}`;
    else if (!isMobileDevice()) w.innerHTML = `WINS:${streak} EXP:${userXP}`;
    else w.innerHTML = `WINS:${streak}`;
  }
  if (v) v.innerHTML = volume();
}

function isMobileDevice() {
  return (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) < 769;
}

/* ═══════════════════════════
   Flow (from core.js + index.js)
   ═══════════════════════════ */

function next() {
  if (phase === 'char') { stageMenu(); return; }
  if (phase === 'stage') { tote(); return; }
}

function back() {
  playSprite('back');
  _timers.push(setTimeout(() => {
    if (phase === 'main' || phase === 'start') { callbacks.onBack && callbacks.onBack(); }
    else if (phase === 'stage') charMenu();
    else if (['result', 'register', 'bio', 'leaderboard', 'char', 'settings', 'team'].includes(phase)) mainMenu();
    else if (phase === 'tote') stageMenu();
  }, 300));
}

/* ── Boot ── */
function boot() {
  phase = 'boot';
  frame('boot', '', 'logo', '',
    `<img src="${assetPre}bwlogosmol.png" alt="miladystation">`
  );
  var b = get('bar');
  if (b) b.style.display = 'none';
  welcomePPO();
}

function welcomePPO() {
  var image = get('logo');
  if (!image) return;
  var el = image.querySelector('img') || image;
  var opacity = 0;
  var intervalID = setInterval(function () {
    if (opacity < 1) {
      opacity += 0.01;
      el.style.opacity = opacity;
    } else {
      clearInterval(intervalID);
      _timers.push(setTimeout(function () {
        var intervalID2 = setInterval(function () {
          if (opacity > 0) {
            opacity -= 0.01;
            el.style.opacity = opacity;
          } else {
            clearInterval(intervalID2);
          }
        }, 4);
        _intervals.push(intervalID2);
      }, 1000));
    }
  }, 2);
  _intervals.push(intervalID);
  _timers.push(setTimeout(function () {
    frame('', '', '', '',
      create('button', 'sound', '', 'window.__ppo.start(true)', 'SOUND')
      + create('button', 'quiet', '', 'window.__ppo.start(false)', 'NO SOUND')
    );
    var b = get('bar');
    if (b) b.style.display = 'none';
  }, 2000));
}

/* ── Start / Auth ── */
function start(loud) {
  phase = 'start';
  if (loud) {
    hear = true;
    if (titleMusic) titleMusic.play();
  } else {
    hear = false;
  }
  frame('', '', 'intro', 'container',
    create('h1', 'title', 'fight', '', 'POWER PACKS ONCHAINED')
    + create('button', 'start', 'float centered-button', 'window.__ppo.auth()', 'START')
    + `<img src="${assetPre}dogpile.png" id="dogpile" />`
  );
  var b = get('bar');
  if (b) b.style.display = 'none';
  panUp(1.3);
}

function auth() {
  phase = 'auth';
  if (titleMusic) titleMusic.stop();
  playSprite('startButton');
  menuMusics();
  var walletButton = onChained
    ? create('button', 'wallet-ask', 'float centered-button web3', 'window.__ppo.mainMenu()', 'continue')
    : create('button', 'wallet-ask', 'float centered-button web3', 'window.__ppo.connectWallet()', 'connect-wallet');
  frame('', '', '', 'container',
    walletButton
    + create('button', 'wallet-ask2', 'float centered-button web3', 'window.__ppo.playOffline()', 'play-offline')
  );
  var b = get('bar');
  if (b) b.style.display = 'none';
}

function playOffline() {
  onChained = false;
  mainMenu();
}

/* ── Main Menu ── */
function mainMenu() {
  phase = 'main';
  playSprite('menuButton');
  if (!onChained) {
    frame('', 'inside', 'option', 'option',
      create('p', '', '', '', 'Check miladystation twitter for updates or go to the mony discord.')
      + create('ul', '', 'list', '',
        create('li', '', 'option', '',
          create('button', '', 'float', 'window.__ppo.charMenu()', 'Play Offline')
        )
      )
    );
  } else if (walletPacks[0] > 0 && openBusiness) {
    frame('', 'inside', 'option', 'option',
      create('ul', '', 'list', '',
        create('li', '', 'option', '', create('button', '', 'float', 'window.__ppo.charMenu()', 'Campaign'))
        + create('li', '', 'option', '', create('button', 'multi', 'float', '', 'Create Multiplayer Game'))
        + create('li', '', 'option', '', create('button', 'join', 'float', '', 'Join Multiplayer Game'))
        + create('li', '', 'option', '', create('button', 'watch', 'float', '', 'Spectate'))
      )
    );
    if (get('multi')) get('multi').disabled = true;
    if (get('join')) get('join').disabled = true;
    if (get('watch')) get('watch').disabled = true;
  } else if (walletPacks[0] === 0 && openBusiness) {
    frame('', 'inside', 'option', 'option',
      create('p', '', '', '', 'We see you haven\'t registered, you need to choose your team before you can fight.')
      + create('ul', '', 'list', '',
        create('li', '', 'option', '', create('button', '', 'float', 'window.__ppo.registerMenu()', 'Register'))
        + create('li', '', 'option', '', create('button', '', 'float', 'window.__ppo.charMenu()', 'Play Offline'))
      )
    );
  } else {
    frame('', 'inside', 'option', 'option',
      create('p', '', '', '', 'The arena is closed. Check miladystation twitter for updates.')
      + create('ul', '', 'list', '',
        create('li', '', 'option', '', create('button', '', 'float', 'window.__ppo.charMenu()', 'Play Offline'))
      )
    );
  }
}

/* ── Character Select ── */
function charMenu() {
  phase = 'char';
  position = { x: 0, y: 0 };
  playSprite('menuButton');
  playSprite('choose');
  frame('', 'inside', '', '',
    create('div', 'char-sel', 'float grid', '', charList())
    + create('div', 'disc', 'draggable', '', '')
    + create('div', 'picked', 'card', '', '')
    + create('div', 'spec', '', '',
      create('p', 'exp', 'stat', '', 'exp: ')
      + create('p', 'name', 'stat', '', 'name: ')
    )
    + create('div', 'param', '', '',
      create('div', '', 'dial', '',
        create('p', 'odds', '', '', `STOCKS: ${stocks}`)
        + create('button', 'risk-less', 'ctrl', 'window.__ppo.stock(0)', '-')
        + create('button', 'risk-more', 'ctrl', 'window.__ppo.stock(1)', '+')
      )
    )
  );
  initDragDrop();
}

function charList() {
  var chars = '';
  if (onChained) {
    for (var i = 0; i < 6; i++) {
      chars += create('div', `${walletPacks[i]}`, 'op char', '',
        `<img src="${pre}${charPre}${walletPacks[i]}.png" alt="char${walletPacks[i]}" class="pp"/>`
      );
    }
  } else {
    for (var i = 1; i < 13; i++) {
      chars += create('div', `${i}`, 'op char', '',
        `<img src="${pre}${charPre}${i}.png" alt="char${i}" class="pp"/>`
      );
    }
  }
  return chars;
}

function loadCard(id) {
  var picked = get('picked');
  if (picked) {
    picked.innerHTML = `<img src="${pre}${charPre}${character}.png" id="chosen" alt="pack" />`;
  }
  banner();
}

function stock(w) {
  playSprite('click');
  if (w > 0) stocks++;
  else stocks--;
  var oddsEl = get('odds');
  if (oddsEl) oddsEl.innerHTML = 'STOCKS: ' + stocks;
  var rl = get('risk-less');
  var rm = get('risk-more');
  if (rl) rl.disabled = stocks < 2;
  if (rm) rm.disabled = stocks > 4;
}

/* ── Stage Select ── */
function stageMenu() {
  playSprite('menuButton');
  updateBar();
  phase = 'stage';
  position = { x: 0, y: 0 };
  var page = 0;
  if (level + 2 >= stageMax) page += Math.floor(level / stageMax);

  _timers.push(setTimeout(() => {
    frame('', 'inside', 'stageMenu', '',
      create('div', 'stage-sel', 'float grid', '', stageList(page))
      + create('div', 'disc', 'draggable', '', '')
    );
    initDragDrop();
  }, cadence.menu.barLag));
}

function stageList(page) {
  var stages = '';
  if (onChained) {
    for (var i = 1 + stageMax * page; i < level + 2 && i <= stageMax + stageMax * page; i++) {
      stages += create('div', `${i}`, 'dest op', '',
        `<img src="${pre}stage/${i}.png" alt="stage${i}" class="stage" />`
      );
    }
  } else {
    for (var i = 1; i <= stageMax; i++) {
      stages += create('div', `${i}`, 'dest op', '',
        `<img src="${pre}stage/${i}.png" alt="stage${i}" class="stage" />`
      );
    }
  }
  return stages;
}

/* ── Tote ── */
function tote() {
  phase = 'tote';
  character1 = Math.floor(Math.random() * totalSup);
  playSprite('menuButton');
  frame('', '', 'option', '',
    create('div', 'summary', 'float sheet', '', summary())
    + create('button', 'fight', '', 'window.__ppo.arm()', 'FIGHT')
    + create('button', 'check', '', 'window.__ppo.charMenu()', 'wait')
  );
  if (!onChained) {
    var gambleEl = get('gamble');
    var challengeEl = get('challenge');
    if (gambleEl) gambleEl.style.display = 'none';
    if (challengeEl) challengeEl.style.display = 'none';
  }
}

function summary() {
  return create('h3', 'q', '', '', 'Are you ready to fight?')
    + create('p', 'challenge', '', '', 'Wanna bet?')
    + create('input', 'gamble', '', '', '')
    + create('p', 'glance', '', '',
      `<img src="${pre}char/${character}.png" /><img src="${pre}stage/${arena}.png" />`
    );
}

/* ── Battle ── */
function arm() {
  if (!onChained) {
    battle();
  }
  // Web3 battle flow handled separately when connected
}

function battle() {
  phase = 'battle';
  if (hear) fightMusics();
  round = 0;
  if (!onChained) {
    score = vrf(stocks * 2);
  }
  game.p1.stock = stocks;
  game.p2.stock = game.p1.stock;
  frame('', '', 'match', '',
    create('div', 'action', '', '', action())
  );
  var p1 = get('player1');
  var p2 = get('player2');
  if (p1) p1.style.display = 'none';
  if (p2) p2.style.display = 'none';
  fight();
}

function action() {
  return create('div', 'game', '', '',
    `<img src="${pre}stage/${arena}.png" alt="stage" id="arena" />`
    + `<img src="${pre}char/${character}.png" alt="char0" id="player1" />`
    + `<img src="${pre}char/${character1}.png" alt="char1" id="player2" />`
    + getStocks()
  );
}

function getStocks() {
  var p1s = '<div class="stocks stock0">';
  var p2s = '<div class="stocks stock1">';
  for (var i = 1; i < stocks + 1; i++) {
    if (game.p1.stock + 1 > i)
      p1s += `<img src="${pre}char/${character}.png" alt="stock0" id="0stock${i}" class="stock0"/>`;
    if (game.p2.stock + 1 > i)
      p2s += `<img src="${pre}char/${character1}.png" alt="stock1" id="1stock${i}" class="stock1"/>`;
  }
  return p1s + '</div>' + p2s + '</div>';
}

function fight() {
  spawnSlide('player1');
  spawnSlide('player2');
  _timers.push(setTimeout(() => {
    var a = get('action');
    if (a) a.innerHTML = action();
  }, cadence.fight.spawn));
  _timers.push(setTimeout(() => { countDown(); }, cadence.fight.countdown));
  _timers.push(setTimeout(() => { battle1(); }, cadence.fight.battle));
}

function countDown() {
  var tempo = cadence.countDown.tempo;
  if (container) container.innerHTML += create('h1', 'count', 'fight', '', '3');
  countSlide('count');
  playSprite('three');
  _timers.push(setTimeout(() => {
    var c = get('count');
    if (c) c.remove();
    if (container) container.innerHTML += create('h1', 'count', 'fight', '', '2');
    countSlide('count');
    playSprite('two');
  }, tempo));
  _timers.push(setTimeout(() => {
    var c = get('count');
    if (c) c.remove();
    if (container) container.innerHTML += create('h1', 'count', 'fight', '', '1');
    countSlide('count');
    playSprite('one');
  }, tempo * 2));
  _timers.push(setTimeout(() => {
    var c = get('count');
    if (c) c.remove();
    if (container) container.innerHTML += create('h1', 'count', 'fight', '', 'FIGHT');
    countSlide('count');
    playSprite('ffight');
  }, tempo * 3));
  _timers.push(setTimeout(() => {
    var c = get('count');
    if (c) c.remove();
  }, tempo * 4));
}

function battle1() {
  var p1 = get('player1');
  var p2 = get('player2');
  if (!p1 || !p2) return;
  var tempo = cadence.hit.count;
  hit(p2);
  _timers.push(setTimeout(() => { hit(p1); }, tempo));
  _timers.push(setTimeout(() => {
    curInt = setInterval(() => {
      hit(p2);
      _timers.push(setTimeout(() => { hit(p1); }, tempo));
    }, tempo * 2);
    _intervals.push(curInt);
  }, tempo));
  _timers.push(setTimeout(() => { smash(); }, cadence.battle1.bell));
}

function smash() {
  clearInterval(curInt);
  var p1 = get('player1');
  var p2 = get('player2');
  if (!p1 || !p2) return;
  p1.classList.add('smashR');
  p2.classList.add('smashL');
  _timers.push(setTimeout(() => {
    if (score[round]) knockOff(p2, 1);
    else knockOff(p1, 0);
    p1.classList.remove('smashR');
    p2.classList.remove('smashL');
  }, 100));
}

function hit(el) {
  if (!el) return;
  playSprite('hit');
  var count = 0;
  var flickerInterval = setInterval(() => {
    if (count < 3) {
      el.style.transition = 'opacity 0.2s';
      el.style.opacity = '0';
      var existingTransform = getComputedStyle(el).transform;
      el.style.transform = existingTransform + ' scaleX(-1)';
      _timers.push(setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = existingTransform;
      }, cadence.hit.flicker / 2));
      count++;
    } else {
      clearInterval(flickerInterval);
    }
  }, cadence.hit.flicker);
  _intervals.push(flickerInterval);
}

function knockOff(el, right) {
  if (!el) return;
  playSprite('homerun');
  if (right === 0) {
    el.classList.add('knock-off-left');
    game.p1.stock -= 1;
  } else {
    el.classList.add('knock-off-right');
    game.p2.stock -= 1;
  }
  _timers.push(setTimeout(() => {
    if (game.p1.stock > 0 && game.p2.stock > 0) {
      var a = get('action');
      if (a) a.innerHTML = action();
      if (right === 0) {
        el.classList.remove('knock-off-left');
        spawnSlide('player1');
      } else {
        el.classList.remove('knock-off-right');
        spawnSlide('player2');
      }
      _timers.push(setTimeout(() => { battle1(); }, cadence.fight.spawn));
    } else {
      stopMusics();
      if (game.p1.stock === 0) {
        var s = document.getElementById('0stock1');
        if (s) s.style.display = 'none';
      } else if (game.p2.stock === 0) {
        var s = document.getElementById('1stock1');
        if (s) s.style.display = 'none';
      }
      playSprite('ggame');
      if (container) {
        container.innerHTML += create('button', 'result-btn', '', 'window.__ppo.result()', 'FIN');
      }
    }
    round++;
  }, cadence.smash.air));
}

/* ── Result ── */
function result() {
  phase = 'result';
  clearInterval(curInt);
  if (game.p1.stock > 0) { streak++; win = 1; }
  else { win = -1; }
  game.p1.stock = stocks;
  game.p2.stock = stocks;
  score = [];

  frame('', '', '', 'water',
    create('div', 'board', '', '',
      create('h1', 'result-text', '', '', '')
    )
  );
  var rt = get('result-text');
  if (win === 1) {
    playSprite('applause');
    playSprite('congrats');
    if (rt) rt.innerHTML = 'YOU WIN';
  } else {
    playSprite('defeated');
    if (rt) rt.innerHTML = 'YOU LOSE';
  }
  var board = get('board');
  if (board) {
    board.innerHTML +=
      create('button', '', '', 'window.__ppo.charMenu()', 'select Pack')
      + create('button', '', '', 'window.__ppo.stageMenu()', 'select Stage')
      + create('button', '', '', 'window.__ppo.tote()', 'again')
      + create('button', '', '', 'window.__ppo.mainMenu()', 'main menu');
  }
  menuMusics();
  updateBar();
}

/* ── Settings ── */
function settings() {
  var s = get('cash-out');
  if (s) s.style.display = 'none';
  phase = 'settings';
  var cs = get('close-settings');
  if (cs) cs.style.display = 'inline-block';
  playSprite('click');

  var _name = onChained ? 'PLAYER' : 'PLAYER';
  if (container) {
    container.innerHTML +=
      create('div', 'settings', '', '',
        create('p', '', 'settings-option', '', _name)
        + (onChained
          ? create('p', '', 'settings-option', '', create('div', '', 'settings-button', 'window.__ppo.mainMenu()', 'MAIN MENU'))
            + create('p', '', 'settings-option', '', create('div', '', 'settings-button', '', 'COLLECTION'))
          : create('p', '', 'settings-option', '', 'OFFLINE')
        )
        + create('p', '', 'settings-option', '', create('div', '', 'settings-button', 'window.__ppo.goHome()', 'SAVE & QUIT'))
      );
  }
}

function hideSettings() {
  var cs = get('close-settings');
  if (cs) cs.style.display = 'none';
  playSprite('click');
  var co = get('cash-out');
  if (co) co.style.display = 'inline-block';
  var s = get('settings');
  if (s) s.remove();
}

function goHome() {
  callbacks.onBack && callbacks.onBack();
}

/* ── Helpers ── */
function wait() {
  phase = 'wait';
  frame('', '', 'wait', '',
    create('div', '', '', '', `<img src="${pre}assets/loading.gif"/>`)
  );
}

function banner() {
  var b = get('banner');
  if (b) b.remove();
  if (container) {
    container.innerHTML +=
      create('div', 'banner', 'ribbon', '',
        create('button', 'banner-min', 'tiny', 'window.__ppo.minimize()', '-')
        + create('button', 'next', '', 'window.__ppo.next()', 'READY')
      );
  }
  bannerSlide('banner');
  var disc = get('disc');
  if (disc) disc.style.opacity = '.33';
}

function minimize() {
  var tar = get('banner');
  if (tar) {
    tar.style.top = '0px';
    tar.style.height = '10%';
    tar.innerHTML = create('button', 'banner-max', 'tiny', 'window.__ppo.banner()', '+');
  }
  var disc = get('disc');
  if (disc) disc.style.opacity = '1';
  var b = get('banner');
  if (b) b.style.padding = '0%';
}

function vrf(num) {
  var ran = [];
  for (var i = 0; i < num; i++) {
    ran.push(Math.random() < 0.5);
  }
  random = ran;
  return ran;
}

function openNewTab(url) {
  var w = window.open(url, '_blank');
  if (w) w.focus();
}

/* ═══════════════════════════
   Animation (from anime.js)
   ═══════════════════════════ */

function bannerSlide(id) {
  playSprite('selection');
  var el = document.getElementById(id);
  if (el) {
    _timers.push(setTimeout(() => {
      el.style.top = '30%';
      el.style.transform = 'translate(-50%, -50%)';
    }, 100));
  }
}

function countSlide(id) {
  var el = document.getElementById(id);
  if (el) {
    _timers.push(setTimeout(() => {
      el.style.top = '50%';
      el.style.transform = 'translate(-50%, -50%)';
    }, 100));
  }
}

function spawnSlide(id) {
  playSprite('spawn');
  var el = get(id);
  if (!el) return;
  if (el.style.display === 'none') el.style.display = '';
  el.classList.add('spawn-slide');
  document.addEventListener('animationend', (event) => {
    if (event.animationName === 'spawnSlideIn') {
      event.target.classList.remove('spawn-slide');
    }
  }, { once: true });
}

function panUp(zoomFactor) {
  var image = document.getElementById('dogpile');
  var introEl = document.getElementById('intro');
  if (!image || !introEl) return;
  var imageHeight = image.offsetHeight;
  var containerHeight = introEl.offsetHeight;
  if (imageHeight > containerHeight) {
    var maxScroll = imageHeight - containerHeight;
    image.style.transition = 'transform 7s, width 7s, height 7s';
    image.style.transform = `translateY(${maxScroll}px) scale(${zoomFactor})`;
  }
}

/* ═══════════════════════════
   Drag & Drop (from anime.js)
   — uses interact.js global
   ═══════════════════════════ */

function initDragDrop() {
  if (typeof interact === 'undefined') return;

  interact('.draggable').draggable({
    listeners: {
      start(event) {
        event.target.classList.add('dragging');
        var b = document.getElementById('banner');
        if (b) b.remove();
      },
      move(event) {
        position.x += event.dx;
        position.y += event.dy;
        event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
      },
      end(event) {
        event.target.classList.remove('dragging');
      }
    }
  });

  interact('.char').dropzone({
    accept: '.draggable',
    overlap: 0.5,
    ondragenter(event) {
      event.target.classList.add('choice');
    },
    ondragleave(event) {
      event.target.classList.remove('choice');
    },
    ondrop(event) {
      var dropzone = event.target;
      dropzone.classList.add('choice');
      character = parseInt(dropzone.id);
      loadCard(character);
    }
  });

  interact('.dest').dropzone({
    accept: '.draggable',
    overlap: 0.5,
    ondragenter(event) {
      event.target.classList.add('choice');
    },
    ondragleave(event) {
      event.target.classList.remove('choice');
    },
    ondrop(event) {
      arena = parseInt(event.target.id);
      banner();
    }
  });

  interact.dynamicDrop(true);
}

/* ═══════════════════════════
   Web3 (from web3.js) — stub
   Actual contract interaction requires
   Web3 global and MetaMask provider.
   ═══════════════════════════ */

function connectWallet() {
  if (typeof Web3 === 'undefined') {
    alert('Web3 not available. Install MetaMask or another wallet provider.');
    return;
  }
  playSprite('web3');
  var wa = get('wallet-ask');
  if (wa) wa.innerHTML = `<img src="${assetPre}loading.gif" />`;

  var web3 = new Web3(Web3.givenProvider);
  web3.eth.requestAccounts().then(function (accs) {
    accounts = accs;
    onChained = true;
    return web3.eth.net.getId();
  }).then(function (networkId) {
    if (networkId !== 421613) {
      alert('Change your network to Arbitrum Goerli and reload the page');
    }
    mainMenu();
  }).catch(function (err) {
    errorTell(err.message);
  });
}

/* ═══════════════════════════
   Public API (exposed on window.__ppo)
   ═══════════════════════════ */

function exposeGlobals() {
  window.__ppo = {
    back, start, auth, playOffline, mainMenu, charMenu, stageMenu,
    tote, arm, battle, result, settings, hideSettings, goHome,
    stock, next, banner, minimize, connectWallet, soundSwitch,
    loadCard, openNewTab
  };
}

function cleanGlobals() {
  delete window.__ppo;
}

/* ═══════════════════════════
   Lifecycle
   ═══════════════════════════ */

export function initEngine(containerEl, opts) {
  container = containerEl;
  callbacks = opts || {};
  hear = opts.soundEnabled || false;

  initSound();
  exposeGlobals();
  boot();
}

export function destroyEngine() {
  // Clear all timers/intervals
  _timers.forEach(clearTimeout);
  _intervals.forEach(clearInterval);
  _timers = [];
  _intervals = [];
  clearInterval(curInt);

  // Stop all audio
  stopMusics();
  if (titleMusic) titleMusic.stop();

  // Clean up globals
  cleanGlobals();

  // Reset state
  container = null;
  callbacks = {};
  phase = '';
  hear = false;
  onChained = false;
  streak = 0;
  score = [];
}
