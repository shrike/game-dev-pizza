/* eslint object-curly-newline: ["error", "never"] */
/* eslint-env es6 */
import Fire from '../objects/Fire';

/**
 * Setup and control bomb explosion.
 */
export default class Explosion extends Phaser.Sprite {
  /**
   *
   * @param game
   * @param x
   * @param y
   * @param key
   * @param frame
   * @param cursors
   */
  constructor({game, x, y, key, checkTile, removeTile, map, onBurnTile, flameLength}) {

    const frames = {
      F1111: 0,
      F0111: 1,
      F1011: 2,
      F1101: 3,
      F1110: 4,
      F1100: 5,
      F0110: 6,
      F0011: 7,
      F1001: 8,
      F1010: 9,
      F0101: 10,
      F1000: 11,
      F0100: 12,
      F0010: 13,
      F0001: 14,
      F0000: 15,
    };

    const currentX = map.pixelToGridCoord(x);
    const currentY = map.pixelToGridCoord(y);

    // TODO: CHECK if the tile is destroyable! not if it is free...
    const bottom = checkTile(currentX, currentY + 1) !== 2 ? '1' : '0';
    const right = checkTile(currentX + 1, currentY) !== 2 ? '1' : '0';
    const top = checkTile(currentX, currentY - 1) !== 2 ? '1' : '0';
    const left = checkTile(currentX - 1, currentY) !== 2 ? '1' : '0';

    super(game, x, y, key, frames[`F${top}${right}${bottom}${left}`]);

    this.frame = frames[`F${top}${right}${bottom}${left}`];

    // Add the sprite to the game.
    this.game.add.existing(this);
    this.anchor.setTo(0.5);
    this.marker = new Phaser.Point();
    this.marker.x = map.pixelToGridCoord(x);
    this.marker.y = map.pixelToGridCoord(y);
    this.gridsize = map.gridsize;
    this.checkTile = checkTile;
    this.removeTile = removeTile;
    this.tail = [];
    this.flameLength = flameLength;
    onBurnTile(this);
    this.onBurnTile = onBurnTile;
    this.expand();
  }
  /**
   * Expands the current explosion.
   */
  expand() {
    const blocked = {left: false,
      right: false,
      up: false,
      down: false};
    for (let c = 1; c <= this.flameLength; c += 1) {
      if (!blocked.left) {
        blocked.left = !this.expandTailX(-c, c === this.flameLength);
      }

      if (!blocked.right) {
        blocked.right = !this.expandTailX(c, c === this.flameLength);
      }

      if (!blocked.up) {
        blocked.up = !this.expandTailY(c, c === this.flameLength);
      }

      if (!blocked.down) {
        blocked.down = !this.expandTailY(-c, c === this.flameLength);
      }
    }
  }

  /**
   * Destroy current explosion.
   * @param {Boolean} destroyChildren
   */
  destroy(destroyChildren) {
    this.tail.map((part) => {
      part.destroy(destroyChildren);
      return true;
    });

    super.destroy(destroyChildren);
  }

  /**
   * Expand explosion to x axis.
   * @param {int} step
   * @returns {boolean}
   */
  expandTailX(step, last) {
    let frame = 5;
    if (step > 0) {
      frame = 6;
    }
    if (last) {
      frame -= 4;
    }

    return this.addFire(this.marker.x + step, this.marker.y, frame);
  }

  /**
   * Expands explosion to y axis.
   * @param {int} step
   * @returns {boolean}
   */
  expandTailY(step, last) {
    let frame = 7;
    if (step > 0) {
      frame = 4;
    }

    if (last) {
      frame -= 4;
    }

    return this.addFire(this.marker.x, this.marker.y + step, frame);
  }

  /**
   * Put fire tile at position.
   * @param {int} x
   * @param {int} y
   * @param frame
   * @returns {boolean}
   */
  addFire(x, y, frame) {
    const tileType = this.checkTile(x, y);
    if (tileType === 2) {
      return false;
    }

    const fire = new Fire({game: this.game,
      x: (x + 0.5) * this.gridsize, // this.game.world.centerX,
      y: (y + 0.5) * this.gridsize, // this.game.world.centerY,
      key: 'expl-tail',
      frame});
    this.tail.push(fire);
    this.onBurnTile(fire);

    if (tileType === 1) {
      this.removeTile(x, y);
    }

    return tileType === 0;
  }

  /**
   * Update loop.
   */
  update() {
    if (this.body) {
      this.body.immovable = true;
      this.body.allowGravity = false;
    }
  }
}
