var ControlCapture=null;

function Scrollbar(x, y, w, h, min, max, val, name, onchange){
	this.x=x;
	this.y=y;
	this.w=w;
	this.h=h;
	this.min=min;
	this.max=max;
	this.normval=(val-min)/(max-min);
	this.val=val;
	this.name=name;

	this.onchange=onchange;

	this.canvas = document.createElement("canvas");
    this.canvas.width=w;
    this.canvas.height=h;

    this.canvas.style.position='absolute';
    this.canvas.style.left=this.x+"px";
    this.canvas.style.top=this.y+"px";

	this.ismousedown=false;

    $("#candiv").append(this.canvas);

    this.graphics = this.canvas.getContext('2d');

    var that=this;    
    $(this.canvas).mousedown(function(event) {that.OnMouseDown(event)});
    $(this.canvas).mousemove(function(event) {that.OnMouseMove(event)});
    $(this.canvas).mouseup(function(event) {that.OnMouseUp(event)});

    this.Redraw();
}

Scrollbar.prototype.Redraw=function() {

	this.graphics.clearRect(0,0,this.w, this.h);

	this.graphics.globalAlpha=0.5;
	this.graphics.fillStyle="#000000";
	this.graphics.fillRect(0,0,this.w, this.h);

	this.graphics.fillStyle="#ffffff";
	this.graphics.fillRect(1,1,this.w*this.normval, this.h-2);

	this.graphics.globalAlpha=1.0;
	this.graphics.fillStyle="#000000";
	this.graphics.font = "10px Arial"; // "bold 16px Verdana";
    this.graphics.textAlign = "left";
    this.graphics.textBaseline = "top";

    this.graphics.fillText(this.name+"="+this.val.toFixed(2)+"", 1.0, 1.0);
}

Scrollbar.prototype.OnMouseDown=function(event) {
	var offset = $(this.canvas).offset();
    var x = event.pageX - offset.left;
    var y = event.pageY - offset.top;

    this.normval=x/this.w;
    if (this.normval<0.0) this.normval=0.0;
    else if (this.normval>1.0) this.normval=1.0;

	this.val=this.normval*(this.max-this.min)+this.min;

	if(this.onchange!=null) {
		this.onchange(this.val);
	}

	ControlCapture=this;
	this.Redraw();

	this.ismousedown=true;

}

Scrollbar.prototype.OnMouseMove=function(event) {
	if (ControlCapture!=this) return;
	var offset = $(this.canvas).offset();
    var x = event.pageX - offset.left;
    var y = event.pageY - offset.top;

    this.normval=x/this.w;
    if (this.normval<0.0) this.normval=0.0;
    else if (this.normval>1.0) this.normval=1.0;

	this.val=this.normval*(this.max-this.min)+this.min;

	if(this.onchange!=null) {
		this.onchange(this.val);
	}

	this.Redraw();
}

Scrollbar.prototype.OnMouseUp=function(event) {
	this.ismousedown=false;
	ControlCapture=null;
}