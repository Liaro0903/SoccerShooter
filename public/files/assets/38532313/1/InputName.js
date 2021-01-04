var InputName = pc.createScript('inputName');

// initialize code called once per entity
InputName.prototype.initialize = function() {
    this.canType = false;
    this.firstStroke = true;
    var self = this;
    var InputImg = this.app.root.findByName('InputImg');
    
    this.entity.element.on('click', function() {
        self.canType = true;
        InputImg.element.opacity = 1;
    });
    
    this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
};

// update code called every frame
InputName.prototype.update = function(dt) {
    
};

InputName.prototype.onKeyDown = function(event) {
    if (this.canType) {
        if (this.firstStroke) {
            this.firstStroke = false;
            this.entity.element.text = '';
        }
        if (event.key >= 65 && event.key <= 90) {
            var s = this.entity.element.text;
            s += String.fromCharCode(event.key);
            this.entity.element.text = s;
        }
        if (event.key === 8) {
            this.entity.element.text = this.entity.element.text.substring(0, this.entity.element.text.length - 1);
        }
    }
};