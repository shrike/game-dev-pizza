/* eslint object-curly-newline: ["error", "never"] */
/* eslint-env es6 */
import Fire from '../objects/Fire';

/**
 * Setup and control base player.
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
  constructor({game, x, y, key, frame, id, isTileFree, removeTile, isTileRemovable}) {
    super(game, x, y, key, frame);

    // Add the sprite to the game.
    this.game.add.existing(this);
    this.anchor.setTo(0.5);
    this.marker = new Phaser.Point();
    this.marker.x = x;
    this.marker.y = y;
    this.id = id;
    this.gridsize = 64;
    this.isTileFree = isTileFree;
    this.removeTile = removeTile;
    this.tail = [];
    this.isTileRemovable = isTileRemovable;
    this.calcGridPosition();

    this.expand();
  }

  expand() {
    const blocked = {left: false,
      right: false,
      up: false,
      down: false};
    for (let c = 0; c <= 4; c++) {
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
   *
   */
  destroy(destroyChildren) {
    this.tail.map((part) => {
      part.destroy();
      return true;
    });

    super.destroy(destroyChildren);
  }

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

  addFire(x, y) {
    return new Fire({game: this.game,
      x: (x + 0.5) * this.gridsize, // this.game.world.centerX,
      y: (y + 0.5) * this.gridsize, // this.game.world.centerY,
      key: 'bomb.exploded'});
  }

  /**
   *
   */
  calcGridPosition() {
    this.marker.x = this.game.math.snapToFloor(Math.floor(this.x), this.gridsize) / this.gridsize;
    this.marker.y = this.game.math.snapToFloor(Math.floor(this.y), this.gridsize) / this.gridsize;
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
