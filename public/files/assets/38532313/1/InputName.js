var InputName = pc.createScript('inputName');

// initialize code called once per entity
InputName.prototype.initialize = function() {
    this.canType = false;
    this.firstStroke = true;
    var self = this;
    // var parent = this.entity.parent;
    this.text = this.entity.children[0];
    
    this.entity.element.on('click', function() {
        if (this.canType) {
            this.entity.element.opacity = 0.6;
        } else {
            this.entity.element.opacity = 1;
        }
        this.canType = !this.canType;
    }, this);
    
    this.app.keyboard.on(pc.EVENT_KEYDOWN, this.onKeyDown, this);
};

InputName.prototype.onKeyDown = function(event) {
    if (this.canType) {
        if (this.firstStroke) {
            this.firstStroke = false;
            this.text.element.text = '';
        }
        if (event.key >= 65 && event.key <= 90) {
            var s = this.text.element.text;
            s += String.fromCharCode(event.key);
            this.text.element.text = s;
        }
        if (event.key === 8) {
            this.text.element.text = this.text.element.text.substring(0, this.text.element.text.length - 1);
        }
    }
};