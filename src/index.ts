import express from 'express';
import * as http from 'http';
import * as path from 'path';
import { Server, Socket } from 'socket.io';

import Room from './components/room';
import { dsdrSync } from './components/players';
import { ISpawnPointData } from './types';

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://launch.playcanvas.com',
    methods: ['GET', 'POST']
  }
});

app.use(express.static(path.join(__dirname, '../public')));

let rooms: Room[] = [];

io.on('connection', (socket: Socket) => {
  console.log('Client has connected!');

  // Creates room when first person connect
  if (rooms.length === 0) {
    rooms.push(new Room(io));
    console.log('New Room!');
  };

  socket.on('initialize', (title: string) => {
    rooms[0].initializePlayer(socket, title);
  });
  socket.on('disconnect', () => {
    rooms[0].goodbye(socket);
    if (rooms[0].players.length === 0) {
      rooms.shift();
      console.log('Room deleted');
    }
  });
  socket.on('setRemotedsdr', (dsdr: dsdrSync) => {
    rooms[0].players.setPlayer(dsdr);
    socket.broadcast.emit('setLocaldsdr', dsdr);
  });
  socket.on('bulletFired', (spawnPointData: ISpawnPointData) => {
    rooms[0].universe.sendSpawnBullets(spawnPointData);
  });
  /* Use only in development */
  socket.on('setWorld', (world: any) => {
    console.log(world);
  })
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));