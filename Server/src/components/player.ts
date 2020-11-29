import { Socket } from 'socket.io';

export interface Vector {
  x: number;
  y: number;
  z: number;
}

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
  // socket: Socket;
  
  constructor(socket: Socket, title: string, playersLength: number) {
    this.id = socket.id;
    this.title = title;
    this.team = playersLength % 2 === 0 ? 'Hero' : 'Enemy';
    this.position = spawnLocations[playersLength];
    this.rotation = spawnRotation[playersLength % 2];
    // this.socket = socket;
  }
}

export default Player;