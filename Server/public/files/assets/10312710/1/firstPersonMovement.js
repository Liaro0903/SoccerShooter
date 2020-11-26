'use strict';
/* jshint strict:global */
/* globals pc, console */

var FirstPersonMovement = pc.createScript('firstPersonMovement');

FirstPersonMovement.attributes.add('power', {
    type: 'number'
});

FirstPersonMovement.attributes.add('lookSpeed', {
    type: 'number'
});

FirstPersonMovement.attributes.add('jumpSpeed', {
    type: 'number'
});

FirstPersonMovement.attributes.add('walkingSurface', {
    type: 'string',
    default: 'WalkingSurface',
    description: 'Name of the surfaces the player can walk on.'
});

FirstPersonMovement.prototype.initialize = function() {
    this.force = new pc.Vec3();
    this.camera = this.app.root.findByName('FirstPersonCamera');
    this.eulers = new pc.Vec3();

    this.isTouching = false;

    var app = this.app;
    var self = this;

    // Listen for mouse move events
    app.mouse.on('mousemove', this._onMouseMove, this);

    // when the mouse is clicked hide the cursor
    app.mouse.on('mousedown', function () {
        app.mouse.enablePointerLock();
    }, this);
    
    // Change initial rotation according to the team
    app.on('initialEulerHero', function () {
        self.eulers.set(0, 180, 0);
    });
    app.on('initialEulerEnemy', function() {
        self.eulers.set(0, 0, 0);
    });
};

FirstPersonMovement.prototype.update = function(dt) {
    var force = this.force;
    var app = this.app;

    // Get camera directions to determine movement directions
    var forward = this.camera.forward;
    var right = this.camera.right;

    // movement
    var x = 0;
    var z = 0;

    //Set if it is in air / touching the BoxPlane
    this.entity.collision.on('collisionstart', this.onCollisionStart, this);

    this.entity.collision.on('collisionend', this.onCollisionEnd, this);

    // Use W-A-S-D keys to move player
    // Check for key presses
    if (app.keyboard.isPressed(pc.KEY_A) || app.keyboard.isPressed(pc.KEY_Q)) {
        x -= right.x;
        z -= right.z;
    }

    if (app.keyboard.isPressed(pc.KEY_D)) {
        x += right.x;
        z += right.z;
    }

    if (app.keyboard.isPressed(pc.KEY_W)) {
        x += forward.x;
        z += forward.z;
    }

    if (app.keyboard.isPressed(pc.KEY_S)) {
        x -= forward.x;
        z -= forward.z;
    }
    if (app.keyboard.isPressed(pc.KEY_SPACE) && this.isTouching === true) {
        force.set(x, 10, z).normalize().scale(this.jumpSpeed);
        this.entity.rigidbody.applyImpulse(force);
    }
    
    /*
    if (app.keyboard.isPressed(pc.KEY_R)) {
        this.entity.rigidbody.teleport(25, 4, 0);
        this.entity.rigidbody.linearVelocity = new pc.Vec3();
        this.eulers.set(0,0,0);
        var ball = this.app.root.findByName('Ball');
        ball.rigidbody.teleport(25,4,-3);
        ball.rigidbody.linearVelocity = new pc.Vec3();
        ball.rigidbody.angularVelocity = new pc.Vec3();
    }
    */
    
    //console.log(this.entity.getPosition().x + ' ' + this.entity.getPosition().y + ' ' + this.entity.getPosition().z);
    
    // use direction from keypresses to apply a force to the character
    if (x !== 0 && z !== 0 && this.isTouching === true) {
        force.set(x, 0, z).normalize().scale(this.power);
        this.entity.rigidbody.applyForce(force);
    } else {
        var y = this.entity.rigidbody.linearVelocity.y;
        this.entity.rigidbody.linearVelocity.set(0, y, 0);
    }

    // update camera angle from mouse events
    this.camera.setLocalEulerAngles(this.eulers.x, this.eulers.y, 0);
};

FirstPersonMovement.prototype.onCollisionStart = function(result) {
    if(result.other.name === this.walkingSurface) {   //Is not in air
        this.isTouching = true;
        this.entity.rigidbody.linearDamping = 0.99;
    }
};

FirstPersonMovement.prototype.onCollisionEnd = function(result) {
    if(result.name === this.walkingSurface) { //Is in air
        this.isTouching = false;
        this.entity.rigidbody.linearDamping = 0;
    }
};

FirstPersonMovement.prototype._onMouseMove = function (e) {
    // If pointer is disabled
    // If the left mouse button is down update the camera from mouse movement
    if (pc.Mouse.isPointerLocked() || e.buttons[0]) {
        this.eulers.y -= this.lookSpeed * e.dx;
        this.eulers.x -= this.lookSpeed * e.dy;
    }
};