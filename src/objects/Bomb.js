/* eslint object-curly-newline: ["error", "never"] */
/* eslint-env es6 */

/**
 * Setup and control base player.
 */
export default class Bomb extends Phaser.Sprite {
  /**
   *
   * @param game
   * @param x
   * @param y
   * @param key
   * @param frame
   * @param cursors
   */
  constructor({game, x, y, key, frame}) {
    super(game, x, y, key, frame);

    // Add the sprite to the game.
    this.game.add.existing(this);
    this.anchor.setTo(0.5);
    this.marker = new Phaser.Point();
    this.marker.x = x;
    this.marker.y = y;




  }

  /**
   *
   */
  update() {
    if(this.body){
      this.body.immovable = true;
      this.body.allowGravity = false;
    }
  }
}
