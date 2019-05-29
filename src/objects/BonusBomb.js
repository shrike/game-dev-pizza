import Bonus from './Bonus';

export default class BonusBomb extends Bonus {
  constructor({game, map, x, y}) {
    console.log(x);
    super({
      game: game,
      x: x,
      y: y,
      key: 'bonus-bomb'
    });
  }
}