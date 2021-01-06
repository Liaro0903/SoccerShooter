import { Server, Socket } from 'socket.io';

import Players from './players';
import Universe from './universe';

class Room {
  code: string;
  universe: Universe;
  players: Players;
  io: Server;

  constructor(code: string, io: Server) {
    this.code = code;
    this.universe = new Universe(code, io);
    this.players = new Players();
    this.io = io;
  }

  /* Method starts when user entered their username and press 'start game'. If first person, world will start running */
  playerJoinRoom = (socket: Socket, username: string) => {
    let { code, players } = this;

    // Starts timer if first
    if (players.getLength() === 0) {
      this.universe.dt();
    }
    let newPlayer = players.addPlayer(socket, username);
    console.log(players);
    socket.emit('playerData', {
      id: socket.id,
      room: this.code,
      players: players.players,
    });
    socket.to(code).broadcast.emit('setLocalPlayers', newPlayer);
  }

  /* Runs when player disconnects */
  goodbye = (socket: Socket) => {
    let { code, players, io } = this;
    if (players.getPlayer(socket.id) !== undefined) {  // To prevent if connected but not initialized
      players.deletePlayer(socket.id);
      io.to(code).emit('goodbyePlayer', socket.id);
      console.log(players);
    }
    // Clear world if last player left
    if (players.length === 0) this.universe.clearPhysics();
  }
}

export default Room;
