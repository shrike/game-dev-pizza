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
  constructor({game, x, y, key, isTileFree, removeTile, map, onBurnTile}) {

    const frames = {F1111: 0,
      F0111: 1,
      F0011: 2,
      F1100: 3,
      F1001: 4,
      F0110: 5,
      F0000: 6,
      F0101: 7,
      F1010: 8};

    const currentX = map.pixelToGridCoord(x);
    const currentY = map.pixelToGridCoord(y);


    const bottom = isTileFree(currentX, currentY + 1) ? '1' : '0';
    const right = isTileFree(currentX + 1, currentY) ? '1' : '0';
    const top = isTileFree(currentX, currentY - 1) ? '1' : '0';
    const left = isTileFree(currentX - 1, currentY) ? '1' : '0';

    console.log(frames[`F${top}${right}${bottom}${left}`]);

    super(game, x, y, key, frames[`F${top}${right}${bottom}${left}`]);


    // Add the sprite to the game.
    this.game.add.existing(this);
    this.anchor.setTo(0.5);
    this.marker = new Phaser.Point();
    this.marker.x = map.pixelToGridCoord(x);
    this.marker.y = map.pixelToGridCoord(y);
    this.gridsize = map.gridsize;
    this.isTileFree = isTileFree;
    this.removeTile = removeTile;
    this.tail = [];
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
    for (let c = 0; c <= 4; c += 1) {
      if (!blocked.left) {
        blocked.left = !this.expandTailX(-c);
      }

      if (!blocked.right) {
        blocked.right = !this.expandTailX(c);
      }

      if (!blocked.up) {
        blocked.up = !this.expandTailY(c);
      }

      if (!blocked.down) {
        blocked.down = !this.expandTailY(-c);
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
  expandTailX(step) {
    let tail;
    if (!this.isTileFree(this.marker.x + step, this.marker.y)) {
      if (this.removeTile(this.marker.x + step, this.marker.y)) {
        tail = this.addFire(this.marker.x + step, this.marker.y);
        this.tail.push(tail);
      }
      return false;
    }

    tail = this.addFire(this.marker.x + step, this.marker.y);
    this.tail.push(tail);

    return true;
  }

  /**
   * Expands explosion to y axis.
   * @param {int} step
   * @returns {boolean}
   */
  expandTailY(step) {
    let tail;
    if (!this.isTileFree(this.marker.x, this.marker.y + step)) {
      if (this.removeTile(this.marker.x, this.marker.y + step)) {
        tail = this.addFire(this.marker.x, this.marker.y + step);
        this.tail.push(tail);
      }
      return false;
    }

    tail = this.addFire(this.marker.x, this.marker.y + step);
    this.tail.push(tail);

    return true;
  }

  /**
   * Put fire tile at position.
   * @param {int} x
   * @param {int} y
   * @returns {Fire}
   */
  addFire(x, y) {
    const fire = new Fire({game: this.game,
      x: (x + 0.5) * this.gridsize, // this.game.world.centerX,
      y: (y + 0.5) * this.gridsize, // this.game.world.centerY,
      key: 'explosion'});
    this.onBurnTile(fire);
    return fire;
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
