/* eslint object-curly-newline: ["error", "never"] */
/* eslint-env es6 */

/**
 * Setup and control base player.
 */
export default class Player extends Phaser.Sprite {
  /**
   *
   * @param game
   * @param map
   * @param layer
   * @param x
   * @param y
   * @param key
   * @param frame
   * @param cursors
   */
  constructor({game, map, isTileFree, x, y, key, frame, cursors}) {
    super(game, x, y, key, frame);

    this.map = map;
    this.isTileFree = isTileFree;

    // Add the sprite to the game.
    this.game.add.existing(this);
    this.anchor.setTo(0.5);

    // The sprite's position in tile coordinates
    this.marker = new Phaser.Point();

    this.cursors = cursors;

    this.speed = 150;
    this.turned = false;
    this.turning = false;
    this.threshold = 3;
    this.turnSpeed = 150;
    this.gridsize = 64;
    this.safetile = 1;

    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
    this.directions = [Phaser.NONE, Phaser.ANGLE_LEFT, Phaser.ANGLE_RIGHT, Phaser.ANGLE_UP,
      Phaser.ANGLE_DOWN];

    this.current = Phaser.RIGHT;
  }

  /**
   *
   * @param direction
   */
  canTurn(direction) {
    if (direction === Phaser.LEFT) {
      return this.isTileFree(this.marker.x - 1, this.marker.y);
    } else if (direction === Phaser.RIGHT) {
      return this.isTileFree(this.marker.x + 1, this.marker.y);
    } else if (direction === Phaser.UP) {
      return this.isTileFree(this.marker.x, this.marker.y - 1);
    } else if (direction === Phaser.DOWN) {
      return this.isTileFree(this.marker.x, this.marker.y + 1);
    }

    return false;
  }

  /**
   *
   * @param direction
   */
  turn(direction) {
    if (this.turning || !this.canTurn(direction)) {
      return;
    }

    if (direction === this.current) {
      return;
    }

    if (this.current !== this.opposites[direction]) {
      this.body.x = this.marker.x * this.gridsize;
      this.body.y = this.marker.y * this.gridsize;
    }

    this.turning = true;
    this.turned = true;

    this.turning = false;
    this.current = direction;
    this.angle = this.directions[direction];

    // this.game.add.tween(this)
    //   .to({angle: this.getAngle(direction)}, null, null, null)
    //   .onComplete.addOnce(() => {
    //     this.turning = false;
    //     this.current = direction;
    //   });
  }

  /**
   *
   */
  move() {
    let direction = null;

    if (!this.cursors.left.isDown && !this.cursors.right.isDown &&
        !this.cursors.up.isDown && !this.cursors.down.isDown) {
      // not pressing any movement keys!
      this.stop();
      return;
    }

    // check for new direction request (holding down left while moving down)
    if (!this.turned) {
      if (this.cursors.left.isDown && this.current !== Phaser.LEFT) {
        direction = Phaser.LEFT;
      } else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT) {
        direction = Phaser.RIGHT;
      } else if (this.cursors.up.isDown && this.current !== Phaser.UP) {
        direction = Phaser.UP;
      } else if (this.cursors.down.isDown && this.current !== Phaser.DOWN) {
        direction = Phaser.DOWN;
      }

      if (direction) {
        this.turn(direction);
      }
    }

    if (this.current === Phaser.LEFT) {
      this.body.velocity.x = -this.speed;
      this.body.velocity.y = 0;
    } else if (this.current === Phaser.RIGHT) {
      this.body.velocity.x = this.speed;
      this.body.velocity.y = 0;
    } else if (this.current === Phaser.UP) {
      this.body.velocity.x = 0;
      this.body.velocity.y = -this.speed;
    } else if (this.current === Phaser.DOWN) {
      this.body.velocity.x = 0;
      this.body.velocity.y = this.speed;
    } else {
      // invalid ?
    }
  }

  /**
   *
   */
  stop() {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }

  /**
   *
   * @param to
   * @returns {int}
   */
  getAngle(to) {
    //  About-face?
    if (this.current === this.opposites[to]) {
      return 180;
    }

    if ((this.current === Phaser.UP && to === Phaser.LEFT) ||
          (this.current === Phaser.DOWN && to === Phaser.RIGHT) ||
          (this.current === Phaser.LEFT && to === Phaser.DOWN) ||
          (this.current === Phaser.RIGHT && to === Phaser.UP)) {
      return -90;
    }
    return 90;
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
  resetButtons() {
    if (this.cursors.down.justDown ||
      this.cursors.up.justDown ||
      this.cursors.left.justDown ||
      this.cursors.right.justDown) {
      this.turned = false;
    }
  }

  /**
   *
   */
  update() {
    this.resetButtons();
    this.calcGridPosition();
    this.move();
  }
}
