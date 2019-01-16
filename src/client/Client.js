import io from 'socket.io-client';

const Client = {};
Client.socket = io.connect(window.location.href);

Client.sendTest = function() {
  Client.socket.emit('test');
};

Client.sendButtons = function(buttons) {
  Client.socket.emit('buttons', buttons);
};

Client.askNewPlayer = function() {
  Client.socket.emit('newplayer');
};

Client.emitAddBomb = function(x, y) {
  Client.socket.emit('bomb', {x, y});
};

export default Client;
