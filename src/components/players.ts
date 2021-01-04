import { Socket } from 'socket.io';
import { Vector } from '../types';

const spawnLocations: Vector[] = [
  { x: -4, y: 4, z:  0 },  // Hero Side 1
  { x:  4, y: 4, z:  1 },  // Enemy Side 1
  { x: -4, y: 4, z:  6 },  // Hero Side 2
  { x:  4, y: 4, z:  7 },  // Enemy Side 2
  { x: -4, y: 4, z: -6 },  // Hero Side 3
  { x:  4, y: 4, z: -5 },  // Enemy Side 3
]

const spawnRotation: Vector[] = [
  // Not sure if below is right
  { x: 0, y: 180, z: 0 },
  { x: 0, y: 0, z: 0},
]

class Player {
  id: string;
  title: string;
  team: string;
  position: Vector;
  rotation: Vector;
  
  constructor(socket: Socket, title: string, playersLength: number) {
    this.id = socket.id;
    this.title = title;
    this.team = playersLength % 2 === 0 ? 'Hero' : 'Enemy';
    this.position = Object.assign({}, spawnLocations[playersLength]);
    this.rotation = Object.assign({}, spawnRotation[playersLength % 2]);
  }
}

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