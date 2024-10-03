(function (exports) {
    const MaterialType = {
        Diffuse: 2,
        Mirror: 3,
        Dielectric: 4,
        RoughMirror: 5,
        RoughDielectric: 6,
    }

    const LoadedSceneType = {
        Default: 0,
        ModifiedDefault: 1,
        Custom: 2,
    }
    
    function getSceneGeometryLength(sceneIdx) {
        var d;
        if (sceneIdx < 4) {
            // Line, Box, Three segments, and Virtual mirror
            d = 0.4;
        } else if (sceneIdx == 4) {
            // Rotated segment
            // d = Math.sqrt(0.17);
            d = 0.5;
        } else if (sceneIdx == 5) {
            // Two boxes
            d = 0.5;
        } /*else {
            // Triangle
            d = Math.sqrt(0.2);
        }*/

        return d;
    }

    function getSegmentLength(v1, v2) {
        var x1 = v1[0];
        var x2 = v2[0];
        var y1 = v1[1];
        var y2 = v2[1];
        
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    var SceneData = function (jsonText, config, sceneNames, modSceneNames) {
        jsonScene = JSON.parse(jsonText);
        var nameWords = jsonScene.scene.name.split(' ');

        // Scene name and geometry parameters
        this.name = jsonScene.name;
        if (nameWords[0] != 'Custom' && nameWords[nameWords.length-1] != 'modified') {
            this.typeOfScene = LoadedSceneType.Default;
            this.sceneIdx = sceneNames.findIndex((name) => name === jsonScene.scene.name);
            if (this.sceneIdx == -1) {
                alert('Unknown scene');
            }
        } else {
            this.typeOfScene = (nameWords[0] === 'Custom') ? LoadedSceneType.Custom : LoadedSceneType.ModifiedDefault;
            if (this.typeOfScene == LoadedSceneType.ModifiedDefault) {
                // Get the original scene
                var baseSceneName = nameWords[0];
                for (let i = 1; i < nameWords.length-1; i++)
                    baseSceneName = baseSceneName.concat(' ', nameWords[i]);
                this.baseSceneIdx = modSceneNames.findIndex((name) => name === baseSceneName);
                if (this.baseSceneIdx == -1) {
                    alert('Unknown scene');
                }
            } else {
                // Get the vertices of the custom hidden segment
                this.v1 = [jsonScene.scene.x1, jsonScene.scene.y1];
                this.v2 = [jsonScene.scene.x2, jsonScene.scene.y2];
                this.boxWidth = jsonScene.scene['box-width'];
            }
            this.hiddenMat = config.material_types.findIndex((type) => type === jsonScene.scene.hidden_mat) + 2;
            this.wallMat = config.material_types.findIndex((type) => type === jsonScene.scene.wall_mat) + 2;
            this.featureSize = parseFloat(jsonScene.scene.feature_size.split(' ')[0]); // assuming cm
            var length = (this.typeOfScene == LoadedSceneType.ModifiedDefault) ? getSceneGeometryLength(this.baseSceneIdx) : getSegmentLength(this.v1, this.v2);
            this.nFeatures = parseInt(length*100 / this.featureSize); // Length is in m, feature size in cm
            // console.log(`Feature size: ${this.featureSize}\nLength: ${length}\n#features: ${this.nFeatures}`);
            // this.nFeatures = 1; // TODO: compute from featureSize or save this in JSON
            if (this.hiddenMat === MaterialType.Dielectric|| this.hiddenMat === MaterialType.RoughDielectric) {
                this.hiddenIor = jsonScene.scene.hidden_ior;
            } 
            if (this.hiddenMat === MaterialType.RoughMirror || this.hiddenMat === MaterialType.RoughDielectric) {
                this.hiddenRoughness = jsonScene.hidden_roughness;
            }
            if (this.wallMat === MaterialType.RoughMirror) {
                this.wallRoughness = jsonScene.wall_roughness;
            }
        }

        // Emitter parameters
        this.spreadIdx = config.spread_types.findIndex((type) => type === jsonScene.light_source.spread);
        this.lightOrigin = jsonScene.light_source.origin;
        this.lightLookAt = jsonScene.light_source.look_at; // Ignored if capture is confocal

        // Capture parameters
        if (jsonScene.capture.hasOwnProperty('origin')) {
            this.sensorOrigin = jsonScene.capture.origin;
        } else {
            this.sensorOrigin = this.lightOrigin;
        }
        this.captureIdx = config.capture_methods.findIndex((method) => method === jsonScene.capture.method);
        this.nSpadIdx = config.spad_num.findIndex((num) => num == jsonScene.capture.num_spads);
        this.spadBoundaries = jsonScene.capture.spad_boundaries;
        this.deltaT = jsonScene.capture.delta_t;
        this.tmax = jsonScene.capture.max_time;
        this.bounces = jsonScene.capture.bounces_saved;
        this.bounces[1] += 1;
        this.sampleCount = parseInt(jsonScene.capture.sample_count.split(' ')[0]);

        // Reconstruction parameters
        this.resolutionIdx = config.resolution_labels.findIndex((res) => res === jsonScene.reconstruction.resolution);
        this.cameraIdx = config.camera_models.findIndex((model) => model === jsonScene.reconstruction.camera_model.type);
        // TODO: other values under camera_model
        this.instant = jsonScene.reconstruction.instant;
        this.filterIdx = config.filters.findIndex((type) => type === jsonScene.reconstruction.filter.type);
        if (this.filterIdx == 3) { // Phasor Fields
            this.wl = jsonScene.reconstruction.filter.wl.split(' ');
            this.wl = parseInt(this.wl[0]); // Assuming cm
            this.sigma = jsonScene.reconstruction.filter.sigma.split(' ');
            this.sigma = parseFloat(this.sigma[0]); // Assuming cm
        }

        // Draw scene geometry
        this.geometryVisibilityIdx = jsonScene.superimpose_geometry ? 1 : 0;
    }

    SceneData.prototype.applyCaptureParameters = function (sampleSlider, captureSelector, nSpadSelector, spadBoundsSlider, deltaTSlider, tmaxSlider, bounceSlider, renderer) {
        sampleSlider.setValue(100 * Math.log10(this.sampleCount));
        captureSelector.select(this.captureIdx);
        nSpadSelector.select(this.nSpadIdx);
        spadBoundsSlider.noUiSlider.set(this.spadBoundaries);
        deltaTSlider.setValue(parseInt(this.deltaT * 1000));
        tmaxSlider.setValue(parseInt(this.tmax / this.deltaT));
        bounceSlider.noUiSlider.set(this.bounces);
        renderer.setSpadPos(this.sensorOrigin);
    }

    SceneData.prototype.applyEmitterParameters = function (spreadSelector, renderer) {
        spreadSelector.select(this.spreadIdx);
        var lightLookAt = (renderer.isConf) ? [renderer.spadPoints[0], renderer.spadPoints[1]] : this.lightLookAt;
        renderer.setEmitterPos(renderer.scene2canvas(this.lightOrigin), renderer.scene2canvas(lightLookAt));
    }

    SceneData.prototype.applyReconstructionParameters = function (filterSelector, wlSlider, sigmaSlider, recResolutionSelector, camSelector, instantSlider, filterTypes) {
        filterSelector.select(this.filterIdx);
        if (filterTypes[this.filterIdx] === 'pf') {
            wlSlider.setValue(this.wl);
            sigmaSlider.setValue(parseInt(this.sigma * 10));
        }
        recResolutionSelector.select(this.resolutionIdx);
        camSelector.select(this.cameraIdx);
        instantSlider.setValue(this.instant);
    }
    
    exports.MaterialType = MaterialType;
    exports.LoadedSceneType = LoadedSceneType;
    exports.SceneData = SceneData;
    exports.getSegmentLength = getSegmentLength;
    exports.getSceneGeometryLength = getSceneGeometryLength;
})(window.sceneData = window.sceneData || {})