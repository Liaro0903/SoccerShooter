# Soccer Shooter

An online multiplayer FPS game where players shoot bullets at a ball to "kick" the ball into their goal. Here are two playable links:
1. [Play on PlayCanvas](https://playcanv.as/p/h9FzL0Ep/)
1. [Play on IONIS Website](socshoot.ionis-hg.com)

## Installation
Prerequisites: node, yarn, and Typescript

Development:
```
yarn
yarn start
```
Production:
```
yarn
yarn build
yarn start-prod
```

## How this Works
The frontend is made with PlayCanvas and the project link on PlayCanvas is [here](https://playcanvas.com/project/515987/overview/soccer-shooter). Current frontend build was downloaded to the "public" folder in this repository.

Usually, the physics of the game is run on the frontend handled by Ammo, the physics engine that PlayCanvas is using. However, in multiplayer mode, the physics needed to be run on the backend. Currently, PlayCanvas could not be run on the backend unless with some hacks with mock canvas and disabling WebGL. I decided to use cannon.js as the physics engine running on NodeJS + Typescript backend, as I think it is more clear and easier to implement than the headless PlayCanvas hack. Player's movement physics is still handled on the frontend, but the ball and bullets are handled in the back, and are synced to the front using Socket.io.

The current method for handling physics is more of a "proof of concept" implementation. Ideally, the backend can be upgrade to a more powerful language or library like using C++. Feel free to contribute or even contact me.

## Some backstory about this game
This idea came to me when I was doing some Unreal Engine tutorials, and I thought it will be fun if multiple people can play together. Actual implementation didn't come until I discovered PlayCanvas through my friend. We started working on together but it was sporadic throughout the years. As I learn more about web development, the game has also come to a playable state. This is also the first game I ever made, and also the first time making a multiplayer game as well. 

---
### This project is also listed on my website, ionis-hg.com

