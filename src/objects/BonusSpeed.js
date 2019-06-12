import Bonus from './Bonus';

export default class BonusSpeed extends Bonus {
  constructor({game, map, x, y}) {
    super({
      game: game,
      x: x,
      y: y,
      key: 'bonus-speed'
    });
  }

  addToPlayer(player) {
    player.increaseSpeed();
    this.destroy();
  }
}