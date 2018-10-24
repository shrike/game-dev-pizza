import io from 'socket.io-client';

const Client = {};
Client.socket = io.connect('ws://127.0.0.1:8081');

Client.sendTest = function() {
  console.log('test sent');
  Client.socket.emit('test');
};

Client.askNewPlayer = function() {
  Client.socket.emit('newplayer');
};

Client.sendClick = function(x, y) {
  Client.socket.emit('click', {
    x: x,
    y: y
  });
};

Client.socket.on('newplayer', function(data) {
  Game.addNewPlayer(data.id, data.x, data.y);
});

Client.socket.on('allplayers', function(data) {
  for (var i = 0; i < data.length; i++) {
    Game.addNewPlayer(data[i].id, data[i].x, data[i].y);
  }

  Client.socket.on('move', function(data) {
    Game.movePlayer(data.id, data.x, data.y);
  });

  Client.socket.on('remove', function(id) {
    Game.removePlayer(id);
  });
});

export default Client;
