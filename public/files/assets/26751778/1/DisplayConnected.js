var DisplayConnected = pc.createScript('displayConnected');

DisplayConnected.prototype.initialize = function() {
    var self = this;
    this.app.on('updateConnected', function(numConnected) {
        self.entity.element.text = ('Players Connected: ' + numConnected);
    });
};