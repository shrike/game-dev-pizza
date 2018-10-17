/* eslint object-curly-newline: ["error", "never"] */
/* eslint-env es6 */

import Explosion from './Explosion';

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
  constructor({game, map, x, y, key, frame, id, onExplode, isTileFree, removeTile, onBurnTile}) {
    super(
      game,
      game.math.snapToFloor(x, map.gridsize) + (map.gridsize / 2),
      game.math.snapToFloor(y, map.gridsize) + (map.gridsize / 2),
      key,
      frame
    );

    this.map = map;
    this.game.add.existing(this);
    this.anchor.setTo(0.5);
    this.marker = map.pixelToGrid(this);
    this.id = id;
    this.game.time.events.add(Phaser.Timer.SECOND * 4, this.explode, this);
    this.onExplode = onExplode;
    this.isTileFree = isTileFree;
    this.removeTile = removeTile;
    this.exploded = false;
    this.onBurnTile = onBurnTile;
  }

  /**
   *
   */
  update() {
    if (this.body) {
      this.body.immovable = true;
      this.body.allowGravity = false;
      this.body.static = true;
      this.body.enabled = true;
    }
  }

  explode() {
    if (this.exploded) {
      return;
    }
    this.exploded = true;
    this.onExplode(this);

    const explosion = new Explosion({
      game: this.game,
      x: this.x,
      y: this.y,
      key: 'explosion',
      isTileFree: this.isTileFree,
      removeTile: this.removeTile,
      map: this.map,
      onBurnTile: this.onBurnTile,
    });

    this.game.time.events.add(Phaser.Timer.SECOND * 2, () => explosion.destroy(true), this);
    this.destroy();
  }
}
