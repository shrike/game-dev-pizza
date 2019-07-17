import io from 'socket.io-client';

const Client = {};
Client.socket = io.connect(window.location.href);

Client.sendTest = function() {
  Client.socket.emit('test');
};

Client.sendPosition = function(position) {
  Client.socket.emit('position', position);
};

Client.emitAddBomb = function(x, y, playerId) {
  Client.socket.emit('bomb', {x, y, playerId});
};

Client.emitGameOver = function(id) {
  Client.socket.emit('playerGameOver', {id});
};

Client.sendJoin = function() {
  Client.socket.emit('join');
};

Client.startGame = function(map) {
  console.log(`Emitting startGame "${map.name}"`);
  Client.socket.emit('startGame', map);
}

Client.createRoom = function() {
  console.log('Emitting createRoom');
  Client.socket.emit('createRoom');
}

Client.sendJoinRoom = function(roomId) {
  console.log(`Emitting joinRoom "${roomId}"`);
  Client.socket.emit('joinRoom', {id: roomId});
}

export default Client;
