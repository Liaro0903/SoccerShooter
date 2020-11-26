var DisableTutorialText = pc.createScript('disableTutorialText');

DisableTutorialText.prototype.initialize = function() {
    var self = this;
    setTimeout(function() {
        self.entity.destroy();
    }, 10000);
};