var Score = pc.createScript('score');

// This score script is used on both ball and goalbox. The reason this works is because
// ball only uses onCollisionstart and goalbox only uses triggerenter.
Score.prototype.initialize = function() {
    this.team = 'None';      // For ball only, to know which team last player shooted
    this.winner = 'None';   // For puppet server to know who the winner is
    var self = this;
    this.entity.collision.on('collisionstart', this.onCollisionStart, this);
    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
    this.app.on('scored', function(winTeam) {
        self.winner = winTeam;
    });
};

Score.prototype.update = function(dt) {
    
};

// Only works on ball, and this function is designed for ball
Score.prototype.onCollisionStart= function(result) {
    if (result.other.name === 'Bullet') {    // if result is with bullets
        this.team = result.other.tags.list()[0];
    }
};

// Only works on goalbox, and this function is designed for goalbox.
Score.prototype.onTriggerEnter = function(result) {
    if (result.name === 'Ball') {    // if goalbox receives ball
        /* Puppet Server Code, archive
        var team = result.script.score.team;
        // When player goals
        if ((this.entity.name === 'HeroGoalBox' && team === 'Enemy') || (this.entity.name === 'EnemyGoalBox' && team === 'Hero')) {
            this.app.fire('scored', team);
        } else { // When player shoot the ball into it's team's goal.
            if (team === 'Hero') {
                this.app.fire('scored', 'Enemy');
            } else {
                this.app.fire('scored', 'Hero');
            }
        }
        */
    }
};