/* eslint object-curly-newline: ["error", "never"] */
/* eslint-env es6 */

export default class Sound {

  /**
   * @param game
   */
  constructor({game}) {
    this.moves = [game.audio.move1, game.audio.move2];
    this.deaths = [game.audio.death1, game.audio.death2, game.audio.death3, game.audio.death4, game.audio.death5];
    this.bonuses = [game.audio.bonus1, game.audio.bonus2, game.audio.bonus3, game.audio.bonus4, game.audio.bonus5];
    this.bombExplds = [game.audio.bombExpld1, game.audio.bombExpld2, game.audio.bombExpld3, game.audio.bombExpld4];
  }

  playMoves() {
    this.moves[Math.floor(Math.random() * this.moves.length)].play();
  }

  playDeath() {
    this.deaths[Math.floor(Math.random() * this.deaths.length)].play();
  }

  playBonuses() {
    this.bonuses[Math.floor(Math.random() * this.bonuses.length)].play();
  }

  playBombExplds() {
    this.bombExplds[Math.floor(Math.random() * this.bombExplds.length)].play();
  }
}
