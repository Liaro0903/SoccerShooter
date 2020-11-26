//C_FP stands for Cannon First Person
"use strict";
/* jshint strict:global */
/* globals pc, console */
var CFp = pc.createScript('cFp');

CFp.attributes.add('power', {
    type: 'number'
});

CFp.attributes.add('lookSpeed', {
    type: 'number'
});

CFp.attributes.add('jumpSpeed', {
    type: 'number'
});

CFp.attributes.add('walkingSurface', {
    type: 'string',
    default: 'WalkingSurface',
    description: 'Name of the surfaces the player can walk on.'
});

// initialize code called once per entity
CFp.prototype.initialize = function() {
    this.force = new pc.Vec3();
    this.camera = this.app.root.findByName("Camera");
    this.eulers = new pc.Vec3();

    this.isTouching = false;

    var app = this.app;

    // Listen for mouse move events
    app.mouse.on("mousemove", this._onMouseMove, this);

    // when the mouse is clicked hide the cursor
    app.mouse.on("mousedown", function () {
        app.mouse.enablePointerLock();
    }, this);
};

// update code called every frame
CFp.prototype.update = function(dt) {
    //var force = this.force;
    var app = this.app;

    // Get camera directions to determine movement directions
    var forward = this.camera.forward;
    var right = this.camera.right;

    // movement
    var x = 0;
    var z = 0;

    //Set if it is in air / touching the BoxPlane
    //this.entity.collision.on('collisionstart', this.onCollisionStart, this);

    //this.entity.collision.on('collisionend', this.onCollisionEnd, this);

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
    /*
    if (app.keyboard.isPressed(pc.KEY_SPACE) && this.isTouching === true) {
        force.set(x, 10, z).normalize().scale(this.jumpSpeed);
        this.entity.rigidbody.applyImpulse(force);
    }
    */
    
    //console.log(this.entity.getPosition().x + " " + this.entity.getPosition().y + " " + this.entity.getPosition().z);
    
    // use direction from keypresses to apply a force to the character
    this.isTouching = true; //ONLY FOR TESTING PURPOSE. DELETE THIS LATER!
    if (x !== 0 && z !== 0 && this.isTouching === true) {
        //force.set(x, 0, z).normalize().scale(this.power);
        //this.entity.rigidbody.applyForce(force);
        app.fire("updatePosition", x, z, this.power);
    } else {
        //var y = this.entity.rigidbody.linearVelocity.y;
        //this.entity.rigidbody.linearVelocity.set(0, y, 0);
    }
    
    // update camera angle from mouse events
    this.camera.setLocalEulerAngles(this.eulers.y, this.eulers.x, 0);
    //console.log(this.eulers.x + " " + this.eulers.y + " " + this.eulers.z);
    //console.log(this.camera.forward.x);
};

CFp.prototype._onMouseMove = function (e) {
    // If pointer is disabled
    // If the left mouse button is down update the camera from mouse movement
    if (pc.Mouse.isPointerLocked() || e.buttons[0]) {
        this.eulers.x -= this.lookSpeed * e.dx;
        this.eulers.y -= this.lookSpeed * e.dy;
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// CFp.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/