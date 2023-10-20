var Transient = function () {

    // Debug mode
    this.DEBUG = true;

    this.canvas = document.getElementById("transient-canvas");
    this.overlay = document.getElementById("transient-overlay");
    this.controls = document.getElementById("transient-controls");
    this.filterCanvas = document.getElementById("filter-canvas");

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
        var message = e.message;
        if (this.DEBUG) {
            var aux = e.stack.split("\n");
            aux.splice(0, 1); //removing the line that we force to generate the error (var err = new Error();) from the message
            console.error(message + '\n' + aux.join('\n'));
            aux = aux.join('<br>');
            this.fail(message + '<br>' + aux);
        } else {
            this.fail("Something unexpected happened. The error message is listed below:<br/>" +
            "<pre>" + message + "</pre>");
        }
        return;
    }

    /* Ok, all seems well. Time to show the controls */
    this.controls.style.visibility = "visible";

    window.requestAnimationFrame(this.boundRenderLoop);
}

Transient.prototype.setupGL = function () {
    try {
        var gl = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
    } catch (e) { }
    if (!gl)
        throw new Error("Could not initialise WebGL");

    var floatExt = gl.getExtension("OES_texture_float");
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

Transient.prototype.colorBufferFloatTest = function (gl) {
    /* This one is slightly awkward. The WEBGL_color_buffer_float
       extension is apparently causing a lot of troubles for
       ANGLE, so barely anyone bothers to implement it. On the other
       hand, most platforms do actually implicitly support float render
       targets just fine, even though they pretend they don't.
       So to *actually* figure out whether we can do float attachments
       or not, we have to do a very hacky up-front blending test
       and see whether the results come out correct.
       Hurray WebGL! */

    var shader = new tgl.Shader(Shaders, "blend-test-vert", "blend-test-frag");
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

function getCoordinate(label) {
    var element = document.getElementById(label);
    var val = element.value;
    if (!val) val = element.placeholder;
    val = parseFloat(val);
    var min = parseFloat(element.min);
    var max = parseFloat(element.max);
    return Math.min(max, Math.max(min, val));
}

/*
 * Create a box with a side [(x1,y1),(x2,y2)], and the new perpendicular sides having a length of width
 */
function closeBox(x1, y1, x2, y2, width) {
    // Perpendicular direction to the given segment
    var xDir = y2 - y1;
    var yDir = -(x2 - x1);
    // Normalize the vector and make it width-lengthed
    var length = Math.sqrt(xDir * xDir + yDir * yDir);
    xDir /= length / width;
    yDir /= length / width;

    var x3 = x2 + xDir;
    var y3 = y2 + yDir;
    var x4 = x1 + xDir;
    var y4 = y1 + yDir;
    return [x1, y1, x2, y2, x3, y3, x4, y4];
}

Transient.prototype.setupUI = function () {
    var config = {
        "reconstruction_resolutions": [32, 64, 128, 256, 512, 1024, 2048, 4096],
        "scenes": [
            { 'shader': 'scene10', 'name': 'Line', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene9', 'name': 'Circle', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene20', 'name': 'Box', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene11', 'name': 'Visibility test', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            // {'shader': 'scene12', 'name': 'Virtual mirror',   'posA': [0.5, 0.8],       'posB': [0.837, 0.5],      'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene14', 'name': 'Virtual mirror', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene16', 'name': 'Virtual mirror 2', 'posA': [0.64, 0.995], 'posB': [0.837, 0.75], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            // { 'shader': 'scene13', 'name': 'Virtual mirror 2', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene15', 'name': 'Rotated segment', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            // { 'shader': 'scene17', 'name': 'Non-working second corner', 'posA': [0.218, 0.1], 'posB': [0.359, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene18', 'name': 'Second corner', 'posA': [0.625, 0.9], 'posB': [0.837, 0.8], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene19', 'name': 'Second corner target', 'posA': [0.625, 0.9], 'posB': [0.837, 0.8], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene21', 'name': 'Two boxes', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse },
            { 'shader': 'scene22', 'name': 'Triangle', 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': genScene.MaterialType.Diffuse }
        ],
        "capture_methods": ["Single", "Confocal", "Exhaustive"],
        "camera_models": ["Confocal", "Transient", "Conventional"],
        "spad_num": [16, 32, 64, 128],
        "filters": ["None", "Laplacian", "Laplacian of Gaussian", "Phasor Fields"],
        "tone_mapper_labels": ["None", "Logarithmic", "Square root"],
        "tone_mapper_ids": ["none", "log(1.0+", "sqrt("],
        "magnitudes": ["Amplitude", "Phase"],
        "material_types": ["Diffuse", "Mirror", "Dielectric", "RoughMirror", "RoughDielectric"],
        "vertices": [
            // Line
            [0.0, 0.2, 0.0, -0.2],
            // Box
            [0.0, 0.2, 0.0, -0.2,
                0.0, -0.2, -0.2, -0.2,
                -0.2, -0.2, -0.2, 0.2,
                -0.2, 0.2, 0.0, 0.2],
            // Visibility test
            [0.0, 0.2, 0.0, -0.2,
                0.2, 0.54641, 0.0, 0.2,
                0.0, -0.2, -0.2, -0.54641],
            // Virtual mirror
            [0.4, 0.2, 0.4, -0.2],
            // Rotated segment
            [0.5, 0.2, 0.4, -0.2],
            // Two boxes
            [
                // First box
                0.125, 0.1, 0.125, 0.4,
                0.125, 0.4, 0.25, 0.4,
                0.25, 0.4, 0.25, 0.1,
                0.25, 0.1, 0.125, 0.1,
                // Second box
                -0.325, -0.25, -0.25, -0.5,
                -0.25, -0.5, -0.325, -0.75,
                -0.325, -0.75, -0.575, -0.325,
                -0.575, -0.325, -0.325, -0.25
            ],
            // Triangle
            [0.0, 0.4, 0.2, 0.0,
                0.2, 0.0, 0.0, -0.4,
                0.0, -0.4, 0.0, 0.4],
        ],
        "addition_modes": ["Absolute space", "Complex space"],
        "resolution_labels": [],
        "spread_types": ["Point", "Cone", "Beam", "Laser", "Area"]
    };
    this.config = config;

    var sceneShaders = [], sceneNames = [];
    for (var i = 0; i < config.scenes.length; ++i) {
        sceneShaders.push(config.scenes[i].shader);
        sceneNames.push(config.scenes[i].name);
    }

    this.renderer = new transientcore.Renderer(this.gl, (this.canvas.width - 10) / 2, this.canvas.height, sceneShaders, this.filterCanvas);
    this.renderer.changeScene(0, config.scenes[0].name, config.scenes[0].wallMat);
    this.generator = new genScene.SceneGenerator();

    /* Let's try and make member variables in JS a little less verbose... */
    var renderer = this.renderer;
    var generator = this.generator;
    var canvas = this.canvas;

    this.progressBar = new tui.ProgressBar("render-progress", true);

    var filterTypes = [];
    config.filters.forEach(filt => {
        filt = filt.toLowerCase();
        words = filt.split(" ");
        if (words.length == 1) {
            if (filt[0] == 'l')
                filt = "lap";
        } else {
            filt = "";
            words.forEach(w => {
                filt = filt.concat(w[0]);
            });
        }
        filterTypes.push(filt);
    });

    for (var i = 0; i < filterTypes.length; i++) {
        config.filters[filterTypes[i]] = config.filters[i];
    }

    function changeInstantSlider() {
        if (instantSlider == null || instantSlider.maxValue != renderer.numIntervals - 1) {
            instantSlider = new tui.Slider("instant-selector", 0, renderer.numIntervals - 1, true, function (instant) {
                var m = renderer.deltaT * instant;
                var ns = meters2seconds(m) * 1e9;
                this.setLabel(`t = ${ns.toFixed(3)} ns (L = ${m.toFixed(3)} m)`);
                renderer.setInstant(instant);
            });
            instantSlider.setValue(0);
            instantSlider.updateLabel = function () {
                var m = renderer.deltaT * this.value;
                var ns = meters2seconds(m) * 1e9;
                this.setLabel(`t = ${ns.toFixed(3)} ns (L = ${m.toFixed(3)} m)`);
            }
            renderer.addInstantSlider(instantSlider);
        }
    }
    var instantSlider = null;
    changeInstantSlider();

    var sigmaSlider = new tui.Slider("sigma-slider", 1, 200, true, function (sigma) {
        this.setLabel(`Standard deviation: ${sigma / 10} cm`);
        sigma = sigma / 1000;
        renderer.setSigma(sigma);
    })
    sigmaSlider.setValue(20);

    var wlSlider = new tui.Slider("wl-slider", 1, 20, true, function (wl) {
        this.setLabel(`Wavelength: ${wl} cm`);
        wl = wl / 100;
        renderer.setWavelength(wl);
    });
    wlSlider.setValue(2);

    new tui.ButtonGroup("magnitude-selector", false, config.magnitudes, function (idx) {
        var usePhase = Boolean(idx);
        renderer.setUsePhase(usePhase);
        // var visibility = (usePhase) ? 'hidden' : 'visible';
        var display = (usePhase) ? 'none' : 'block';
        if (usePhase) {
            renderer.setToneMapper('none');
        } else {
            renderer.setToneMapper(config.tone_mapper_ids[tonemapSelector.selectedButton]);
        }
        document.getElementById("tonemap-div").style.display = display;
    });

    new tui.ButtonGroup("geometry-visibility-selector", false, ['Hide', 'Show'], function (idx) {
        var showGeometry = Boolean(idx);
        renderer.setShowGeometry(showGeometry);
    });

    document.getElementById("filter-parameter").style.display = 'none';

    (new tui.ButtonGroup("filter-selector", true, config.filters, function (idx) {
        renderer.setFilterType(filterTypes[idx]);
        if (idx < 3) {
            document.getElementById("filter-parameter").style.display = 'none';
            document.getElementById("conventional-addition").style.display = 'none';
        } else {
            document.getElementById("filter-parameter").style.display = 'block';
            document.getElementById("conventional-addition").style.display = (renderer.isConvCamera) ? 'block' : 'none';
            wlSlider.show(filterTypes[idx] === 'pf');
        }
    })).select(3);

    for (var i = 0; i < config.reconstruction_resolutions.length; ++i)
        config.resolution_labels.push(parseInt(config.reconstruction_resolutions[i] * renderer.aspect) + "x" + config.reconstruction_resolutions[i]);

    var recResolutionSelector = new tui.ButtonGroup("reconstruction-resolution-selector", false, config.resolution_labels, function (idx) {
        var height = config.reconstruction_resolutions[idx];
        renderer.changeReconstructionResolution(height);
    });
    recResolutionSelector.select(2);
    new tui.ButtonGroup("capture-method-selector", true, config.capture_methods, function (idx) {
        var captureMethod = {
            0: "single",
            1: "confocal",
            2: "exhaustive"
        }[idx]
        renderer.setCaptureMethod(captureMethod);
        if (captureMethod != "single")
            document.getElementById("spread-type").style.display = 'none';
        else
            document.getElementById("spread-type").style.display = 'block';
    });

    document.getElementById("xa").onchange = function () { updateLightSourcePos() };
    document.getElementById("ya").onchange = function () { updateLightSourcePos() };
    document.getElementById("xb").onchange = function () { updateLightSourcePos() };
    document.getElementById("yb").onchange = function () { updateLightSourcePos() };
    function updateLightSourcePos() {
        var xa = getCoordinate("xa");
        var xb = getCoordinate("xb");
        var ya = getCoordinate("ya");
        var yb = getCoordinate("yb");
        renderer.setEmitterPos(renderer.scene2canvas([xa, ya]), renderer.scene2canvas([xb, yb]));
    }


    new tui.ButtonGroup("addition-selector", false, config.addition_modes, function (idx) {
        renderer.setAddModules(!idx);
    });
    new tui.ButtonGroup("camera-selector", true, config.camera_models, function (idx) {
        var prev = renderer.isConvCamera;
        renderer.setCameraModel(idx);

        // Hide or show Amplitude/Phase and Module/Complex selectors depending on camera model if the filter is phasor fields
        if (renderer.filterType === 'pf') {
            var current = renderer.isConvCamera;
            var usePhase = renderer.usePhase;

            if (prev) {
                // Show Amplitude/Phase selector
                document.getElementById("magnitude-div").style.display = 'block';

                // Hide tone mapper selector if showing phase
                var display = (usePhase) ? 'none' : 'block';
                if (usePhase) {
                    renderer.setToneMapper('none');
                } else {
                    renderer.setToneMapper(config.tone_mapper_ids[tonemapSelector.selectedButton]);
                }
                document.getElementById("tonemap-div").style.display = display;

                // Hide Module/Complex addition selector
                document.getElementById("conventional-addition").style.display = 'none';
            } else if (current) {
                // Hide Amplitude/Phase selector
                document.getElementById("magnitude-div").style.display = 'none';

                // Show tone mapper selector if previously showing phase
                if (usePhase) {
                    document.getElementById("tonemap-div").style.display = 'block';
                    renderer.setToneMapper(config.tone_mapper_ids[tonemapSelector.selectedButton]);
                }

                // Show Module/Complex addition selector
                document.getElementById("conventional-addition").style.display = 'block';
            }
        }
    });
    var tonemapSelector = new tui.ButtonGroup("tonemap-selector", true, config.tone_mapper_labels, function (idx) {
        renderer.setToneMapper(config.tone_mapper_ids[idx]);
    });
    var spadNumberSelector = new tui.ButtonGroup("spad-selector", false, config.spad_num, function (idx) {
        renderer.changeSpadResolution(config.spad_num[idx]);
    });
    spadNumberSelector.select(2);

    var spadPositionsSlider = document.getElementById("spad-positions-selector");
    noUiSlider.create(spadPositionsSlider, {
        start: [-0.5, 0.5],
        connect: true,
        range: {
            min: [-1],
            max: [1]
        }
    });
    spadPositionsSlider.label = document.createElement("p");
    spadPositionsSlider.label.className = "slider-label";
    var parent = spadPositionsSlider.parentNode;
    parent.insertBefore(spadPositionsSlider.label, spadPositionsSlider.nextSibling);
    spadPositionsSlider.label.textContent = "[-0.5, 0.5] m";
    spadPositionsSlider.noUiSlider.on('update', function (values) {
        var low = parseFloat(values[0]);
        var high = parseFloat(values[1]);
        renderer.setSpadBoundaries(low, high);
        spadPositionsSlider.label.textContent = `[${low},${high}]`;
    });

    var spreadSelector = new tui.ButtonGroup("spread-selector", true, config.spread_types, renderer.setSpreadType.bind(renderer));

    function selectScene(idx) {
        renderer.changeScene(idx, config.scenes[idx].name, config.scenes[idx].wallMat);
        spreadSelector.select(config.scenes[idx].spread);
        if (renderer.captureMethod == "single")
            renderer.setNormalizedEmitterPos(config.scenes[idx].posA, config.scenes[idx].posB);
    }
    var sceneSelector = new tui.ButtonGroup("scene-selector", true, sceneNames, selectScene);

    var mouseListener = new tui.MouseListener(canvas, renderer.setEmitterPos.bind(renderer));

    // var bounceSlider = new tui.Slider("path-length", 1, 20, true, function (length) {
    //     this.setLabel((length - 1) + " light bounces");
    //     renderer.setMaxPathLength(length);
    // });
    // bounceSlider.setValue(12);
    var bounceSlider = document.getElementById("path-length");
    noUiSlider.create(bounceSlider, {
        start: [3, 12],
        connect: true,
        step: 1,
        range: {
            min: [1],
            max: [20]
        }
    });
    bounceSlider.label = document.createElement("p");
    bounceSlider.label.className = "slider-label";
    var parent = bounceSlider.parentNode;
    parent.insertBefore(bounceSlider.label, bounceSlider.nextSibling);
    bounceSlider.label.textContent = "11 light bounces, capturing from bounce 3";
    bounceSlider.noUiSlider.on('update', function (values) {
        var low = parseFloat(values[0]);
        var length = parseFloat(values[1]);
        bounceSlider.label.textContent = (length - 1) + " light bounces, capturing from bounce " + low;
        renderer.setMaxPathLength(length);
        renderer.setMinPathLength(low);
    })

    var sampleSlider = new tui.Slider("sample-count", 400, 700, true, function (exponent100) {
        var sampleCount = Math.floor(Math.pow(10, exponent100 * 0.01));
        this.setLabel(sampleCount + " light paths");
        renderer.setMaxSampleCount(sampleCount);
    });
    sampleSlider.setValue(600);

    var tmaxSlider = new tui.Slider("tmax", 10, renderer.maxTextureSize, true, function (numIntervals) {
        var tmax = renderer.deltaT * numIntervals;
        var ns = meters2seconds(tmax) * 1e9;
        this.setLabel(`${ns.toFixed(3)} ns (${tmax.toFixed(3)} m)`);
        renderer.setMaxTime(tmax);
        changeInstantSlider();
    });

    function meters2seconds(m) {
        return m / 299792458;
    }

    var deltaTSlider = new tui.Slider("delta-t", 1, 250, true, function (mm) {
        var m = mm / 1000;
        var ps = meters2seconds(m) * 1e12;
        this.setLabel(`${ps.toFixed(3)} ps (${mm} mm)`);
        renderer.setDeltaT(m);
        tmaxSlider.setValue(renderer.numIntervals, false);
    });
    deltaTSlider.setValue(3);
    tmaxSlider.setValue(3333);

    this.saveImageData = false;
    document.getElementById('save-button').addEventListener('click', (function () {
        this.saveImageData = true;
    }).bind(this));

    this.playVideo = false;
    this.changePlayState = false;
    document.getElementById('play-button').addEventListener('click', (function () {
        this.changePlayState = true;
    }).bind(this));

    document.getElementById('add-button').addEventListener('click', (function () {
        modal.style.display = "block";
        hideSliderHandles();
    }).bind(this));

    function hideSliderHandles() {
        var handles = document.getElementsByClassName('slider-handle');
        for (var i = 0; i < handles.length; i++) {
            handles[i].style.visibility = 'hidden';
        }
        featureSizeSlider.sliderHandle.style.visibility = '';
        roughnessSlider.sliderHandle.style.visibility = '';
        wallRoughnessSlider.sliderHandle.style.visibility = '';
    }
    function showSliderHandles() {
        var handles = document.getElementsByClassName('slider-handle');
        for (var i = 0; i < handles.length; i++) {
            handles[i].style.visibility = '';
        }
    }

    // Get the modal
    var modal = document.getElementById("myModal");

    // Add configuration options for the new scene to the modal
    this.matType = 2;
    var matType = this.matType;
    var typeSelector = new tui.ButtonGroup("material-types", true, config.material_types, function (idx) {
        matType = 2 + idx;
    });
    typeSelector.select(0);

    this.wallMatType = genScene.MaterialType.Diffuse;
    var wallMatType = this.wallMatType;
    var wallTypeSelector = new tui.ButtonGroup("rwall-mat-types", true, ["Diffuse", "RoughMirror"], function (idx) {
        wallMatType = (idx == 0) ? genScene.MaterialType.Diffuse : genScene.MaterialType.RoughMirror;
    })
    wallTypeSelector.select(0);

    var NumFeatures = function (val) {
        this.value = val;
    }
    NumFeatures.prototype.setNFeatures = function (nFeatures) {
        this.value = nFeatures;
    }
    var nFeatures = new NumFeatures(1);
    var featureSizeSlider = new tui.Slider("feature-size", 1, 250, true, function (nf) {
        nFeatures.setNFeatures(251 - nf);
        var d;
        if (usingModifiedScene) {
            if (modSceneSelector.selectedButton < 4) {
                // Line, Box, Visibility test, and Virtual mirror
                d = 0.4;
            } else if (modSceneSelector.selectedButton == 4) {
                // Rotated segment
                d = Math.sqrt(0.17);
            } else if (modSceneSelector.selectedButton == 5) {
                // Two boxes
                d = 0.5;
            } else {
                // Triangle
                d = Math.sqrt(0.2);
            }
        } else {
            var x1 = getCoordinate("x1");
            var x2 = getCoordinate("x2");
            var y1 = getCoordinate("y1");
            var y2 = getCoordinate("y2");
            d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        }
        this.setLabel((d * 100 / (251 - nf)).toFixed(4) + " cm");
    });
    featureSizeSlider.setValue(250);
    document.getElementById("x1").onchange = function () { updateFeatureSize() };
    document.getElementById("x2").onchange = function () { updateFeatureSize() };
    document.getElementById("y1").onchange = function () { updateFeatureSize() };
    document.getElementById("y2").onchange = function () { updateFeatureSize() };
    function updateFeatureSize(sceneIdx = -1) {
        if (usingModifiedScene) {
            var d;
            var selectedScene = (sceneIdx == -1) ? modSceneSelector.selectedButton : sceneIdx;
            if (selectedScene < 4) {
                // Line, Box, Visibility test, and Virtual mirror
                d = 0.4;
            } else if (selectedScene == 4) {
                // Rotated segment
                d = Math.sqrt(0.17);
            } else if (modSceneSelector.selectedButton == 5) {
                // Two boxes
                d = 0.5;
            } else {
                // Triangle
                d = Math.sqrt(0.2);
            }
        } else {
            var x1 = getCoordinate("x1");
            var x2 = getCoordinate("x2");
            var y1 = getCoordinate("y1");
            var y2 = getCoordinate("y2");
            d = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        }
        var nf = 251 - featureSizeSlider.value;
        featureSizeSlider.setLabel((d * 100 / nf).toFixed(4) + " cm");
    }

    var roughness = 0.01;
    var roughnessSlider = new tui.Slider("roughness-slider", 1, 100, true, function (alpha) {
        this.setLabel(alpha / 100);
        roughness = alpha / 100;
    });
    roughnessSlider.setValue(10);

    var wallRoughness = 0.5;
    var wallRoughnessSlider = new tui.Slider("rwall-roughness", 1, 100, true, function (alpha) {
        this.setLabel(alpha / 100);
        wallRoughness = alpha / 100;
    });
    wallRoughnessSlider.setValue(50);

    document.getElementById("segment-div").style.display = 'block';
    document.getElementById("scene-div").style.display = 'none';
    var usingModifiedScene = false;
    new tui.ButtonGroup("type-of-scene", true, ["Single segment/Box", "Predefined scene"], function (idx) {
        if (idx == 0) {
            document.getElementById("segment-div").style.display = 'block';
            document.getElementById("scene-div").style.display = 'none';
            usingModifiedScene = false;
        } else {
            document.getElementById("segment-div").style.display = 'none';
            document.getElementById("scene-div").style.display = 'block';
            usingModifiedScene = true;
        }
        updateFeatureSize();
    });

    sceneNames = [];
    for (var i = 0; i < config.scenes.length; ++i) {
        if ((i != 1 && i != 5 && i < 7) || (i >= 9)) {
            sceneNames.push(config.scenes[i].name);
        }
    }
    var modSceneSelector = new tui.ButtonGroup("mod-scene-selector", true, sceneNames, function (idx) {
        updateFeatureSize(idx);
    });

    document.getElementById('create-button').addEventListener('click', (function () {
        var verticesList = [];
        if (usingModifiedScene) {
            var endVertices = config.vertices[modSceneSelector.selectedButton];
            if (modSceneSelector.selectedButton == 1) {
                // Box
                verticesList.push(generator.generateVertices([endVertices[0], endVertices[1]],
                    [endVertices[2], endVertices[3]], nFeatures.value));

                var v1 = [verticesList[0][0], verticesList[0][1]];
                var v2 = [verticesList[0][verticesList[0].length - 2], verticesList[0][verticesList[0].length - 1]];
                var listAux = generator.generateVertices([endVertices[8], endVertices[9]],
                    [endVertices[10], endVertices[11]], nFeatures.value);
                v2.push(listAux[0], listAux[1]);
                v1 = [listAux[listAux.length - 2], listAux[listAux.length - 1], v1[0], v1[1]];
                verticesList.push(v2, listAux, v1);
            } else {
                for (var i = 0; i < endVertices.length; i += 4) {
                    verticesList.push(generator.generateVertices([endVertices[i], endVertices[i + 1]],
                        [endVertices[i + 2], endVertices[i + 3]], nFeatures.value));
                }
            }
        } else {
            var x1 = getCoordinate("x1");
            var x2 = getCoordinate("x2");
            var y1 = getCoordinate("y1");
            var y2 = getCoordinate("y2");
            var boxWidth = getCoordinate("box-width");
            if (boxWidth <= 1e-5) {
                // Use a segment
                verticesList = [generator.generateVertices([x1, y1], [x2, y2], nFeatures.value)];
            } else {
                // Use a box
                var vertices = closeBox(x1, y1, x2, y2, boxWidth);
                verticesList.push(generator.generateVertices([x1, y1], [x2, y2], nFeatures.value));
                var v1 = [verticesList[0][0], verticesList[0][1]];
                var v2 = [verticesList[0][verticesList[0].length - 2], verticesList[0][verticesList[0].length - 1]];
                var listAux = generator.generateVertices([vertices[4], vertices[5]],
                    [vertices[6], vertices[7]], nFeatures.value);
                v2.push(listAux[0], listAux[1]);
                v1 = [listAux[listAux.length - 2], listAux[listAux.length - 1], v1[0], v1[1]];
                verticesList.push(v2, listAux, v1);
            }
        }
        var vertices = [];
        verticesList.forEach(vertexList => {
            vertices = vertices.concat(vertexList);
        });
        var matParams = [];
        if (matType === genScene.MaterialType.RoughMirror || matType === genScene.MaterialType.RoughDielectric) {
            matParams.push(roughness);
        } else if (matType === genScene.MaterialType.Diffuse) {
            matParams.push(0.5);
        }
        if (matType === genScene.MaterialType.Dielectric || matType === genScene.MaterialType.RoughDielectric) {
            var ior = getCoordinate("ior");
            matParams.push(ior);
        }
        var wallMatParams = [0.5];
        if (wallMatType === genScene.MaterialType.RoughMirror || wallMatType === genScene.MaterialType.RoughDielectric) {
            wallMatParams = [wallRoughness];
        }
        var ids = generator.generate(verticesList, matType, matParams, wallMatType, wallMatParams);
        config.scenes.push({
            'shader': ids[0], 'name': 'Custom scene ' + ids[1], 'posA': [0.5, 0.8], 'posB': [0.837, 0.5], 'spread': tcore.Renderer.SPREAD_LASER, 'wallMat': wallMatType,
            'modifications': {
                'feature_size': featureSizeSlider.label.innerHTML,
                'base_scene': (usingModifiedScene) ? sceneNames[modSceneSelector.selectedButton] : 'Custom',
                'mat_type': matType,
                'mat_params': matParams,
                'wall_mat_type': wallMatType,
                'wall_mat_params': wallMatParams,
                'x1': x1,
                'x2': x2,
                'y1': y1,
                'y2': y2,
                'width': boxWidth
            }
        });
        sceneSelector.addButton(config.scenes[config.scenes.length - 1].name);
        renderer.addScene(ids[0], verticesList);
        modal.style.display = "none";
        showSliderHandles();
        sceneSelector.select(config.scenes.length - 1);
    }).bind(this));

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
        showSliderHandles();
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            showSliderHandles();
        }
    }

    selectScene(0);

    this.overlay.className = "render-help";
    this.overlay.offsetHeight; /* Flush CSS changes */
    this.overlay.className += " render-help-transition";
    this.overlay.textContent = "Click and drag!"
    this.overlay.addEventListener("mousedown", function (event) {
        this.parentNode.removeChild(this);
        mouseListener.mouseDown(event);
    });
}

function isMobile() {
    if (navigator.userAgentData != undefined) {
        return navigator.userAgentData.mobile;
    } else {
        // Source: https://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
        let check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }
}

Transient.prototype.fail = function (message) {
    var text = (isMobile()) ? "Save the link and connect from a computer, it won't run on most mobile devices" : "The demo is not working";
    var sorryP = document.createElement("p");
    sorryP.appendChild(document.createTextNode(text));
    sorryP.style.fontSize = "50px";

    var failureP = document.createElement("p");
    failureP.className = "warning-box";
    failureP.innerHTML = message;

    var failureDiv = document.createElement("div");
    failureDiv.className = "center";
    failureDiv.appendChild(sorryP);
    failureDiv.appendChild(failureP);

    document.getElementById("transient-content").appendChild(failureDiv);
    this.overlay.style.display = this.canvas.style.display = 'none';
}

Transient.prototype.renderLoop = function (timestamp) {
    window.requestAnimationFrame(this.boundRenderLoop);

    if (!this.renderer.finished())
        this.renderer.render(timestamp);
    else if (this.changePlayState) {
        this.playVideo = !this.playVideo;
        this.changePlayState = false;
        if (!this.playVideo)
            this.renderer.pause();
        else if (this.renderer.videoFinished())
            this.renderer.play(timestamp);
    } else if (this.playVideo) {
        if (this.renderer.videoFinished()) {
            this.playVideo = false;
            this.renderer.pause();
        } else
            this.renderer.play(timestamp);
    }

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

        var downloadFiles = async (fileName) => {
            this.saveParameters(fileName + ".json");
            await new Promise(r => setTimeout(r, 1000)); // Avoid downloading only the second file but twice on Chrome
            this.saveRaw(fileName + ".csv");
        }
        downloadFiles(fileName);

        fileName += ".png";

        this.canvas.toBlob(function (blob) { saveAs(blob, fileName); });

        this.savedImages++;
        this.saveImageData = false;

        // console.log(this.renderer.getTransientValues());
    }

    this.progressBar.setProgress(this.renderer.progress());
    this.progressBar.setLabel(Math.min(this.renderer.totalRaysTraced(), this.renderer.maxRayCount()) +
        "/" + this.renderer.maxRayCount() + " rays traced; Progress: " +
        this.progressBar.getProgressPercentage() + "%");
}

Transient.prototype.saveParameters = function (fileName) {
    var renderer = this.renderer;
    var config = this.config;
    var text = '{\n';

    // Scene parameters
    var modifications = config.scenes[renderer.currentScene].modifications;
    text += `"scene": {\n`
    if (modifications) {
        text += `\t"name": "${modifications.base_scene + ((modifications.base_scene != 'Custom') ? ' modified' : '')}",\n`;
        if (modifications.base_scene == 'Custom') {
            text += `\t"x1": ${modifications.x1},
    "y1": ${modifications.y1},
    "x2": ${modifications.x2},
    "y2": ${modifications.y2},
    "box-width": ${modifications.width},
`;
        }
        text += `\t"hidden_mat": "${config.material_types[modifications.mat_type - 2]}",\n`;
        if (modifications.mat_type === genScene.MaterialType.RoughDielectric || modifications.mat_type === genScene.MaterialType.RoughMirror) {
            text += `\t"hidden_roughness": ${modifications.mat_params[0]},\n`;
        }
        if (modifications.mat_type === genScene.MaterialType.Dielectric || modifications.mat_type === genScene.MaterialType.RoughDielectric) {
            text += `\t"hidden_ior": ${modifications.mat_params[0]},\n`;
        }
        text += `\t"wall_mat": "${config.material_types[modifications.wall_mat_type - 2]}",\n`;
        if (modifications.wall_mat_type === genScene.MaterialType.RoughDielectric || modifications.wall_mat_type === genScene.MaterialType.RoughMirror) {
            text += `\t"wall_roughness": ${modifications.wall_mat_params[0]},\n`;
        }
        text += `\t"feature_size": "${modifications.feature_size}"\n`;
    } else {
        text += `\t"name": "${config.scenes[renderer.currentScene].name}"\n`;
    }
    text += `},\n"light_source": {\n`;
    text += `\t"spread": "${config.spread_types[renderer.spreadType]}",\n`;
    text += `\t"origin": [${renderer.laserPos[0]}, ${renderer.laserPos[1]}],\n`;
    text += `\t"look_at": [${renderer.laserFocus[0]}, ${renderer.laserFocus[1]}]\n},`

    // Capture parameters
    text += `
"capture": {
    "method": "${renderer.captureMethod}",
    "num_spads": ${renderer.numSpads},
    "spad_boundaries": [${renderer.spadBoundaries[0]}, ${renderer.spadBoundaries[1]}],
    "delta_t": ${renderer.deltaT},
    "max_time": ${renderer.maxTime},
    "bounces_saved": [${renderer.minPathLength}, ${renderer.maxPathLength - 1}],
    "sample_count": "${document.getElementById("sample-count").getElementsByClassName("slider-label")[0].innerHTML}"
},`;

    // Reconstruction parameters
    text += `
"reconstruction": {
    "resolution": "${renderer.numPixels[0]}x${renderer.numPixels[1]}",
    "camera_model": {
        "type": "${config.camera_models[(renderer.isVirtualConf) ? 0 : 1 + Number(renderer.isConvCamera)]}"`;
    if (renderer.isConvCamera) {
        text += `,
        "add_mode": "${config.addition_modes[Number(!renderer.addModules)]}"
    },`;
    } else {
        text += `
    },
    "instant": ${renderer.instant},
    "time": "${renderer.instant * renderer.deltaT} m",`
    }
    text += `
    "filter": {
        "type": "${config.filters[renderer.filterType]}"`;
    if (renderer.filterType === 'pf') {
        text += `,
        "wl": "${renderer.wl * 100} cm",
        "sigma": "${renderer.sigma * 100} cm"`;
    }
    text += `
    }
},
"superimpose_geometry": ${renderer.showGeometry}
}`;

    var blob = new Blob([text], { type: "text/json;charset=utf-8" });
    saveAs(blob, fileName);
}

Transient.prototype.saveRaw = function (fileName) {
    var values = this.renderer.getReconstructionValues();
    // var arr = new Float32Array(values.length / 2);
    // var k = 0;
    // for (var j = 0; j < this.renderer.numPixels[1]; j++) {
    //     for (var i = 0; i < this.renderer.numPixels[0]; i++) {
    //         k = (this.renderer.numPixels[0] * j + i) * 4;
    //         arr[k / 2] = values[k];
    //         arr[k / 2 + 1] = values[k + 1];
    //     }
    // }
    // hdf5.FS.writeFile(fileName + ".hdf5", arr.buffer);
    // console.log(f);

    var text = ``;
    var k = 0;
    for (var j = 0; j < this.renderer.numPixels[1]; j++) {
        for (var i = 0; i < this.renderer.numPixels[0]; i++) {
            k = (this.renderer.numPixels[0] * j + i) * 4;
            if (values[k + 1] < 0) {
                text += `${values[k]}${values[k + 1]}i,`;
            } else if (values[k + 1] > 0) {
                text += `${values[k]}+${values[k + 1]}i,`;
            } else {
                text += `${values[k]},`;
            }
        }
        text += `\n`;
    }

    var blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    saveAs(blob, fileName);
}