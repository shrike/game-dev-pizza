import Client from '../client/Client';
import MenuBase from './MenuBase';
import BackgroundMusicButton from '../objects/BackgroundMusicButton';

export default class MainMenu extends MenuBase {

  constructor() {
    super();

    Client.socket.on("players", (players) => {

      console.log('Updating players... ', players);
      this.txt.text = `Players: ${Object.keys(players).length}`
    });

    Client.socket.on("roomCreated", (room) => {
      console.log("Received 'roomCreated'", room);
      this.addMenuOption('ROOM ' + room.id, () => {
        Client.sendJoinRoom(room.id);
      });
    });

    Client.socket.on("roomJoined", (msg) => {
      console.log("Received 'roomJoined'", msg);
      this.game.room = msg.room;
      this.game.players = msg.players;
      this.game.state.start('Room');
    });
  }

  preload() {
    const gameOverText = 'MAIN MENU';
    const textStyle = {font: '50px 8BitCrash', fill: '#F2F2F2', align: 'center'};

    this.stateText = this.game.add.text(
      this.game.world.centerX, this.game.world.centerY, gameOverText, textStyle);

    // Position text at the center
    this.stateText.anchor.setTo(0.5);

    this.addConnInfo();

    this.addCreateRoomBtn();

    new BackgroundMusicButton({
      x: this.game.world.width - 42,
      y: 10,
      game: this.game
    });
  }

  addCreateRoomBtn() {
    const text = "Create Room";
    const btn = this.game.add.text(30, this.game.world.height-200, text, this.style());
    btn.inputEnabled = true;
    btn.events.onInputUp.add(() => {
      Client.createRoom();
    });
    btn.events.onInputOver.add(this.onOverStyle);
    btn.events.onInputOut.add(this.onOutStyle);
  }

  create() {
    this.stateText.visible = true;
    Client.sendJoin();
  }

  addConnInfo() {
    const text = "Players: ";
    this.txt = this.game.add.text(
      this.game.world.width-200, this.game.world.height-100, text, this.style());
  }
}
