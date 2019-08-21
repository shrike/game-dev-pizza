import players from '../generated/Players';

/**
 * Setup the pre-game boot sequence.
 */
export default class Boot extends Phaser.State {
  /**
   * Preload any assets needed for the preload state.
   */
  preload() {

    // this.load.baseURL = 'http://files.phaser.io.s3.amazonaws.com/codingtips/issue005/';
    this.load.baseURL = '';
    this.load.crossOrigin = 'anonymous';

    this.load.json('maps', 'assets/maps.json');

    players.players.forEach(player => {
      player.colors.forEach(color => {
        this.load.spritesheet(`player-${player.name}-${color}`, `assets/${player.name}-${color}.png`, 64, 64);
      })
    });

    this.load.image('bomb', 'assets/bomb.png');

    // bonus images
    this.load.image('bonus-bomb', 'assets/bonus-bomb.png');
    this.load.image('bonus-fire', 'assets/bonus-fire.png');
    this.load.image('bonus-speed', 'assets/bonus-speed.png');
    this.load.spritesheet('sound-icon', 'assets/sound-icon-sprite.png', 32, 32);

    // TODO use map size instead of hardcoded 64
    this.load.spritesheet('explosion', 'assets/explosion-sprite.png', 64, 64);
    this.load.spritesheet('expl-tail', 'assets/expl-tail-sprite.png', 64, 64);

    // loading audio with Phaser does not work for some reason
    this.game.audio = {};
    this.game.audio.background = new Audio('assets/background.wav');
    this.game.audio.nie = new Audio('assets/nienienienie.wav');
    this.game.audio.buh = new Audio('assets/buhhhhhhh.wav');
    this.game.audio.dzh = new Audio('assets/dzhhhh.wav');
    this.game.audio.nimogapove4e = new Audio('assets/nimogapove4e.wav');
    this.game.audio.sekname = new Audio('assets/sekname.wav');
    this.game.audio.stanami = new Audio('assets/stanami.wav');
    this.game.audio.stanamilo6i4ko = new Audio('assets/stanamilo6i4ko.wav');

    this.game.audio.background.loop = true;
    this.game.audio.nie.loop = false;
    this.game.audio.buh.loop = false;
    this.game.audio.dzh.loop = false;
    this.game.audio.nimogapove4e.loop = false;
    this.game.audio.sekname.loop = false;
    this.game.audio.stanami.loop = false;
    this.game.audio.stanamilo6i4ko.loop = false;

    // Play here, so that the buttons can set the correct image
    this.game.audio.background.play();
  }

  /**
   * Setup anything that is needed before the preload state begins.
   */
  create() {
    // Scale the game to fill the entire page.
    // this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    // Don't pause the game on blur.
    // this.game.stage.disableVisibilityChange = true;

    // Disable clearing the canvas on each tick (usually not needed).
    // this.game.clearBeforeRender = false;

    // Disable right click.
    this.game.canvas.oncontextmenu = e => e.preventDefault();

    // Enable running in the background
    this.game.stage.disableVisibilityChange = true;

    // Move on to the preload state.
    this.game.state.start('Preload');
  }
}
