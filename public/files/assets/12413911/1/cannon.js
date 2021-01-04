var Cannon = pc.createScript('cannon');

// initialize code called once per entity
Cannon.prototype.initialize = function() {
    this.ball = this.app.root.findByName("Ball");
    //this.socket = io.connect('https://clear-course.glitch.me');
    //this.socket = io.connect('https://bright-skull.glitch.me');
    this.socket = io.connect('https://socshoot0-3test2');
    this.socket.emit('initialize');
    var socket = this.socket;
    var self = this;
    
    //this.player = this.app.root.findByName ('Player');
    //this.other = this.app.root.findByName ('Other');
    
    socket.on ('initialized', function (id, players) {
        self.initializePlayers (id, players);
    });
    
    socket.on ('movePlayer', function (positions) {
        self.movePlayer (positions);
    });
    
    this.app.on ('updatePosition', function (x, z, power) {
       //self.updatePosition();
    });
};

// update code called every frame
Cannon.prototype.update = function(dt) {
    //console.log(this.b1.getPosition().y);
    if(this.app.keyboard.isPressed(pc.KEY_W)) {
        this.socket.emit('move');
    }
    if(this.app.keyboard.isPressed(pc.KEY_S)) {
        
    }
    if(this.app.keyboard.isPressed(pc.KEY_D)) {
        
    }
    if(this.app.keyboard.isPressed(pc.KEY_A)) {
        
    }
};

Cannon.prototype.initializePlayers = function (id, players) {
    // Create a player array and populate it with the currently connected players.
    this.players = players;
    console.log("All the players: " + this.players);
    
    // For every player already connected, create a new capsule entity.
    for(var i in this.players){
        if(i !== id){
            this.players[i].entity = this.createPlayerEntity(this.players[i]);
        } else if (i === id) {
            this.players[id].entity = this.app.root.findByName ('Player');
        } else if (i === "ball") {
            this.players[id].entity = this.app.root.findByName ('Ball');
        }
    }
    
    //Set my player
    this.myPlayer(id);
    
    // Mark that the client has received data from the server.
    this.initialized = true;
};

Cannon.prototype.myPlayer = function (id) {
    // Keep track of what ID number you are.
    this.id = id;
    console.log("My id is " + this.id);
    
    this.player = this.players[this.id].entity;
    
    //Add tags of the entity
    this.player.tags.add(this.players[this.id].team);
    console.log("My tag is " + this.player.tags.list());
    
    //Set teamText
    var teamText = this.app.root.findByName("TeamText");
    var teamPlayer = this.player.tags.list()[0];
    teamText.element.text = "Team " + teamPlayer;
    
    //Will set a server event to teleport people to certain places.
    this.player.setPosition(this.players[this.id].body.position.x, this.players[this.id].body.position.z, this.players[this.id].body.position.y);
    
    if(teamPlayer == "Hero") {
        this.app.fire("initialEuler");  //Change angle because originally not facing the enemy goal.
    } else {    //If I am enemy
        //Change TeamText color to red.
        teamText.element.color.r = 1;
        teamText.element.color.b = 0;
        teamText.element.color.g = 0;
    }
};

Cannon.prototype.createPlayerEntity = function (data) {
    var newPlayer = this.other.clone ();
    // Create a new player entity.

    newPlayer.enabled = true;
    // Enable the newly created player.

    newPlayer.tags.add(data.team);
    //Add tags of the entity
    
    this.other.getParent().addChild (newPlayer);
    // Add the entity to the entity hierarchy.

    if (data)
        newPlayer.rigidbody.teleport (data.x, data.y, data.z);
    // If a location was given, teleport the new entity to the position of the connected player.

    return newPlayer;
    // Return the new entity.
};

Cannon.prototype.movePlayer = function (positions) {
    /*
    if (this.initialized)
        this.players[data.id].entity.rigidbody.teleport (data.x, data.y, data.z);
    console.log(data.x, data.y, data.z);
    */
    if(this.initialized) {
        for(var id in this.players) {
            this.players[id].entity.setPosition(positions[id].x, positions[id].z, positions[id].y);
        }
    }
};

Cannon.prototype.updatePosition = function () {
    
    /*
    if (this.initialized) {
        var pos = this.player.getPosition ();
        this.socket.emit ('positionUpdate', {id: this.id, x: pos.x, y: pos.y, z: pos.z});
    }
    */
};

Cannon.prototype.displayScore = function (team) {
    var scoreText = this.app.root.findByName("ScoreText");
    //Display victory or defeat
    var player = this.app.root.findByName("Player");
    if(player.tags.has(team)) {
        scoreText.element.text = "Victory!";
    } else {
        scoreText.element.text = "Defeated";
    }
};

Cannon.prototype.moveBall = function(position) {
    //console.log(position.z);
    this.ball.setPosition(position.x, position.z, position.y);
};

// swap method called for script hot-reloading
// inherit your script state here
// Cannon.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/