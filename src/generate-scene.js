(function (exports) {
    const RELAY_WALL_COMMENT = '// Relay wall';
    var SceneGenerator = function () {
        this.pattern = new RegExp('// fill');
        this.relayWallPattern = new RegExp(RELAY_WALL_COMMENT);
        this.sceneNumber = 17;
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

        return shader.replace(this.pattern, text);
    }

    SceneGenerator.prototype.generateIntersect = function (vertices, matType) {
        if (vertices.length > 0 && vertices.length < 4) {
            alert('Insufficient number of vertices');
            return '';
        }

        var text = '';
        var i = 0;
        while (i + 3 < vertices.length) {
            v = [];
            for (var j = 0; j < 4; j++) {
                v.push(toPrint(vertices[i+j]));
            }
            text += 'lineIntersect(ray, vec2(' + v[0] + ', ' + v[1] + '), ' +
                'vec2(' + v[2] + ', ' + v[3] + '), ' + matType.toFixed(1) + ', isect);\n';
            i += 2;
        }
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
        var y = [Math.min(0.999, start[1] - Math.abs(featureSize) / 2), Math.min(0.999, start[1] + Math.abs(featureSize) / 2)];
        for (var i = 0; i <= nFeatures; i++) {
            res.push(x[i]);
            // if (i == 0)
                // res.push(start[1]);
            // else if (i == nFeatures)
                // res.push(end[1]);
            // else
                res.push(y[i % 2]);
        }
        return res;
    }

    exports.SceneGenerator = SceneGenerator;
    exports.MaterialType = MaterialType;
})(window.genScene = window.genScene || {});