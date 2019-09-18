export const type = 'harmless-virus';

export default class Infection extends Phaser.Sprite {

  /**
   * @param game
   * @param map
   * @param x
   * @param y
   * @param key
   * @param frame
   */
  constructor({game, map, x, y, key, frame}) {
    super(
      game,
      x,
      y,
      key,
      frame,
    );

    this.game.add.existing(this);
    this.anchor.setTo(0.5);
    this._isActive = true;
    this.timer = null;
  }

  get uniqueType() {
    return undefined;
  }

  infectPlayer() {
    if (!this.timer) {
      this.timer = window.setTimeout(() => {
        this._isActive = false;
        this.timer = null;
      }, 20000);
    }
    this.destroy();
  }

  get isActive() {
    return this._isActive;
  }
}
