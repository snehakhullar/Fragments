var fragmentscounter=1;
var fragments=[];
var mouseoverid=0;

function CFragment(gl, serverfile, title, date, desc) {
	
	this.modelmatrix=mat4.create();
	mat4.identity(this.modelmatrix);

	this.x=0.0;
	this.y=0.0;
	this.z=0.0;

	this.viewp=vec3.create();

	this.Width=4.0;
	this.Height=4.0;

	var fileext=serverfile.split('.').pop();// extention of serverfile

	this.title=title;
	this.date=date;
	this.desc=desc;
	this.serverfile=serverfile;

	if (fileext=='json') {
		this.BuildModel(gl);
	}	
	else {
		this.BuildTexture(gl);
	}


	this.Relations=[];
	
	/*if (this.fileexe == "jpg" || "png" || "tif" || "gif") { 
		this.image = serverfile;
	}
	if else (this.fileexe == "3dx") {
		this.
	}*/
	//this.texture=null;
	//this.mesh=null;

	this.editing=false;

	this.id=fragmentscounter;
	fragmentscounter++;

	fragments.push(this);
}

CFragment.prototype.BuildModel=function(gl) {
	var that=this;
	$.getJSON(this.serverfile, function(data) {
		that.mesh=new Mesh(new Float32Array(data.VBOdata), new Uint16Array(data.IBOdata));
	}
	);

}

CFragment.prototype.BuildTexture=function(gl) {
	this.texture=new CTexture(gl, this.serverfile, this.onload);

}

CFragment.prototype.onload=function(gl, tex) {
	tex.Ratio=tex.Height/tex.Width;
}

CFragment.prototype.GlobalToLocal=function(pg) {

	if (this.texture) { //image
		var dv=vec3.create();

		vec3.subtract(pg, this.viewp, dv);

		//var dy=dv[2];
		//var dx=Math.sqrt(dv[0]*dv[0]+dv[1]*dv[1]);
		dy=vec3.dot(dv, camera.viewY);
		dx=vec3.dot(dv, camera.viewX);

		if (this.Window) {
			dy+=this.Height*0.5;
			dx+=this.Width*0.5;
		}
		else {
			dx+=this.Width*0.5;
		}

		dx/=this.Width;
		dy/=this.Height;

		var res=vec3.create();
		res[0]=dx;
		res[1]=dy;
		res[2]=0.0;
		return res;
	}
	else { //mesh
		var res=vec3.create();
		res[0]=pg[0]-this.viewp[0];
		res[1]=pg[1]-this.viewp[1];
		res[2]=pg[2]-this.viewp[2];
		return res;
	}

}

CFragment.prototype.LocalToGlobal=function(pl) {
	if (this.texture) { //image
		var res=vec3.create();
		res[0]=this.viewp[0]+(pl[0]-0.5)*camera.viewX[0]*this.Width;
		res[1]=this.viewp[1]+(pl[0]-0.5)*camera.viewX[1]*this.Width;
		res[2]=this.viewp[2]+(pl[0]-0.5)*camera.viewX[2]*this.Width;

		if (this.Window) {
			res[0]+=(pl[1]-0.5)*camera.viewY[0]*this.Height;
			res[1]+=(pl[1]-0.5)*camera.viewY[1]*this.Height;
			res[2]+=(pl[1]-0.5)*camera.viewY[2]*this.Height;
		}
		else {
			res[0]+=(pl[1])*camera.viewY[0]*this.Height;
			res[1]+=(pl[1])*camera.viewY[1]*this.Height;
			res[2]+=(pl[1])*camera.viewY[2]*this.Height;
		}
		return res;
	}
	else { //mesh
		var res=vec3.create();
		res[0]=pl[0]+this.viewp[0];
		res[1]=pl[1]+this.viewp[1];
		res[2]=pl[2]+this.viewp[2];

		return res;
	}
}

CFragment.prototype.Render=function(gl, SpriteShader, ObjectShader) {

	

	if (this.texture) { //image
		gl.useProgram(SpriteShader);
		this.Height=this.Width*this.texture.Ratio;

		sprite.Begin(PVMat, ViewMat, SpriteShader);
		var UId=gl.getUniformLocation(SpriteShader, "uId");
		gl.uniform1i(UId, this.id);

		if (this.Window) {

			glsel.UnProjectPointXYZ(2.0*((this.Window.cx/width)-0.5), 2.0*((this.Window.cy/height)-0.5), 0.9, this.viewp);
			
			sprite.Render(this.texture, this.viewp[0], this.viewp[1], this.viewp[2], -0.5*this.Width, 0.5*this.Width, -0.5*this.Height, 0.5*this.Height);
		}
		else {
			this.viewp[0]=this.x;
			this.viewp[1]=this.y;
			this.viewp[2]=this.z;
			sprite.Render(this.texture, this.x, this.y, this.z, -0.5*this.Width, 0.5*this.Width, 0.0, this.Height);
		}

		sprite.End();
	}
	else if (this.mesh) {  //mesh
		gl.useProgram(ObjectShader);
		

    	var UId=gl.getUniformLocation(ObjectShader, "uId");
		gl.uniform1i(UId, this.id);

		if (this.Window) {
			glsel.UnProjectPointXYZ(2.0*((this.Window.cx/width)-0.5), 2.0*((this.Window.cy/height)-0.5), 0.9, this.viewp);
			this.modelmatrix[12]=this.viewp[0];
			this.modelmatrix[13]=this.viewp[1];
			this.modelmatrix[14]=this.viewp[2];
		}
		else {
			this.modelmatrix[12]=this.x;
			this.modelmatrix[13]=this.y;
			this.modelmatrix[14]=this.z;

			this.viewp[0]=this.x;
			this.viewp[1]=this.y;
			this.viewp[2]=this.z;
		}

		UId=gl.getUniformLocation(ObjectShader, "uMMatrix4");
    	gl.uniformMatrix4fv(UId, false, this.modelmatrix);
		this.mesh.Render(gl);
	}

}

function RenderFragments(gl, SpriteShader, ObjectShader) {
	for(var i=0; i<fragments.length; ++i) {
		fragments[i].Render(gl, SpriteShader, ObjectShader);	
	}
}

function FindFragmentromId(id) {
	for(var i=0; i<fragments.length; ++i) {
		if (fragments[i].id==id) return fragments[i];
	}

	return null;
}

var relations=[];

function CRelation() {
	this.type="";
	this.anchors=[];

	relations.push(this);
}

CRelation.prototype.Render=function(gl) {

	var p0=this.anchors[0].fragment.LocalToGlobal(this.anchors[0].point);
	var p1=this.anchors[1].fragment.LocalToGlobal(this.anchors[1].point);

	line.Draw(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2]);

}

CRelation.prototype.RenderIcon=function(gl) {

	if (iconTextures[this.type]) { 
		var p0=this.anchors[0].fragment.LocalToGlobal(this.anchors[0].point);
		var p1=this.anchors[1].fragment.LocalToGlobal(this.anchors[1].point);

		sprite.Render(iconTextures[this.type], (p0[0]+p1[0])/2, (p0[1]+p1[1])/2, (p0[2]+p1[2])/2, -0.50, 0.50, -0.50, 0.50);
	}
}

function BuildRelation(fragmentstart, fragmentstartPoint, fragmentend, fragmentendPoint, type) {
	this.fragmentstart=fragmentstart;
	this.fragmentstartPoint=fragmentstartPoint;
	this.fragmentend=fragmentend;
	this.fragmentendPoint=fragmentendPoint;
	
	var rel=new CRelation();
	rel.type=type;
	rel.anchors.push({fragment:fragmentstart, point:fragmentstartPoint});
	rel.anchors.push({fragment:fragmentend, point:fragmentendPoint});

	fragmentstart.Relations.push(rel);

	if (fragmentend!=fragmentstart)
		fragmentend.Relations.push(rel);

}