(function (exports) {
    const RELAY_WALL_COMMENT = '// Relay wall';
    var SceneGenerator = function () {
        this.pattern = new RegExp('// fill');
        this.relayWallPattern = new RegExp(RELAY_WALL_COMMENT);
        this.sceneNumber = 23;
        this.baseShader = Shaders['scene-base'];
        this.created = 0;
    }

    const MaterialType = {
        Diffuse: 2,
        Mirror: 3,
        Dielectric: 4,
        RoughMirror: 5,
        RoughDielectric: 6,
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
                x = [Math.min(1.0, start[0] + Math.abs(featureSize) / 2), Math.min(1.0, start[0] - Math.abs(featureSize) / 2)];
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

    exports.SceneGenerator = SceneGenerator;
    exports.MaterialType = MaterialType;
})(window.genScene = window.genScene || {});