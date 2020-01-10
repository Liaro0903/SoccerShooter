var Vector = require('./vector.js');

/*** Player Object ***/

// Constructor
class Player {
  constructor(playersLength) {
    this.team = playersLength % 2 === 0 ? 'Hero' : 'Enemy';
    this.position = Player.spawnLocations[playersLength];
    this.isHost = playersLength === 0 ? true : false;
  }
}

// spawn locations available to players
Player.spawnLocations = [  //Hero and Enemy alternate. Player 1 Hero, player 2 Enemy, player 3 Hero...
  new Vector(-4, 4, 0),  //Hero Side
  new Vector(4, 4, 1),  //Enemy Side
  new Vector(-4, 4, 6),  //Hero side 2
  new Vector(4, 4, 7),  //Enemy Side 2
  new Vector(-4, 4, -6),  //Hero Side 3
  new Vector(4, 4, -5)  //Enemy Side 3
];

// exports the player class
module.exports = Player;