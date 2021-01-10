/* jshint esversion: 6 */

var Network = pc.createScript('network');

Network.prototype.initialize = function() {
    // this.socket = io.connect('https://socshoot0-3.glitch.me');
    //this.socket = io.connect('http://localhost:3000');
    this.socket - io.connect();
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
    
    socket.on('foundIsRoomValid', function(message) {
        app.fire('foundIsRoomValid', message);
    });
    
    app.on('joinRoom', function(code, username) {
        socket.emit('joinRoom', code, username);
    });
    
    // Local practice
    app.on('nextGame', function(time) {
        self.newGame(time);
    });
    
    socket.on ('nextGame', function(time) {
        self.newGame(time);
    });
    
    /* Sync players */
    
    // After initialized, get all players data
    socket.on('initialData', function(initialData) {
        self.startMultiGame();
        self.initialData(initialData);
    });
    
    socket.on('initialPlayersRepeat', function(initialPlayersRepeat) {
        self.initialPlayersRepeat(initialPlayersRepeat);
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

Network.prototype.newGame = function(time) {
    var ngt = this.app.root.findByName('NextGameText');
    ngt.enabled = true;
    if (time === 0) {
        ngt.enabled = false;
        var scoreText = this.app.root.findByName('ScoreText');
        scoreText.element.text = '';
    } else {
        ngt.element.text = 'Next Game in ' + time;
    }
};

/*
interface Players {
    id: string;
    title: string;
    team: string;
    position: Vector;
    rotation: Vector;
    entity: pc.Entity;
}
*/

/* Sync players */

/*
 * Method only calls on when player joined
 * Props: data: {
 *     id: string;
 *     room: string;
 *     players: players;
 * }
 */
Network.prototype.initialData = function(initialData) {
    this.id = initialData.myId;
    this.room = initialData.myRoom;
    this.players = initialData.players;
    
    // UI updates
    this.app.fire('updateCode', this.room);
    this.app.fire('updateConnected', Object.keys(this.players).length);
    
    // Create player entities
    this.players[this.id].entity = this.player;
    
    this.initialPlayersRepeat(this.players);

    // Mark that the client has received data from the server.
    this.initialized = true;
};

// Method calls on future new game too
// Props: Depending on when calling this. It can be initialPlayers or initialPlayersRepeat
Network.prototype.initialPlayersRepeat = function(initialPlayers) {
    // Update my team
    var myTeam = initialPlayers[this.id].team;
    this.app.fire('updateTeam', myTeam);  // UI update
    this.player.tags.clear();
    this.player.tags.add(myTeam);
    
    // Update my dsdr
    this.player.rigidbody.teleport(
        initialPlayers[this.id].position.x,
        initialPlayers[this.id].position.y,
        initialPlayers[this.id].position.z
    );
    if (myTeam === 'Hero') {
        this.app.fire('initialEulerHero');
    } else {
        this.app.fire('initialEnemy');
    }
    
    // Update other players
    for (var id in initialPlayers) {
        if (id !== this.id) {
            if (!this.players[id].entity) {  // Separate this so new game event can utilize this method as well.
                // For every player already connected, create a new capsule entity.
                this.players[id].entity = this.initialOther(this.players[id]);
            }
            this.initialOtherRepeat(this.players[id].entity, initialPlayers[id]);
        }
    }
};

Network.prototype.initialOther = function(player) {
    var newPlayer = this.other.clone();  // Create a new player entity.
    this.other.getParent().addChild(newPlayer);  // Add the entity to the entity hierarchy.
    newPlayer.enabled = true;
    
    // Update title text
    newPlayer.children[1].children[0].element.text = player.title;
    
    return newPlayer;
};

// Props can be initialPlayer or initialPlayerRepeat
Network.prototype.initialOtherRepeat = function(entity, initialPlayer) {
    // Update team
    entity.tags.clear();
    entity.tags.add(initialPlayer.team);  // Add tags of the entity
    if (initialPlayer.team === 'Enemy')
        entity.children[1].children[0].element.color = new pc.Color(1, 0, 0);  // Update color of text
    
    // Update dsdr
    entity.setPosition(
        initialPlayer.position.x,
        initialPlayer.position.y,
        initialPlayer.position.z
    );
    entity.children[2].setLocalEulerAngles(
        initialPlayer.rotation.x,
        initialPlayer.rotation.y,
        initialPlayer.rotation.z
    );
};

Network.prototype.addPlayer = function(newPlayer) {
    this.players[newPlayer.id] = newPlayer;
    this.players[newPlayer.id].entity = this.initialOther(this.players[newPlayer.id]);
    this.initialOtherRepeat(this.players[newPlayer.id].entity, newPlayer);
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