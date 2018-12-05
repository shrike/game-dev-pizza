export default class MainMenu extends Phaser.State {
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
        this.game.mapName = map.name;
        this.game.state.start('Main');
      });
    });
  }

  create() {
    this.stateText.visible = true;
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
}
