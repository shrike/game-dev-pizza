/* eslint object-curly-newline: ["error", "never"] */
/* eslint-env es6 */

/**
 * Setup and control base player.
 */
export default class Player extends Phaser.Sprite {
  /**
   *
   * @param game
   * @param x
   * @param y
   * @param key
   * @param frame
   * @param cursors
   */
  constructor({game, x, y, key, frame, cursors}) {
    super(game, x, y, key, frame);

    // Add the sprite to the game.
    this.game.add.existing(this);
    this.anchor.setTo(0.5);

    // The sprite's position in tile coordinates
    this.marker = new Phaser.Point();
    this.turnPoint = new Phaser.Point();

    this.cursors = cursors;

    this.speed = 150;
    // true if player is turning
    this.animating = false;
    this.threshold = 3;
    this.turnSpeed = 150;
    this.gridsize = 64;
    this.safetile = 1;

    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];

    this.current = Phaser.UP;
    this.turning = Phaser.NONE;
  }

  /**
   * Handle checks on keypress.
   */
  checkKeys() {
    if (!this.cursors.left.isDown &&
      !this.cursors.right.isDown &&
      !this.cursors.up.isDown &&
      !this.cursors.down.isDown) {
      this.stop();
    } else if (this.cursors.left.isDown) {
      this.checkDirection(Phaser.LEFT);
    } else if (this.cursors.right.isDown) {
      this.checkDirection(Phaser.RIGHT);
    } else if (this.cursors.up.isDown) {
      this.checkDirection(Phaser.UP);
    } else if (this.cursors.down.isDown) {
      this.checkDirection(Phaser.DOWN);
    } else {
      //  This forces them to hold the key down to turn the corner
      this.turning = Phaser.NONE;
    }
  }

  /**
   *
   * @param turnTo
   */
  checkDirection(turnTo) {
    if (this.animating) {
      return;
    }

    let {speed} = this;
    if (this.current === this.opposites[turnTo]) {
      this.move(turnTo);
    } if (turnTo === this.current) {

      if (turnTo === Phaser.LEFT || turnTo === Phaser.UP) {
        speed = -speed;
      }

      if (turnTo === Phaser.LEFT || turnTo === Phaser.RIGHT) {
        this.body.velocity.x = speed;
      } else {
        this.body.velocity.y = speed;
      }
    } else {
      this.turning = turnTo;
      this.turnPoint.x = (this.marker.x * this.gridsize) + (this.gridsize / 2);
      this.turnPoint.y = (this.marker.y * this.gridsize) + (this.gridsize / 2);

      if (turnTo === Phaser.LEFT || turnTo === Phaser.RIGHT) {
        this.body.velocity.x = speed;
      } else {
        this.body.velocity.y = speed;
      }
    }
  }

  /**
   *
   * @returns {boolean}
   */
  turn() {
    this.x = this.turnPoint.x;
    this.y = this.turnPoint.y;

    this.body.reset(this.turnPoint.x, this.turnPoint.y);

    this.move(this.turning);

    this.turning = Phaser.NONE;

    return true;
  }

  stop() {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }

  /**
   * Move to direction.
   * @param direction string Direction
   */
  move(direction) {
    let {speed} = this;

    this.animating = true;
    if (direction === Phaser.LEFT || direction === Phaser.UP) {
      speed = -speed;
    }

    if (direction === Phaser.LEFT || direction === Phaser.RIGHT) {
      this.body.velocity.x = speed;
      this.body.velocity.y = 0;
    } else {
      this.body.velocity.y = speed;
      this.body.velocity.x = 0;
    }
    this.game.add.tween(this)
      .to({angle: this.getAngle(direction)}, this.turnSpeed, 'Linear', true)
      .onComplete.addOnce(() => {
        this.animating = false;
      });
    this.current = direction;
  }

  /**
   *
   * @param to
   * @returns {string}
   */
  getAngle(to) {
    //  About-face?
    if (this.current === this.opposites[to]) {
      return '180';
    }

    if ((this.current === Phaser.UP && to === Phaser.LEFT) ||
          (this.current === Phaser.DOWN && to === Phaser.RIGHT) ||
          (this.current === Phaser.LEFT && to === Phaser.DOWN) ||
          (this.current === Phaser.RIGHT && to === Phaser.UP)) {
      return '-90';
    }
    return '90';
  }

  /**
   *
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
    this.calcGridPosition();

    this.checkKeys();

    if (this.turning !== Phaser.NONE) {
      this.turn();
    }
  }
}
