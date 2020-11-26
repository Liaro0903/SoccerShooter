"use strict";
/* jshint strict:global */
/* globals pc, console, setTimeout */


var SpawnBullets = pc.createScript('spawnBullets');
SpawnBullets.attributes.add('spawnPoint', {type:'entity'});
SpawnBullets.attributes.add('gun', {type:'entity'});
SpawnBullets.attributes.add('bulletPrefab', {type:'entity'});
SpawnBullets.attributes.add('firePause', {type: 'number', default: 10});
SpawnBullets.attributes.add('bulletImpulse', {type: 'number', default: 2});

// initialize code called once per entity
SpawnBullets.prototype.initialize = function() {
    
    // For autocomplete
    /** @type {pc.Entity.prototype} */
    this.spawnPoint = this.spawnPoint;
    /** @type {pc.Entity.prototype} */
    this.gun = this.gun;
    /** @type {pc.Entity.prototype} */
    this.bulletPrefab = this.bulletPrefab;
    /** @type {number} */
    this.bulletImpulse = this.bulletImpulse;
    
    this.bulletPrefab.enabled = false;
    
    //this.lastFireTime = Date.now();
    this.mouseclicked = false;
    
    var self = this;
    
    this.app.on ('newBullet', function (x, y, z, w) {
        self.shoot2(x, y, z, w);
    });
};

// update code called every frame
SpawnBullets.prototype.update = function(dt) {
    if (this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT) && this.mouseclicked === false) {
        this.shoot();
    }
    if (!this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT)) {
        this.mouseclicked = false;
    }
};

SpawnBullets.prototype.shoot = function() {
    /** @type {pc.Entity.prototype} */
    var newBullet = this.bulletPrefab.clone();
    //Determine which team this bullet is from
    var team = "";
    if(this.entity.tags.has("Hero")) {
        newBullet.tags.add("Hero");
        team = "Hero";
    } else {
        newBullet.tags.add("Enemy");
        team = "Enemy";
    }
    this.app.root.addChild(newBullet);
    newBullet.enabled = true;
    newBullet.rigidbody.teleport(this.spawnPoint.getPosition(), this.spawnPoint.getRotation());
    newBullet.rigidbody.applyImpulse(this.gun.forward.scale(this.bulletImpulse));
    this.app.fire("bulletFired", this.spawnPoint.getPosition(), this.spawnPoint.getRotation(), this.gun.forward.scale(this.bulletImpulse), team);
    this.mouseclicked = true;
    //Destroy Bullet scripts
    setTimeout(function() {
        newBullet.destroy();
    }, 5000);
};

SpawnBullets.prototype.shoot2 = function(x, y, z, w) {
    /** @type {pc.Entity.prototype} */
    var newBullet = this.bulletPrefab.clone();
    //Determine which team this bullet is from
    newBullet.tags.add(w);
    this.app.root.addChild(newBullet);
    newBullet.enabled = true;
    var p = new pc.Vec3(x["data"][0], x["data"][1], x["data"][2]);
    var r = new pc.Quat(y.x, y.y, y.z, y.w);
    newBullet.rigidbody.teleport(p, r);
    //console.log(z["data"][0], z["data"][1], z["data"][2]);
    //var i = new pc.Vec3(z["data"][0], z["data"][1], z["data"][2]);
    newBullet.rigidbody.applyImpulse(z["data"][0], z["data"][1], z["data"][2]);
    //Destroy Bullet scripts
    setTimeout(function() {
        newBullet.destroy();
    }, 5000);
};

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/