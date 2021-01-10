var Menu = pc.createScript('menu');

Menu.attributes.add('css', { type: 'asset', assetType: 'css', title: 'CSS Asset' });
Menu.attributes.add('html', { type: 'asset', assetType: 'html', title: 'HTML Asset' });

Menu.prototype.initialize = function() {
    // Menu screen
    this.menuScreen = this.app.root.findByName('Menu Screen');
    this.playBtn = this.app.root.findByName('PlayBtn');
    this.practiceBtn = this.app.root.findByName('PracticeBtn');
    
    this.playBtn.element.on('click', this.startMultiMenu, this);
    this.practiceBtn.element.on('click', this.startSingleGame, this);
    
    // Playing screen
    this.playingScreen = this.app.root.findByName('Playing Screen');
    this.mulitplayerElements = this.app.root.findByName('Multiplayer Elements');
    this.gameCode = this.app.root.findByName('GameCode');
    
    this.app.on('updateCode', function(code) {
        this.gameCode.element.text = ('Room Code: ' + code);
    }, this);
    
    // Scene variables
    this.initialCamera = this.app.root.findByName('InitialCamera');
    this.player = this.app.root.findByName('Player');
};

Menu.prototype.startSingleGame = function() {
    this.menuScreen.enabled = false;
    this.playingScreen.enabled = true;
    
    this.initialCamera.enabled = false;
    this.player.enabled = true;
    
    this.app.fire('startSingle');   // To tell spawnBullets to use local shoot
};

Menu.prototype.startMultiMenu = function() {
    this.playBtn.enabled = false;
    this.practiceBtn.enabled = false;
    
    // Create style element
    var style = document.createElement('style');
    
    // append to head
    document.head.appendChild(style);
    style.innerHTML = this.css.resource || '';
    
    // Add HTML
    this.div = document.createElement('div');
    this.div.classList.add('container');
    this.div.id = 'multiplayer-menu';
    this.div.innerHTML = this.html.resource || '';
    
    document.body.appendChild(this.div);
    
    var self = this;
    
    // Add event listeners
    var form = this.div.querySelector('.form-wrapper');
    var username = document.getElementById('username');
    var hostBtn = document.getElementById('host-btn');
    var gameCode = document.getElementById('game-code');
    var joinBtn = document.getElementById('join-btn');
    
    if (hostBtn) {
        hostBtn.addEventListener('click', function() {
            if (self.usernameValid(username, form)) {
                self.startMultiPlayingScreen();
                self.app.fire('createRoom', username.value);
            }
        });
    }
    
    var passedHere = false;
    if (joinBtn) {
        joinBtn.addEventListener('click', function() {
            if (self.usernameValid(username, form)) {
                self.app.fire('isRoomValid', gameCode.value);
                self.app.on('foundIsRoomValid', function(message) {
                    if (message === '') {
                        if (!passedHere) {
                            passedHere = true;  // For some reason, it will call these twice, so use passedHere to limit once
                            self.startMultiPlayingScreen();
                            self.app.fire('joinRoom', gameCode.value, username.value);
                        }
                    } else {
                        self.generateWarning(form, message);
                    }
                });
            }
        });
    }
};

/* Helper method for host and join btn */
Menu.prototype.usernameValid = function(username, form) {
    if (username.value === '') {
        this.generateWarning(form, 'Invalid Display name');
        return false;
    } else {
        return true;
    }
};

Menu.prototype.generateWarning = function(form, message) {
    var warning = document.getElementById('warning');
    if (warning === null) {
        warning = document.createElement('div');
        warning.id = 'warning';
        warning.textContent = 'Warning: ' + message;
        form.appendChild(warning);
    } else {
        warning.textContent = 'Warning: ' + message;
    }
};

/* Helper method for host and join btn */
Menu.prototype.startMultiPlayingScreen = function() {
    this.div.remove();
    this.menuScreen.enabled = false;
    this.playingScreen.enabled = true;
    this.mulitplayerElements.enabled = true;
};