// import Player from '../objects/Player';

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

    this.load.tilemap('map', 'assets/tiles.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('tiles', 'assets/tiles.png');
    this.load.image('player', 'assets/creep_tri_c1.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image('bomb.exploded', 'assets/expl_test.png');
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

    // Move on to the preload state.
    this.game.state.start('Preload');
  }
}
