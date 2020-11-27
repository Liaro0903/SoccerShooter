import puppeteer, { Browser, Page } from 'puppeteer';
import { Socket } from 'socket.io';

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

const getBall = async () => {
  let balldsdr = await page.evaluate(() => ({
    // @ts-ignore
    pos: app.root.findByName('Ball').getPosition(),
    // @ts-ignore
    rot: app.root.findByName('Ball').getEulerAngles(),
  }));
  return balldsdr;
}

const getScore = async () => {
  let score = await page.evaluate(() =>
    // @ts-ignore
    app.root.findByName('Ball').script.score.winner
  );
  return score;
}

export const dt = async (socket: Socket) => {
  timer = setInterval(async () => {
    let balldsdr = await getBall();
    socket.emit('setBalldsdr', balldsdr);
    socket.broadcast.emit('setBalldsdr', balldsdr);
    let winner = await getScore();
    if (winner !== 'None') {
      socket.emit('winner', winner);
      socket.broadcast.emit('winner', winner);
    }
  }, 16);
}