import Client from '../client/Client';
import Map from '../objects/Map';
import MenuBase from './MenuBase';
import BackgroundMusicButton from '../objects/BackgroundMusicButton';

export default class Room extends MenuBase {
  
  constructor() {
    super();
  }
  
  preload() {
    const gameOverText = 'ROOM X';
    const textStyle = {font: '50px 8BitCrash', fill: '#F2F2F2', align: 'center'};
    
    this.stateText = this.game.add.text(
      this.game.world.centerX, this.game.world.centerY, gameOverText, textStyle);
      
    // Position text at the center
    this.stateText.anchor.setTo(0.5);
      
    const maps = this.game.cache.getJSON('maps');
    maps.maps.forEach((map) => {
      this.addMenuOption(map.name, () => {
        const selectedMap = new Map({
          name: map.name,
          playerPositions: map.playerPositions,
        });
        
        const tilemap = this.add.tilemap(selectedMap.name);
        selectedMap.bonusTiles = this.placeBonuses(tilemap);
        Client.startGame(selectedMap);
      });
    });
    
    this.addConnInfo();

    new BackgroundMusicButton({
      x: this.game.world.width - 42,
      y: 10,
      game: this.game
    });
  }

  placeBonuses(tilemap) {
    // find all non-empty tiles in the brick layer
    const bricksLayer = tilemap.layers[tilemap.getLayer('bricks')];
    const brickTiles = [];
    for (let y = 0; y < bricksLayer.data.length; y++) {
      for (let x = 0; x < bricksLayer.data[y].length; x++) {
        if (bricksLayer.data[y][x].index >= 0) {
          brickTiles.push({x, y});
        }
      }
    }
    
    // pick random tiles from the brick layer to place bonuses
    const bonusTiles = [];
    const numBonuses = Math.floor(0.2 * brickTiles.length)
    for (let n = 0; n < numBonuses; n++) {
      
      const randIndex = Math.floor(Math.random() * brickTiles.length);
      bonusTiles.push(brickTiles[randIndex]);
      brickTiles.splice(randIndex, 1);
    }
    
    // pick a random bonus type for each bonus picked
    const NUM_BONUS_TYPES = 3;
    for (let i = 0; i < bonusTiles.length; i++) {
      
      bonusTiles[i].bonusType = Math.floor(Math.random() * NUM_BONUS_TYPES);
    }
    return bonusTiles;
  }
    
  create() {
    Client.socket.on("playerJoined", (player) => {
      
      console.log('New player joined... ', player);
      this.game.players[player.id] = player;
      this.txt.text = `Players: ${Object.keys(this.game.players).length}`
    });
    ``
    Client.socket.on("gameStarted", (map) => {
      console.log("Received 'gameStarted'", map.name);
      this.game.map = map;
      this.game.state.start('Main');
    });
    
    this.stateText.visible = true;
  }
  
  addConnInfo() {
    const text = "Players: ";
    this.txt = this.game.add.text(
      this.game.world.width-200, this.game.world.height-100, text, this.style());
  }
}