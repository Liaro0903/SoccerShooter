'use strict';
/* jshint strict:global */
/* globals pc, console, setTimeout */
/* jshint esversion: 6 */

var SpawnBullets = pc.createScript('spawnBullets');
SpawnBullets.attributes.add('spawnPoint', { type: 'entity' });
SpawnBullets.attributes.add('gun', { type: 'entity' });
SpawnBullets.attributes.add('bulletPrefab', { type: 'entity' });
SpawnBullets.attributes.add('firePause', { type: 'number', default: 10 });
SpawnBullets.attributes.add('bulletImpulse', { type: 'number', default: 2 });

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
    
    this.mouseclicked = false;
    
    var self = this;
    this.bulletFolder = this.app.root.findByName('BulletFolder');
    
    // Only used by client
    this.bullet2 = this.app.root.findByName('Bullet2');
    this.bullets = {};
    
    // Only used by server
    this.spawnPoints = {};
    
    this.isSingle = false;
    
    this.app.on('setBullets', function(bullets) {
       self.setBullets(bullets); 
    });
    
    this.app.on('startSingle', function() {
        this.isSingle = true;
    }, this);
};

SpawnBullets.prototype.update = function(dt) {
    if (this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT) && this.mouseclicked === false) {
        if (this.isSingle) {
            this.shoot();
        } else {
            var team = this.entity.tags.list()[0];
            var spawnPoint = this.spawnPoint.getPosition();
            var gunVec = this.gun.forward.scale(this.bulletImpulse);
            this.app.fire('bulletFired', {
                team, spawnPoint, gunVec
            });
        }
        this.mouseclicked = true;
    }
    if (!this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT)) {
        this.mouseclicked = false;
    }
    // Server code
    /*
    if (this.spawnPoints.length !== 0) {
        var serverSpawnPoint = this.spawnPoints.shift();
        this.shootFromClient(serverSpawnPoint);
    }
    */
};

// Use for single player or debugging
SpawnBullets.prototype.shoot = function() {
    /** @type {pc.Entity.prototype} */
    var newBullet = this.bulletPrefab.clone();
    // Determine which team this bullet is from
    var team = '';
    if (this.entity.tags.has('Hero')) {
        newBullet.tags.add('Hero');
        team = 'Hero';
    } else {
        newBullet.tags.add('Enemy');
        team = 'Enemy';
    }
    this.bulletFolder.addChild(newBullet);
    newBullet.enabled = true;
    newBullet.rigidbody.teleport(this.spawnPoint.getPosition(), this.spawnPoint.getRotation());
    newBullet.rigidbody.applyImpulse(this.gun.forward.scale(this.bulletImpulse));
    this.mouseclicked = true;
    // Destroy Bullet scripts
    setTimeout(function() {
        newBullet.destroy();
    }, 5000);
};

// Server code
SpawnBullets.prototype.shootFromClient = function(q) {
    /** @type {pc.Entity.prototype} */
    var newBullet = this.bulletPrefab.clone();
    // Determine which team this bullet is from
    var team = '';
    if (q.team === 'Hero') {
        newBullet.tags.add('Hero');
        team = 'Hero';
    } else {
        newBullet.tags.add('Enemy');
        team = 'Enemy';
    }
    this.bulletFolder.addChild(newBullet);
    newBullet.enabled = true;
    newBullet.rigidbody.teleport(q.spawnPoint.x, q.spawnPoint.y, q.spawnPoint.z);
    newBullet.rigidbody.applyImpulse(q.gunVec.x, q.gunVec.y, q.gunVec.z);
    this.mouseclicked = true;
    // Destroy Bullet scripts
    setTimeout(function () {
        newBullet.destroy();
    }, 5000);
};

// Client code
SpawnBullets.prototype.setBullets = function(bullets) {
    var localBullets = this.bullets;
    var self = this;
    bullets.forEach(function(bullet) {
        if (localBullets[bullet.id] === undefined) {
            localBullets[bullet.id] = self.createBullet2();
            var newBulletId = bullet.id;
            // Destroy Bullet scripts
            setTimeout(function() {
                localBullets[newBulletId].destroy();
                delete localBullets[newBulletId];
            }, 5000);
        }
        localBullets[bullet.id].setPosition(bullet.pos.x, bullet.pos.y, bullet.pos.z);
    });
};

SpawnBullets.prototype.createBullet2 = function() {
    var newBullet = this.bullet2.clone();
    this.bulletFolder.addChild(newBullet);
    newBullet.enabled = true;
    return newBullet;
};

/* Old but may have examples using quat
SpawnBullets.prototype.shoot2 = function(x, y, z, w) {
    /** @type {pc.Entity.prototype} */
    /*
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
*/