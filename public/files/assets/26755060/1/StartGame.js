var StartGame = pc.createScript('startGame');

StartGame.prototype.initialize = function() {
    this.entity.element.on('click', function (event) {
        var title = this.app.root.findByName('InputText').element.text;
        this.app.fire('startGame', title);
        
        this.app.root.findByName('ConnectedText').enabled = true;
        this.app.root.findByName('TeamText').enabled = true;
        this.app.root.findByName('TutorialText').enabled = true;
        
        this.app.root.findByName('InputImg').enabled = false;
        this.app.root.findByName('WelcomeText').enabled = false;
        this.entity.enabled = false;
    }, this);
};