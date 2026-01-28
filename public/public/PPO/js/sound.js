/*

 ______   ______   __  __   ___   __    ______      
/_____/\ /_____/\ /_/\/_/\ /__/\ /__/\ /_____/\     
\::::_\/_\:::_ \ \\:\ \:\ \\::\_\\  \ \\:::_ \ \    
 \:\/___/\\:\ \ \ \\:\ \:\ \\:. `-\  \ \\:\ \ \ \   
  \_::._\:\\:\ \ \ \\:\ \:\ \\:. _    \ \\:\ \ \ \  
    /____\:\\:\_\ \ \\:\_\:\ \\. \`-\  \ \\:\/.:| | 
    \_____\/ \_____\/ \_____\/ \__\/ \__\/ \____/_/ 
                                                    

*/

const soundPre = './public/PPO/sounds/'

var soundEffects = "smash"; //default soundeffects, pokemon soon

const titleMusic = new Howl ({
    src: [soundPre+'title.mp3'],
    html5: true,
    onend: function() {
        menuMusics();
    }
});

function playSprite(which) {
    if(hear){
        switch(soundEffects){
            case 'smash':
                if(which == 'applause'){
                    smashFX2.play(which);
                }else if ('threetwooneffightdefeatedggamecongratschoose'.includes(which)){
                    announce.play(which);
                }else {
                    smashFX.play(which);
                }
                
                break;
            default:
                console.log('something worng');
        }
    }
}

function soundSwitch() {
    if(hear){
        if(menuMusic.isPlaying){
            menuMusic.stop();
        } else if (fightMusic.isPlaying){
                fightMusic.stop()
        }
    } else {
        if("maincharstageresult".includes(phase)){
            //console.log('includes phase');
            menuMusic.play();
        } else if ("battle".includes(phase)) {
            fightMusic.play();
        }
    }
    hear = !hear;
    updateBar();
    //sound off 	128263
    //sound on  128266
    //skip 9193
    //back 9194
}

function menuMusics() {
    //for-past-and-present
    //someone-ilke-you
    //power
    //tard-mode
    //i-care-about-you
    //thick-and-juicy
    if(fightMusic.isPlaying){
        fightMusic.stop()
    }
    if(hear){
        menuMusic.play(Math.floor(5*Math.random()))
    }
    
}

function fightMusics() {
    //shuffle fight songs and play
    //virgincore
    //mainframe
    //run-and-gun
    //falling-for-you
    if(menuMusic.isPlaying){
        menuMusic.stop()
    }
    
    if(hear){
        fightMusic.play(Math.floor(3*Math.random()))
    }
    
}

function stopMusics() {
    if(fightMusic.isPlaying){
        fightMusic.stop()
    }
    if(menuMusic.isPlaying){
        menuMusic.stop();
    }
}

function volume() {
    if(hear) {
        return '&#128263'
    } else {
        return '&#128266'
    }
}

///////////////////
// howler config //
///////////////////
// grafted from their examples

/**
 * Player class containing the state of our playlist and where we are in it.
 * Includes all methods for playing, skipping, updating the display, etc.
 * @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
 */
var Player = function(playlist) {
  this.playlist = playlist;
  this.index = 0;
  var isPlaying;
};
Player.prototype = {
  /**
   * Play a song in the playlist.
   * @param  {Number} index Index of the song in the playlist (leave empty to play the first or current).
   */
  play: function(index) {
    var self = this;
    var sound;
    var isPlaying;

    index = typeof index === 'number' ? index : self.index;
    var data = self.playlist[index];
    if (data.howl) {
      sound = data.howl;
    } else {
      sound = data.howl = new Howl({
        src: [soundPre + 'st/' + data.file + '.mp3'],
        html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
        // onplay: function() {
        // },
        // onload: function() {
        // },
        onend: function() {
          self.skip();
        },
        // onpause: function() {
        // },
        // onstop: function() {
        // },
        // onseek: function() {
        // }
      });
    }

    // Begin playing the sound.
    sound.play();

    // Keep track of the index we are currently playing.
    self.index = index;
    self.isPlaying = true;
  },

  /**
   * Pause the currently playing track.
   */
  pause: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.playlist[self.index].howl;

    // Puase the sound.
    sound.pause();
    self.isPlaying = false;
    // Show the play button.
    playBtn.style.display = 'block';
    pauseBtn.style.display = 'none';
  },

  /**
   * Stop the song
   */
  stop: function() {
    var self = this;
    var sound = self.playlist[self.index].howl;
    //console.log('sound var howl in stop',sound);
    sound.stop();
    self.isPlaying = false;
  },
    /**
     * Skip to the next or previous track.
     * @param  {String} direction 'next' or 'prev'.
     */
    skip: function(direction) {
        var self = this;
        //console.log('skipping now')
        //console.log('self index',self.index);
        // Get the next track based on the direction of the track.
        var index = 0;
        if (direction === 'prev') {
            index = self.index - 1;
            if (index < 0) {
            index = self.playlist.length - 1;
            }
        } else {
            index = self.index + 1;
            if (index >= self.playlist.length) {
            index = 0;
            }
        }

        self.skipTo(index);
        },
    /**
   * Skip to a specific track based on its playlist index.
   * @param  {Number} index Index in the playlist.
   */
  skipTo: function(index) {
    var self = this;

    // Stop the current track.
    if (self.playlist[self.index].howl) {
      self.playlist[self.index].howl.stop();
    }

    // Play the new track.
    self.play(index);
  },


};

/**
 * Sprite class containing the state of our sprites to play and their progress.
 * @param {Object} options Settings to pass into and setup the sound and visuals.
 */
var Sprite = function(options) {
    var self = this;
    self.sounds = [];
  
    // Setup the options to define this sprite display.
    self._spriteMap = options.spriteMap;
    self._sprite = options.sprite;
  
    // Create our audio sprite definition.
    self.sound = new Howl({
      src: options.src,
      sprite: options.sprite
    });

};
Sprite.prototype = {
  
    /**
     * Play a sprite when clicked and track the progress.
     * @param  {String} key Key in the sprite map object.
     */
    play: function(key) {
      var self = this;
      var sprite = key//self._spriteMap[key];
      var spriteTime = self._sprite[self._spriteMap[key]][1] - self._sprite[self._spriteMap[key]][0];
      //console.log('time in play',spriteTime);
      // Play the sprite sound and capture the ID.
      //var id = 
      self.sound.play(sprite);
      setTimeout(()=>{
        self.sound.stop();
      },spriteTime)
    }

};

//////////
// init //
//////////

const menuMusic = new Player([
  {
    title: 'For Past Present and Future',
    file: 'for-past-present-and-future',
    // howl: ttifffppaf
    howl: null
  },
  {
    title: 'Someone Like You',
    file: 'someone-like-you',
    // howl: ttiffsly
    howl: null
  },
  {
    title: 'Power',
    file: 'power',
    // howl: ttiffp
    howl: null
  },
  {
    title: 'Tard Mode',
    file: 'tard-mode',
    // howl: ttifftm
    howl: null
  },
  {
    title: 'I Care About You',
    file: 'i-care-about-you',
    // howl: ttifficay
    howl: null
  }
]);

const fightMusic = new Player([
    {
        title: 'Mainframe',
        file: 'mainframe',
        howl: null
    },
    {
        title: 'Run and Gun',
        file: 'run-and-gun',
        howl: null
    },
    {
        title: 'Falling for You',
        file: 'falling-for-you',
        howl: null
    }
]);

const smashFX = new Sprite({
    src: [soundPre+'smash.mp3'],
    sprite: {
        fightStart: [0,1467],
        click: [1766,2228],
        web3: [20162,20596],
        back: [26113,26760],
        spawn: [46909,48005],
        disc: [56954,57130],
        homerun: [60303,62199],
        selection: [77200,77654],
        startButton: [98724,99017],
        menuButton: [99919,100058],
        hit: [108042, 108203],
        sparkle: [119104,119595]
    },
    spriteMap: {
        'fightStart': 'fightStart',
        'click': 'click',
        'web3': 'web3',
        'back': 'back',
        'spawn': 'spawn',
        'disc': 'disc',
        'homerun': 'homerun',
        'selection': 'selection',
        'startButton': 'startButton',
        'menuButton': 'menuButton',
        'hit': 'hit',
        'sparkle': 'sparkle'
    }
});

const smashFX2 = new Sprite({
    src: [soundPre+'smash.mp3'],
    sprite: {
        applause: [31750,39211]
    },
    spriteMap: {
        'applause': 'applause'
    }
})

const announce = new Sprite({
    src: [soundPre+'announcer.mp3'],
    sprite: {
        three: [43305,43791],
        two: [44774,45156],
        one: [36610,37121],
        ffight: [36074,36604],
        defeated: [32818,33853],
        ggame: [35211,36064],
        congrats: [51620,53286],
        choose: [81065,82477]
    },
    spriteMap: {
        'three': 'three',
        'two':'two',
        'one':'one',
        'ffight':'ffight',
        'defeated':'defeated',
        'ggame':'ggame',
        'congrats':'congrats',
        'choose':'choose'
    }
})







