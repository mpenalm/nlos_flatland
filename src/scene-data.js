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

    var SceneData = function (jsonFile, config, sceneNames, modSceneNames) {
        jsonFile.text().then(function (text) {
            jsonScene = JSON.parse(text);
            var nameWords = jsonScene.scene.name.split(' ');

            // Scene name and geometry parameters
            this.name = jsonScene.name;
            if (nameWords[0] != 'Custom' && nameWords[nameWords.length-1] != 'modified') {
                this.typeOfScene = LoadedSceneType.Default;
                this.sceneIdx = sceneNames.findIndex((name) => name === jsonScene.scene.name);
                if (this.sceneIdx == -1) {
                    alert('Unknown scene');
                    // TODO: prevent from adding an empty scene
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
                        // TODO: prevent from adding an empty scene
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
                this.nFeatures = 1; // TODO: compute from featureSize or save this in JSON
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
        })
    }
    
    exports.MaterialType = MaterialType;
    exports.LoadedSceneType = LoadedSceneType;
    exports.SceneData = SceneData;
})(window.sceneData = window.sceneData || {})