var pgl = {'init': function(gl) {
    function glTypeSize(type) {
        switch (type) {
        case gl.BYTE:
        case gl.UNSIGNED_BYTE:
            return 1;
        case gl.SHORT:
        case gl.UNSIGNED_SHORT:
            return 2;
        case gl.INT:
        case gl.UNSIGNED_INT:
        case gl.FLOAT:
            return 4;
        default:
            return 0;
        }
    }

    pgl.Shader = function(shaderDict, vert, frag) {
        this.vertex   = this.createShaderObject(shaderDict, vert, false);
        this.fragment = this.createShaderObject(shaderDict, frag, true);
        
        this.program = gl.createProgram();
        gl.attachShader(this.program, this.vertex);
        gl.attachShader(this.program, this.fragment);
        gl.linkProgram(this.program);
        
        this.uniforms = {};

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
            alert("Could not initialise shaders");
    }
    
    pgl.Shader.prototype.bind = function() {
        gl.useProgram(this.program);
    }
    
    pgl.Shader.prototype.createShaderObject = function(shaderDict, name, isFragment) {
        var shaderSource = this.resolveShaderSource(shaderDict, name);
        var shaderObject = gl.createShader(isFragment ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER);
        gl.shaderSource(shaderObject, shaderSource);
        gl.compileShader(shaderObject);

        if (!gl.getShaderParameter(shaderObject, gl.COMPILE_STATUS)) {
            /* Add some line numbers for convenience */
            var lines = shaderSource.split("\n");
            for (var i = 0; i < lines.length; ++i)
                lines[i] = ("   " + (i + 1)).slice(-4) + " | " + lines[i];
            shaderSource = lines.join("\n");
        
            throw new Error(
                (isFragment ? "Fragment" : "Vertex") + " shader compilation error for shader '" + name + "':\n\n    " +
                gl.getShaderInfoLog(shaderObject).split("\n").join("\n    ") +
                "\nThe expanded shader source code was:\n\n" +
                shaderSource);
        }

        return shaderObject;
    }
    
    pgl.Shader.prototype.resolveShaderSource = function(shaderDict, name) {
        if (!(name in shaderDict))
            throw new Error("Unable to find shader source for '" + name + "'");
        var shaderSource = shaderDict[name];
        
        /* Rudimentary include handling for convenience.
           Not the most robust, but it will do for our purposes */
        var pattern = new RegExp('#include "(.+)"');
        var match;
        while (match = pattern.exec(shaderSource)) {
            shaderSource = shaderSource.slice(0, match.index) +
                           this.resolveShaderSource(shaderDict, match[1]) +
                           shaderSource.slice(match.index + match[0].length);
        }
        
        return shaderSource;
    }
    
    pgl.Shader.prototype.uniformIndex = function(name) {
        if (!(name in this.uniforms))
            this.uniforms[name] = gl.getUniformLocation(this.program, name);
        return this.uniforms[name];
    }
    
    pgl.Shader.prototype.uniformTexture = function(name, texture) {
        var id = this.uniformIndex(name);
        if (id != -1)
            gl.uniform1i(id, texture.boundUnit);
    }
    
    pgl.Shader.prototype.uniformF = function(name, f) {
        var id = this.uniformIndex(name);
        if (id != -1)
            gl.uniform1f(id, f);
    }
    
    pgl.Shader.prototype.uniform2F = function(name, f1, f2) {
        var id = this.uniformIndex(name);
        if (id != -1)
            gl.uniform2f(id, f1, f2);
    }

    pgl.Shader.prototype.uniform4F = function(name, f1, f2, f3, f4) {
        var id = this.uniformIndex(name);
        if (id != -1)
            gl.uniform4f(id, f1, f2, f3, f4);
    }

    pgl.Shader.prototype.uniformFV = function(name, v) {
        var id = this.uniformIndex(name);
        if (id != -1)
            gl.uniform1fv(id, v);
    }

    pgl.Shader.prototype.uniformI = function(name, i) {
        var id = this.uniformIndex(name);
        if (id != -1)
            gl.uniform1i(id, i);
    }
    
    pgl.VertexBuffer = function() {
        this.attributes = [];
        this.elementSize = 0;
    }
    
    pgl.VertexBuffer.prototype.bind = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);
    }
    
    pgl.VertexBuffer.prototype.addAttribute = function(name, size, type, norm) {
        this.attributes.push({
            "name": name,
            "size": size,
            "type": type,
            "norm": norm,
            "offset": this.elementSize,
            "index": -1
        });
        this.elementSize += size*glTypeSize(type);
    }
    
    pgl.VertexBuffer.prototype.init = function(numVerts) {
        this.length = numVerts;
        this.glName = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);
        gl.bufferData(gl.ARRAY_BUFFER, this.length*this.elementSize, gl.STATIC_DRAW);
    }
    
    pgl.VertexBuffer.prototype.copy = function(data) {
        if (data.byteLength != this.length*this.elementSize)
            throw new Error("Resizing VBO during copy strongly discouraged");
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }
    
    pgl.VertexBuffer.prototype.draw = function(shader, mode, length) {
        for (var i = 0; i < this.attributes.length; ++i) {
            this.attributes[i].index = gl.getAttribLocation(shader.program, this.attributes[i].name);
            if (this.attributes[i].index >= 0) {
                var attr = this.attributes[i];
                gl.enableVertexAttribArray(attr.index);
                gl.vertexAttribPointer(attr.index, attr.size, attr.type, attr.norm, this.elementSize, attr.offset);
            }
        }
        
        gl.drawArrays(mode, 0, length ? length : this.length);
        
        for (var i = 0; i < this.attributes.length; ++i) {
            if (this.attributes[i].index >= 0) {
                gl.disableVertexAttribArray(this.attributes[i].index);
                this.attributes[i].index = -1;
            }
        }
    }
}};