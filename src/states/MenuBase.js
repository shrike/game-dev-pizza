export default class MenuBase extends Phaser.State {
  
  constructor() {
    super();
    this.style = function () {
      return {
        font: '20px 8BitCrash',
        fill: 'white',
        align: 'right',
        stroke: 'rgba(0,0,0,0)',
        strokeThickness: 4,
      };
    };
    
    this.onOverStyle = (target) => {
      target.fill = "#FEFFD5";
      target.stroke = "rgba(200,200,200,0.5)";
    };
    this.onOutStyle = (target) => {
      target.fill = "white";
      target.stroke = "rgba(0,0,0,0)";
    };

    this.optionCount = 1;
  }

  addMenuOption(text, callback) {
    const optionStyle = this.style();
    optionStyle.font = '30px 8BitCrash';
    const txt = this.game.add.text(30, (this.optionCount * 80) + 200, text, optionStyle);
    txt.inputEnabled = true;
    txt.events.onInputUp.add(callback);
    txt.events.onInputOver.add(this.onOverStyle);
    txt.events.onInputOut.add(this.onOutStyle);
    this.optionCount += 1;
    return txt;
  }
}