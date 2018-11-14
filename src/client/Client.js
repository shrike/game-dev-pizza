import io from 'socket.io-client';

const Client = {};
Client.socket = io.connect('ws://127.0.0.1:7788');

Client.sendTest = function() {
  Client.socket.emit('test');
};

Client.sendButtons = function(buttons) {
  Client.socket.emit('buttons', buttons);
};

Client.askNewPlayer = function() {
  Client.socket.emit('newplayer');
};

export default Client;
