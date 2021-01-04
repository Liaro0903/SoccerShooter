var Title = pc.createScript('title');

// initialize code called once per entity
Title.prototype.initialize = function() {
    this.threedscreen = this.entity;
    this.player = this.app.root.findByName('Player');
    var prevp = new pc.Vec3(0, 0, 0);
    var prevs = new pc.Vec3(0, 0, 0);
    this.prevp = prevp;
    this.prevs = prevs;
};

// update code called every frame
Title.prototype.update = function(dt) {
    var p = this.player.getPosition();
    var s = this.threedscreen.getPosition();
    if (!p.equals(this.prevp) || !s.equals(this.prevs)) {
        var psvector = new pc.Vec3();
        psvector = psvector.sub2(p, s);
        var costheta = psvector.z / Math.sqrt( Math.pow(psvector.z, 2) + Math.pow(psvector.x, 2) );
        var theta = Math.acos(costheta)*180/Math.PI;
        this.threedscreen.setEulerAngles(0, psvector.x / Math.abs(psvector.x) * theta, 0);
    }
};

// swap method called for script hot-reloading
// inherit your script state here
// Title.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/