export default class Bonus extends Phaser.Sprite {
  /**
   * @param game
   * @param map
   * @param x
   * @param y
   * @param key
   * @param frame
   */
  constructor({game, map, x, y, key, frame}) {
    console.log(x);
    super(
      game,
      x,
      y,
      key,
      frame
    );

    this.game.add.existing(this);
    this.anchor.setTo(0.5);
  }

  addToPlayer(player) {
    this.destroy();
  }
}
