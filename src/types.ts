import CANNON from 'cannon';

import { Player } from './components/players';

export interface Vector {
  x: number;
  y: number;
  z: number;
}

export interface Quat extends Vector {
  w: number;
}

export interface IEntity {
  name: string;
  position: Vector;
  size: Vector;
  rotation: Quat;
}

export interface IBall {
  body: CANNON.Body;
  team: string;
}

export interface IBullets {
  [id: string]: {
    body: CANNON.Body;
    team: string;
  }
}

export interface ISpawnPointData {
  team: string;
  spawnPoint: Vector;
  gunVec: Vector;
}

// Initial: Beginning of a game
// Data: includes what is my id and room and initialPlayers

export interface initialData {
  myId: string;
  myRoom: string;
  players: initialPlayers;
}

export interface initialPlayers {
  [id: string]: initialPlayer;
}

export interface initialPlayersRepeat {
  [id: string]: initialPlayerRepeat;
}

interface initialPlayer extends Player {}

export interface initialPlayerRepeat extends Omit<Player, 'title'> {}