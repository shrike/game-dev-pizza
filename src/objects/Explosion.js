/* eslint object-curly-newline: ["error", "never"] */
/* eslint-env es6 */
import Fire from '../objects/Fire';
/**
 * Setup and control base player.
 */
export default class Explosion extends Phaser.Sprite {
  /**
   *
   * @param game
   * @param x
   * @param y
   * @param key
   * @param frame
   * @param cursors
   */
  constructor({game, x, y, key, frame, id, isTileFree}) {
    super(game, x, y, key, frame);

    // Add the sprite to the game.
    this.game.add.existing(this);
    this.anchor.setTo(0.5);
    this.marker = new Phaser.Point();
    this.marker.x = x;
    this.marker.y = y;
    this.id = id;
    this.gridsize = 64;
    this.isTileFree = isTileFree;
    this.expand = this.expand.bind(this);
    this.calcGridPosition();
    this.expand();
  }

  expand() {
    ['left', 'right', 'up', 'down'].map((position) => {
      for (let c = 0; c <= 4; c++) {
        let tail;

        if(position === 'left' && this.isTileFree(this.marker.x - c, this.marker.y)) {
          tail = new Fire({
            game: this.game,
            x: (this.marker.x - c + 0.5) * this.gridsize, // this.game.world.centerX,
            y: (this.marker.y + 0.5) * this.gridsize, // this.game.world.centerY,
            key: 'bomb.exploded',
          });
          continue;
        } else if(position === 'right' && this.isTileFree(this.marker.x + c, this.marker.y)) {
          console.log(this.marker.x, this.marker.y);
          tail = new Fire({
            game: this.game,
            x: (this.marker.x + c + 0.5) * this.gridsize, // this.game.world.centerX,
            y: (this.marker.y + 0.5) * this.gridsize, // this.game.world.centerY,
            key: 'bomb.exploded',

          });
          continue;
        } else if(position === 'up' && this.isTileFree(this.marker.x, this.marker.y - c)) {
          tail = new Fire({
            game: this.game,
            x: (this.marker.x + 0.5) * this.gridsize, // this.game.world.centerX,
            y: (this.marker.y - c + 0.5) * this.gridsize, // this.game.world.centerY,
            key: 'bomb.exploded',

          });
          continue;
        } else if(position === 'down' && this.isTileFree(this.marker.x, this.marker.y + c)) {
          tail = new Fire({
            game: this.game,
            x: (this.marker.x + 0.5) * this.gridsize, // this.game.world.centerX,
            y: (this.marker.y + c + 0.5) * this.gridsize, // this.game.world.centerY,
            key: 'bomb.exploded',
          });
          continue;
        }

        break;
      }
      return 1;
    });


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
  update() {
    if (this.body) {
      this.body.immovable = true;
      this.body.allowGravity = false;
    }
  }
}
