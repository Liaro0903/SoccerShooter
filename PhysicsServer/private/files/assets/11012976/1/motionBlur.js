//--------------- POST EFFECT DEFINITION ------------------------//
pc.extend(pc, function () {
    function createRenderTarget(gd) {
        // Create a 512x512x24-bit render target with a depth buffer
        var colorBuffer = new pc.Texture(gd, {
            width: gd.width,
            height: gd.height,
            format: pc.PIXELFORMAT_R8_G8_B8,
            autoMipmap: false
        });
        colorBuffer.minFilter = pc.FILTER_LINEAR;
        colorBuffer.magFilter = pc.FILTER_LINEAR;
        colorBuffer.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
        colorBuffer.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
        var renderTarget = new pc.RenderTarget(gd, colorBuffer, {
            depth: true
        });
        
        return renderTarget;
    }

    /**
     * @name pc.MotionBlur
     * @class Implements the motion blur effect.
     * @constructor Creates new instance of the post effect.
     * @extends pc.PostEffect
     * @param {pc.Device} graphicsDevice The graphics device of the application
     * @property {Number} amount Controls the intensity of the effect. Ranges from 0 to 1.
     */
    var MotionBlur = function (graphicsDevice) {
        var vertexShader = [
            "attribute vec2 aPosition;",
            "",
            "varying vec2 vUv0;",
            "",
            "void main(void)",
            "{",
            "    gl_Position = vec4(aPosition, 0.0, 1.0);",
            "    vUv0 = (aPosition.xy + 1.0) * 0.5;",
            "}"
        ].join("\n");
        
        this.blurShader = new pc.Shader(graphicsDevice, {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION
            },
            vshader: vertexShader,
            fshader: [
                "precision " + graphicsDevice.precision + " float;",
                "",
                "uniform float uAmount;",
                "uniform sampler2D uCurrColorBuffer;",
                "uniform sampler2D uPrevColorBuffer;",
                "",
                "varying vec2 vUv0;",
                "",
                "void main() {",
                "    vec4 color1 = texture2D(uCurrColorBuffer, vUv0);",
                "    vec4 color2 = texture2D(uPrevColorBuffer, vUv0);",
                "",
                "    gl_FragColor = mix(color1, color2, uAmount);",
                "}"
            ].join("\n")
        });

        this.copyShader = new pc.Shader(graphicsDevice, {
            attributes: {
                aPosition: pc.SEMANTIC_POSITION
            },
            vshader: vertexShader,
            fshader: [
                "precision " + graphicsDevice.precision + " float;",
                "",
                "uniform sampler2D uColorBuffer;",
                "",
                "varying vec2 vUv0;",
                "",
                "void main() {",
                "    vec4 color = texture2D(uColorBuffer, vUv0);",
                "",
                "    gl_FragColor = color;",
                "}"
            ].join("\n")
        });

        this.tempTarget = createRenderTarget(graphicsDevice);

        // Uniforms
        this.amount = 1;
    };

    MotionBlur = pc.inherits(MotionBlur, pc.PostEffect);

    MotionBlur.prototype = pc.extend(MotionBlur.prototype, {
        render: function (inputTarget, outputTarget, rect) {
            var device = this.device;
            var scope = device.scope;

            if (!this.prevTarget) {
                this.prevTarget = createRenderTarget(device);
                scope.resolve("uColorBuffer").setValue(inputTarget.colorBuffer);
                pc.drawFullscreenQuad(device, this.tempTarget, this.vertexBuffer, this.copyShader, rect);
            } else {
                scope.resolve("uAmount").setValue(this.amount);
                scope.resolve("uCurrColorBuffer").setValue(inputTarget.colorBuffer);
                scope.resolve("uPrevColorBuffer").setValue(this.prevTarget.colorBuffer);
                pc.drawFullscreenQuad(device, this.tempTarget, this.vertexBuffer, this.blurShader, rect);
            }

            scope.resolve("uColorBuffer").setValue(this.tempTarget.colorBuffer);
            pc.drawFullscreenQuad(device, this.prevTarget, this.vertexBuffer, this.copyShader, rect);

            scope.resolve("uColorBuffer").setValue(this.tempTarget.colorBuffer);
            pc.drawFullscreenQuad(device, outputTarget, this.vertexBuffer, this.copyShader, rect);
        }
    });

    return {
        MotionBlur: MotionBlur
    };
}());


var MotionBlur = pc.createScript('motionBlur');

MotionBlur.attributes.add('amount', { type: 'number', default: 1, min: 0, max: 1, step: 0.01 });

MotionBlur.prototype.initialize = function () {
    this.effect = new pc.MotionBlur(this.app.graphicsDevice);
    this.effect.amount = this.amount;
    this.on('set', this.onAttributeChanged, this);
    
    this.on('attr', function(name, value, prev) {
        this.effect[name] = value;
    });    

    this.on("enable", function () {
        this.entity.camera.postEffects.addEffect(this.effect);
    });

    this.on("disable", function () {
        this.entity.camera.postEffects.removeEffect(this.effect);
    });
    
    this.entity.camera.renderTarget = this.effect.prevTarget;
    this.entity.camera.postEffects.addEffect(this.effect);
};
