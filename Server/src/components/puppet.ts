import puppeteer, { Browser, Page } from 'puppeteer';
import * as socketio from 'socket.io';
// import { Socket } from 'socket.io';
import { Vector } from './player';

let browser: Browser;
let page: Page;
let timer: any;

export const initializeServer = async () => {
  browser = await puppeteer.launch( { headless: false });
  page = await browser.newPage();
  await page.goto('http://localhost:3001');
}

export const closeServer = async () => {
  clearInterval(timer);
  await browser.close();
}

const getEntities = async () => {
  let entities = await page.evaluate(() => ({
    ball: {
      // @ts-ignore
      pos: app.root.findByName('Ball').getPosition(),
      // @ts-ignore
      rot: app.root.findByName('Ball').getEulerAngles(),
    },
    // @ts-ignore
    bullets: app.root.findByName('BulletFolder').children.map((bullet) => ({
      // @ts-ignore
      id: bullet._guid,
      // @ts-ignore
      pos: bullet.getPosition(),
    }))
  }));
  return entities;
}

export interface ISpawnPointData {
  team: string;
  spawnPoint: Vector;
  gunVec: Vector;
}

export const sendSpawnBullets = async (spawnPointData: ISpawnPointData) => {
  await page.evaluate((spawnPointData: ISpawnPointData) => {
    // @ts-ignore
    app.root.findByName('Player').script.spawnBullets.spawnPoints.push(spawnPointData);
    // @ts-ignore
  }, spawnPointData);
}

const getScore = async () => {
  let score = await page.evaluate(() =>
    // @ts-ignore
    app.root.findByName('Ball').script.score.winner
  );
  return score;
}

export const dt = async (socket: socketio.Socket, io: socketio.Server) => {
  let emittedWinner = false;
  timer = setInterval(async () => {
    let dsdr = await getEntities();
    io.emit('setdsdr', dsdr);

    let winner = await getScore();
    if (winner !== 'None' && !emittedWinner) {
      socket.emit('winner', winner);
      socket.broadcast.emit('winner', winner);
      emittedWinner = true;
      console.log('Winner emitted');
    }
  }, 16);
}