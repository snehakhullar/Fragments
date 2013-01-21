var dummycanvas=document.createElement("canvas");
var c2d = dummycanvas.getContext("2d");

function CTexture(_gl, _fileorcanvas, _onload) {
    this.Img=null;
    this.Texture = null;
    this.Width = 0;
    this.Height = 0;
    this.Ready=false;
   
   if (_fileorcanvas.width) {
    this.FromCanvas(_gl, _fileorcanvas);    
   }
   else {
    this.Load(_gl, _fileorcanvas, _onload);
   }
    
}

CTexture.prototype.FromCanvas = function (gl, _canvas) {
    if (_canvas == null) return;
    if (this.Texture == null) {
        this.Texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.Texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    gl.bindTexture(gl.TEXTURE_2D, this.Texture);
    //if (true){//this.Width != this.Canvas.width || this.Height != this.Canvas.height) {
        this.Width = _canvas.width;
        this.Height = _canvas.height;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _canvas);
   // }
   // else {
   //     gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.Canvas);
  //  }
    gl.bindTexture(gl.TEXTURE_2D, null);
}

CTexture.prototype.Load=function(gl, _file, _onload) {
  this.Img = new Image();
  var that = this;
  this.Img.onload = function () { that.Loaded(gl, _onload); }
  this.Img.src = _file;
}


CTexture.prototype.Loaded = function (gl, _onload) {
    this.Width = this.Img.width;
    this.Height = this.Img.height;

    if (this.Texture == null) {
        this.Texture = gl.createTexture();
    }

    gl.bindTexture(gl.TEXTURE_2D, this.Texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.Img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.Ready=true;


    //...................................
    if (_onload) _onload(gl, this);
}

CTexture.prototype.GetImageData = function() {
    return new ImageData(this.Img);
}

CTexture.prototype.BindTexture = function (gl) {
    gl.bindTexture(gl.TEXTURE_2D, this.Texture);
}

CTexture.prototype.BindTextureAt = function (gl, _t) {
    gl.activeTexture(gl.TEXTURE0 + _t);
    gl.bindTexture(gl.TEXTURE_2D, this.Texture);
}


//.....................................................ImageData
function ImageData(img, rx, ry){
    if (img!=null) {
        dummycanvas.width = img.width;
        dummycanvas.height = img.height;

        c2d.drawImage(img, 0, 0);

        this.width=img.width;
        this.height=img.height;
        this.data=c2d.getImageData(0, 0, img.width, img.height);
    }
    else {
        dummycanvas.width = rx;
        dummycanvas.height = ry;

        this.width=rx;
        this.height=ry;
        this.data=c2d.getImageData(0, 0, rx, ry);
    }

    this.AvgR=0.0;
    this.AvgG=0.0;
    this.AvgB=0.0;
    this.Rx=0.0;
    this.Ry=0.0;
    this.Gx=0.0;
    this.Gy=0.0;
    this.Bx=0.0;
    this.By=0.0;
}

ImageData.prototype.ComputeAverages = function () {
    this.AvgR=0.0;
    this.AvgG=0.0;
    this.AvgB=0.0;
    this.Rx=0.0;
    this.Ry=0.0;
    this.Gx=0.0;
    this.Gy=0.0;
    this.Bx=0.0;
    this.By=0.0;

   for(var j=0; j<this.height; ++j){
        for(var i=0; i<this.width; ++i){
            var v=this.GetColor(i,j);
            
            this.AvgR+=v[0];
            this.AvgG+=v[1];
            this.AvgB+=v[2];

            this.Rx+=i*v[0];
            this.Ry+=j*v[0];
            this.Gx+=i*v[1];
            this.Gy+=j*v[1];
            this.Bx+=i*v[2];
            this.By+=j*v[2];
        }
    }

    this.Rx/=this.AvgR;
    this.Ry/=this.AvgR;
    this.Gx/=this.AvgG;
    this.Gy/=this.AvgG;
    this.Bx/=this.AvgB;
    this.By/=this.AvgB;

    this.AvgR/=(this.height*this.width);
    this.AvgG/=(this.height*this.width);
    this.AvgB/=(this.height*this.width);
}

ImageData.prototype.GetColor = function (i,j,dest) {
    var c=(j*this.width+i)*4;

    if(!dest) dest = new Float32Array(4);

    dest[0]=this.data.data[c++]/255;
    dest[1]=this.data.data[c++]/255;
    dest[2]=this.data.data[c++]/255;
    dest[3]=this.data.data[c]/255;
    return dest;
}

ImageData.prototype.SetColor = function (i,j,r,g,b,a) {
    var c=(j*this.width+i)*4;

    this.data.data[c++]=r*255;
    this.data.data[c++]=g*255;
    this.data.data[c++]=b*255;
    this.data.data[c]=a*255;
}


ImageData.prototype.GetR = function (i,j) {
    return this.data.data[(j*this.width+i)*4]/255;
}

ImageData.prototype.GetG = function (i,j) {
    return this.data.data[(j*this.width+i)*4+1]/255;
}

ImageData.prototype.GetB = function (i,j) {
    return this.data.data[(j*this.width+i)*4+2]/255;
}

ImageData.prototype.GetA = function (i,j) {
    return this.data.data[(j*this.width+i)*4+3]/255;
}

ImageData.prototype.SetR = function (i,j, v) {
    this.data.data[(j*this.width+i)*4]=v*255;
}

ImageData.prototype.SetG = function (i,j, v) {
    this.data.data[(j*this.width+i)*4+1]=v*255;
}

ImageData.prototype.SetB = function (i,j, v) {
    this.data.data[(j*this.width+i)*4+2]=v*255;
}

ImageData.prototype.SetA = function (i,j, v) {
    this.data.data[(j*this.width+i)*4+3]=v*255;
}

ImageData.prototype.CreateTexture = function (gl) {
    dummycanvas.width = this.width;
    dummycanvas.height = this.height;

    c2d.putImageData(this.data,0,0);

    return new CTexture(gl, dummycanvas);
}