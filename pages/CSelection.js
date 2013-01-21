/*
* Copyright (c) 2012 Panagiotis Michalatos [www.sawapan.eu]
*
* This software is provided 'as-is', without any express or implied
* warranty. In no event will the authors be held liable for any damages
* arising from the use of this software.
*
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
*
*    1. The origin of this software must not be misrepresented; you must not
*    claim that you wrote the original software. If you use this software
*    in a product, an acknowledgment in the product documentation would be
*    appreciated but is not required.
*
*    2. Altered source versions must be plainly marked as such, and must not
*    be misrepresented as being the original software.
*
*    3. This notice may not be removed or altered from any source
*    distribution.
*/


function SelectionEngine(gl) {
    this.BufferSize = 2;

    this.SelectionFBO = new CFBO(gl, this.BufferSize, this.BufferSize, false);
    //this.SelectionSprite = new CSprite(this.SelectionFBO, 0.0, 0.0, 0.5, 0.5, 1.0, 0.5, 1.0, scene.Materials2D.Sprite2D);
    this.SelectionPixel = new Uint8Array(4);

    this.DepthFBO = new CFBO(gl, this.BufferSize, this.BufferSize, false);
    //  this.DepthSprite = new CSprite(this.DepthFBO, 0.0, 0.0, 0.5, 0.5, 1.0, 0.5, 1.0, this.Materials2D.Sprite2D);
    this.DepthPixel = new Uint8Array(4);

    this.PickX = 0.0;
    this.PickY = 0.0;
    this.PickW = this.BufferSize;
    this.PickH = this.BufferSize;

    //........pickmatrix entries
    this.PickMatrix = mat4.create();
    mat4.identity(this.PickMatrix);

    this.PVmatrix = mat4.create();
    mat4.identity(this.PVmatrix);


    this.InversePVmatrix = mat4.create();
}

SelectionEngine.prototype.BeginIndexRendering = function (gl, shader, _x, _y, PVmatrix) {
    this.PickX = _x;
    this.PickY = height-_y;

    this.outsidePVmatrix=PVmatrix;
    mat4.set(this.outsidePVmatrix, this.PVmatrix);
    this.shader=shader;

    gl.useProgram(this.shader);

    this.PickMatrix[0] = width / this.PickW;
    this.PickMatrix[5] = height / this.PickH;
    this.PickMatrix[12] = (width - 2.0 * this.PickX) / this.PickW;
    this.PickMatrix[13] = (height - 2.0 * this.PickY) / this.PickH;

    mat4.multiply(this.PickMatrix, this.PVmatrix, this.outsidePVmatrix);


      //....................................
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);

    //.....................................Selection buffer
    this.SelectionFBO.BindFBO(gl);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}


SelectionEngine.prototype.EndIndexRendering = function (gl) {
    

    gl.readPixels(Math.floor(this.BufferSize / 2), Math.floor(this.BufferSize / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.SelectionPixel);

    this.SelectionFBO.UnBindFBO(gl);
   // var newindex = ((this.SelectionPixel[0]) | (this.SelectionPixel[1] << 8) | (this.SelectionPixel[2] << 16) | (this.SelectionPixel[3] << 24));
    var newindex = ((this.SelectionPixel[0]) + (this.SelectionPixel[1] *255) + (this.SelectionPixel[2] *255*255) + (this.SelectionPixel[3] *255*255*255));

    mat4.set(this.PVmatrix, this.outsidePVmatrix);
    var UId=gl.getUniformLocation(this.shader, "uPVMatrix4");
    gl.uniformMatrix4fv(UId, false, this.PVmatrix);  
     gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.ONE);

    return newindex;
}

SelectionEngine.prototype.BeginDepthRendering = function (gl, shader, _x, _y, PVmatrix) {
    this.PickX = _x;
    this.PickY = height-_y;

    this.outsidePVmatrix=PVmatrix;
    mat4.set(this.outsidePVmatrix, this.PVmatrix);

    mat4.inverse(this.PVmatrix, this.InversePVmatrix);

    this.shader=shader;

    gl.useProgram(this.shader);

    this.PickMatrix[0] = width / this.PickW;
    this.PickMatrix[5] = height / this.PickH;
    this.PickMatrix[12] = (width - 2.0 * this.PickX) / this.PickW;
    this.PickMatrix[13] = (height - 2.0 * this.PickY) / this.PickH;

    mat4.multiply(this.PickMatrix, this.PVmatrix, this.outsidePVmatrix);

     //....................................
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    //gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.ONE);
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);


    //.....................................Depth buffer
    this.DepthFBO.BindFBO(gl);    
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

SelectionEngine.prototype.EndDepthRendering = function (gl, _p2, _p3) {
    gl.readPixels(Math.floor(this.BufferSize / 2), Math.floor(this.BufferSize / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.DepthPixel);
    this.DepthFBO.UnBindFBO(gl);

    _p2[0] =  2.0 * ((this.PickX / (width)) - 0.5);
    _p2[1] =  2.0 * ((this.PickY / (height)) - 0.5);
    //_p2[2] = ( ( (this.DepthPixel[0] / (256.0) + this.DepthPixel[1]) / (256.0 ) + this.DepthPixel[2]) / (256.0) + this.DepthPixel[3]) / (256.0);
    _p2[2] = this.DepthPixel[0] / (256.0*256.0*256.0*256.0) + this.DepthPixel[1]/(256.0*256.0*256.0) + this.DepthPixel[2]/(256.0*256.0) + this.DepthPixel[3]/ (256.0);
  // _p2[2] = this.DepthPixel[3] / (255.0*255.0*255.0*255.0) + this.DepthPixel[2]/(255.0*255.0*255.0) + this.DepthPixel[1]/(255.0*255.0) + this.DepthPixel[0]/ (255.0);
    //_p2[2]=_p2[2]*2-1;
    _p2[2]=(1/(2*_p2[2]))-1;
    //_p2[2] = ( ( (this.DepthPixel[0] / (255.0) + this.DepthPixel[1]) / (255.0 ) + this.DepthPixel[2]) / (255.0) + this.DepthPixel[3]) / (255.0);

    this.UnProjectPoint(_p2, _p3);

    mat4.set(this.PVmatrix, this.outsidePVmatrix);
    var UId=gl.getUniformLocation(this.shader, "uPVMatrix4");
    gl.uniformMatrix4fv(UId, false, this.PVmatrix);  
     gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.SRC_ALPHA, gl.ONE);
}

SelectionEngine.prototype.UnProjectPoint = function (_p2, _p3) {
    //Transformation of normalized coordinates between -1 and 1
    var np = vec4.createXYZW(_p2[0], _p2[1], _p2[2], 1.0);
   
    mat4.multiplyVec4(this.InversePVmatrix, np);

    _p3[0] = np[0];
    _p3[1] = np[1];
    _p3[2] = np[2];

    if (np[3] != 0.0) {
        _p3[0] /= np[3];
        _p3[1] /= np[3];
        _p3[2] /= np[3];
    }
}

SelectionEngine.prototype.UnProjectPointXYZ = function (x,y,z, _p3) {
    //Transformation of normalized coordinates between -1 and 1
    var np = vec4.createXYZW(x, y, z, 1.0);
   
    mat4.multiplyVec4(this.InversePVmatrix, np);

    _p3[0] = np[0];
    _p3[1] = np[1];
    _p3[2] = np[2];

    if (np[3] != 0.0) {
        _p3[0] /= np[3];
        _p3[1] /= np[3];
        _p3[2] /= np[3];
    }
}