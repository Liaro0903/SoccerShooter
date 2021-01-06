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

let rooms: { [id: string]: Room } = {};
let socketsCode: { [id: string]: string } = {};  // Match each socket to their corresponding room code

const generateRoomCode = (): string => {
  let roomCode: string = '';
  for (let i = 0; i < 6; i++) {
    roomCode += String.fromCharCode(Math.floor(Math.random() * 26 + 65));
  }
  if (!rooms.hasOwnProperty(roomCode)) {  // Too prevent randomly generates an existing room code
    return roomCode;
  } else {
    return generateRoomCode();
  }
}

io.on('connection', (socket: Socket) => {
  console.log('Client has connected!');

  socket.on('createRoom', (username: string) => {
    let roomCode: string = generateRoomCode();
    console.log(roomCode);
    
    rooms[roomCode] = new Room(roomCode, io);
    rooms[roomCode].playerJoinRoom(socket, username);
    socketsCode[socket.id] = roomCode;
    socket.join(roomCode);
    console.log(rooms);
    console.log(socketsCode);
  });

  socket.on('isRoomValid', (roomCode: string) => {
    socket.emit('foundIsRoomValid', rooms.hasOwnProperty(roomCode));
  });

  socket.on('joinRoom', (roomCode: string, username: string) => {
    if (rooms.hasOwnProperty(roomCode)) {
      rooms[roomCode].playerJoinRoom(socket, username);
      socketsCode[socket.id] = roomCode;
      socket.join(roomCode);
    }
    console.log(rooms);
    console.log(socketsCode);
  });

  socket.on('disconnect', () => {
    let roomCode = socketsCode[socket.id];
    if (rooms.hasOwnProperty(roomCode)) {
      rooms[roomCode].goodbye(socket);
      if (rooms[roomCode].players.length === 0) {
        delete rooms[roomCode];
        console.log('Room deleted');
      }
    }
    delete socketsCode[socket.id];
    console.log(rooms);
    console.log(socketsCode);
  });

  socket.on('setRemotedsdr', (dsdr: dsdrSync) => {
    let roomCode = socketsCode[socket.id];
    if (rooms.hasOwnProperty(roomCode)) {
      rooms[roomCode].players.setPlayer(dsdr);
      socket.to(roomCode).broadcast.emit('setLocaldsdr', dsdr);
    }
  });

  socket.on('bulletFired', (spawnPointData: ISpawnPointData) => {
    let roomCode = socketsCode[socket.id];
    if (rooms.hasOwnProperty(roomCode)) {
      rooms[roomCode].universe.sendSpawnBullets(spawnPointData);
    }
  });

  /* Use only in development */
  socket.on('setWorld', (world: any) => {
    console.log(world);
  })
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));