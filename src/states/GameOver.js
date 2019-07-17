import BackgroundMusicButton from '../objects/BackgroundMusicButton';

/**
 * Setup the game over state.
 */
export default class GameOver extends Phaser.State {

  preload() {
    const gameOverText = 'GAME OVER\nPress any key to restart';
    const textStyle = {font: '50px 8BitCrash', fill: '#F2F2F2', align: 'center'};

    this.stateText = this.game.add.text(
      this.game.world.centerX, this.game.world.centerY, gameOverText, textStyle);

    // Position text at the center
    this.stateText.anchor.setTo(0.5);

    this.game.input.keyboard.onDownCallback = () => {
      this.game.input.keyboard.onDownCallback = null;
      // HACK FIX: if we restart the game here, we end up with a new player for the same browser window
      // this.game.state.start('MainMenu');
    };

    new BackgroundMusicButton({
      x: this.game.world.width - 42,
      y: 10,
      game: this.game
    });
  }

  create() {
    this.stateText.visible = true;
  }
}
