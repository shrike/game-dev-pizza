import Client from '../client/Client';
import Map from '../objects/Map';

export default class MainMenu extends Phaser.State {

  constructor() {
    super();

    Client.socket.on("players", (players) => {

      console.log('Updating players... ', players);
      this.txt.text = `Players: ${Object.keys(players).length}`
      this.game.players = players;
    });

    Client.socket.on("gameStarted", (map) => {
      console.log("Received 'gameStarted'", map.name);
      this.game.map = map;
      this.game.state.start('Main');
    });
  }

  preload() {
    const gameOverText = 'MAIN MENU';
    const textStyle = {font: '50px 8BitCrash', fill: '#F2F2F2', align: 'center'};

    this.stateText = this.game.add.text(
      this.game.world.centerX, this.game.world.centerY, gameOverText, textStyle);

    // Position text at the center
    this.stateText.anchor.setTo(0.5);

    this.optionCount = 1;

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
    this.stateText.visible = true;
    Client.sendJoin();
  }

  addMenuOption(text, callback) {
    const optionStyle = {
      font: '30px 8BitCrash',
      fill: 'white',
      align: 'left',
      stroke: 'rgba(0,0,0,0)',
      strokeThickness: 4
    };
    const txt = this.game.add.text(30, (this.optionCount * 80) + 200, text, optionStyle);
    const onOver = (target) => {
      target.fill = "#FEFFD5";
      target.stroke = "rgba(200,200,200,0.5)";
    };
    const onOut = (target) => {
      target.fill = "white";
      target.stroke = "rgba(0,0,0,0)";
    };
    txt.stroke = "rgba(0,0,0,0";
    txt.strokeThickness = 4;
    txt.inputEnabled = true;
    txt.events.onInputUp.add(callback);
    txt.events.onInputOver.add(onOver);
    txt.events.onInputOut.add(onOut);
    this.optionCount += 1;
  }

  addConnInfo() {
    const style = {
      font: '20px 8BitCrash',
      fill: 'white',
      align: 'right',
      stroke: 'rgba(0,0,0,0)',
      strokeThickness: 4,
    };

    const text = "Players: ";
    this.txt = this.game.add.text(this.game.world.width-200, this.game.world.height-100, text, style);
  }
}
