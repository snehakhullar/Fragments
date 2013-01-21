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

function CSprite(gl) {
    this.gl=gl;
    this.VBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0]), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    this.program=LoadShaderFromFiles(gl, "shaders/sprite_vs.glsl", "shaders/sprite_fs.glsl", 
            function(prog) {
                prog.PVMatrix=gl.getUniformLocation(prog, "PVMatrix");
                prog.VMatrix=gl.getUniformLocation(prog, "VMatrix");
                prog.uPos=gl.getUniformLocation(prog, "uPos");
                prog.uDim=gl.getUniformLocation(prog, "uDim");
                prog.uTexture0=gl.getUniformLocation(prog, "uTexture0");
                prog.color=gl.getUniformLocation(prog, "color");


                gl.useProgram(prog);

                gl.uniform4f(prog.color, 1,1,1,1);
                gl.uniform1i(prog.uTexture0, 0);

                prog.ready=true;
            }
        );    


    this.programSelection=LoadShaderFromFiles(gl, "shaders/sprite_vs.glsl", "shaders/selection_fs.glsl", 
            function(prog) {
                prog.PVMatrix=gl.getUniformLocation(prog, "PVMatrix");
                prog.VMatrix=gl.getUniformLocation(prog, "VMatrix");
                prog.uPos=gl.getUniformLocation(prog, "uPos");
                prog.uDim=gl.getUniformLocation(prog, "uDim");
                //that.uTexture0Sel=gl.getUniformLocation(prog, "uTexture0");

                //gl.useProgram(prog);
                //gl.uniform1i(that.uTexture0, 0);

                prog.ready=true;
            }
        );  

        this.programDepth=LoadShaderFromFiles(gl, "shaders/sprite_vs.glsl", "shaders/depth_fs.glsl", 
            function(prog) {
                prog.PVMatrix=gl.getUniformLocation(prog, "PVMatrix");
                prog.VMatrix=gl.getUniformLocation(prog, "VMatrix");
                prog.uPos=gl.getUniformLocation(prog, "uPos");
                prog.uDim=gl.getUniformLocation(prog, "uDim");
                //that.uTexture0=gl.getUniformLocation(prog, "uTexture0");
  
                //gl.useProgram(prog);

                //gl.uniform1i(that.uTexture0, 0);

                prog.ready=true;
            }
        );     
}

CSprite.prototype.Begin=function(PVMAT, VMAT, Shader) {
    if (!Shader.ready) return;
    this.CurrentShader=Shader;
    this.gl.useProgram(Shader);

    this.gl.uniformMatrix4fv(Shader.PVMatrix, false, PVMAT);
    this.gl.uniformMatrix4fv(Shader.VMatrix, false, VMAT);
    

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBO);

    this.gl.enableVertexAttribArray(0);
    this.gl.disableVertexAttribArray(1);
    this.gl.disableVertexAttribArray(2);
    this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 8 , 0);
}

CSprite.prototype.End=function() {
    if (!this.ready) return;
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    this.CurrentShader=null;
}

CSprite.prototype.Render=function(_texture, _x, _y, _z, _l, _r, _b, _t) {
    if (this.CurrentShader==null || !this.CurrentShader.ready) return;
    if (_texture != null) _texture.BindTextureAt(this.gl, 0);
    this.gl.uniform3f(this.CurrentShader.uPos, _x, _y, _z);
    this.gl.uniform4f(this.CurrentShader.uDim, _l, _r, _b, _t);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
}
