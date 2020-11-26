var Score = pc.createScript('score');

var team = "None";

// initialize code called once per entity
Score.prototype.initialize = function() {
    this.entity.collision.on('collisionstart', this.onCollisionStart, this);
    this.entity.collision.on('triggerenter', this.onTriggerEnter, this);
};

// update code called every frame
Score.prototype.update = function(dt) {
    
};

Score.prototype.onCollisionStart= function(result) {
    //if result is with bullets
    if(result.other.name === "Bullet") {
        team = result.other.tags.list()[0];
        //this.app.fire("host");
    }
};

Score.prototype.onTriggerEnter = function(result) {
    //if result is the collisionbox of goal
    if(result.name === "Ball") {
        //When player goals
        if((this.entity.name === "HeroGoalBox" && team === "Enemy") || (this.entity.name === "EnemyGoalBox" && team === "Hero")) {
            this.app.fire("scored", team);
        } else { //When player shoot the ball into it's team's goal.
            if(team === "Hero") {
                this.app.fire("scored", "Enemy");
            } else {
                this.app.fire("scored", "Hero");
            }
        }
    }
};
// swap method called for script hot-reloading
// inherit your script state here
// Score.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/