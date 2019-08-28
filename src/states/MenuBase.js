import Client from "../client/Client";

export default class MenuBase extends Phaser.State {
  
  constructor() {
    super();
    this.addConnInfo = this.addConnInfo.bind(this);
    this.addMenuOption = this.addMenuOption.bind(this);
    this.addPlayerOption = this.addPlayerOption.bind(this);
    this.removePlayerOptions = this.removePlayerOptions.bind(this);
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
    this.playerCount = 1;

    this.players = new Map();
    this.playerOptions = [];

    Client.socket.on("playerDisconnected", (playerId) => {

      this.players.delete(playerId);

      if (this.txt) {
        this.removePlayerOptions(this.playerOptions);
        this.playerOptions = [];

        this.txt.text = `Players: ${this.players.size}`;
        this.players.forEach((player) => {
          const txt = this.addPlayerOption(player.nickname);
          this.playerOptions.push(txt);
        });
      }
    });
  }

  addConnInfo() {
    const text = "Players: ";
    this.txt = this.game.add.text(
      this.game.world.width-300, 50, text, this.style());
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

  addPlayerOption(nickname) {
    const optionStyle = this.style();
    optionStyle.font = '30px 8BitCrash';
    const txt = this.game.add.text(this.game.world.width - 300, (this.playerCount * 40) + 100, nickname, optionStyle);
    this.playerCount += 1;
    return txt;
  }

  removePlayerOptions(playerOptions) {
    playerOptions.forEach((txt) => {
      this.game.world.remove(txt);
    });
    this.playerCount = 1;
  }

  addPlayerToView(player) {
    this.players.set(player.id, player);

    if (this.txt) {
      this.txt.text = `Players: ${this.players.size}`;
    }

    const txt = this.addPlayerOption(player.nickname);
    this.playerOptions.push(txt);
  }

  updatePlayersInView(players) {

    if (this.state.current !== this.constructor.name) {
      return;
    }

    console.log('Updating players... ', players);

    this.players.clear();
    Object.values(players).forEach((player) => {
      this.players.set(player.id, player);
    });

    if (this.txt) {
      this.txt.text = `Players: ${Object.keys(players).length}`;

      this.removePlayerOptions(this.playerOptions);

      Object.values(players).forEach((player) => {
        const txt = this.addPlayerOption(player.nickname);
        this.playerOptions.push(txt);
      });
    }
  }
}
