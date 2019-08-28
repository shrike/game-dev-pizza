import Client from '../client/Client';

export default class Settings extends Phaser.State {
  constructor() {
    super();

    Client.socket.on('joinSuccessful', (player) => {
      const nickname = prompt('Please enter your nickname', `Player${player.id}`);
      Client.settings({nickname});

      this.game.state.start('MainMenu');
    });
  }

  create() {
    Client.sendJoin();
  }
}
