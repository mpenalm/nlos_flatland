(function (exports) {
    const RELAY_WALL_COMMENT = '// Relay wall';
    var SceneGenerator = function () {
        this.pattern = new RegExp('// fill');
        this.relayWallPattern = new RegExp(RELAY_WALL_COMMENT);
        this.sceneNumber = 27;
        this.baseShader = Shaders['scene-base'];
        this.created = 0;
    }

    function toPrint(n) {
        if (n % 1 === 0) {
            // is integer, write as float
            return n.toFixed(1);
        } else {
            // is float, write as is
            return n.toString();
        }
    }

    function linspace(start, end, n) {
        if (n == 1) {
            return [(start + end) / 2.0];
        } else if (n == 2) {
            return [start, end];
        } else {
            var step = (end - start) / (n - 1);
            var result = [start];
            var accum = start + step;
            while (result.length < n) {
                result.push(accum);
                accum += step;
            }
            return result;
        }
    }

    let MaterialType = sceneData.MaterialType;

    SceneGenerator.prototype.generateSample = function (matType, matParams, shader) {
        var functionCall;
        switch (matType) {
            case MaterialType.Diffuse:
                functionCall = 'sampleDiffuse(';
                break;
            case MaterialType.Mirror:
                functionCall = 'sampleMirror(';
                break;
            case MaterialType.Dielectric:
                functionCall = 'sampleDielectric(';
                break;
            case MaterialType.RoughMirror:
                functionCall = 'sampleRoughMirror(';
                break;
            case MaterialType.RoughDielectric:
                functionCall = 'sampleRoughDielectric(';
                break;
            default:
                functionCall = 'sampleDiffuse(';
                break;
        }
        var params = (matType == MaterialType.Mirror) ? 'wiLocal' : 'state, wiLocal';
        if (matType == MaterialType.RoughMirror) {
            params += ', throughput';
        }
        if (matType == MaterialType.RoughDielectric || matType == MaterialType.RoughMirror) {
            // for RoughDielectric and RoughMirror, matParams[0] is sigma (defines normal distribution)
            params += ', ' + toPrint(matParams[0]);
        }
        if (matType == MaterialType.Dielectric || matType == MaterialType.RoughDielectric) {
            params += ', ior';
        }
        if (matType == MaterialType.RoughDielectric) {
            params += ', wiDotN';
        }

        var text;
        if (matType == MaterialType.RoughDielectric) {
            text = `float wiDotN;
        vec2 res = ${functionCall}${params});
        if (wiDotN < 0.0)
            tMult = ior;
        return res;`;
        } else {
            text = `return ${functionCall}${params});`;
        }
        if (matType == MaterialType.Dielectric || matType == MaterialType.RoughDielectric) {
            var ior = (matParams.length > 0) ? matParams[0] : 1.3;
            text = `float ior = ${toPrint(ior)};
        if (wiLocal.y < 0.0) {
            // The ray comes from inside the dielectric material - it will take longer times
            tMult = ior;
        }
        ${text}`;
        } else if (matType == MaterialType.Diffuse) {
            // for Diffuse, matParams[0] is albedo (always gray for now)
            text = 'throughput *= vec3(' + toPrint(matParams[0]) + ');\n' + text;
        }

        return shader.replace(this.pattern, text);
    }

    SceneGenerator.prototype.generateIntersect = function (vertices, matType) {
        vertices.forEach(vertexList => {
            if (vertexList.length > 0 && vertexList.length < 4) {
                alert('Insufficient number of vertices');
                return '';
            }
        });

        var text = '';
        vertices.forEach(vertexList => {
            var i = 0;
            while (i + 3 < vertexList.length) {
                v = [];
                for (var j = 0; j < 4; j++) {
                    v.push(toPrint(vertexList[i + j]));
                }
                text += 'lineIntersect(ray, vec2(' + v[0] + ', ' + v[1] + '), ' +
                    'vec2(' + v[2] + ', ' + v[3] + '), ' + matType.toFixed(1) + ', isect);\n';
                i += 2;
            }
        });
        text = text.slice(0, -1);
        return this.baseShader.replace(this.pattern, text);
    }

    SceneGenerator.prototype.generateRelayWall = function (matType, matParams, shader) {
        var functionCall;
        switch (matType) {
            case MaterialType.Diffuse:
                functionCall = 'sampleDiffuse(';
                break;
            case MaterialType.Mirror:
                functionCall = 'sampleMirror(';
                break;
            case MaterialType.Dielectric:
                functionCall = 'sampleDielectric(';
                break;
            case MaterialType.RoughMirror:
                functionCall = 'sampleRoughMirror(';
                break;
            case MaterialType.RoughDielectric:
                functionCall = 'sampleRoughDielectric(';
                break;
            default:
                functionCall = 'sampleDiffuse(';
                break;
        }
        var params = (matType == MaterialType.Mirror) ? 'wiLocal' : 'state, wiLocal';
        if (matType == MaterialType.RoughMirror) {
            params += ', throughput';
        }
        if (matType == MaterialType.RoughDielectric || matType == MaterialType.RoughMirror) {
            // for RoughDielectric and RoughMirror, matParams[0] is sigma (defines normal distribution)
            params += ', ' + toPrint(matParams[0]);
        }
        if (matType == MaterialType.Dielectric || matType == MaterialType.RoughDielectric) {
            params += ', ior';
        }
        if (matType == MaterialType.RoughDielectric) {
            params += ', wiDotN';
        }

        var text;
        if (matType == MaterialType.RoughDielectric) {
            text = 'float wiDotN;\n' +
                'vec2 res = ' + functionCall + params + ');\n' +
                'if (wiDotN < 0.0)\n' +
                '\ttMult = ior;\n' +
                'return res;';
        } else {
            text = 'return ' + functionCall + params + ');';
        }
        if (matType == MaterialType.Dielectric || matType == MaterialType.RoughDielectric) {
            text = 'float ior = 1.3;\n' + text;
        } else if (matType == MaterialType.Diffuse) {
            // for Diffuse, matParams[0] is albedo (always gray for now)
            text = 'throughput *= vec3(' + toPrint(matParams[0]) + ');\n' + text;
        }

        return shader.replace(this.relayWallPattern, RELAY_WALL_COMMENT + '\n' + text);
    }

    SceneGenerator.prototype.generate = function (vertices, matType, matParams, wallMaterial = MaterialType.Diffuse, wallMatParams = [0.5]) {
        var shader = this.generateIntersect(vertices, matType);
        shader = this.generateSample(matType, matParams, shader);
        shader = this.generateRelayWall(wallMaterial, wallMatParams, shader);
        var sceneId = 'scene' + this.sceneNumber;
        this.sceneNumber++;
        Shaders[sceneId] = shader;
        return [sceneId, this.created++];
    }

    SceneGenerator.prototype.generateVertices = function (start, end, nFeatures) {
        if (nFeatures == 1) {
            // Single feature, use given vertices
            return [start[0], start[1], end[0], end[1]];
        }

        // More than one feature, compute intermediate values
        var featureSize = (end[0] - start[0]) / nFeatures;
        var x = [start[0]];
        while (x.length <= nFeatures) {
            x.push(x[x.length - 1] + featureSize);
        }
        res = [];
        var y = [];
        var horizontal = (Math.abs(start[1] - end[1]) < 1e-5);
        var vertical = (Math.abs(start[0] - end[0]) < 1e-5);
        if (horizontal) {
            y = [Math.min(0.999, start[1] - Math.abs(featureSize) / 2), Math.min(0.999, start[1] + Math.abs(featureSize) / 2)];
            for (var i = 0; i <= nFeatures; i++) {
                res.push(x[i]);
                res.push(y[i % 2]);
            }
        } else {
            featureSize = (end[1] - start[1]) / nFeatures;
            y = linspace(start[1], end[1], nFeatures + 1);
            if (vertical) {
                x = [start[0] + Math.abs(featureSize) / 2, start[0] - Math.abs(featureSize) / 2];
                for (var i = 0; i <= nFeatures; i++) {
                    res.push(x[i % 2]);
                    res.push(y[i]);
                }
            } else {
                var angle = Math.atan(Math.abs(y[0] - y[1]) / Math.abs(x[0] - x[1]));
                var xChange = -Math.sign(angle) * Math.abs(Math.sin(angle) * featureSize);
                var yChange = Math.cos(angle) * Math.abs(featureSize);

                for (var i = 0; i <= nFeatures; i++) {
                    if (i % 2 == 0) {
                        // Place on the line that joins both ends
                        res.push(x[i]);
                        res.push(y[i]);
                    } else {
                        // Triangle top vertex
                        res.push(x[i] + xChange);
                        res.push(y[i] + yChange);
                    }
                }
            }
        }
        return res;
    }

    SceneGenerator.prototype.generateVertexListForModifiedScene = function (baseSceneIdx, sceneVertices, nFeatures) {
        var verticesList = [];
        var endVertices = sceneVertices;
        if (baseSceneIdx == 1) {
            // Box
            verticesList.push(this.generateVertices([endVertices[0], endVertices[1]],
                [endVertices[2], endVertices[3]], nFeatures));

            var v1 = [verticesList[0][0], verticesList[0][1]];
            var v2 = [verticesList[0][verticesList[0].length - 2], verticesList[0][verticesList[0].length - 1]];
            var listAux = this.generateVertices([endVertices[8], endVertices[9]],
                [endVertices[10], endVertices[11]], nFeatures);
            v2.push(listAux[0], listAux[1]);
            v1 = [listAux[listAux.length - 2], listAux[listAux.length - 1], v1[0], v1[1]];
            verticesList.push(v2, listAux, v1);
        } else {
            for (var i = 0; i < endVertices.length; i += 4) {
                verticesList.push(this.generateVertices([endVertices[i], endVertices[i + 1]],
                    [endVertices[i + 2], endVertices[i + 3]], nFeatures));
            }
        }
        return verticesList;
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

    SceneGenerator.prototype.generateVertexListForCustomScene = function (v1, v2, boxWidth, nFeatures) {
        var verticesList = [];
        if (boxWidth <= 1e-5) {
            // Use a segment
            verticesList = [this.generateVertices(v1, v2, nFeatures)];
        } else {
            // Use a box
            var vertices = closeBox(v1[0], v1[1], v2[0], v2[1], boxWidth);
            verticesList.push(this.generateVertices(v1, v2, nFeatures));
            // Because of the features, the exact vertices may vary
            var vert1 = [verticesList[0][0], verticesList[0][1]];
            var vert2 = [verticesList[0][verticesList[0].length - 2], verticesList[0][verticesList[0].length - 1]];
            var listAux = this.generateVertices([vertices[4], vertices[5]],
                [vertices[6], vertices[7]], nFeatures);
            vert2.push(listAux[0], listAux[1]);
            vert1 = [listAux[listAux.length - 2], listAux[listAux.length - 1], vert1[0], vert1[1]];
            verticesList.push(vert2, listAux, vert1);
        }
        return verticesList;
    }

    SceneGenerator.prototype.generateAndAddScene = function (renderer, config, sceneSelector, verticesList, hiddenMaterial, wallMaterial, featureSize, baseSceneName, hiddenBox, emitterSpread, emitterOrigin, emitterLookAt) {
        var vertices = [];
        verticesList.forEach(vertexList => {
            vertices = vertices.concat(vertexList);
        });
        var matParams = [];
        if (hiddenMaterial.matType === sceneData.MaterialType.RoughMirror || hiddenMaterial.matType === sceneData.MaterialType.RoughDielectric) {
            matParams.push(hiddenMaterial.roughness);
        } else if (hiddenMaterial.matType === sceneData.MaterialType.Diffuse) {
            matParams.push(hiddenMaterial.albedo);
        }
        if (hiddenMaterial.matType === sceneData.MaterialType.Dielectric || hiddenMaterial.matType === sceneData.MaterialType.RoughDielectric) {
            matParams.push(hiddenMaterial.ior);
        }
        var wallMatParams = [wallMaterial.albedo];
        if (wallMaterial.matType === sceneData.MaterialType.RoughMirror || wallMaterial.matType === sceneData.MaterialType.RoughDielectric) {
            wallMatParams = [wallMaterial.roughness];
        }
        var ids = this.generate(verticesList, hiddenMaterial.matType, matParams, wallMaterial.matType, wallMatParams);
        // TODO: check necessary additional vars
        var sceneConfig = {
            'shader': ids[0], 'name': 'Custom scene ' + ids[1], 'posA': renderer.scene2canvas(emitterOrigin), 'posB': renderer.scene2canvas(emitterLookAt), 'spread': emitterSpread, 'wallMat': wallMaterial.matType,
            'modifications': {
                'feature_size': featureSize,
                'base_scene': baseSceneName,
                'mat_type': hiddenMaterial.matType,
                'mat_params': matParams,
                'wall_mat_type': wallMaterial.matType,
                'wall_mat_params': wallMatParams
            }
        };
        if (hiddenBox != null) {
            sceneConfig.modifications.x1 = hiddenBox.x1;
            sceneConfig.modifications.x2 = hiddenBox.x2;
            sceneConfig.modifications.y1 = hiddenBox.y1;
            sceneConfig.modifications.y2 = hiddenBox.y2;
            sceneConfig.modifications.width = hiddenBox.width;
        }
        config.scenes.push(sceneConfig);
        sceneSelector.addButton(config.scenes[config.scenes.length - 1].name);
        renderer.addScene(ids[0], verticesList);
    }

    exports.SceneGenerator = SceneGenerator;
})(window.genScene = window.genScene || {});