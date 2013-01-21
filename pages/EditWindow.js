function EditWindow(x0, y0, x1, y1) {
	this.x0=x0;
	this.x1=x1;
	this.y0=y0;
	this.y1=y1;

	this.cx=(this.x1+this.x0)*0.5;
	this.cy=(this.y1+this.y0)*0.5;

	this.fragment=null;

	this.div = document.createElement("div");
    this.div.id = "editWindowBox1";
    $(this.div).addClass("editWindowBox");

    this.div.style.left= x0+"px";
    this.div.style.top=y0+"px";

    this.div.style.width= (x1-x0)+"px";
    this.div.style.height=(y1-y0)+"px";

    $("#candiv").append(this.div);
}


EditWindow.prototype.AttachFragment=function(frag) {
	if (this.fragment) this.DetachFragment();
	this.fragment=frag;
	this.fragment.Window=this;
}

EditWindow.prototype.DetachFragment=function() {
	if (!this.fragment) return;
	this.fragment.Window=undefined;
	this.fragment=null;
}

EditWindow.prototype.Render=function(gl, Shader) {

}