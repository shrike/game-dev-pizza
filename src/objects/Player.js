/* eslint object-curly-newline: ["error", "never"] */
/* eslint-env es6 */
import Client from '../client/Client';
import BombInfectionBonus, {type as spamBombsType}  from '../objects/BombInfectBonus';
/**
 * Setup and control base player.
 */
export default class Player extends Phaser.Sprite {

  constructor({game, map, isTileBrickFree, x, y, key, frame, cursors, id, isPlayerLocal, addBomb}) {
    super(game, x, y, key, frame);

    this.map = map;
    this.isTileBrickFree = isTileBrickFree;
    this.id = id;
    this.isPlayerLocal = isPlayerLocal;

    // Add the sprite to the game.
    this.game.add.existing(this);
    this.anchor.setTo(0.5);

    // The sprite's position in tile coordinates
    this.marker = new Phaser.Point();

    this.cursors = cursors;

    this.initialSpeed = 150;
    this.speed = this.initialSpeed;
    this.animRate = 30;
    this.turned = false;
    this.turning = false;

    this.opposites = [Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP];
    this.pressedButtons = [false, false, false, false, false];
    this.buttonsQueue = [];
    this.current = Phaser.DOWN;
    this.bombPlaced = false;
    this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
    this.addBomb = addBomb;
    this.infections = new Map();
    this._bombsAvailable = 1;


    this.flameLength = 1;


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
    });

    this.lastPosition = {};
    this.stopSent = false;
  }

  canTurn(direction) {
    const left = this.left;
    const right = this.right;
    const top = this.top;
    const bottom = this.bottom;

    if (direction === Phaser.LEFT) {
      return this.isTileBrickFree(left.x - 1, left.y);
    } else if (direction === Phaser.RIGHT) {
      return this.isTileBrickFree(right.x + 1, right.y);
    } else if (direction === Phaser.UP) {
      return this.isTileBrickFree(top.x, top.y + 1);
    } else if (direction === Phaser.DOWN) {
      return this.isTileBrickFree(bottom.x, bottom.y - 1);
    }

    return false;
  }


  turn(direction) {

    if (this.turning || !this.canTurn(direction) || direction === this.current) {
      return;
    }

    if (this.current !== this.opposites[direction]) {
      this.body.x = this.marker.x * this.map.gridsize;
      this.body.y = this.marker.y * this.map.gridsize;
    }

    this.current = direction;

    this.animate();
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

  move() {
    const lastPressedDirection = this.buttonsQueue[this.buttonsQueue.length - 1];

    if (this.turnAvailable(lastPressedDirection)) {
      this.turn(lastPressedDirection);
    } else if (!this.pressedButtons[this.current]) { // else if button is pressed in current direction - continue, else stop
      this.stop();
      this.buttonsQueue.pop(lastPressedDirection);
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

    this.changeVelocity();
  }

  changeVelocity() {
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
    }
  }

  turnAvailable(direction) {
    if (this.pressedButtons[direction] && this.current !== direction && !this.turned) {
      return true;
    }
    return false;
  }

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

  calcGridPosition() {
    this.marker = this.map.pixelToGrid(this);
  }

  checkButtons() {
    if (this.cursors.down.justDown) {
      this.buttonsQueue.push(Phaser.DOWN);
    }
    if (this.cursors.up.justDown) {
      this.buttonsQueue.push(Phaser.UP);
    }
    if (this.cursors.left.justDown) {
      this.buttonsQueue.push(Phaser.LEFT);
    }
    if (this.cursors.right.justDown) {
      this.buttonsQueue.push(Phaser.RIGHT);
    }
    if (this.buttonsQueue.lenght > 0) {
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

  update() {
    // Only the local player can be controlled via the keyboard
    if (this.isPlayerLocal) {

      if (((this.aKey && this.aKey.isDown && !this.bombPlaced) || this.isSpammer) && this.bombsAvailable > 0) {
        const bomb = this.addBomb(this.x, this.y, this.id);
        if (bomb) {
          this.bombsAvailable -= 1;
          bomb.events.onDestroy.add(() => this.bombsAvailable += 1, this);
          this.bombPlaced = !this.isSpammer;
        }
      }
      if (this.aKey && this.aKey.isUp) {
        this.bombPlaced = false;
      }

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

  increaseSpeed() {
    this.speed += 0.5 * this.initialSpeed;
  }

  addInfection(infection) {
    infection.infectPlayer();

    if (!this.infections.has(infection.uniqueType) || !this.infections.get(infection.uniqueType).isActive) {
      this.infections.set(infection.uniqueType, infection);
    }
  }

  getInfections() {
    return this.infections;
  }

  get bombsAvailable() {
    return this._bombsAvailable;
  }

  set bombsAvailable(n) {
    this._bombsAvailable = n;
  }

  get isSpammer() {
    return this.infections.has(spamBombsType) && this.infections.get(spamBombsType).isActive;
  }
}
