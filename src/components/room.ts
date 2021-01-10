import { Server, Socket } from 'socket.io';

import { initialData } from '../types';
import Players from './players';
import Universe from './universe';

class Room {
  code: string;
  universe: Universe;
  players: Players;
  io: Server;

  constructor(code: string, io: Server) {
    this.code = code;
    this.universe = new Universe(code, io, this.nextGame);
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
    let initialData: initialData = {
      myId: socket.id,
      myRoom: this.code,
      players: players.players,
    }
    socket.emit('initialData', initialData);
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

  nextGame = () => {
    const { io, code, players, universe } = this;
    let timeleft = 10;
    let countDownToNext = setInterval(() => {
      io.to(code).emit('nextGame', timeleft);
      if (timeleft === 0) {
        clearInterval(countDownToNext);
        universe.newGame();
        // io.to(code).emit('initialPlayersRepeat', players.shuffle());
      }
      timeleft--;
    }, 1000);
  }
}

export default Room;
