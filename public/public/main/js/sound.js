/*

 ___   ___   ______   ___ __ __   ______       ______   ______   __  __   ___   __    ______      
/__/\ /__/\ /_____/\ /__//_//_/\ /_____/\     /_____/\ /_____/\ /_/\/_/\ /__/\ /__/\ /_____/\     
\::\ \\  \ \\:::_ \ \\::\| \| \ \\::::_\/_    \::::_\/_\:::_ \ \\:\ \:\ \\::\_\\  \ \\:::_ \ \    
 \::\/_\ .\ \\:\ \ \ \\:.      \ \\:\/___/\    \:\/___/\\:\ \ \ \\:\ \:\ \\:. `-\  \ \\:\ \ \ \   
  \:: ___::\ \\:\ \ \ \\:.\-/\  \ \\::___\/_    \_::._\:\\:\ \ \ \\:\ \:\ \\:. _    \ \\:\ \ \ \  
   \: \ \\::\ \\:\_\ \ \\. \  \  \ \\:\____/\     /____\:\\:\_\ \ \\:\_\:\ \\. \`-\  \ \\:\/.:| | 
    \__\/ \::\/ \_____\/ \__\/ \__\/ \_____\/     \_____\/ \_____\/ \_____\/ \__\/ \__\/ \____/_/ 
                                                                                                  
                                                    

*/


/**
 * Player class containing the state of our playlist and where we are in it.
 * Includes all methods for playing, skipping, updating the display, etc.
 * @param {Array} playlist Array of objects with playlist song details ({title, file, howl}).
 */
var Player = function(playlist) {
    this.playlist = playlist;
    this.index = 0;
    var isPlaying;
    // Display the title of the first track.
    //track.innerHTML = '1. ' + playlist[0].title;
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
      // If we already loaded this track, use the current one.
      // Otherwise, setup and load a new Howl.
      if (data.howl) {
        sound = data.howl;
      } else {
        sound = data.howl = new Howl({
          src: ['./public/main/' + data.file + '.mp3'],
          html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
          onplay: function() {
            // Display the duration.
            //duration.innerHTML = self.formatTime(Math.round(sound.duration()));
  
            // Start updating the progress of the track.
            //requestAnimationFrame(self.step.bind(self));
  
            // Start the wave animation if we have already loaded
          //   wave.container.style.display = 'block';
          //   bar.style.display = 'none';
          //   pauseBtn.style.display = 'block';
          },
          onload: function() {
            // Start the wave animation.
          //   wave.container.style.display = 'block';
          //   bar.style.display = 'none';
          //   loading.style.display = 'none';
          },
          onend: function() {
            // Stop the wave animation.
          //   wave.container.style.display = 'none';
          //   bar.style.display = 'block';
            //self.skip();
          },
          onpause: function() {
            // Stop the wave animation.
          //   wave.container.style.display = 'none';
          //   bar.style.display = 'block';
          },
          onstop: function() {
            // Stop the wave animation.
          //   wave.container.style.display = 'none';
          //   bar.style.display = 'block';
          },
          onseek: function() {
            // Start updating the progress of the track.
            //requestAnimationFrame(self.step.bind(self));
          }
        });
      }
  
      // Begin playing the sound.
      sound.play();
  
      // Update the track display.
      //track.innerHTML = (index + 1) + '. ' + data.title;
  
      // Show the pause button.
      // if (sound.state() === 'loaded') {
      //   playBtn.style.display = 'none';
      //   pauseBtn.style.display = 'block';
      // } else {
      //   loading.style.display = 'block';
      //   playBtn.style.display = 'none';
      //   pauseBtn.style.display = 'none';
      // }
  
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
          console.log('skipping now')
          console.log('self index',self.index);
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
// var Sprite = function(options) {
//     var self = this;
//     self.sounds = [];
  
//     // Setup the options to define this sprite display.
//     self._spriteMap = options.spriteMap;
//     self._sprite = options.sprite;
  
//     // Create our audio sprite definition.
//     self.sound = new Howl({
//       src: options.src,
//       sprite: options.sprite
//     });

// };
// Sprite.prototype = {
//     /**
//      * Setup the listeners for each sprite click area.
//      */
//     // setupListeners: function() {
//     //   var self = this;
//     //   var keys = Object.keys(self._spriteMap);
  
//     //   keys.forEach(function(key) {
//     //     window[key].addEventListener('click', function() {
//     //       self.play(key);
//     //     }, false);
//     //   });
//     // },
  
//     /**
//      * Play a sprite when clicked and track the progress.
//      * @param  {String} key Key in the sprite map object.
//      */
//     play: function(key) {
//       var self = this;
//       var sprite = key//self._spriteMap[key];
//       var spriteTime = self._sprite[self._spriteMap[key]][1] - self._sprite[self._spriteMap[key]][0];
//       //console.log('time in play',spriteTime);
//       // Play the sprite sound and capture the ID.
//       //var id = 
//       self.sound.play(sprite);
//       setTimeout(()=>{
//         self.sound.stop();
//       },spriteTime)
//     }

// };

msPlayer = new Player([
  {
    title: 'intro',
    file: 'intro',
    howl: null
  }
])


function playIntro() {
  msPlayer.play(0);
}