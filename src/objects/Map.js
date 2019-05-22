/* eslint object-curly-newline: ["error", "never"] */
/* eslint-env es6 */

export default class Map {
  /**
   * @param name
   * @param playerPositions
   */
  constructor({name, playerPositions}) {

    this.name = name;
    this.playerPositions = playerPositions;
  }
}
