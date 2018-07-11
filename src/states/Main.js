// import throttle from 'lodash.throttle';
import Player from '../objects/Player';
import Bomb from '../objects/Bomb';

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

    this.group = this.game.add.group();

    this.bombs = [];

    this.backgroundLayer = this.map.createLayer('background');
    this.stonesLayer = this.map.createLayer('stones');
    this.bricksLayer = this.map.createLayer('bricks');

    this.map.setCollision(4, true, this.stonesLayer);
    this.map.setCollision(3, true, this.bricksLayer);

    // // Enable arcade physics.
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    // // Add a player to the game.
    this.player = new Player({
      game: this.game,
      x: 96, // this.game.world.centerX,
      y: 96, // this.game.world.centerY,
      key: 'player',
      cursors: this.input.keyboard.createCursorKeys(),
    });


    // this.bomb = new Player({
    //   game: this.game,
    //   x: -48, // this.game.world.centerX,
    //   y: -48, // this.game.world.centerY,
    //   key: 'bomb',
    //   cursors: this.input.keyboard.createCursorKeys(),
    // });

    this.physics.arcade.enable(this.player);



    this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

   // this.physics.arcade.enable(this.bomb);
    // // Add background tile.
    // this.game.add.tileSprite(-5000, -5000, 10000, 10000, 'bg');

    // // ...

    // Setup listener for window resize.
    // window.addEventListener('resize', throttle(this.resize.bind(this), 50), false);
  }

  /**
   * Resize the game to fit the window.
   */
  resize() {
    // const width = window.innerWidth * window.devicePixelRatio;
    // const height = window.innerHeight * window.devicePixelRatio;
    //
    // console.log(width);
    // console.log(height);
    // this.scale.setGameSize(width, height);
  }

  /**
   *
   * @param x
   * @param y
   */
  addBomb(x, y) {
    const bomb = new Bomb({
      game: this.game,
      x, // this.game.world.centerX,
      y, // this.game.world.centerY,
      key: 'bomb',
    });
    //this.group.add(bomb);


    this.game.physics.arcade.enable(bomb);



    return bomb;
  }

  /**
   * Handle actions in the main game loop.
   */
  update() {
    this.physics.arcade.collide(this.player, this.stonesLayer);
    this.physics.arcade.collide(this.player, this.bricksLayer);

    // this.physics.arcade.collide(this.player, this.group);
    if (this.aKey.isDown) {
      this.bombs.push(this.addBomb(this.player.x, this.player.y));
    }

    this.bombs.map((bomb) => {
      this.physics.arcade.collide(this.player, bomb);

      return bomb;
    });
  }
}
