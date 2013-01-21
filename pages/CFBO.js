function CFBO(gl, _w, _h, _smoothtexture) {

    this.Width = _w;
    this.Height = _h;

    this.FBO = gl.createFramebuffer();
    this.RBO = gl.createRenderbuffer()

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.RBO);

    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _w, _h);

    this.Texture = NewTexture(gl, _w, _h, _smoothtexture);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.Texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.RBO);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO);
    var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    switch (status) {
        case gl.FRAMEBUFFER_COMPLETE:
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
            throw ("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_ATTACHMENT");
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
            throw ("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT");
            break;
        case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
            throw ("Incomplete framebuffer: FRAMEBUFFER_INCOMPLETE_DIMENSIONS");
            break;
        case gl.FRAMEBUFFER_UNSUPPORTED:
            alert("FRAMEBUFFER_UNSUPPORTED by WebGL Driver")
            throw ("Incomplete framebuffer: FRAMEBUFFER_UNSUPPORTED");
            break;
        default:
            throw ("Incomplete framebuffer: " + status);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

CFBO.prototype.BindFBO = function (gl) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.FBO);
    gl.viewport(0, 0, this.Width, this.Height);

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

CFBO.prototype.UnBindFBO = function (gl) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, width, height);
}

CFBO.prototype.BindTexture = function (gl) {
    gl.bindTexture(gl.TEXTURE_2D, this.Texture);
}

CFBO.prototype.BindTextureAt = function (gl, _t) {
    gl.activeTexture(gl.TEXTURE0 + _t);
    gl.bindTexture(gl.TEXTURE_2D, this.Texture);
}

function NewTexture(gl, _w, _h, _smoothtexture) {
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);

    emptyTexImage2D(gl, gl.RGBA, _w, _h, gl.RGBA, gl.UNSIGNED_BYTE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    if (_smoothtexture) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
    else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    }

    t.Width = _w;
    t.Height = _h;
    return t;
}

function emptyTexImage2D(gl, _internalFormat, _w, _h, _format, _type) {
    try {
        gl.texImage2D(gl.TEXTURE_2D, 0, _internalFormat, _width, _height, 0, _format, _type, null);
    } catch (e) {
        var pixels = new Uint8Array(_w * _h * (_internalFormat == gl.RGBA ? 4 : 3));
        gl.texImage2D(gl.TEXTURE_2D, 0, _internalFormat, _w, _h, 0, _format, _type, pixels);
    }
}