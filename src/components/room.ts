import { Server, Socket } from 'socket.io';

import Players from './players';
import Universe from './universe';

class Room {
  universe: Universe;
  players: Players;
  io: Server;

  constructor(io: Server) {
    this.universe = new Universe(io);
    this.players = new Players();
    this.io = io;
  }

  /* Method starts when user entered their username and press 'start game'. If first person, world will start running */
  initializePlayer = (socket: Socket, title: string) => {
    let { players } = this;

    // Starts timer if first
    if (players.getLength() === 0) {
      this.universe.dt();
    }
    let newPlayer = players.addPlayer(socket, title);
    console.log(players);
    socket.emit('playerData', {
      id: socket.id,
      players: players.players,
    });
    socket.broadcast.emit('setLocalPlayers', newPlayer);
  }

  /* Runs when player disconnects */
  goodbye = (socket: Socket) => {
    let { players, io } = this;
    if (players.getPlayer(socket.id) !== undefined) {  // To prevent if connected but not initialized
      players.deletePlayer(socket.id);
      io.emit('goodbyePlayer', socket.id);
      console.log(players);
    }
    // Clear world if last player left
    if (players.length === 0) this.universe.clearPhysics();
  }
}

export default Room;
