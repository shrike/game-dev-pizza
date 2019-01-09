/**
 * Setup the game over state.
 */
export default class GameOver extends Phaser.State {

  preload() {
    const gameOverText = 'GAME OVER\nPress any key to restart';
    const textStyle = {font: '50px Arial', fill: '#F2F2F2', align: 'center'};

    this.stateText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, gameOverText, textStyle);

    // Position text at the center
    this.stateText.anchor.setTo(0.5);

    this.game.input.keyboard.onDownCallback = function() {
      this.game.input.keyboard.onDownCallback = null;
      // HACK FIX: if we restart the game here, we end up with a new player for the same browser window
      // this.game.state.start('Main');
    };
  }

  create() {
    this.stateText.visible = true;
  }
}
