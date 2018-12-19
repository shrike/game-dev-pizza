/* eslint object-curly-newline: ["error", "never"] */
/* eslint-env es6 */
import Client from '../client/Client';
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
  constructor({game, map, isTileFree, x, y, key, frame, cursors, id, isPlayerLocal}) {
    super(game, x, y, key, frame);

    this.map = map;
    this.isTileFree = isTileFree;
    this.id = id;
    this.isPlayerLocal = isPlayerLocal

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
    this.pressedButtons = [false, false, false, false, false];
    this.buttonsQueue = [];
    this.current = Phaser.DOWN;

    Client.socket.on("buttons", (buttons) => {
      if (id === buttons.playerId) {
        this.buttonsQueue.push(buttons.buttons);
      };
    });

  }

  /**
   *
   * @param direction
   */
  canTurn(direction) {
    const left = this.map.getTileWorldXY(this.left - 1, this.centerY);
    const right = this.map.getTileWorldXY(this.right + 1, this.centerY);
    const top = this.map.getTileWorldXY(this.centerX, this.top - 1);
    const bottom = this.map.getTileWorldXY(this.centerX, this.bottom + 1);

    if (direction === Phaser.LEFT) {
      return this.isTileFree(left.x, left.y);
    } else if (direction === Phaser.RIGHT) {
      return this.isTileFree(right.x, right.y);
    } else if (direction === Phaser.UP) {
      return this.isTileFree(top.x, top.y);
    } else if (direction === Phaser.DOWN) {
      return this.isTileFree(bottom.x, bottom.y);
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
    this.frame = direction;
    return true;
  }

  /**
   *
   */
  move() {

    const event = this.buttonsQueue.shift();

    if (!event) {
      this.stop();
      return;
    }

    // if button pressed in new direction - check if we can turn
    if (event[Phaser.LEFT] && this.current !== Phaser.LEFT && !this.turned &&
      this.turn(Phaser.LEFT)) {
      ;
    } else if (event[Phaser.RIGHT] && this.current !== Phaser.RIGHT && !this.turned &&
      this.turn(Phaser.RIGHT)) {
      ;
    } else if (event[Phaser.UP] && this.current !== Phaser.UP && !this.turned &&
      this.turn(Phaser.UP)) {
      ;
    } else if (event[Phaser.DOWN] && this.current !== Phaser.DOWN && !this.turned &&
      this.turn(Phaser.DOWN)) {
      ;
    } else if (!event[this.current]) {
      // else if button is pressed in current direction - continue, else stop
      this.stop();
      return;
    }

    this.turned = false;

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
    this.marker = this.map.pixelToGrid(this);
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
    // Only the local player can be controlled via the keyboard
    if (this.isPlayerLocal) {
      this.checkButtons();
    }

    this.calcGridPosition();
    if (this.cursors && (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown)) {
      Client.sendButtons({playerId: this.id, buttons: this.pressedButtons});
    }

    this.move();
  }
}
