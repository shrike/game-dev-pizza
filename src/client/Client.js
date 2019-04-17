import io from 'socket.io-client';

const Client = {};
Client.socket = io.connect(window.location.href);

Client.sendTest = function() {
  Client.socket.emit('test');
};

Client.sendPosition = function(position) {
  Client.socket.emit('position', position);
};

Client.askNewPlayer = function() {
  Client.socket.emit('newplayer');
};

Client.emitAddBomb = function(x, y) {
  Client.socket.emit('bomb', {x, y});
};

Client.emitGameOver = function(id) {
  Client.socket.emit('playerGameOver', {id});
};


Client.sendJoin = function() {
  Client.socket.emit('join');
};

Client.startGame = function(mapName) {
  console.log(`Emitting startGame "${mapName}"`);
  Client.socket.emit('startGame', mapName);
}

export default Client;
