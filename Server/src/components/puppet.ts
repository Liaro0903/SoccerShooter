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

export const dt = (socket: Socket) => {
  timer = setInterval(async () => {
    let balldsdr = await getBall();
    socket.emit('setBalldsdr', balldsdr);
    socket.broadcast.emit('setBalldsdr', balldsdr);
  }, 16);
}

export const test = () => {
  console.log('In test');
}
