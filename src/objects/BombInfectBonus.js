import Infection from './Infection';

export const type = 'spammer-virus';

export default class BombInfectionBonus extends Infection {
  constructor({game, map, x, y}) {
    super({
      game: game,
      x: x,
      y: y,
      key: 'bonus-infection',
    });
  }
  get uniqueType() {
    return type;
  }
}