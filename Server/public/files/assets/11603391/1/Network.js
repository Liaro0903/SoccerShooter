var Network = pc.createScript('network');

// initialize code called once per entity
Network.prototype.initialize = function() {
    // this.socket = io.connect('https://socshoot0-2.glitch.me');
    this.socket = io();
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
        socket.emit('initialize', title);
    });
    
    /* Sync players */
    
    // After initialized, get all players data 
    socket.on ('playerData', function (data) {
        self.startGame();
        self.initializePlayers(data);
    });

    // When new player joined, add the new player
    socket.on ('setLocalPlayers', function(newPlayer) {
        self.addPlayer(newPlayer);
    });

    // When other players move, update their stuff
    socket.on ('setLocaldsdr', function (dsdr) {
        self.setLocaldsdr(dsdr);
    });

    // When other player left
    socket.on ('goodbyePlayer', function (id) {
        self.deletePlayer (id);
    });

    /*
    socket.on ('nextGame', function(time, players) {
        self.newGame(time, players);
    });
    */
    
    // Sync Scores
    socket.on ('winner', function (winner) {
        self.displayScore(winner);
    })
    
    // Sync Balls
    socket.on('setBalldsdr', function (balldsdr) {
        self.moveBall(balldsdr);
    })
    /*
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
    */

    // Sync Bullet
    socket.on('setBullets', function (bullets) {
        app.fire('setBullets', bullets);
    })

    /*
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
    this.setRemotedsdr();
};


Network.prototype.initializePlayers = function (data) {
    this.players = data.players;
    this.id = data.id;
    this.host = true;
    
    // UI updates
    var hostTeam = this.players[this.id].team;
    this.app.fire('updateConnected', Object.keys(this.players).length);
    this.app.fire('updateTeam', hostTeam);
    
    // Create player entities
    this.players[this.id].entity = this.player;
    this.player.tags.add(hostTeam);
    this.player.rigidbody.teleport(this.players[this.id].position.x, this.players[this.id].position.y, this.players[this.id].position.z);
    if (hostTeam === 'Hero') {
        this.app.fire('initialEulerHero');
    } else {
        this.app.fire('initialEnemy');
    }
    
    // For every player already connected, create a new capsule entity.
    for (var id in this.players) {
        if (id !== this.id) {
            this.players[id].entity = this.createPlayerEntity(this.players[id]);
        }
    }

    // Mark that the client has received data from the server.
    this.initialized = true;
};

Network.prototype.createPlayerEntity = function (player) {
    var newPlayer = this.other.clone();  // Create a new player entity.
    newPlayer.tags.add(player.team);  // Add tags of the entity
    this.other.getParent().addChild (newPlayer);  // Add the entity to the entity hierarchy.
    newPlayer.rigidbody.teleport (player.position.x, player.position.y, player.position.z);  // Teleport the new entity to the position of the connected player.
    newPlayer.children[1].children[0].element.text = player.title;  // Update title text
    if (player.team === 'Enemy') newPlayer.children[1].children[0].element.color = new pc.Color(1, 0, 0);  // Update color of text
    newPlayer.children[2].setLocalEulerAngles(player.rotation.x, player.rotation.y, player.rotation.z);
    newPlayer.enabled = true;
    
    return newPlayer;
};

Network.prototype.addPlayer = function (newPlayer) {
    this.players[newPlayer.id] = newPlayer;
    this.players[newPlayer.id].entity = this.createPlayerEntity (this.players[newPlayer.id]);
    this.app.fire('updateConnected', Object.keys(this.players).length);
};

Network.prototype.deletePlayer = function (id) {
    this.players[id].entity.enabled = false;
    delete this.players[id];
    this.app.fire('updateConnected', Object.keys(this.players).length);
};

Network.prototype.setRemotedsdr = function () {
    if (this.initialized) {
        var pos = this.player.getPosition();
        var rot = this.app.root.findByName('FirstPersonCamera').getLocalEulerAngles();
        this.socket.emit('setRemotedsdr', {
            id: this.id,
            x: pos.x,
            y: pos.y,
            z: pos.z,
            ex: rot.x,
            ey: rot.y,
            ez: rot.z
        });
    }
};

Network.prototype.setLocaldsdr = function (dsdr) {
    if (this.initialized) {
        var player = this.players[dsdr.id];
        if (player !== undefined) {
            player.entity.rigidbody.teleport(dsdr.x, dsdr.y, dsdr.z);
            player.entity.children[2].setLocalEulerAngles(dsdr.ex, dsdr.ey, dsdr.ez);
        }
    }
};

Network.prototype.startGame = function () {
    this.gameStarted = true;
    this.initialCamera.enabled = false;
    if (this.host) {
        this.player.enabled = true;
        this.ball.enabled = false;
        this.ball2.enabled = true;
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
        this.ball2.setPosition(ball.pos.x, ball.pos.y, ball.pos.z);
        this.ball2.setLocalEulerAngles(ball.rot.x, ball.rot.y, ball.rot.z);
        //this.ball2.setPosition (ball.pos.x, ball.pos.y, ball.pos.z);
        //var q = new pc.Quat(ball.rot.x, ball.rot.y, ball.rot.z, ball.rot.w);
        //this.ball2.setRotation(q);
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