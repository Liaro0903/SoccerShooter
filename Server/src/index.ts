import express from 'express';
import * as http from 'http';
import * as path from 'path';
import { Server, Socket } from 'socket.io';

import Players, { dsdrSync } from './components/players';
import {
  closeServer,
  dt,
  ISpawnPointData,
  initializeServer,
  sendSpawnBullets
} from './components/puppet';

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

let players = new Players();

const initialize = (socket: Socket, title: string) => {
  // Starts puppet timer if first
  if (players.getLength() === 0) {
    dt(socket, io);
  }
  let newPlayer = players.addPlayer(socket, title);
  console.log(players);
  socket.emit('playerData', {
    id: socket.id,
    players: players.players,
  });
  socket.broadcast.emit('setLocalPlayers', newPlayer);
}

const goodbye = (socket: Socket) => {
  if (players.getPlayer(socket.id) !== undefined) {  // To prevent if connected but not initialized
    players.deletePlayer(socket.id);
    socket.emit('goodbyePlayer', socket.id);
    socket.broadcast.emit('goodbyePlayer', socket.id);
    console.log(players);
  }
  // Close puppet server if no one
  if (players.length === 0) closeServer();
}

io.on('connection', (socket: Socket) => {
  console.log('Client has connected!');

  // Starts puppet server if no one
  if (players.getLength() === 0) initializeServer();

  socket.on('initialize', (title: string) => {
    initialize(socket, title);
  });
  socket.on('disconnect', () => {
    goodbye(socket);
  });
  socket.on('setRemotedsdr', (dsdr: dsdrSync) => {
    players.setPlayer(dsdr);
    socket.broadcast.emit('setLocaldsdr', dsdr);
  })
  socket.on('bulletFired', (spawnPointData: ISpawnPointData) => {
    sendSpawnBullets(spawnPointData);
  })
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));