const os = require('os');
const log = require('winston'); // error, warn, info, verbose, debug, silly

// Setup the environment.
const env = process.env.NODE_ENV;
const port = process.env.PORT;
const host = `${os.hostname()}:${port}`;
const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

log.remove(log.transports.Console);
log.add(log.transports.Console, {colorize: true, timestamp: true});

// Game server code goes here....

server.lastPlayderID = 0;

server.listen(process.env.PORT || 8081, () => {
  log.info(`Listening on ${server.address().port}`);
});

function getAllPlayers(socket) {
  const players = [];
  Object.keys(io.sockets.connected).forEach((socketID) => {
    if (socket !== io.sockets.connected[socketID]) {
      const player = io.sockets.connected[socketID].player;
      if (player) {
        players.push(player);
      }
    }
  });
  return players;
}

io.on('connection', (socket) => {
  socket.on('newplayer', () => {
    const playerId = server.lastPlayderID;
    server.lastPlayderID += 1;
    socket.player = {
      id: playerId,
      x: 96,
      y: 96,
    };
    socket.emit('allplayers', getAllPlayers(socket));
    socket.emit('myPlayer', socket.player);

    socket.broadcast.emit('newplayer', socket.player);


    socket.on('disconnect', () => {
      io.emit('remove', socket.player.id);
    });
  });

  socket.on('buttons', (buttons) => {
    socket.emit('buttons', {buttons: buttons.buttons, playerId: buttons.playerId});
    socket.broadcast.emit('buttons', {buttons: buttons.buttons, playerId: buttons.playerId});
  });

  socket.on('test', () => {
    log.warn('test received');
  });
});


// Log that the game server has started.
log.info(`Game server started at ${host} [${env}].`);
