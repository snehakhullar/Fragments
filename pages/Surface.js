function Surface(ru, rv, u0, v0, u1, v1, funcx, funcy, funcz) {
    this.ru=ru;
    this.rv=rv;

    this.u0=u0;
    this.v0=v0;
    this.u1=u1;
    this.v1=v1;

    this.fx=funcx;
    this.fy=funcy;
    this.fz=funcz;

    this.VBOdata=null;
    this.IBOdata=null;

    this.VBO = null;
    this.IBO = null;

    this.updateneeded=true;
}

Surface.prototype.UpdateGeometry = function (gl){
    var du=(this.u1-this.u0)/(this.ru-1);
    var dv=(this.v1-this.v0)/(this.rv-1);

    var va=new Array();
    var ia=new Array();

    var dd=0.0001;
    var ddu=vec3.create();
    var ddv=vec3.create();
    var normal=vec3.create();

    for(var j=0; j<this.rv; ++j) {
        var v=this.v0+j*dv;
        for (var i=0; i<this.ru; ++i) {
            var u=this.u0+i*du;
            var x=this.fx(u,v);
            var y=this.fy(u,v);
            var z=this.fz(u,v);

            ddu[0]=this.fx(u+dd, v)-this.fx(u-dd, v);
            ddu[1]=this.fy(u+dd, v)-this.fy(u-dd, v);
            ddu[2]=this.fz(u+dd, v)-this.fz(u-dd, v);

            ddv[0]=this.fx(u, v+dd)-this.fx(u, v-dd);
            ddv[1]=this.fy(u, v+dd)-this.fy(u, v-dd);
            ddv[2]=this.fz(u, v+dd)-this.fz(u, v-dd);

            vec3.cross(ddu,ddv,normal);

            va.push(x);
            va.push(y);
            va.push(z);
            va.push(normal[0]);
            va.push(normal[1]);
            va.push(normal[2]);
            va.push(u);
            va.push(v);
        }
    }

    for(var j=0; j<this.rv-1; ++j) {
        for (var i=0; i<this.ru-1; ++i) {
            var i0=j*this.ru+i;

            ia.push(i0);
            ia.push(i0+1);
            ia.push(i0+this.ru+1);

            ia.push(i0);
            ia.push(i0+this.ru+1);
            ia.push(i0+this.ru);
        }
    }

    this.VBOdata = new Float32Array(va);
    this.IBOdata = new Uint16Array(ia);

    if (this.VBO==null) {
        this.VBO = gl.createBuffer();
        this.IBO = gl.createBuffer();
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.VBO);
    gl.bufferData(gl.ARRAY_BUFFER, this.VBOdata, gl.STATIC_DRAW);

    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IBO);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.IBOdata, gl.STATIC_DRAW);

    this.updateneeded=false;
}

Surface.prototype.Render=function (gl) {
    if(this.updateneeded) {
        this.UpdateGeometry(gl);
        
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