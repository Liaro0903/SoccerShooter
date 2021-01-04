import CANNON from 'cannon';

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