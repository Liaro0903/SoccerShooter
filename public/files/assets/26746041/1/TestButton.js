var TestButton = pc.createScript('testButton');

TestButton.prototype.initialize = function() {
    this.entity.element.on('click', this.onClick, this);
};

TestButton.prototype.onClick = function (event) {
    console.log('Button clicked!');
};