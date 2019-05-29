import Bonus from './Bonus';

export default class BonusFlame extends Bonus {
  constructor({game, map, x, y}) {
    console.log(x);
    super({
      game: game,
      x: x,
      y: y,
      key: 'bonus-fire'
    });
  }

  addToPlayer(player) {
    player.addAdditionalFlame();
    this.destroy();
  }
}