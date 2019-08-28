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
server.rooms = {}
server.lastRoomId = 0;

server.listen(process.env.PORT || 8081, () => {
  log.info(`Listening on ${server.address().port}`);
});

app.use('/', express.static(`${__dirname}/dist`));

function getAllPlayersMap(socket) {
  const players = {};
  Object.keys(io.sockets.connected).forEach((socketID) => {
    const player = io.sockets.connected[socketID].player;
    if (player) {
      if (socket === null || socket !== io.sockets.connected[socketID]) {
          players[player.id] = player;
      } else {
        players['me'] = player;
      }
    }
  });
  return players;
}

function getAllPlayersInRoom(roomId, currPlayerId) {

  const players = {};
  Object.keys(io.sockets.connected).forEach((socketID) => {
    const player = io.sockets.connected[socketID].player;
    if (io.sockets.connected[socketID].roomId === roomId) {
      if (player && player.id !== currPlayerId) {
        players[player.id] = player;
      } else {
        players['me'] = player;
      }
    }
  });
  return players;
}

function sendPlayerDisconnected(socket) {

  log.info("Emitting 'playerDisconnected': ", socket.player.id);
  io.emit('playerDisconnected', socket.player.id);
}

function sendPosition(socket, position) {

  //FIXME: this is Sir Spam-A-Lot
  log.debug("Emitting 'position': ", position);
  socket.broadcast.emit('position', position);
}

function sendBomb(socket, bomb) {

  log.info("Emitting 'bomb': ", bomb);
  socket.broadcast.emit('bomb', bomb);
}

function sendDied(socket) {

  log.info("Emitting 'died': ", socket.player.id);
  socket.broadcast.emit('playerDied', socket.player.id);
}

function sendPlayers(socket) {

  players = getAllPlayersMap(socket);
  socket.emit('players', players);
}

function emitPlayers() {

  log.info("Emitting 'players'");
  Object.keys(io.sockets.connected).forEach((socketID) => {
    const socket = io.sockets.connected[socketID];
    sendPlayers(socket);
  });
}

function startGame(roomId, map) {

  log.info(`Emitting 'gameStarted' ${map.name} in room ${roomId}`);
  io.in(roomId).emit('gameStarted', map);
}

function createRoom(socket) {
  server.lastRoomId += 1;
  const room = {
    id: server.lastRoomId,
    players: { [socket.player.id]: socket.player }
  };
  server.rooms[room.id] = room;
  socket.roomId = room.id;
  socket.join(room.id);
  emitRoomJoined(socket, room);
  socket.broadcast.emit('roomCreated', room);
}

function getNonEmptyRooms() {
  const rooms = [];
  Object.values(server.rooms).forEach((room) => {
    if (Object.keys(room.players).length > 0){
      rooms.push(room);
    }
  });
  return rooms;
}

function emitRooms(socket) {
  log.info("Emitting 'rooms'");
  socket.emit('rooms', getNonEmptyRooms());
}

function broadcastRooms(socket) {
  log.info("Broadcasting 'rooms'");
  socket.broadcast.emit('rooms', getNonEmptyRooms());
}

function emitRoomJoined(socket, room) {
  log.info("Emitting 'roomJoined'", room);
  // Replace the key 'id' of the current player with 'me'
  const players = Object.keys(room.players).reduce(function(result, key) {
    if (key == socket.player.id) {
        result['me'] = room.players[key];
    } else {
        result[key] =  room.players[key];
    }
    return result
  }, {});

  socket.emit('roomJoined', {
    room: room, 
    players: players
  });
}

function joinSuccessful(socket) {
  log.info('Join successful; emitting the current player');
  socket.emit('joinSuccessful', socket.player);
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

  // sendAllPlayersToNewlyJoined(socket);
  // sendMyPlayer(socket);
  // sendNewPlayerToExisting(socket);
  emitPlayers();
  emitRooms(socket);
  joinSuccessful(socket);

  socket.on('disconnect', () => {
    const room = server.rooms[socket.roomId];
    if (room) {
      delete room.players[socket.player.id];
    }
    sendPlayerDisconnected(socket);
    broadcastRooms(socket);
  });

  socket.on('position', (position) => {
    sendPosition(socket, {position: position, playerId: playerId});
  });

  socket.on('test', () => {
    log.warn('test received');
  });

  socket.on('bomb', (bomb) => {
    sendBomb(socket, bomb);
  });

  socket.on('playerGameOver', () => {
    sendDied(socket);
  });

  socket.on('startGame', (map) => {
    log.info(`Received startGame "${map.name}" in room "${socket.roomId}"`);
    startGame(socket.roomId, map);
  });

  socket.on('createRoom', () => {
    log.info('Received createRoom');
    createRoom(socket);
  });

  socket.on('joinRoom', (msg) => {
    const roomId = msg.id;
    log.info('Received joinRoom', msg);
    socket.join(roomId);
    socket.roomId = roomId;
    server.rooms[roomId].players[socket.player.id] = socket.player;

    //TODO - move these to functions?
    // 1. Tell everyone else we joined
    io.in(roomId).emit('playerJoined', socket.player);
    // 2. Tell our current client it has successfully joined a room
    emitRoomJoined(socket, server.rooms[roomId]);
  });

  socket.on('settings', ({nickname}) => {
    log.info('Received settings', {nickname});
    socket.player.nickname = nickname;
    emitPlayers();
  });
}

io.on('connection', (socket) => {
  log.info("Received 'connection'");

  socket.on('join', () => {
    handleNewPlayer(socket);
  });
});


// Log that the game server has started.
log.info(`Game server started at ${host} [${env}].`);
