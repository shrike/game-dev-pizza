import Client from '../client/Client';
import MenuBase from './MenuBase';
import BackgroundMusicButton from '../objects/BackgroundMusicButton';

export default class MainMenu extends MenuBase {

  constructor() {
    super();

    this.stateName = "MainMenu";
    this.rooms = [];

    Client.socket.on("players", (players) => {

      this.updatePlayersInView(players);
    });

    Client.socket.on("rooms", (rooms) => {

      this.updateRooms(rooms);
   });

    Client.socket.on("roomCreated", (room) => {
      console.log("Received 'roomCreated'", room);
      this.addRoomBtn(room);
    });

    Client.socket.on("roomJoined", (msg) => {
      console.log("Received 'roomJoined'", msg);
      this.game.room = msg.room;
      this.game.players = msg.players;
      this.game.state.start('Room');
    });

    Client.socket.on("playerDisconnected", (playerId) => {
      if (this.game.players) {
        delete this.game.players[playerId];
      }
    });
  }

  updateRooms(rooms) {
    if (this.state && this.state.current === this.stateName) {
      this.cachedRooms = rooms;
      return;
    }

    console.log("Received 'rooms'", rooms);
    this.rooms.forEach(room => {
      this.game.world.remove(room);
    });
    if (rooms) {
      rooms.forEach(room => {
        this.addRoomBtn(room);
      });
    }
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
    super.create();
    this.updateRooms(this.cachedRooms);
    this.stateText.visible = true;
  }

  addRoomBtn(room) {
    if (this.state && this.state.current === this.stateName) {
      this.rooms.push(this.addMenuOption('ROOM ' + room.id, () => {
        Client.sendJoinRoom(room.id);
      }));
    }
  }
}
