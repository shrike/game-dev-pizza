import throttle from 'lodash.throttle';
import Player from '../objects/Player';

/**
 * Setup and display the main game state.
 */
export default class Main extends Phaser.State {

  /**
   * Setup all objects, etc needed for the main game state.
   */
  create() {

    this.map = this.add.tilemap('map');
    this.map.addTilesetImage('tiles', 'tiles');

    this.layer = this.map.createLayer('Tile Layer 1');

    this.map.setCollision(20, true, this.layer);

    // // Enable arcade physics.
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.safetile = 1;
    this.gridsize = 32;

    this.turnPoint = new Phaser.Point();

    this.car = this.add.sprite(48, 48, 'car');
    this.car.anchor.set(0.5);

    this.physics.arcade.enable(this.car);

    this.player = new Car(this.car, this.input.keyboard.createCursorKeys());

    this.player.move(Phaser.DOWN);

    // // Add background tile.
    // this.game.add.tileSprite(-5000, -5000, 10000, 10000, 'bg');

    // // Add a player to the game.
    // this.player = new Player({
    //   game: this.game,
    //   x: this.game.world.centerX,
    //   y: this.game.world.centerY,
    //   key: 'textures',
    //   frame: 'ship',
    // });

    // // ...

    // // Setup listener for window resize.
    // window.addEventListener('resize', throttle(this.resize.bind(this), 50), false);
  }

  /**
   * Resize the game to fit the window.
   */
  resize() {
    // const width = window.innerWidth * window.devicePixelRatio;
    // const height = window.innerHeight * window.devicePixelRatio;

    // this.scale.setGameSize(width, height);
  }

  /**
   * Handle actions in the main game loop.
   */
  update() {
    
    this.physics.arcade.collide(this.car, this.layer);

    this.player.marker.x = this.math.snapToFloor(Math.floor(this.car.x), this.gridsize) / this.gridsize;
    this.player.marker.y = this.math.snapToFloor(Math.floor(this.car.y), this.gridsize) / this.gridsize;

    //  Update our grid sensors
    this.player.updateGridSensors(this.map);

    this.player.checkKeys();

    this.player.update();
  }
}

class Car {

  constructor(car, cursors) {

    this.car = car;
    this.marker = new Phaser.Point();
    this.cursors = cursors;

    this.speed = 150;
    this.threshold = 3;
    this.turnSpeed = 150;

    this.directions = [ null, null, null, null, null ];
    this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

    this.current = Phaser.UP;
    this.turning = Phaser.NONE;
  }
  
  checkKeys() {

      if (this.cursors.left.isDown && this.current !== Phaser.LEFT)
      {
          this.checkDirection(Phaser.LEFT);
      }
      else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT)
      {
          this.checkDirection(Phaser.RIGHT);
      }
      else if (this.cursors.up.isDown && this.current !== Phaser.UP)
      {
          this.checkDirection(Phaser.UP);
      }
      else if (this.cursors.down.isDown && this.current !== Phaser.DOWN)
      {
          this.checkDirection(Phaser.DOWN);
      }
      else
      {
          //  This forces them to hold the key down to turn the corner
          this.turning = Phaser.NONE;
      }

  }

  checkDirection(turnTo) {

      if (this.turning === turnTo || this.directions[turnTo] === null || this.directions[turnTo].index !== this.safetile)
      {
          //  Invalid direction if they're already set to turn that way
          //  Or there is no tile there, or the tile isn't index a floor tile
          return;
      }

      //  Check if they want to turn around and can
      if (this.current === this.opposites[turnTo])
      {
          this.move(turnTo);
      }
      else
      {
          this.turning = turnTo;

          this.turnPoint.x = (this.marker.x * this.gridsize) + (this.gridsize / 2);
          this.turnPoint.y = (this.marker.y * this.gridsize) + (this.gridsize / 2);
      }

  }

  turn() {

      var cx = Math.floor(this.car.x);
      var cy = Math.floor(this.car.y);

      //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
      if (!this.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold))
      {
          return false;
      }

      this.car.x = this.turnPoint.x;
      this.car.y = this.turnPoint.y;

      this.car.body.reset(this.turnPoint.x, this.turnPoint.y);

      this.move(this.turning);

      this.turning = Phaser.NONE;

      return true;
  }

  move(direction) {

      var speed = this.speed;

      if (direction === Phaser.LEFT || direction === Phaser.UP)
      {
          speed = -speed;
      }

      if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
      {
          this.car.body.velocity.x = speed;
      }
      else
      {
          this.car.body.velocity.y = speed;
      }

      // this.add.tween(this.car).to( { angle: this.getAngle(direction) }, this.turnSpeed, "Linear", true);

      this.current = direction;
  }

  getAngle(to) {

      //  About-face?
      if (this.current === this.opposites[to])
      {
          return "180";
      }

      if ((this.current === Phaser.UP && to === Phaser.LEFT) ||
          (this.current === Phaser.DOWN && to === Phaser.RIGHT) ||
          (this.current === Phaser.LEFT && to === Phaser.DOWN) ||
          (this.current === Phaser.RIGHT && to === Phaser.UP))
      {
          return "-90";
      }

      return "90";
  }

  updateGridSensors(map) {

    var layerIndex = 0; //FIXME - this should not be a const
    this.directions[1] = map.getTileLeft(layerIndex, this.marker.x, this.marker.y);
    this.directions[2] = map.getTileRight(layerIndex, this.marker.x, this.marker.y);
    this.directions[3] = map.getTileAbove(layerIndex, this.marker.x, this.marker.y);
    this.directions[4] = map.getTileBelow(layerIndex, this.marker.x, this.marker.y);
  }

  update() {

    if (this.turning !== Phaser.NONE)
    {
        this.turn();
    }
  }

}