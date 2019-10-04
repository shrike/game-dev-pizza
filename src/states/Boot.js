import players from '../generated/Players';
import sound from '../objects/Sound';

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
      });
    });

    this.load.image('bomb', 'assets/bomb.png');

    // bonus images
    this.load.image('bonus-bomb', 'assets/bonus-bomb.png');
    this.load.image('bonus-fire', 'assets/bonus-fire.png');
    this.load.image('bonus-speed', 'assets/bonus-speed.png');
    this.load.image('bonus-infection', 'assets/bonus-infection.png');
    this.load.spritesheet('sound-icon', 'assets/sound-icon-sprite.png', 32, 32);

    // TODO use map size instead of hardcoded 64
    this.load.spritesheet('explosion', 'assets/explosion-sprite.png', 64, 64);
    this.load.spritesheet('expl-tail', 'assets/expl-tail-sprite.png', 64, 64);

    // loading audio with Phaser does not work for some reason
    this.game.audio = {};
    this.game.audio.background = new Audio('assets/background.wav');

    this.game.audio.bombExpld1 = new Audio('assets/bombExpld1.wav');
    this.game.audio.bombExpld2 = new Audio('assets/bombExpld2.wav');
    this.game.audio.bombExpld3 = new Audio('assets/bombExpld3.wav');
    this.game.audio.bombExpld4 = new Audio('assets/bombExpld4.wav');

    this.game.audio.death1 = new Audio('assets/death1.wav');
    this.game.audio.death2 = new Audio('assets/death2.wav');
    this.game.audio.death3 = new Audio('assets/death3.wav');
    this.game.audio.death4 = new Audio('assets/death4.wav');
    this.game.audio.death5 = new Audio('assets/death5.wav');

    this.game.audio.bonus1 = new Audio('assets/bonus1.wav');
    this.game.audio.bonus2 = new Audio('assets/bonus2.wav');
    this.game.audio.bonus3 = new Audio('assets/bonus3.wav');
    this.game.audio.bonus4 = new Audio('assets/bonus4.wav');
    this.game.audio.bonus5 = new Audio('assets/bonus5.wav');

    this.game.audio.move1 = new Audio('assets/move1.wav');
    this.game.audio.move2 = new Audio('assets/move2.wav');

    // load the sounds in the 'sound' singleton
    sound.init(this.game);

    this.game.audio.background.loop = true;

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
