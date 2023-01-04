var Transient = function() {
    this.canvas         = document.getElementById("transient-canvas");
    this.overlay        = document.getElementById("transient-overlay");
    this.content        = document.getElementById("transient-content");
    this.controls       = document.getElementById("transient-controls");

    this.boundRenderLoop = this.renderLoop.bind(this);
    
    this.savedImages = 0;
    
    try {
        this.setupGL();
    } catch (e) {
        /* GL errors at this stage are to be expected to some degree,
           so display a nice error message and call it quits */
        this.fail(e.message + ". This demo won't run in your browser.");
        return;
    }
    try {
        this.setupUI();
            } catch (e) {
        /* Errors here are a bit more serious and shouldn't normally happen.
           Let's just dump what we have and hope the user can make sense of it */
        this.fail("Ooops! Something unexpected happened. The error message is listed below:<br/>" +
             "<pre>" + e.message + "</pre>");
        return;
    }
    
    /* Ok, all seems well. Time to show the controls */
    this.controls.style.visibility = "visible";
    
    window.requestAnimationFrame(this.boundRenderLoop);
}

Transient.prototype.setupGL = function() {
    try {
        var gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
    } catch (e) {}
    if (!gl)
        throw new Error("Could not initialise WebGL");
    
    var floatExt    = gl.getExtension("OES_texture_float");
    var floatLinExt = gl.getExtension("OES_texture_float_linear");
    var floatBufExt = gl.getExtension("WEBGL_color_buffer_float");
    var multiBufExt = gl.getExtension("WEBGL_draw_buffers");
    
    if (!floatExt || !floatLinExt)
        throw new Error("Your platform does not support float textures");
    if (!multiBufExt)
        throw new Error("Your platform does not support the draw buffers extension");
        
    tgl.init(gl, multiBufExt);
    
    if (!floatBufExt)
        this.colorBufferFloatTest(gl);
    
    this.gl = gl;
}

Transient.prototype.colorBufferFloatTest = function(gl) {
    /* This one is slightly awkward. The WEBGL_color_buffer_float
       extension is apparently causing a lot of troubles for
       ANGLE, so barely anyone bothers to implement it. On the other
       hand, most platforms do actually implicitly support float render
       targets just fine, even though they pretend they don't.
       So to *actually* figure out whether we can do float attachments
       or not, we have to do a very hacky up-front blending test
       and see whether the results come out correct.
       Hurray WebGL! */

    var shader     = new tgl.Shader(Shaders, "blend-test-vert", "blend-test-frag");
    var packShader = new tgl.Shader(Shaders, "blend-test-vert", "blend-test-pack-frag");
    var target = new tgl.Texture(1, 1, 4, true, false, false, new Float32Array([-6.0, 10.0, 30.0, 2.0]));
    var fbo = new tgl.RenderTarget();
    var vbo = new tgl.VertexBuffer();
    vbo.bind();
    vbo.addAttribute("Position", 3, gl.FLOAT, false);
    vbo.init(4);
    vbo.copy(new Float32Array([1.0, 1.0, 0.0, -1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0]));
    
    gl.viewport(0, 0, 1, 1);
    
    fbo.bind();
    fbo.drawBuffers(1);
    fbo.attachTexture(target, 0);
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    
    shader.bind();
    vbo.draw(shader, gl.TRIANGLE_FAN);
    vbo.draw(shader, gl.TRIANGLE_FAN);
    
    fbo.unbind();
    gl.disable(gl.BLEND);
    
    /* Of course we can neither read back texture contents or read floating point
       FBO attachments in WebGL, so we have to do another pass, convert to uint8
       and check whether the results are ok.
       Hurray WebGL! */
    packShader.bind();
    target.bind(0);
    packShader.uniformTexture("Tex", target);
    vbo.draw(packShader, gl.TRIANGLE_FAN);
    
    var pixels = new Uint8Array([0, 0, 0, 0]);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    
    if (pixels[0] != 8 || pixels[1] != 128 || pixels[2] != 16 || pixels[3] != 4) {
        console.log("Floating point blending test failed. Result was " + pixels + " but should have been " + [8, 128, 16, 4]);
        throw new Error("Your platform does not support floating point attachments");
    }
}

Transient.prototype.setupUI = function() {
    function map(a, b) { return [a*0.5/1.78 + 0.5, -b*0.5 + 0.5]; }

    var config = {
        "resolutions": [[820, 461], [1024, 576], [1280, 720], [1600, 900], [1920, 1080], [4096, 2160]],
        "reconstruction_resolutions": [16, 32, 64, 128],
        "scenes": [
            {'shader': 'scene10', 'name': 'Plane NLOS',          'posA': [0.5, 0.8],       'posB': [0.837, 0.5],      'spread': tcore.Renderer.SPREAD_LASER},
            {'shader': 'scene9', 'name': 'Spheres NLOS',         'posA': [0.5, 0.8],       'posB': [0.837, 0.5],      'spread': tcore.Renderer.SPREAD_LASER}
        ],
        "capture_methods": ["Non-confocal", "Confocal"],
        "spad_num": [16, 32, 64, 128],
        "filters": ["None", "Laplacian", "Gaussian", "Laplacian of Gaussian", "Phasor Fields"]
    };
    
    var sceneShaders = [], sceneNames = [];
    for (var i = 0; i < config.scenes.length; ++i) {
        sceneShaders.push(config.scenes[i].shader);
        sceneNames.push(config.scenes[i].name);
    }
    
    this.renderer = new transientcore.Renderer(this.gl, this.canvas.width/2, this.canvas.height, sceneShaders);

    /* Let's try and make member variables in JS a little less verbose... */
    var renderer = this.renderer;
    var content = this.content;
    var canvas = this.canvas;

    this.progressBar = new tui.ProgressBar("render-progress", true);
    
    var resolutionLabels = [];
    for (var i = 0; i < config.resolutions.length; ++i)
        resolutionLabels.push(config.resolutions[i][0] + "x" + config.resolutions[i][1]);

    new tui.ButtonGroup("resolution-selector", false, resolutionLabels, function(idx) {
        var width = config.resolutions[idx][0];
        var height = config.resolutions[idx][1];
                        content.style.width = width + "px";
        content.style.height = height + "px";
        canvas.width = width*2;
        canvas.height = height;
        renderer.changeResolution(width, height);
    });

    resolutionLabels = [];
    for (var i = 0; i < config.reconstruction_resolutions.length; ++i)
        resolutionLabels.push(config.reconstruction_resolutions[i] + "x" + config.reconstruction_resolutions[i]);

    new tui.ButtonGroup("reconstruction-resolution-selector", false, resolutionLabels, function(idx) {
        var width = config.resolutions[idx];
        //renderer.changeResolution(width, height);
    });
    var captureMethodSelector = new tui.ButtonGroup("capture-selector", true, config.capture_methods, function() {});
    var spadNumberSelector = new tui.ButtonGroup("spad-selector", false, config.spad_num, function() {});
    
    function selectScene(idx) {
        renderer.changeScene(idx);
        renderer.setNormalizedEmitterPos(config.scenes[idx].posA, config.scenes[idx].posB);
    }
    new tui.ButtonGroup("scene-selector", true, sceneNames, selectScene);
    
    var mouseListener = new tui.MouseListener(canvas, renderer.setEmitterPos.bind(renderer));
        
    var bounceSlider = new tui.Slider("path-length", 1, 20, true, function(length) {
        this.setLabel((length - 1) + " light bounces");
        renderer.setMaxPathLength(length);
    });
    bounceSlider.setValue(12);
        
    var sampleSlider = new tui.Slider("sample-count", 400, 700, true, function(exponent100) {
        var sampleCount = Math.floor(Math.pow(10, exponent100*0.01));
        this.setLabel(sampleCount + " light paths");
        renderer.setMaxSampleCount(sampleCount);
    });
    sampleSlider.setValue(600);
        
    this.saveImageData = false;
    document.getElementById('save-button').addEventListener('click', (function() {
        this.saveImageData = true;
    }).bind(this));
        
    selectScene(0);
        
    this.overlay.className = "render-help";
    this.overlay.offsetHeight; /* Flush CSS changes */
    this.overlay.className += " render-help-transition";
    this.overlay.textContent = "Click and drag!"
    this.overlay.addEventListener("mousedown", function(event) {
        this.parentNode.removeChild(this);
        mouseListener.mouseDown(event);
    });
    }

Transient.prototype.fail = function(message) {
    var sorryP = document.createElement("p"); 
    sorryP.appendChild(document.createTextNode("Sorry! :("));
    sorryP.style.fontSize = "50px";

    var failureP = document.createElement("p");
    failureP.className = "warning-box";
    failureP.innerHTML = message;
    
    var errorImg = document.createElement("img"); 
    errorImg.title = errorImg.alt = "The Element of Failure";
    errorImg.src = "derp.gif";
    
    var failureDiv = document.createElement("div"); 
    failureDiv.className = "center";
    failureDiv.appendChild(sorryP);
    failureDiv.appendChild(errorImg);
    failureDiv.appendChild(failureP);
    
    document.getElementById("transient-content").appendChild(failureDiv);
    this.overlay.style.display = this.canvas.style.display = 'none';
}

Transient.prototype.renderLoop = function(timestamp) {
    window.requestAnimationFrame(this.boundRenderLoop);
    
    if (!this.renderer.finished())
        this.renderer.render(timestamp);

    if (this.saveImageData) {
        /* Ensure we redraw the image before we grab it. This is a strange one:
           To save power the renderer stops doing anything after it finished
           tracing rays, and the canvas keeps displaying the correct image
           (as you would expect). However, when we get the canvas as a blob,
           the results are garbage unless we rendered to it in that frame.
           There's most likely some browser/ANGLE meddling happening here, but
           in interest of my mental health I'm not going to dig deeper into this */
        //if (this.renderer.finished()) {
            // Now we are not rendering every frame, only when we reach the maximum length of each batch
            this.renderer.redraw();
        //}
        
        var fileName = "Transient";
        if (this.savedImages > 0)
            fileName += (this.savedImages + 1);
        fileName += ".png";
        
        this.canvas.toBlob(function(blob) { saveAs(blob, fileName); });

        this.savedImages++;
        this.saveImageData = false;
    }

    this.progressBar.setProgress(this.renderer.progress());
    this.progressBar.setLabel(Math.min(this.renderer.totalRaysTraced(), this.renderer.maxRayCount()) +
        "/" + this.renderer.maxRayCount() + " rays traced; Progress: " +
        this.progressBar.getProgressPercentage() + "%");
}