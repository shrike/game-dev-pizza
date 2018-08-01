// import throttle from 'lodash.throttle';
import Player from '../objects/Player';
import Bomb from '../objects/Bomb';

/**
 * Setup and display the main game state.
 */
export default class Main extends Phaser.State {

  constructor() {
    super();
    this.isTileFree = this.isTileFree.bind(this);
    this.removeTile = this.removeTile.bind(this);
    this.isTileRemovable = this.isTileRemovable.bind(this);
  }

  /**
   * Setup all objects, etc needed for the main game state.
   */
  create() {
    this.map = this.add.tilemap('map');
    this.map.gridsize = 64;
    this.map.gridToPixelCoord = gridCoordinate => (gridCoordinate + 0.5) * 64;
    this.map.gridToPixelPoint =
        point => new Phaser.Point((point.x + 0.5) * 64, (point.y + 0.5) * 64);
    this.map.pixelToGridCoord = function(val) {
      return this.game.math.snapToFloor(Math.floor(val), this.gridsize) / this.gridsize;
    };
    this.map.pixelToGrid = function(point) {
      return new Phaser.Point(
        this.game.math.snapToFloor(Math.floor(point.x), this.gridsize) / this.gridsize,
        this.game.math.snapToFloor(Math.floor(point.y), this.gridsize) / this.gridsize);
    };

    this.map.addTilesetImage('tiles', 'tiles');

    this.explosions = this.game.add.group();

    this.bombs = [];
    this.bombPlaced = false;

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
      key: 'player',
      map: this.map,
      isTileFree: this.isTileFree,
      x: 96, // this.game.world.centerX,
      y: 96, // this.game.world.centerY,
      cursors: this.input.keyboard.createCursorKeys(),
    });

    this.physics.arcade.enable(this.player);

    this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

    // Setup listener for window resize.
    // window.addEventListener('resize', throttle(this.resize.bind(this), 50), false);
  }

  /**
   * @param {integer} tileX X coordinate to check.
   * @param {integer} tileY Y coordinate to check.
   * Resize the game to fit the window.
   */
  isTileFree(tileX, tileY) {
    if (this.map.getTile(tileX, tileY, this.bricksLayer)) {
      return false;
    }
    if (this.map.getTile(tileX, tileY, this.stonesLayer)) {
      return false;
    }
    if (this.bombs.some(bomb => bomb.marker.x === tileX && bomb.marker.y === tileY)) {
      return false;
    }
    return true;
  }
  /**
   * Is tile removable from map
   */
  isTileRemovable(tileX, tileY) {
    return !!this.map.getTile(tileX, tileY, this.bricksLayer);
  }

  /**
   *
   * @param {Integer} x
   * @param {Integer} y
   * @returns {boolean}
   */
  removeTile(tileX, tileY) {
    const bomb = this.bombs.find(b => b.marker.x === tileX && b.marker.y === tileY);

    if (bomb) {
      bomb.explode();
    }
    if (this.isTileRemovable(tileX, tileY)) {
      this.map.removeTile(tileX, tileY, this.bricksLayer).destroy();
      return true;
    }
    return false;
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
  addBomb(x, y, id) {
    const bomb = new Bomb({
      game: this.game,
      map: this.map,
      x,
      y,
      key: 'bomb',
      id,
      isTileFree: this.isTileFree,
      removeTile: this.removeTile,
      onExplode: (exploded) => {
        this.bombs = this.bombs.filter((aBomb) => {
          return aBomb.id !== exploded.id;
        });
      },
      onBurnTile: (fire) => {
        this.explosions.add(fire);
      }
    });

    return bomb;
  }

  /**
   * Handle actions in the main game loop.
   */
  update() {
    this.physics.arcade.collide(this.player, this.stonesLayer);
    this.physics.arcade.collide(this.player, this.bricksLayer);
    if (this.aKey.isDown && !this.bombPlaced) {
      this.bombs.push(this.addBomb(this.player.x, this.player.y, this.bombs.length));
      this.bombPlaced = true;
    }
    if (this.aKey.isUp) {
      this.bombPlaced = false;
    }
    this.bombs.map((bomb) => {
      this.physics.arcade.collide(this.player, bomb);

      return bomb;
    });
  }
}
