var modelcounter=1;
var allmodels=[];
//var mouseoverid=0;

function CModel(mesh, x, y, z){
	this.modelmatrix=mat4.create();
	mat4.identity(this.modelmatrix);

	this.mesh=mesh;

	this.id=modelcounter;
	modelcounter++;

	this.SetTranslation(x,y,z);	

	allmodels.push(this);
}

CModel.prototype.SetTranslation=function(x,y,z) {
	this.x=x;
	this.y=y;
	this.z=z;

	this.modelmatrix[12]=x;
	this.modelmatrix[13]=y;
	this.modelmatrix[14]=z;
}

CModel.prototype.Render=function (gl, shader) {
	var UId=gl.getUniformLocation(shader, "uMMatrix4");
    gl.uniformMatrix4fv(UId, false, this.modelmatrix);

    UId=gl.getUniformLocation(shader, "uId");
    gl.uniform1i(UId, this.id);

    UId=gl.getUniformLocation(shader, "uColor");
    if (mouseoverid==this.id) {
    	 gl.uniform4f(UId, 1.0, 0.0, 0.0, 1.0);
    }
    else {
    	gl.uniform4f(UId, 1.0, 1.0, 1.0, 1.0);
    }

    this.mesh.Render(gl);
}


function FindModelFromId(id) {
	for(var i=0; i<allmodels.length; ++i) {
		if (allmodels[i].id==id) return allmodels[i];
	}

	return null;
}

function RenderModels(gl, shader) {
	for(var i=0; i<allmodels.length; ++i) {
		allmodels[i].Render(gl,shader);
	}
}

function DeleteModel(c) {
	for (var i=0;  i<allmodels.length; ++i) {
		if (allmodels[i]==c) {
			allmodels.splice(i,1);
			return;
		}
	}
}