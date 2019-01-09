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

function sendAllPlayersToNewlyJoined(socket) {
  
  allOtherPlayers = getAllPlayers(socket);
  log.info("Sending 'allplayers': " + allOtherPlayers.map((p) => p.id));
  socket.emit('allplayers', allOtherPlayers);
}

function sendMyPlayer(socket) {

  log.info("Sending 'myPlayer': ", socket.player);
  socket.emit('myPlayer', socket.player);
}

function sendNewPlayerToExisting(socket) {

  log.info("Broadcasting 'newplayer': ", socket.player);
  socket.broadcast.emit('newplayer', socket.player);
}

function sendPlayerDisconnected(socket) {
  
  log.info("Emitting 'remove': ", socket.player.id);
  io.emit('remove', socket.player.id);
}

function sendButtons(socket, buttons) {

  //FIXME: this is Sir Spam-A-Lot
  log.debug("Emitting 'buttons': ", buttons);
  io.emit('buttons', {buttons: buttons.buttons, playerId: buttons.playerId});
}

function sendBomb(socket, bomb) {

  log.info("Emitting 'bomb': ", bomb);
  io.emit('bomb', bomb);
}

function handleNewPlayer(socket) {

  log.info("handleNewPlayer");

  const playerId = server.lastPlayderID;
  server.lastPlayderID += 1;
  socket.player = {
    id: playerId,
    x: 96,
    y: 96,
  };

  sendAllPlayersToNewlyJoined(socket);
  sendMyPlayer(socket);
  sendNewPlayerToExisting(socket);

  socket.on('disconnect', () => {
    sendPlayerDisconnected(socket);
  });

  socket.on('buttons', (buttons) => {
    sendButtons(socket, buttons);
  });

  socket.on('test', () => {
    log.warn('test received');
  });

  socket.on('bomb', (bomb) => {
    sendBomb(socket, bomb);
  });
}

io.on('connection', (socket) => {
  log.info("Received 'connection'");

  socket.on('newplayer', () => {
    handleNewPlayer(socket);
  });
});


// Log that the game server has started.
log.info(`Game server started at ${host} [${env}].`);
