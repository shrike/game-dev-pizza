import Client from '../client/Client';

export default class Settings extends Phaser.State {
  constructor() {
    super();

    Client.socket.on('joinSuccessful', (player) => {

      const old = window.localStorage.getItem('nickname') || `Player${player.id}`

      const nickname = prompt('Please enter your nickname', old);

      window.localStorage.setItem('nickname', nickname);

      Client.settings({nickname});

      this.game.state.start('MainMenu');
    });
  }

  create() {
    Client.sendJoin();
  }
}
