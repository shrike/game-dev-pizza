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
    ['left', 'right', 'up', 'down'].map((position) => {
      for (let c = 0; c <= 4; c++) {
        if(position === 'left' && this.expandTaileft(c)) {
          continue;
        } else if(position === 'right' && this.expandTailRight(c)) {
          continue;
        } else if(position === 'up' && this.expandTailUp(c)) {
          continue;
        } else if(position === 'down' && this.expandTailDown(c)) {
          continue;
        }

        break;
      }
      return 1;
    });


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

  expandTailDown(step) {
    let res = true;
    if (!this.isTileFree(this.marker.x, this.marker.y + step)) {
      res = this.removeTile(this.marker.x, this.marker.y + step);
    }
    if (res) {
      const tail = new Fire({
        game: this.game,
        x: (this.marker.x + 0.5) * this.gridsize, // this.game.world.centerX,
        y: (this.marker.y + step + 0.5) * this.gridsize, // this.game.world.centerY,
        key: 'bomb.exploded',
      });

      this.tail.push(tail);
    }
    return res;
  }

  expandTailUp(step) {
    let res = true;
    if (!this.isTileFree(this.marker.x, this.marker.y - step)) {
      res = this.removeTile(this.marker.x, this.marker.y - step);
    }
    if (res) {
      const tail = new Fire({
        game: this.game,
        x: (this.marker.x + 0.5) * this.gridsize, // this.game.world.centerX,
        y: (this.marker.y - step + 0.5) * this.gridsize, // this.game.world.centerY,
        key: 'bomb.exploded',

      });
      this.tail.push(tail);
    }
    return res;
  }

  expandTailRight(step) {
    let res = true;
    if (!this.isTileFree(this.marker.x + step, this.marker.y)) {
      res = this.removeTile(this.marker.x + step, this.marker.y);
    }
    if (res) {
      const tail = new Fire({
        game: this.game,
        x: (this.marker.x + step + 0.5) * this.gridsize, // this.game.world.centerX,
        y: (this.marker.y + 0.5) * this.gridsize, // this.game.world.centerY,
        key: 'bomb.exploded',

      });
      this.tail.push(tail);
    }
    return res;
  }

  expandTaileft(step) {
    let res = true;
    if (!this.isTileFree(this.marker.x - step, this.marker.y)) {
      res = this.removeTile(this.marker.x - step, this.marker.y);
    }
    if (res) {
      const tail = new Fire({
        game: this.game,
        x: (this.marker.x - step + 0.5) * this.gridsize, // this.game.world.centerX,
        y: (this.marker.y + 0.5) * this.gridsize, // this.game.world.centerY,
        key: 'bomb.exploded',
      });
      this.tail.push(tail);
    }
    return res;
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
