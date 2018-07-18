/* eslint object-curly-newline: ["error", "never"] */
/* eslint-env es6 */

/**
 * Setup and control base player.
 */
export default class Bomb extends Phaser.Sprite {
  /**
   * @param game
   * @param map
   * @param x
   * @param y
   * @param key
   * @param frame
   * @param cursors
   */
  constructor({game, map, x, y, key, frame, id}) {
    super(
      game,
      game.math.snapToFloor(x, map.gridsize) + (map.gridsize / 2),
      game.math.snapToFloor(y, map.gridsize) + (map.gridsize / 2),
      key,
      frame
    );
    this.game.add.existing(this);
    this.anchor.setTo(0.5);
    this.marker = map.pixelToGrid(this);
    this.id = id;
  }

  /**
   *
   */
  update() {
    if (this.body) {
      this.body.immovable = true;
      this.body.allowGravity = false;
    }
  }
}
