var server = require('http').createServer();
var io = require('socket.io')(server);

var Player = require('./player.js');

/* which player is the host, not sure if need this
Player.host = null;*/

var players = {}; // A map/dictionary of all the players. Socket id is the key, and the value is the object
var sockets = {}; // All the sockets of all the players.

function initialize(socket) {
  players[socket.id] = new Player(Object.keys(players).length);
  sockets[socket.id] = socket;

  console.log('Num of players: ', Object.keys(players).length);

  // Sends back to playcanvas your player
  sockets[socket.id].emit('playerData', { id: socket.id, players: players });
  // Sends to all other players
  socket.broadcast.emit('addPlayer', { id: socket.id, player: players[socket.id] });
}

function disconnect(socket) {
  // Deletes the disconnected player from the list
  delete players[socket.id];
  // Deletes the disconnected player's socket from the list
  delete sockets[socket.id];
  socket.broadcast.emit('deletePlayer', socket.id);
  console.log('Player deleted, num of players: ', Object.keys(players).length);
  /* The host disconnected, will come back and figure out this part
  if (players[socket.id] === Player.host && players.keys.length > 0) {
    makeHost(sockets.values[0]);
  }
  else if (players.keys.length === 0) {
    Player.host = null;
  }
  */
}

io.sockets.on('connection', function (socket) {
  console.log('Client has connected! ' + socket.id);
  socket.on('initialize', function () {
    initialize(socket);
  });
  socket.on('disconnect', function () {
    disconnect(socket);
  });
  socket.on('startGame', function () {
    socket.broadcast.emit('startGame');
  });
  socket.on('updateBall', function (ball) {
    socket.broadcast.emit('updateBall', ball);
  });
});

console.log('Server started.');
server.listen(4000);
