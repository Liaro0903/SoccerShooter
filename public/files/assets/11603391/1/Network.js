/* jshint esversion: 6 */

var Network = pc.createScript('network');

Network.prototype.initialize = function() {
    // this.socket = io.connect('https://socshoot0-3.glitch.me');
    this.socket = io.connect('http://localhost:3000');
    var socket = this.socket;
    var self = this;
    var app = this.app;
    this.initialized = false;  // True when receive player data
    
    // Player Variables
    this.player = this.app.root.findByName('Player');
    this.other = this.app.root.findByName('Other');
    
    // Ball Variables
    this.ball = this.app.root.findByName('Ball');
    this.ball2 = this.app.root.findByName('Ball2');
    
    this.initialCamera = this.app.root.findByName('InitialCamera');
    
    /* Game states */
    app.on('createRoom', function(username) {
       socket.emit('createRoom', username);
    });
    
    app.on('isRoomValid', function(code) {
        socket.emit('isRoomValid', code);
    });
    
    socket.on('foundIsRoomValid', function(result) {
        app.fire('foundIsRoomValid', result);
    });
    
    app.on('joinRoom', function(code, username) {
        socket.emit('joinRoom', code, username);
    });
    /*
    socket.on ('nextGame', function(time, players) {
        self.newGame(time, players);
    });
    */
    
    /* Sync players */
    
    // After initialized, get all players data
    socket.on('playerData', function(data) {
        self.startMultiGame();
        self.initializePlayers(data);
    });
    
    // When new player joined, add the new player
    socket.on('setLocalPlayers', function(newPlayer) {
        self.addPlayer(newPlayer);
    });
    
    // When other players move, update their stuff
    socket.on('setLocaldsdr', function(dsdr) {
        self.setLocaldsdr(dsdr);
    });
    
    // When other player left
    socket.on('goodbyePlayer', function(id) {
        self.deletePlayer(id);
    });
    
    /* Sync entities (ball and bullets) */
    socket.on('setdsdr', function(dsdr) {
        self.moveBall(dsdr.ball);
        app.fire('setBullets', dsdr.bullets);
    });
    
    app.on('bulletFired', function(spawnPointData) {
        socket.emit('bulletFired', spawnPointData);
    });
    
    /* Sync Scores */
    socket.on('winner', function(winner) {
        self.displayScore(winner);
    });
    
    /* Sync world to server (used only in development) */
    socket.on('getWorld', function() {
        socket.emit('setWorld', self.getEntities());
    });
};

Network.prototype.update = function(dt) {
    if (this.initialized) {
        this.setRemotedsdr();
    }
};

/* Game states */
Network.prototype.startMultiGame = function() {
    this.initialCamera.enabled = false;
    this.player.enabled = true;
    this.ball.enabled = false;
    this.ball2.enabled = true;
};

Network.prototype.newGame = function(time, players) {
    // Old, will be updated
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

/* Sync players */
Network.prototype.initializePlayers = function(data) {
    this.players = data.players;
    this.id = data.id;
    this.room = data.room;
    
    // UI updates
    var myTeam = this.players[this.id].team;
    this.app.fire('updateConnected', Object.keys(this.players).length);
    this.app.fire('updateCode', this.room);
    this.app.fire('updateTeam', myTeam);
    
    // Create player entities
    this.players[this.id].entity = this.player;
    this.player.tags.add(myTeam);
    this.player.rigidbody.teleport(this.players[this.id].position.x, this.players[this.id].position.y, this.players[this.id].position.z);
    if (myTeam === 'Hero') {
        this.app.fire('initialEulerHero'); // this.player.setEulerAngles(0, 270, 0);
    } else {
        this.app.fire('initialEnemy'); // this.player.setEulerAngles(0, 90, 0);
    }
    
    // For every player already connected, create a new capsule entity.
    for (var id in this.players) {
        if (id !== data.id) {
            this.players[id].entity = this.createPlayerEntity(this.players[id]);
        }
    }

    // Mark that the client has received data from the server.
    this.initialized = true;
};

Network.prototype.createPlayerEntity = function(player) {
    var newPlayer = this.other.clone();  // Create a new player entity.
    newPlayer.tags.add(player.team);  // Add tags of the entity
    this.other.getParent().addChild(newPlayer);  // Add the entity to the entity hierarchy.
    newPlayer.setPosition(player.position.x, player.position.y, player.position.z);  // Teleport the new entity to the position of the connected player.
    newPlayer.children[1].children[0].element.text = player.title;  // Update title text
    if (player.team === 'Enemy') newPlayer.children[1].children[0].element.color = new pc.Color(1, 0, 0);  // Update color of text
    newPlayer.children[2].setLocalEulerAngles(player.rotation.x, player.rotation.y, player.rotation.z);
    newPlayer.enabled = true;
    
    return newPlayer;
};

Network.prototype.addPlayer = function(newPlayer) {
    this.players[newPlayer.id] = newPlayer;
    this.players[newPlayer.id].entity = this.createPlayerEntity(this.players[newPlayer.id]);
    this.app.fire('updateConnected', Object.keys(this.players).length);
};

Network.prototype.setLocaldsdr = function(dsdr) {
    if (this.initialized) {
        var player = this.players[dsdr.id];
        if (player !== undefined) {
            player.entity.setPosition(dsdr.x, dsdr.y, dsdr.z);
            player.entity.children[2].setLocalEulerAngles(dsdr.ex, dsdr.ey, dsdr.ez);
        }
    }
};

Network.prototype.deletePlayer = function(id) {
    if (this.initialized) {
        this.players[id].entity.enabled = false;
        delete this.players[id];
        this.app.fire('updateConnected', Object.keys(this.players).length);   
    }
};

Network.prototype.setRemotedsdr = function() {
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

/* Sync entities (ball and bullets) */
Network.prototype.moveBall = function(ball) {
    if (this.initialized) {
        this.ball2.setPosition(ball.pos.x, ball.pos.y, ball.pos.z);
        var q = new pc.Quat(ball.rot.x, ball.rot.y, ball.rot.z, ball.rot.w);
        this.ball2.setRotation(q);
    }
};

/* Sync scores: Display victory or defeat */
Network.prototype.displayScore = function(team) {
    var scoreText = this.app.root.findByName('ScoreText');
    if (this.player.tags.has(team)) {
        scoreText.element.text = 'Victory!';
    } else {
        scoreText.element.text = 'Defeated';
    }
};

/* Sync world to server (used only in development) */
Network.prototype.getEntities = function() {
    var array = [];
    this.entity.forEach(function(child) {
       if (child.rigidbody && child.name !== 'Ball' && child.name !== 'Player') {
           array.push({
               name: child.name,
               position: child.getPosition(),
               size: child.collision.halfExtents,
               rotation: child.getRotation(),
           });
       } 
    });
    return array;
};