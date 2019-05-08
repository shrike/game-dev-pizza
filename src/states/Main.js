// import throttle from 'lodash.throttle';
import Player from '../objects/Player';
import Bomb from '../objects/Bomb';
import Client from '../client/Client';

/**
 * Setup and display the main game state.
 */
export default class Main extends Phaser.State {

  constructor() {
    super();
    this.isTileBrickFree = this.isTileBrickFree.bind(this);
    this.isTileBombFree = this.isTileBombFree.bind(this);
    this.checkTile = this.checkTile.bind(this);
    this.removeTile = this.removeTile.bind(this);
    this.isTileRemovable = this.isTileRemovable.bind(this);
    this.initCurrentPlayer = this.initCurrentPlayer.bind(this);
    this.initAllPlayers = this.initAllPlayers.bind(this);
    this.playerDied = this.playerDied.bind(this);
    this.addPlayer = this.addPlayer.bind(this);
    this.showBomb = this.showBomb.bind(this);
    this.players = [];
    this.explosions = [];
    this.bombs = [];
    this.bombPlaced = false;
    this.aKey = null;
    Client.socket.on("myPlayer", this.initCurrentPlayer);

    Client.socket.on("allplayers", this.initAllPlayers);

    Client.socket.on("bomb", this.showBomb);
    Client.socket.on("playerDied", this.playerDied);
   }

  /**
   * Setup all objects, etc needed for the main game state.
   */
  create() {
    // // Enable arcade physics.
    this.game.physics.startSystem(Phaser.Physics.ARCADE);



    this.map = this.add.tilemap(this.game.mapName);
    this.map.addTilesetImage('tiles', this.game.mapName);

    this.map.gridsize = 64;
    this.map.gridToPixelCoord = gridCoordinate => (gridCoordinate + 0.5) * 64;
    this.map.gridToPixelPoint =
        point => new Phaser.Point((point.x + 0.5) * 64, (point.y + 0.5) * 64);
    this.map.pixelToGridCoord = function (val) {
      return this.game.math.snapToFloor(Math.floor(val), this.gridsize) / this.gridsize;
    };
    this.map.pixelToGrid = function (point) {
      return new Phaser.Point(
        this.game.math.snapToFloor(Math.floor(point.x), this.gridsize) / this.gridsize,
        this.game.math.snapToFloor(Math.floor(point.y), this.gridsize) / this.gridsize);
    };

    this.backgroundLayer = this.map.createLayer('background');
    this.stonesLayer = this.map.createLayer('stones');
    this.bricksLayer = this.map.createLayer('bricks');

    this.map.setCollision(4, true, this.stonesLayer);
    this.map.setCollision(3, true, this.bricksLayer);

    this.initCurrentPlayer(this.game.players['me']);

    const otherPlayers = Object.keys(this.game.players)
      .filter((key) => key != 'me')
      .map((key) => this.game.players[key]);

    this.initAllPlayers(otherPlayers);

    // Setup listener for window resize.
    // window.addEventListener('resize', throttle(this.resize.bind(this), 50), false);
  }

  initAllPlayers(players) {
      players.map((player) => {
      const newPlayer = new Player({
        game: this.game,
        key: 'player',
        map: this.map,
        isTileBrickFree: this.isTileBrickFree,
        x:  96,
        y:  96,
        cursors: null,
        id: player.id,
        isPlayerLocal: false,
      });

      this.physics.arcade.enable(newPlayer);

      this.players[player.id] = newPlayer;
    });
  }

  playerDied({id}) {
    this.players.some((p) => {
      if (p.id === id) {
        p.destroy();
        return true;
      }
      return false;
    });

  }

  addPlayer(player) {
    const newPlayer = new Player({
      game: this.game,
      key: 'player',
      map: this.map,
      isTileBrickFree: this.isTileBrickFree,
      x: 96, // this.game.world.centerX,
      y: 96, // this.game.world.centerY,
      cursors: null,
      id: player.id,
      isPlayerLocal: false,
    });

    this.physics.arcade.enable(newPlayer);

    this.players[player.id] = newPlayer;
  }

  initCurrentPlayer(player) {

    this.player = new Player({
      game: this.game,
      key: 'player',
      map: this.map,
      isTileBrickFree: this.isTileBrickFree,
      x: 96, // this.game.world.centerX,
      y: 96, // this.game.world.centerY,
      cursors: this.input.keyboard.createCursorKeys(),
      id: player.id,
      isPlayerLocal: true,
    });

    this.physics.arcade.enable(this.player);

    this.players[player.id] = this.player;

    this.aKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

  }

  /**
   * @param {integer} tileX X coordinate to check.
   * @param {integer} tileY Y coordinate to check.
   * @returns true if the tile with the given coordinates is free of bricks
   */
  isTileBrickFree(tileX, tileY) {
    if (this.map.getTile(tileX, tileY, this.bricksLayer)) {
      return false;
    }
    if (this.map.getTile(tileX, tileY, this.stonesLayer)) {
      return false;
    }
    return true;
  }

  /**
   * @param {integer} tileX X coordinate to check.
   * @param {integer} tileY Y coordinate to check.
   * @returns true if the tile with the given coordinates is free of bombs
   */
  isTileBombFree(tileX, tileY) {
    if (this.bombs.some(bomb => bomb.marker.x === tileX && bomb.marker.y === tileY)) {
      return false;
    }
    return true;
  }

  /**
   * @param {integer} tileX X coordinate to check.
   * @param {integer} tileY Y coordinate to check.
   * @returns
   *  0 if the tile with the given coordinates is free (no bomb, no bricks)
   *  1 if the tile contains a destructible (bricks, bomb)
   *  2 if the tile contains wall
   */
  checkTile(tileX, tileY) {
    if (this.isTileBrickFree(tileX, tileY) && this.isTileBombFree(tileX, tileY)) {
      return 0;
    }
    // Check if bricks
    if (this.isTileRemovable(tileX, tileY)) {
      return 1;
    }
    // Check if bomb
    if (this.bombs.find(b => b.marker.x === tileX && b.marker.y === tileY)) {
      return 1;
    }
    return 2;
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
  addBomb(x, y) {
    this.showBomb({x, y});
    Client.emitAddBomb(x, y);
  }

  showBomb({x, y, playerId}) {
    const bomb = new Bomb({
      game: this.game,
      map: this.map,
      x,
      y,
      key: 'bomb',
      id: this.bombs.length,
      checkTile: this.checkTile,
      removeTile: this.removeTile,
      onExplode: (exploded) => {
        this.bombs = this.bombs.filter((aBomb) => {
          return aBomb.id !== exploded.id;
        });
      },
      onBurnTile: (fire) => {

        this.physics.arcade.enable(fire);
        fire.body.setSize(50,50,7,7);
        this.explosions.push(fire);
      },
    });
    this.game.physics.enable(bomb);

    this.bombs.push(bomb);
  }

  /**
   * Handle actions in the main game loop.
   */
  update() {

    Object.keys(this.players).forEach((k) => {
      this.game.physics.arcade.overlap(this.player, this.explosions, () => {
          this.gameOver();
      });
      this.physics.arcade.collide(this.players[k], this.stonesLayer);
      this.physics.arcade.collide(this.players[k], this.bricksLayer);
      this.physics.arcade.collide(this.players[k], this.bombs);
    });

    if (this.aKey && this.aKey.isDown && !this.bombPlaced) {
      this.addBomb(this.player.x, this.player.y);
      this.bombPlaced = true;
    }
    if (this.aKey && this.aKey.isUp) {
      this.bombPlaced = false;
    }
  }

  gameOver() {
    Client.emitGameOver(this.player.id);
    this.game.state.start('GameOver');
  }
}
