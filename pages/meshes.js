function Mesh(vdata, fdata) {
	this.VBOdata=vdata;
	this.IBOdata=fdata;

	this.VBO=null;
	this.IBO=null;
}

Mesh.prototype.Render=function(gl) {
	if (this.VBO==null) {
        this.VBO = gl.createBuffer();
        this.IBO = gl.createBuffer();
   
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, this.VBOdata, gl.STATIC_DRAW);

        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.IBOdata, gl.STATIC_DRAW);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IBO);

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0); // position
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12); // normal
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24); // texcoord

    gl.drawElements(gl.TRIANGLES, this.IBOdata.length, gl.UNSIGNED_SHORT, 0);
}

TempVBOdata=new Float32Array([
1,0,0, 0,0,-1, 0,0,
1,1,0, 0,0,-1,1,
0,0,0, 0,0,0,-1,0,
1,0,1, 0,0,0,-1,1,
1,0,0, 1,0,0,1,0,
0,0,1, 1,0,0,1,1,
0,1,0, 1,0,0,1,0,
1,1,1, 1,0,0,1,1,1,0,0,0,-1,0,0,0,0,0,1,0,-1,0,0,1,0,0,0,1,-1,0,0,0,1,0,1,1,-1,0,0,1,1,0,1,0,0,1,0,0,0,1,1,0,0,1,0,1,0,0,1,1,0,1,0,0,1,1,1,1,0,1,0,1,1,1,1,0,1,0,0,0,0,1,0,0,1,0,0,1,0,1,1,1,1,0,0,0,1,1,0,1,1,0,0,1,1,1,0,0,0,-1,0,0,0,0,0,0,0,-1,0,1,0,1,0,1,0,-1,0,0,1,0,0,1,0,-1,0,1,1]);
TempIBOdata=new Uint16Array([
0,2,3,4,6,7,8,10,11,12,14,15,16,18,19,20,22,23,0,3,1,4,7,5,8,11,9,12,15,13,16,19,17,20,23,21]);
var cube= new Mesh(TempVBOdata, TempIBOdata);