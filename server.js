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

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

function getAllPlayers() {
  const players = [];
  Object.keys(io.sockets.connected).forEach((socketID) => {
    const player = io.sockets.connected[socketID].player;
    if (player) {
      players.push(player);
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
      x: randomInt(100, 400),
      y: randomInt(100, 400),
    };
    socket.emit('allplayers', getAllPlayers());
    socket.broadcast.emit('newplayer', socket.player);

    socket.on('click', (data) => {
      log.debug(`click to ${data.x}, ${data.y}`);
      socket.player.x = data.x;
      socket.player.y = data.y;
      io.emit('move', socket.player);
    });

    socket.on('disconnect', () => {
      io.emit('remove', socket.player.id);
    });
  });

  socket.on('buttons', (buttons) => {
    io.emit('buttons', buttons);
  });

  socket.on('test', () => {
    log.warn('test received');
  });
});


// Log that the game server has started.
log.info(`Game server started at ${host} [${env}].`);
