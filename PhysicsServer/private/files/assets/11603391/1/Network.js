var Network = pc.createScript('network');

/*
 * TODO:
 * 1. Send Eulers to server
 * 2. Send to bullets positions to server
 * 3. Send ball positions to server
 * */

// initialize code called once per entity
Network.prototype.initialize = function() {
    // this.socket = io.connect('https://socshoot0-2.glitch.me');
    // this.socket.emit('initialize');
    var socket = this.socket;
    var self = this;
    var app = this.app;
    this.gameStarted = false;
    this.host = true;
    
    //Player Variables
    this.player = this.app.root.findByName ('Player');
    this.other = this.app.root.findByName ('Other');
    
    //Ball Variables
    this.ball = this.app.root.findByName('Ball');
    this.ball2 = this.app.root.findByName('Ball2');
    
    this.initialCamera = this.app.root.findByName('InitialCamera');
    
    // Game states
    this.app.on ('startGame', function (title) {
        // self.socket.emit('startGame');
        self.startGame();
    });
    
    /*
    socket.on ('startGame', function () {
        self.startGame();
    });
    
    // Sync players
    socket.on ('playerData', function (data) {
        if (data.players[data.id].isHost) {
            self.initializePlayersHost (data);
        } else {
            self.initializePlayers (data);
        }
    });
    socket.on ('addPlayer', function (player) {
        self.addPlayer (player);
    });
    socket.on ('playerMoved', function (data) {
        self.movePlayer (data);
    });
    socket.on ('deletePlayer', function (id) {
        self.deletePlayer (id);
    });
    socket.on ('nextGame', function(time, players) {
        self.newGame(time, players);
    });
    
    
    // Sync Scores
    this.app.on("scored", function (team) {
        socket.emit('scored', team);
    });
    socket.on ('displayScore', function(team) {
        self.displayScore(team);
    });
    
    // Sync Balls
    this.app.on ('host', function() {
        self.hosts("host"); //hosts function- change this.host to true.
        socket.emit('isHost');
    });
    socket.on ('ishost', function() {
        self.hosts("host");
    });
    socket.on ('updateBall', function (ball) {
        self.moveBall(ball);
    });
    socket.on ('notHost', function () {
        self.hosts("notHost");
    });
    
    // Sync Bullets
    this.app.on ('bulletFired', function(x, y, z, w) {
        socket.emit("bulletFired", x, y, z, w);
    });
    socket.on ('newBullet', function(x, y, z, w) {
        app.fire("newBullet", x, y, z, w);
    });
    */
};

// update code called every frame
Network.prototype.update = function(dt) {
    /*
    if (this.host && this.gameStarted) {
        this.updateBall();
    }
    */
    /*
    if(this.host) {
        this.updateBall();
    }
    this.updatePosition ();
    */
};


Network.prototype.initializePlayersHost = function (data) {
    this.players = data.players;
    this.id = data.id;
    this.host = true;
    
    // UI updates
    var HostStartBtn = this.app.root.findByName('HostStartBtn');
    HostStartBtn.enabled = true;
    var hostTeam = this.players[data.id].team;
    this.app.fire('updateConnected', Object.keys(this.players).length);
    this.app.fire('updateTeam', hostTeam);
    
    // Create player entities
    this.players[this.id].entity = this.player;
    this.player.tags.add(hostTeam);
    this.player.rigidbody.teleport(this.players[this.id].position.x, this.players[this.id].position.y, this.players[this.id].position.z);
    if (hostTeam === 'Hero') {
        this.player.setEulerAngles(0, 270, 0);
    } else {
        this.player.setEulerAngles(0, 90, 0);
    }
    // For every player already connected, create a new capsule entity.
    /*
    for (var id in this.players) {
        if (id !== data.id) {
            this.players[id].entity = this.createPlayerEntityHost(this.players[id]);
            console.log('InitializePlayersHost Entity created', this.players[id]);
        }
    }
    */

    // Mark that the client has received data from the server.
    //this.initialized = true;
};

Network.prototype.initializePlayers = function (data) {
    this.players = data.players;
    this.id = data.id;
    this.host = false;
    
    //UI updates
    var PlayerWaitingText = this.app.root.findByName('PlayerWaitingText');
    PlayerWaitingText.enabled = true;
    var playerTeam = this.players[data.id].team;
    this.app.fire('updateConnected', Object.keys(this.players).length);
    this.app.fire('updateTeam', playerTeam);
    
    //Create player entities
    this.players[this.id].entity = this.other;
    this.other.tags.add(playerTeam);
    this.other.setPosition(this.players[this.id].position.x, this.players[this.id].position.y, this.players[this.id].position.z);
    if (playerTeam === 'Hero') {
        this.other.setEulerAngles(0, 270, 0);
    } else {
        this.other.setEulerAngles(0, 90, 0);
    }
    
    // For every player already connected, create a new capsule entity.
    for (var id in this.players) {
        if (id !== this.id) {
            this.players[id].entity = this.createPlayerEntity(this.players[id]);
        }
    }
    
    /*
    //Set my player
    this.myPlayer(data);

    //Disable Goal boxes

    var heroGoalBox = this.app.root.findByName('HeroGoalBox');
    var enemyGoalBox = this.app.root.findByName('HeroGoalBox');
    heroGoalBox.enabled = false;
    enemyGoalBox.enabled = false;
    
    // Mark that the client has received data from the server.
    this.initialized = true;
    */
};

Network.prototype.createPlayerEntityHost = function (player) {
    var newPlayer = this.player2.clone();
    // Create a new player entity.

    newPlayer.tags.add(player.team);
    //Add tags of the entity
    
    this.player2.getParent().addChild (newPlayer);
    // Add the entity to the entity hierarchy.

    newPlayer.rigidbody.teleport (player.position.x, player.position.y, player.position.z);
    // Teleport the new entity to the position of the connected player.
    
    if (player.team === 'Hero') {
        newPlayer.setEulerAngles(0, 270, 0);
    } else {
        newPlayer.setEulerAngles(0, 90, 0);
    }

    return newPlayer;
    // Return the new entity.
};

Network.prototype.createPlayerEntity = function (player) {
    var newPlayer = this.other2.clone ();
    // Create a new player entity.

    newPlayer.tags.add(player.team);
    //Add tags of the entity
    
    this.other2.getParent().addChild (newPlayer);
    // Add the entity to the entity hierarchy.

    newPlayer.setPosition (player.position.x, player.position.y, player.position.z);
    // Teleport the new entity to the position of the connected player.

    if (player.team === 'Hero') {
        newPlayer.setEulerAngles(0, 270, 0);
    } else {
        newPlayer.setEulerAngles(0, 90, 0);
    }
    
    return newPlayer;
    // Return the new entity.
};

Network.prototype.startGame = function () {
    this.gameStarted = true;
    this.initialCamera.enabled = false;
    if (this.host) {
        this.player.enabled = true;
        this.ball.enabled = true;
    } else {
        this.other.enabled = true;
        this.app.root.findByName('PlayerWaitingText').enabled = false;
        this.ball2.enabled = true;
    }
    /*
    for (var id in this.players) {
        if (id !== this.id) {
            this.players[id].entity.enabled = true;
        }
    }
    */
};

Network.prototype.addPlayer = function (player) {
    this.players[player.id] = player.player;
    
    if (this.host) {
        this.players[player.id].entity = this.createPlayerEntityHost (this.players[player.id]);
    } else {
        this.players[player.id].entity = this.createPlayerEntity(this.players[player.id]);
    }
    
    this.app.fire('updateConnected', Object.keys(this.players).length);
};

Network.prototype.deletePlayer = function (id) {
    this.players[id].entity.enabled = false;
    delete this.players[id];
    this.app.fire('updateConnected', Object.keys(this.players).length);
};

/*
Network.prototype.myPlayer = function (data) {
    // Keep track of what ID number you are.
    this.id = data.id;
    console.log("My id is " + this.id);
    
    //Tell network,js that this player is host
    //this.host = true;
    
    //Add tags of the entity
    this.player.tags.add(data.team);
    console.log("My tag is " + this.player.tags.list());
    
    //Set teamText
    var teamText = this.app.root.findByName("TeamText");
    var teamPlayer = this.player.tags.list()[0];
    teamText.element.text = "Team " + teamPlayer;
    
    //Will set a server event to teleport people to certain places.
    this.player.rigidbody.teleport(data.players[this.id].x, data.players[this.id].y, data.players[this.id].z);
    
    //Add entity to this.players
    //this.players[this.id].entity = this.player;
    
    //Disable player2
    //this.player2.enabled = false;
    
    if(teamPlayer == "Hero") {
        this.app.fire("initialEuler");  //Change angle because originally not facing the enemy goal.
    } else {    //If I am enemy
        this.app.fire("initialEulerEnemy");
        //Change TeamText color to red.
        teamText.element.color.r = 1;
        teamText.element.color.b = 0;
        teamText.element.color.g = 0;
    }
};


Network.prototype.myPlayerClient = function (data) {
    console.log("myPlayer");
    // Keep track of what ID number you are.
    this.id = data.id;
    console.log("My id is " + this.id);
    
    //Add tags of the entity
    this.player2.tags.add(data.team);
    console.log("My tag is " + this.player2.tags.list());
    
    //Set teamText
    var teamText = this.app.root.findByName("TeamText");
    var teamPlayer = this.player2.tags.list()[0];
    teamText.element.text = "Team " + teamPlayer;
    
    //Will set a server event to teleport people to certain places.
    this.player2.setPosition(data.players[this.id].x, data.players[this.id].y, data.players[this.id].z);
    
    //Add entity to this.players
    this.players[this.id].entity = this.player2;
    
    //Disable player1
    this.player.enabled = false;
    
    if(teamPlayer == "Hero") {
        this.app.fire("initialEuler");  //Change angle because originally not facing the enemy goal.
    } else {    //If I am enemy
        //Change TeamText color to red.
        teamText.element.color.r = 1;
        teamText.element.color.b = 0;
        teamText.element.color.g = 0;
    }
};

Network.prototype.movePlayer = function (data) {
    if (this.initialized) {
        //this.players[data.id].entity.rigidbody.teleport (data.x, data.y, data.z);
        this.players[data.id].entity.setPosition (data.x, data.y, data.z);  //update player position
        this.players[data.id].entity.children[0].children[0].setPosition(data.gx, data.gy, data.gz);  //update handgun position
        this.players[data.id].entity.children[0].children[0].setRotation(data.grx, data.gry, data.grz);  //update handgun rotation
        /*
        if(this.host) {
            this.players[data.id].entity.rigidbody.teleport (data.x, data.y, data.z);
        } else {
            console.log('moved', data.id);
            //this.players[data.id].entity.setPosition (data.x, data.y, data.z);
            this.player2.setPosition (data.x, data.y, data.z);
        }
        
    }
};

Network.prototype.updatePosition = function () {
    if (this.initialized) {
        /*
        for(var i in this.players) {
            var pos = this.players[i].entity.getPosition();
            this.socket.emit ('positionUpdate', {id: this.id, x: pos.x, y: pos.y, z: pos.z});
        }
        
        var pos = this.player.getPosition ();
        var gunpos = this.player.children[0].children[1].getPosition();
        var gunrot = this.player.children[0].children[1].getRotation();
        this.socket.emit ('positionUpdate', {id: this.id, x: pos.x, y: pos.y, z: pos.z, 
            gx: gunpos.x, gy: gunpos.y, gz: gunpos.z, 
            grx: gunrot.x, gry: gunrot.y, grz: gunrot.z, grw: gunrot.w});
    }
};
*/


Network.prototype.displayScore = function (team) {
    var scoreText = this.app.root.findByName("ScoreText");
    //Display victory or defeat
    var player = this.app.root.findByName("Player");
    if(player.tags.has(team)) {
        scoreText.element.text = "Victory!";
    } else {
        scoreText.element.text = "Defeated";
    }
};

Network.prototype.newGame = function (time, players) {
    var ngt = this.app.root.findByName("NextGameText");
    if(time === 0) {
        /*PLAYERS*/
        //Set scoreText to null;
        var scoreText = this.app.root.findByName("ScoreText");
        scoreText.element.text = "";
        
        //Set NextGameText to null;
        ngt.element.text = "";
        for(var id in this.players){
            if(id !== this.id){
                this.players[id].entity.setPosition(players[id].x, players[id].y, players[id].z);
                this.players[id].team = players[id].team;
                this.players[id].entity.tags.list[0] = players[id].team;
            } else {
                //Move to new place
                this.player.rigidbody.teleport(players[this.id].x, players[this.id].y, players[this.id].z);
                this.player.rigidbody.linearVelocity = new pc.Vec3();
                //Set team
                this.player.tags.list[0] = players[id].team;
                
                //Set teamText
                var teamText = this.app.root.findByName("TeamText");
                var teamPlayer = this.player.tags.list()[0];
                teamText.element.text = "Team " + teamPlayer;

                if(teamPlayer == "Hero") {
                    this.app.fire("initialEuler");  //Change angle because originally not facing the enemy goal.
                } else {    //If I am enemy
                    //Change TeamText color to red.
                    teamText.element.color.r = 1;
                    teamText.element.color.b = 0;
                    teamText.element.color.g = 0;
                }
            }
        }
        /*BALL*/
        if(this.host) {
            this.ball.rigidbody.teleport(0, 10 ,0);
            this.ball.rigidbody.linearVelocity = new pc.Vec3();
            this.ball.rigidbody.angularVelocity = new pc.Vec3();
        }
    } else {
        ngt.element.text = "Next Game in " + time;
    }
};

//Update Ball Functions
Network.prototype.hosts = function (host) {
    if(host === "host") {
        this.host = true;
    } else {
        this.host = false;
        this.ball.enabled = false;
        this.ball2.enabled = true;
    }
};
Network.prototype.moveBall = function (ball) {
    if (this.gameStarted) {
        this.ball2.setPosition (ball.pos.x, ball.pos.y, ball.pos.z);
        var q = new pc.Quat(ball.rot.x, ball.rot.y, ball.rot.z, ball.rot.w);
        this.ball2.setRotation(q);
    }
};
Network.prototype.updateBall = function () {
    if (this.gameStarted) {
        var pos = this.ball.getPosition();
        var rot = this.ball.getRotation();
        this.socket.emit ('updateBall', { pos: pos, rot: rot });
        //this.socket.emit ('updateBall', {x: pos.x, y: pos.y, z: pos.z, rx: rot.x, ry: rot.y, rz: rot.z, rw: rot.w});
    }
};