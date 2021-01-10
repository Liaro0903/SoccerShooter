import CANNON from 'cannon';
import { Server } from 'socket.io';

import {
  IBall,
  IBullets,
  IEntity,
  ISpawnPointData,
} from '../types';

class Universe {
  world: CANNON.World;
  ball: IBall;
  bullets: IBullets;
  herogoalbox: number;
  enemygoalbox: number;
  sphereMaterial: CANNON.Material;
  io: Server;
  code: string;
  timer: any;
  nextGame: Function;

  /* Constructs the world */
  constructor(code: string, io: Server, nextGame: Function) {
    // Setup world
    this.world = new CANNON.World();
    this.world.gravity.set(0, 0, -9.81);
    this.world.broadphase = new CANNON.NaiveBroadphase();

    // Variables that will be used later
    this.bullets = {};
    this.herogoalbox = 0;
    this.enemygoalbox = 0;
    this.io = io;
    this.code = code;
    this.nextGame = nextGame;

    // Setup Ball
    this.sphereMaterial = new CANNON.Material('sphere');
    let radius = 1;
    this.ball = {
      body: new CANNON.Body({
        mass: 10000,
        material: this.sphereMaterial,
        position: new CANNON.Vec3(0, 0, 10),
        shape: new CANNON.Sphere(radius),
      }),
      team: '',
    }

    this.ball.body.addEventListener('collide', this.determineWinner);
    this.world.addBody(this.ball.body);

    // Create walls and borders
    let groundMaterial = new CANNON.Material('ground');
    scene.forEach((entity: IEntity) => {
      let groundBody = this.createEntity(entity, groundMaterial);
      this.world.addBody(groundBody);
      if (entity.name === 'HeroGoalBox') {
        this.herogoalbox = groundBody.id;
        groundBody.collisionResponse = false;
      }
      if (entity.name === 'EnemyGoalBox') {
        this.enemygoalbox = groundBody.id;
        groundBody.collisionResponse = false;
      }
    });

    // Ball bouncing behavior
    let mat_ballGround = new CANNON.ContactMaterial(groundMaterial, this.sphereMaterial, {
      friction: 0.5,
      restitution: 0.5,
    });
    this.world.addContactMaterial(mat_ballGround);
  }

  /* Helper method of constructor */
  createEntity = (entity: IEntity, groundMaterial: CANNON.Material) => {
    let size = entity.size;
    size.x = entity.size.x === 0 ? 0.01 : entity.size.x;
    size.y = entity.size.y === 0 ? 0.01 : entity.size.y;
    size.z = entity.size.z === 0 ? 0.01 : entity.size.z;

    let groundBody = new CANNON.Body({
      mass: 0,
      material: groundMaterial,
      position: new CANNON.Vec3(entity.position.x, entity.position.z, entity.position.y),
      shape: new CANNON.Box(new CANNON.Vec3(size.x, size.z, size.y)),
      quaternion: new CANNON.Quaternion(entity.rotation.x, entity.rotation.z, entity.rotation.y, -entity.rotation.w),
    })
    return groundBody;
  }

  /* Method of simulating physics */
  dt = () => {
    let { ball, bullets, code, io, world } = this;
    let timeStep = 1.0 / 60.0;
    this.timer = setInterval(() => {
      world.step(timeStep);
      io.to(code).emit('setdsdr', {
        ball: {
          pos: {
            x: ball.body.position.x,
            y: ball.body.position.z,
            z: ball.body.position.y
          },
          rot: {
            x: ball.body.quaternion.x,
            y: ball.body.quaternion.z,
            z: ball.body.quaternion.y,
            w: ball.body.quaternion.w * -1
          }
        },
        bullets: Object.entries(bullets).map(([key, value]) => ({
          id: key,
          pos: {
            x: value.body.position.x,
            y: value.body.position.z,
            z: value.body.position.y,
          }
        }))
      });
    }, 16);
  }

  /* Spawns a bullet in the world. Called when user socket emit an spawnBullet event */
  sendSpawnBullets = (spawnPointData: ISpawnPointData) => {
    let { bullets, sphereMaterial, world } = this;
    const { team, spawnPoint, gunVec } = spawnPointData;

    // Create bullet
    let radius = 0.01;
    let bulletBody = new CANNON.Body({
      mass: 1000,
      material: sphereMaterial,
      position: new CANNON.Vec3(spawnPoint.x, spawnPoint.z, spawnPoint.y),
      shape: new CANNON.Sphere(radius),
    });

    let impulse = new CANNON.Vec3(gunVec.x, gunVec.z, gunVec.y);
    bulletBody.applyImpulse(impulse, bulletBody.position);
    world.addBody(bulletBody);

    let id = bulletBody.id;
    bullets[id] = {
      body: bulletBody,
      team: team,
    };
    setTimeout(() => {
      world.remove(bulletBody);
      delete bullets[id];
    }, 5000);
  }

  /* Attached to event listener for ball. Determine which team the ball is now and when it goals */
  determineWinner = (e: any) => {
    if (this.bullets.hasOwnProperty(e.body.id)) {
      this.ball.team = this.bullets[e.body.id].team;
    }
    // When player goals
    if ((e.body.id) === this.herogoalbox) {
      this.io.to(this.code).emit('winner', 'Enemy');
      this.nextGame();
    }
    if (e.body.id === this.enemygoalbox) {
      this.io.to(this.code).emit('winner', 'Hero');
      this.nextGame();
    }
  }

  newGame = () => {
    this.ball.body.position = new CANNON.Vec3(0, 0, 10);
    this.ball.body.quaternion = new CANNON.Quaternion(0, 0, 0, 1);
    this.ball.body.sleep();
    this.ball.body.wakeUp();
  }

  /* Shuts down the world. Removes all body in world so then it can be garbage collected */
  clearPhysics = () => {
    clearInterval(this.timer);
    this.ball.body.removeEventListener('collide', this.determineWinner);
    let deleteLength = this.world.bodies.length;
    for (let i = 0; i < deleteLength; i++) {
      this.world.remove(this.world.bodies[0])
    }
  }
}

export default Universe;

const scene: IEntity[] = [
  {
    name: 'InvisibleWalls',
    position: {
      x: -57.07099914550781,
      y: 7.071000099182129,
      z: 32.07099914550781
    },
    size: { x: 0.01, y: 10, z: 7.071 },
    rotation: { x: 0, y: 0, z: 0.38268343236508984, w: 0.9238795325112867 }
  },
  {
    name: 'InvisibleWalls',
    position: {
      x: -57.07099914550781,
      y: 7.071000099182129,
      z: -32.07099914550781
    },
    size: { x: 0.01, y: 10, z: 7.071 },
    rotation: { x: 0, y: 0, z: 0.38268343236508984, w: 0.9238795325112867 }
  },
  {
    name: 'InvisibleWalls',
    position: {
      x: 57.07099914550781,
      y: 7.071000099182129,
      z: 32.07099914550781
    },
    size: { x: 0.01, y: 10, z: 7.071 },
    rotation: { x: 0, y: 0, z: -0.38264587575991654, w: 0.9238950880721937 }
  },
  {
    name: 'InvisibleWalls',
    position: {
      x: 57.07099914550781,
      y: 7.071000099182129,
      z: -32.07099914550781
    },
    size: { x: 0.01, y: 10, z: 7.071 },
    rotation: { x: 0, y: 0, z: -0.38268343236508984, w: 0.9238795325112867 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: -64.14199829101562, y: 27.070999145507812, z: 0 },
    size: { x: 0.01, y: 12.929, z: 39.142 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: 64.14199829101562, y: 27.070999145507812, z: 0 },
    size: { x: 0.01, y: 12.929, z: 39.142 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: 0, y: 27.070999145507812, z: 39.141998291015625 },
    size: { x: 64.142, y: 12.929, z: 0.01 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: 0, y: 27.070999145507812, z: -39.141998291015625 },
    size: { x: 64.142, y: 12.929, z: 0.01 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleCeiling',
    position: { x: 0, y: 40, z: 0 },
    size: { x: 64.142, y: 0.01, z: 39.142 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'Wall',
    position: { x: 0, y: 7.071000099182129, z: -32.07099914550781 },
    size: { x: 64.142, y: 0, z: 10 },
    rotation: { x: 0.38268343236508984, y: 0, z: 0, w: 0.9238795325112867 }
  },
  {
    name: 'Wall',
    position: { x: 0, y: 7.071000099182129, z: 32.07099914550781 },
    size: { x: 64.142, y: 0, z: 10 },
    rotation: { x: -0.38268343236508984, y: 0, z: 0, w: 0.9238795325112867 }
  },
  {
    name: 'Wall',
    position: { x: -57.07099914550781, y: 7.071000099182129, z: 15 },
    size: { x: 10, y: 0, z: 10 },
    rotation: { x: 0, y: 0, z: -0.38268343236508984, w: 0.9238795325112867 }
  },
  {
    name: 'Wall',
    position: { x: -57.07099914550781, y: 7.071000099182129, z: -15 },
    size: { x: 10, y: 0, z: 10 },
    rotation: { x: 0, y: 0, z: -0.38268343236508984, w: 0.9238795325112867 }
  },
  {
    name: 'Wall',
    position: { x: -58.8390007019043, y: 8.83899974822998, z: 0 },
    size: { x: 7.5, y: 0, z: 5 },
    rotation: { x: 0, y: 0, z: -0.38268343236508984, w: 0.9238795325112867 }
  },
  {
    name: 'GoalWall',
    position: { x: -50.51129913330078, y: 1.7669999599456787, z: 5 },
    size: { x: 3, y: 1.768, z: 0.25 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'GoalWall',
    position: { x: -50.51129913330078, y: 1.7669999599456787, z: -5 },
    size: { x: 3, y: 1.768, z: 0.25 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'GoalWall',
    position: { x: -50.51129913330078, y: 3.7860000133514404, z: 0 },
    size: { x: 3, y: 5.25, z: 0.25 },
    rotation: { x: 0.7071067811865475, y: 0, z: 0, w: 0.7071067811865476 }
  },
  {
    name: 'HeroGoalBox',
    position: { x: -52, y: 1.7680000066757202, z: 0 },
    size: { x: 2, y: 1.768, z: 5 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: -90, y: 0, z: 0 },
    size: { x: 0.01, y: 40, z: 25 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: -50, y: -20, z: 0 },
    size: { x: 0.01, y: 20, z: 25 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: -70, y: -20, z: 25 },
    size: { x: 20, y: 20, z: 0.01 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: -70, y: -20, z: -25 },
    size: { x: 20, y: 20, z: 0.01 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: -70, y: -40, z: 0 },
    size: { x: 20, y: 0.01, z: 25 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: -77.07099914550781, y: 20, z: 25 },
    size: { x: 12.929, y: 20, z: 0.01 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: -77.07099914550781, y: 20, z: -25 },
    size: { x: 12.929, y: 20, z: 0.01 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'Wall',
    position: { x: 57.07099914550781, y: 7.071000099182129, z: 15 },
    size: { x: 10, y: 0, z: 10 },
    rotation: { x: 0, y: 0, z: 0.38268343236508984, w: 0.9238795325112867 }
  },
  {
    name: 'Wall',
    position: { x: 57.07099914550781, y: 7.071000099182129, z: -15 },
    size: { x: 10, y: 0, z: 10 },
    rotation: { x: 0, y: 0, z: 0.38268343236508984, w: 0.9238795325112867 }
  },
  {
    name: 'Wall',
    position: { x: 58.8380012512207, y: 8.83899974822998, z: 0 },
    size: { x: 7.5, y: 0, z: 5 },
    rotation: { x: 0, y: 0, z: 0.38268343236508984, w: 0.9238795325112867 }
  },
  {
    name: 'GoalWall',
    position: { x: 50.51100158691406, y: 1.7669999599456787, z: 5 },
    size: { x: 3, y: 1.768, z: 0.25 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'GoalWall',
    position: { x: 50.51100158691406, y: 1.7669999599456787, z: -5 },
    size: { x: 3, y: 1.768, z: 0.25 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'GoalWall',
    position: { x: 50.51100158691406, y: 3.7860000133514404, z: 0 },
    size: { x: 3, y: 5.25, z: 0.25 },
    rotation: { x: 0.7071067811865475, y: 0, z: 0, w: 0.7071067811865476 }
  },
  {
    name: 'EnemyGoalBox',
    position: { x: 52, y: 1.7680000066757202, z: 0 },
    size: { x: 2, y: 1.768, z: 5 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: 90, y: 0, z: 0 },
    size: { x: 0.01, y: 40, z: 25 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: 50, y: -20, z: 0 },
    size: { x: 0.01, y: 20, z: 25 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: 70, y: -20, z: 25 },
    size: { x: 20, y: 20, z: 0.01 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: 70, y: -20, z: -25 },
    size: { x: 20, y: 20, z: 0.01 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: 70, y: -40, z: 0 },
    size: { x: 20, y: 0.01, z: 25 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: 77.07099914550781, y: 20, z: 25 },
    size: { x: 12.929, y: 20, z: 0.01 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'InvisibleBorder',
    position: { x: 77.07099914550781, y: 20, z: -25 },
    size: { x: 12.929, y: 20, z: 0.01 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  },
  {
    name: 'WalkingSurface',
    position: { x: 0, y: 0, z: 0 },
    size: { x: 50, y: 0, z: 25 },
    rotation: { x: 0, y: 0, z: 0, w: 1 }
  }
]