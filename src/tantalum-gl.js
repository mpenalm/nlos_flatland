var tgl = {'init': function(gl, multiBufExt) {
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
    
    tgl.Texture = function(width, height, channels, isFloat, isLinear, isClamped, texels) {
        if (width != undefined) {
            var coordMode = isClamped ? gl.CLAMP_TO_EDGE : gl.REPEAT;
            this.type     = isFloat   ? gl.FLOAT         : gl.UNSIGNED_BYTE;
            this.channels = channels;
            this.format   = [gl.LUMINANCE, gl.RG, gl.RGB, gl.RGBA][channels - 1];
            
            this.width  = width;
            this.height = height;
        
            this.glName = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.glName);
            gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.width, this.height, 0, this.format, this.type, texels);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, coordMode);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, coordMode);
            this.setSmooth(isLinear);
            
            this.boundUnit = -1;
        }
    }

    tgl.Texture.prototype.getArray = function(size, tex2, offset=1) {
        var width = this.width;
        var height = this.height;

        // alocate the array for holding the RGBA pixel data
        var texels = null;
        if (this.type === gl.FLOAT)
            texels = new Float32Array(4 * width * height);
        else
            texels = new Uint8Array(4 * width * height);

        // here we use a framebuffer as an offscreen render object
        // draw the texture into it and then copy the pixel values into a local array.
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.glName, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
            gl.readPixels(0, 0, width, height, gl.RGBA, this.type, texels);
        }

        if (tex2) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex2.glName, 0);
            var texels2 = null;
            if (this.type === gl.FLOAT)
                texels2 = new Float32Array(4 * width * height);
            else
                texels2 = new Uint8Array(4 * width * height);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
                gl.readPixels(0, 0, width, height, gl.RGBA, this.type, texels2);
            }

            for (let i = 0; i < texels.length; i += 4) {
                for (let j = 0; j < offset; j++) {
                    texels[i+offset+j] = texels2[i+j];
                }
            }
        }
    
        // unbind this framebuffer so its memory can be reclaimed.
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return texels.slice(0, 4 * size);
    }

    tgl.Texture.prototype.copyTexture = function(tex, tex2, offset=1) {
        var coordMode = gl.CLAMP_TO_EDGE;
        this.type     = tex.type;
        this.format   = tex.format;

        this.width = tex.width;
        this.height = tex.height;
        var width = this.width;
        var height = this.height;

        // alocate the array for holding the RGBA pixel data
        var texels = null;
        if (this.type === gl.FLOAT)
            texels = new Float32Array(4 * width * height);
        else
            texels = new Uint8Array(4 * width * height);
    
        // here we use a framebuffer as an offscreen render object
        // draw the texture into it and then copy the pixel values into a local array.
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex.glName, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
            gl.readPixels(0, 0, width, height, gl.RGBA, this.type, texels);
        }

        if (tex2) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex2.glName, 0);
            var texels2 = null;
            if (this.type === gl.FLOAT)
                texels2 = new Float32Array(4 * width * height);
            else
                texels2 = new Uint8Array(4 * width * height);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
                gl.readPixels(0, 0, width, height, gl.RGBA, this.type, texels2);
            }

            for (let i = 0; i < texels.length; i += 4) {
                for (let j = 0; j < offset; j++) {
                    texels[i+offset+j] = texels2[i+j];
                }
            }
        }
    
        // unbind this framebuffer so its memory can be reclaimed.
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.glName = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.glName);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.width, this.height, 0, this.format, this.type, texels);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, coordMode);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, coordMode);
        this.setSmooth(false);
        this.boundUnit = tex.boundUnit;

    }
    
    tgl.Texture.prototype.setSmooth = function(smooth) {
        var interpMode = smooth ? gl.LINEAR : gl.NEAREST;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, interpMode);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, interpMode);
    }
    
    tgl.Texture.prototype.copy = function(texels) {
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.width, this.height, 0, this.format, this.type, texels);
    }
    
    tgl.Texture.prototype.bind = function(unit) {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, this.glName);
        this.boundUnit = unit;
    }

    tgl.Texture.prototype.clear = function() {
        const textureData = new Float32Array(this.width * this.height * this.channels); // Assuming RGBA format
        for (let i = 0; i < textureData.length; i++) {
            textureData[i] = 0.0;
        }

        gl.bindTexture(gl.TEXTURE_2D, this.glName);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format, this.width, this.height, 0, this.format, this.type, textureData);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    tgl.RenderTarget = function() {
        this.glName = gl.createFramebuffer();
    }
    
    tgl.RenderTarget.prototype.bind = function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.glName);
    }
    
    tgl.RenderTarget.prototype.unbind = function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    
    tgl.RenderTarget.prototype.attachTexture = function(texture, index) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, texture.glName, 0);
    }
    
    tgl.RenderTarget.prototype.detachTexture = function(index) {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, null, 0);
    }
    
    tgl.RenderTarget.prototype.drawBuffers = function(numBufs) {
        var buffers = [];
        for (var i = 0; i < numBufs; ++i)
            buffers.push(gl.COLOR_ATTACHMENT0 + i);
        multiBufExt.drawBuffersWEBGL(buffers);
    }
    
    tgl.Shader = function(shaderDict, vert, frag) {
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
    
    tgl.Shader.prototype.bind = function() {
        gl.useProgram(this.program);
    }
    
    tgl.Shader.prototype.createShaderObject = function(shaderDict, name, isFragment) {
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
    
    tgl.Shader.prototype.resolveShaderSource = function(shaderDict, name) {
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
    
    tgl.Shader.prototype.uniformIndex = function(name) {
        if (!(name in this.uniforms))
            this.uniforms[name] = gl.getUniformLocation(this.program, name);
        return this.uniforms[name];
    }
    
    tgl.Shader.prototype.uniformTexture = function(name, texture) {
        var id = this.uniformIndex(name);
        if (id != -1)
            gl.uniform1i(id, texture.boundUnit);
    }
    
    tgl.Shader.prototype.uniformF = function(name, f) {
        var id = this.uniformIndex(name);
        if (id != -1)
            gl.uniform1f(id, f);
    }
    
    tgl.Shader.prototype.uniform2F = function(name, f1, f2) {
        var id = this.uniformIndex(name);
        if (id != -1)
            gl.uniform2f(id, f1, f2);
    }

    tgl.Shader.prototype.uniform4F = function(name, f1, f2, f3, f4) {
        var id = this.uniformIndex(name);
        if (id != -1)
            gl.uniform4f(id, f1, f2, f3, f4);
    }

    tgl.Shader.prototype.uniformFV = function(name, v) {
        var id = this.uniformIndex(name);
        if (id != -1)
            gl.uniform1fv(id, v);
    }

    tgl.Shader.prototype.uniformI = function(name, i) {
        var id = this.uniformIndex(name);
        if (id != -1)
            gl.uniform1i(id, i);
    }
    
    tgl.VertexBuffer = function() {
        this.attributes = [];
        this.elementSize = 0;
    }
    
    tgl.VertexBuffer.prototype.bind = function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);
    }
    
    tgl.VertexBuffer.prototype.addAttribute = function(name, size, type, norm) {
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
    
    tgl.VertexBuffer.prototype.init = function(numVerts) {
        this.length = numVerts;
        this.glName = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glName);
        gl.bufferData(gl.ARRAY_BUFFER, this.length*this.elementSize, gl.STATIC_DRAW);
    }
    
    tgl.VertexBuffer.prototype.copy = function(data) {
        if (data.byteLength != this.length*this.elementSize)
            throw new Error("Resizing VBO during copy strongly discouraged");
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }
    
    tgl.VertexBuffer.prototype.draw = function(shader, mode, length) {
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