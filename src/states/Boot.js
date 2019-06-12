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

    // TODO use map size instead of hardcoded 64
    this.load.spritesheet('explosion', 'assets/explosion-sprite.png', 64, 64);
    this.load.spritesheet('expl-tail', 'assets/expl-tail-sprite.png', 64, 64);
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
