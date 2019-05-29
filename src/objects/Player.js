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
   * @param isTileBrickFree
   * @param x
   * @param y
   * @param key
   * @param frame
   * @param cursors
   */
  constructor({game, map, isTileBrickFree, x, y, key, frame, cursors, id, isPlayerLocal}) {
    super(game, x, y, key, frame);

    this.map = map;
    this.isTileBrickFree = isTileBrickFree;
    this.id = id;
    this.isPlayerLocal = isPlayerLocal

    // Add the sprite to the game.
    this.game.add.existing(this);
    this.anchor.setTo(0.5);

    // The sprite's position in tile coordinates
    this.marker = new Phaser.Point();

    this.cursors = cursors;

    this.speed = 150;
    this.animRate = 30;
    this.turned = false;
    this.turning = false;

    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
    this.pressedButtons = [false, false, false, false, false];
    this.buttonsQueue = [];
    this.current = Phaser.DOWN;

    this.flameLength = 1;
    this.bombsAvailable = 1;

    Client.socket.on("position", (position) => {
      if (id === position.playerId) {
        // record the position before we update it
        this.lastPosition.x = this.position.x;
        this.lastPosition.y = this.position.y;
        // update position
        this.position = position.position;
        if (this.position.x > this.lastPosition.x) {
          this.current = Phaser.RIGHT;
          this.animate();
        } else if (this.position.x < this.lastPosition.x) {
          this.current = Phaser.LEFT;
          this.animate();
        } else if (this.position.y > this.lastPosition.y) {
          this.current = Phaser.DOWN;
          this.animate();
        } else if (this.position.y < this.lastPosition.y) {
          this.current = Phaser.UP;
          this.animate();
        } else {
          this.stopAnimation();
        }
      };
    });

    let walk_l = this.animations.add('walk-left', [4,5,6,7]);
    let walk_r = this.animations.add('walk-right', [8,9,10,11]);

    let walk_u = this.animations.add('walk-up', [12,13,14,15]);
    let walk_d = this.animations.add('walk-down', [0,1,2,3]);

    [walk_d, walk_l, walk_r, walk_u].map((anim) => {

      anim.enableUpdate = true;
      anim.onUpdate.add(this.update, this);
    })

    this.lastPosition = {};
    this.stopSent = false;
    const playerTints = [0xffffff, 0xffaa00, 0xff00aa, 0x9944ff, 0x4f4f4e, 0x33a0ff];
    this.tint = playerTints[id % 6];
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
      return this.isTileBrickFree(left.x, left.y);
    } else if (direction === Phaser.RIGHT) {
      return this.isTileBrickFree(right.x, right.y);
    } else if (direction === Phaser.UP) {
      return this.isTileBrickFree(top.x, top.y);
    } else if (direction === Phaser.DOWN) {
      return this.isTileBrickFree(bottom.x, bottom.y);
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

    this.animate();

    return true;
  }

  animate() {
    if (this.current === Phaser.LEFT) {
      this.animations.play('walk-left', this.animRate, true);
    } else if (this.current === Phaser.RIGHT) {
      this.animations.play('walk-right', this.animRate, true);
    } else if (this.current === Phaser.UP) {
      this.animations.play('walk-up', this.animRate, true);
    } else if (this.current === Phaser.DOWN) {
      this.animations.play('walk-down', this.animRate, true);
    }
  }

  /**
   *
   */
  move() {

    // if button pressed in new direction - check if we can turn
    if (this.pressedButtons[Phaser.LEFT] && this.current !== Phaser.LEFT && !this.turned &&
      this.turn(Phaser.LEFT)) {
      ;
    } else if (this.pressedButtons[Phaser.RIGHT] && this.current !== Phaser.RIGHT && !this.turned &&
      this.turn(Phaser.RIGHT)) {
      ;
    } else if (this.pressedButtons[Phaser.UP] && this.current !== Phaser.UP && !this.turned &&
      this.turn(Phaser.UP)) {
      ;
    } else if (this.pressedButtons[Phaser.DOWN] && this.current !== Phaser.DOWN && !this.turned &&
      this.turn(Phaser.DOWN)) {
      ;
    } else if (!this.pressedButtons[this.current]) {
      // else if button is pressed in current direction - continue, else stop
      this.stop();
      if (!this.stopSent) {
        Client.sendPosition(this.position);
        this.stopSent = true;
      }
      return;
    }

    this.stopSent = false;

    this.turned = false;

    if (this.animations.currentAnim.isFinished) {
      this.animate();
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
    this.stopAnimation();
  }

  stopAnimation() {
    if (this.animations.currentAnim) {
      this.animations.currentAnim.stop();
    }
    this.frame = 16 + this.current;
    // Phaser.DOWN == 4 not 0; gawddamn
    if (this.current === Phaser.DOWN) {
      this.frame = 16;
    }
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

  sendPosition() {

    if (this.lastPosition.x !== this.position.x || this.lastPosition.y !== this.position.y) {
      this.lastPosition.x = this.position.x;
      this.lastPosition.y = this.position.y;
      Client.sendPosition(this.position);
      this.stopSent = false;
    }
  }

  /**
   *
   */
  update() {
    // Only the local player can be controlled via the keyboard
    if (this.isPlayerLocal) {
      this.checkButtons();
      this.calcGridPosition();
      this.move();
      this.sendPosition();
    }
  }

  addAdditionalFlame() {
    this.flameLength += 1;
  }

  addAdditionalBomb() {
    this.bombsAvailable += 1;
  }
}
