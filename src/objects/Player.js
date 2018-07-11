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
   * @param isTileFree
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

    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
    this.directions = [Phaser.NONE, Phaser.ANGLE_LEFT, Phaser.ANGLE_RIGHT, Phaser.ANGLE_UP,
      Phaser.ANGLE_DOWN];
    this.pressedButtons = [false, false, false, false, false];

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
      return false;
    }

    if (direction === this.current) {
      return false;
    }

    if (this.current !== this.opposites[direction]) {
      this.body.x = this.marker.x * this.map.gridsize;
      this.body.y = this.marker.y * this.map.gridsize;
    }

    this.turning = true;
    this.turned = true;
    this.turning = false;
    this.current = direction;
    this.angle = this.directions[direction];
    return true;
  }

  /**
   *
   */
  move() {
    // if button pressed in new direction - check if we can turn
    if (this.cursors.left.isDown && this.current !== Phaser.LEFT && !this.turned &&
      this.turn(Phaser.LEFT)) {
      ;
    } else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT && !this.turned &&
      this.turn(Phaser.RIGHT)) {
      ;
    } else if (this.cursors.up.isDown && this.current !== Phaser.UP && !this.turned &&
      this.turn(Phaser.UP)) {
      ;
    } else if (this.cursors.down.isDown && this.current !== Phaser.DOWN && !this.turned &&
      this.turn(Phaser.DOWN)) {
      ;
    } else if (!this.pressedButtons[this.current]) {
      // else if button is pressed in current direction - continue, else stop
      this.stop();
      return;
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
    this.marker.x = this.game.math.snapToFloor(Math.floor(this.x), this.map.gridsize)
      / this.map.gridsize;
    this.marker.y = this.game.math.snapToFloor(Math.floor(this.y), this.map.gridsize)
      / this.map.gridsize;
  }

  /**
   *
   */
  checkButtons() {
    if (this.cursors.down.justDown ||
      this.cursors.up.justDown ||
      this.cursors.left.justDown ||
      this.cursors.right.justDown) {
      this.turned = false;
    }
    this.pressedButtons[Phaser.LEFT] = this.cursors.left.isDown;
    this.pressedButtons[Phaser.RIGHT] = this.cursors.right.isDown;
    this.pressedButtons[Phaser.UP] = this.cursors.up.isDown;
    this.pressedButtons[Phaser.DOWN] = this.cursors.down.isDown;
  }

  /**
   *
   */
  update() {
    this.checkButtons();
    this.calcGridPosition();
    this.move();
  }
}
