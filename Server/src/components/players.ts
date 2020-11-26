import { Socket } from 'socket.io';
import Player from './player';

export interface dsdrSync {  // Use for updating location and rotation for objects
  id: string;
  x: number;
  y: number;
  z: number;
  ex: number;
  ey: number;
  ez: number;
}


class Players {
  players: { [id: string]: Player; };
  length: number;

  constructor() {
    this.players = {};
    this.length = 0;
  }

  addPlayer(socket: Socket, title: string) {
    this.players[socket.id] = new Player(socket, title, this.length);
    this.length++;
    return this.players[socket.id];
  }

  getPlayer(socketId: string) {
    return this.players[socketId];
  }

  setPlayer(dsdr: dsdrSync) {
    let player = this.players[dsdr.id];
    player.position.x = dsdr.x;
    player.position.y = dsdr.y;
    player.position.z = dsdr.z;
    player.rotation.x = dsdr.ex;
    player.rotation.y = dsdr.ey;
    player.rotation.z = dsdr.ez; 
  }

  deletePlayer(socketId: string) {
    delete this.players[socketId];
    this.length--;
  }

  getLength() {
    return this.length;
  }
}

export default Players;