'use strict';
/* jshint strict:global */
/* globals pc, console, setTimeout */

var SpawnBullets = pc.createScript('spawnBullets');
SpawnBullets.attributes.add('spawnPoint', { type: 'entity' });
SpawnBullets.attributes.add('gun', { type: 'entity' });
SpawnBullets.attributes.add('bulletPrefab', { type: 'entity' });
SpawnBullets.attributes.add('firePause', { type: 'number', default: 10 });
SpawnBullets.attributes.add('bulletImpulse', { type: 'number', default: 2 });

// initialize code called once per entity
SpawnBullets.prototype.initialize = function () {

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
    this.bullet2 = this.app.root.findByName('Bullet2');

    // Only used by client
    this.bulletFolder = this.app.root.findByName('BulletFolder');
    this.bullets = {};

    // Only used by server
    this.spawnPoints = [];

    this.app.on('setBullets', function (bullets) {
        self.setBullets(bullets);
    })
};

// update code called every frame
SpawnBullets.prototype.update = function (dt) {
    if (this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT) && this.mouseclicked === false) {
        /* Client code
        var team = this.entity.tags.list()[0];
        var spawnPoint = this.spawnPoint.getPosition();
        var gunVec = this.gun.forward.scale(this.bulletImpulse);
        this.app.fire('bulletFired', {
            team, spawnPoint, gunVec
        });
        this.mouseclicked = true;
        */
        this.shoot();
    }
    if (!this.app.mouse.isPressed(pc.MOUSEBUTTON_LEFT)) {
        this.mouseclicked = false;
    }
    // Server code
    if (this.spawnPoints.length !== 0) {
        var spawnPoint = this.spawnPoints.shift();
        this.shootFromClient(spawnPoint);
    }
};

// Use for single player or debugging
SpawnBullets.prototype.shoot = function () {
    /** @type {pc.Entity.prototype} */
    var newBullet = this.bulletPrefab.clone();
    //Determine which team this bullet is from
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
    setTimeout(function () {
        newBullet.destroy();
    }, 5000);
};

// Client code
SpawnBullets.prototype.setBullets = function (bullets) {
    var localBullets = this.bullets;
    var self = this;
    bullets.forEach(function (bullet) {
        if (localBullets[bullet.id] === undefined) {
            localBullets[bullet.id] = self.createBullet2();
            var newBulletId = bullet.id
            // Destroy Bullet scripts
            setTimeout(function () {
                localBullets[newBulletId].destroy();
                delete localBullets[newBulletId];
            }, 5000);
        }
        localBullets[bullet.id].setPosition(bullet.pos.x, bullet.pos.y, bullet.pos.z);
    });
}

// Client code
SpawnBullets.prototype.createBullet2 = function () {
    var newBullet = this.bullet2.clone();
    this.bulletFolder.addChild(newBullet);
    newBullet.enabled = true;
    return newBullet;
}

// Server code
SpawnBullets.prototype.shootFromClient = function (q) {
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
    //Destroy Bullet scripts
    setTimeout(function () {
        newBullet.destroy();
    }, 5000);
}